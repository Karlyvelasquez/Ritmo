"""
Sistema de Check-in Diario Automático para RITMO

Funcionalidades:
- Envío proactivo de check-ins a las 18:00
- Procesamiento de respuestas "Bien / Normal / Difícil"
- Scheduler para usuarios activos
- Análisis de cumplimiento y tendencias
- Alertas automáticas integradas con motor de análisis
"""

import asyncio
import logging
from datetime import datetime, timedelta, time
from typing import Dict, List, Optional
import pytz

from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.error import TelegramError

from models import UsuarioTelegram, EstadoCheckin, EstadisticasCheckin
from database import DatabaseManager
from generador_respuestas import generar_respuesta_check_in_adaptativa

logger = logging.getLogger(__name__)


class CheckinSystem:
    """Sistema de check-in emocional diario"""
    
    def __init__(self, bot: Bot, db_manager: DatabaseManager):
        self.bot = bot
        self.db = db_manager
        self.usuarios_activos: Dict[int, UsuarioTelegram] = {}
        self.scheduler_running = False
        self.ultimo_envio_fecha = None  # Para evitar múltiples envíos por día
        
    # ------------------------------------------------------------------ #
    #  Scheduler proactivo                                                 #
    # ------------------------------------------------------------------ #
    
    async def iniciar_scheduler(self):
        """Inicia el scheduler para check-ins automáticos a las 19:30"""
        if self.scheduler_running:
            logger.warning("Scheduler ya está ejecutándose")
            return
            
        self.scheduler_running = True
        logger.info("Scheduler de check-ins iniciado - horario: 19:30 España")
        
        while self.scheduler_running:
            try:
                await self._ejecutar_ronda_checkins()
                # Revisar cada minuto
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error en scheduler de check-ins: {e}")
                await asyncio.sleep(300)  # Esperar 5 min si hay error
    
    def detener_scheduler(self):
        """Detiene el scheduler"""
        self.scheduler_running = False
        logger.info("Scheduler de check-ins detenido")
    
    async def _ejecutar_ronda_checkins(self):
        """Ejecuta una ronda de check-ins para todos los usuarios activos"""
        ahora = datetime.now(pytz.timezone('Europe/Madrid'))
        fecha_hoy = ahora.date()
        
        # Solo ejecutar a las 19:30 y solo una vez por día
        if ahora.hour != 19 or ahora.minute != 30:
            return
        
        # Verificar si ya se envió hoy
        if self.ultimo_envio_fecha == fecha_hoy:
            logger.info(f"⏰ Check-in ya enviado hoy ({fecha_hoy}), omitiendo")
            return
            
        logger.info(f"🔔 Ejecutando ronda de check-ins diaria: {ahora.strftime('%H:%M')} - {fecha_hoy}")
        self.ultimo_envio_fecha = fecha_hoy
        
        # Obtener usuarios que necesitan check-in
        usuarios_pendientes = await self._obtener_usuarios_checkin_pendiente()
        
        logger.info(f"📊 Usuarios pendientes de check-in: {len(usuarios_pendientes)}")
        
        if not usuarios_pendientes:
            logger.info("ℹ️ No hay usuarios pendientes de check-in")
            return
        
        for user_id in usuarios_pendientes:
            try:
                logger.info(f"📤 Enviando check-in a usuario: {user_id}")
                await self._enviar_checkin_proactivo(user_id)
                await asyncio.sleep(2)  # Espaciar envíos
                
            except Exception as e:
                logger.error(f"Error enviando check-in a {user_id}: {e}")
    
    async def _obtener_usuarios_checkin_pendiente(self) -> List[str]:
        """
        Obtiene usuarios que necesitan check-in hoy.
        
        Returns:
            Lista de user_ids que necesitan check-in
        """
        usuarios_pendientes = []
        
        try:
            # Buscar todos los usuarios con telegram_id en la BD (usuarios vinculados)
            result = self.db.client.table("usuarios").select("*").not_.is_("telegram_id", "null").execute()
            
            if not result.data:
                logger.info("📊 No hay usuarios vinculados en la BD")
                return usuarios_pendientes
            
            logger.info(f"📊 Revisando {len(result.data)} usuarios vinculados")
            
            for usuario_db in result.data:
                user_id = usuario_db.get("id")
                telegram_id = usuario_db.get("telegram_id")
                nombre = usuario_db.get("nombre", "Usuario")
                
                if not user_id or not telegram_id:
                    continue
                
                # Verificar si ya hizo check-in hoy
                if not await self.db.verificar_checkin_hoy(user_id):
                    usuarios_pendientes.append(user_id)
                    logger.info(f"✅ Usuario {nombre} ({user_id}) necesita check-in")
                else:
                    logger.info(f"ℹ️ Usuario {nombre} ya hizo check-in hoy")
                    
        except Exception as e:
            logger.error(f"❌ Error obteniendo usuarios pendientes: {e}")
            
            # Fallback: usar usuarios en memoria del bot si existe
            try:
                from bot import ritmo_bot
                if hasattr(ritmo_bot, 'usuarios_en_memoria'):
                    logger.info("🔄 Usando usuarios en memoria como fallback")
                    for telegram_id, usuario in ritmo_bot.usuarios_en_memoria.items():
                        if usuario.estado.value == "activo" and usuario.perfil:
                            user_db = await self.db.buscar_usuario_por_telegram_id(telegram_id)
                            if user_db:
                                user_id = user_db.get("id")
                                if not await self.db.verificar_checkin_hoy(user_id):
                                    usuarios_pendientes.append(user_id)
            except Exception as fallback_error:
                logger.error(f"❌ Error en fallback: {fallback_error}")
        
        return usuarios_pendientes
    
    # ------------------------------------------------------------------ #
    #  Envío de check-ins                                                  #
    # ------------------------------------------------------------------ #
    
    async def _enviar_checkin_proactivo(self, user_id: str) -> bool:
        """
        Envía check-in proactivo a un usuario específico.
        
        Args:
            user_id: ID del usuario en BD principal
            
        Returns:
            bool: True si se envió exitosamente
        """
        try:
            # Obtener datos del usuario por su ID en la BD
            result = self.db.client.table("usuarios").select("*").eq("id", user_id).execute()
            
            if not result.data or len(result.data) == 0:
                logger.error(f"❌ Usuario no encontrado: {user_id}")
                return False
                
            user_db = result.data[0]
            telegram_id = user_db.get("telegram_id")
            nombre = user_db.get("nombre", "")
            
            if not telegram_id:
                logger.error(f"❌ Usuario {user_id} no tiene telegram_id")
                return False
            
            telegram_id = int(telegram_id)
            
            # Crear teclado inline con opciones
            from telegram import InlineKeyboardButton, InlineKeyboardMarkup
            
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("😊 Bien", callback_data=f"checkin_bien_{user_id}"),
                    InlineKeyboardButton("😐 Normal", callback_data=f"checkin_normal_{user_id}"),
                    InlineKeyboardButton("😔 Difícil", callback_data=f"checkin_dificil_{user_id}")
                ]
            ])
            
            mensaje = self._generar_mensaje_checkin(nombre)
            
            await self.bot.send_message(
                chat_id=telegram_id,
                text=mensaje,
                reply_markup=keyboard
            )
            
            logger.info(f"✅ Check-in enviado proactivamente a {nombre} ({telegram_id})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error enviando check-in a {user_id}: {e}")
            return False
    
    def _generar_mensaje_checkin(self, nombre: str = "") -> str:
        """Genera mensaje personalizado para check-in según la hora"""
        ahora = datetime.now()
        
        if ahora.hour < 12:
            saludo = "Buenos días"
            pregunta = "¿Cómo te sientes para empezar este día?"
        elif ahora.hour < 18:
            saludo = "Buenas tardes"  
            pregunta = "¿Cómo llevas el día hasta ahora?"
        else:
            saludo = "Buenas tardes"
            pregunta = "¿Cómo ha ido tu día hoy?"
        
        nombre_personal = f" {nombre}" if nombre else ""
        
        return f"{saludo}{nombre_personal} 💙\n\n{pregunta}"
    
    # ------------------------------------------------------------------ #
    #  Procesamiento de respuestas                                         #
    # ------------------------------------------------------------------ #
    
    async def procesar_respuesta_checkin(
        self, 
        user_id: str, 
        telegram_id: int, 
        estado_emocional: str,
        metodo: str = "proactivo"
    ) -> str:
        """
        Procesa la respuesta de check-in del usuario.
        
        Args:
            user_id: ID del usuario
            telegram_id: Telegram ID
            estado_emocional: "bien", "normal", "dificil"  
            metodo: "proactivo" o "reactivo"
            
        Returns:
            str: Mensaje de respuesta personalizado
        """
        try:
            # Guardar check-in en BD
            guardado = await self.db.guardar_checkin_diario(
                user_id=user_id,
                telegram_id=telegram_id,
                estado_emocional=estado_emocional,
                metodo=metodo
            )
            
            if not guardado:
                return "Lo siento, hubo un problema guardando tu respuesta. ¿Puedes intentar de nuevo?"
            
            # Obtener información del usuario para respuesta adaptativa
            user_db = await self.db.buscar_usuario_por_telegram_id(telegram_id)
            nombre = user_db.get("nombre", "Usuario") if user_db else "Usuario"
            
            # Ejecutar análisis contextual para respuesta adaptativa
            analisis = None
            try:
                from motor_analisis import MotorAnalisisContextual, NivelAlerta
                
                # Crear motor de análisis
                motor = MotorAnalisisContextual(self.db)
                
                # Realizar análisis de 7 días
                analisis = await motor.analizar_usuario_completo(user_id, 7)
                
                logger.info(f"Análisis completado para respuesta adaptativa: {user_id}")
                
            except Exception as e:
                logger.error(f"Error en análisis para respuesta adaptativa: {e}")
            
            # Generar respuesta adaptativa usando análisis contextual
            try:
                respuesta = generar_respuesta_check_in_adaptativa(
                    user_id=user_id,
                    nombre=nombre,
                    estado_emocional=estado_emocional,
                    metricas=analisis.get("metricas") if analisis and "error" not in analisis else None,
                    alertas=analisis.get("alertas") if analisis and "error" not in analisis else None,
                    ml_prediccion=analisis.get("ml_prediccion") if analisis and "error" not in analisis else None
                )
                mensaje_respuesta = respuesta
            except Exception as e:
                logger.error(f"Error generando respuesta adaptativa: {e}")
                # Fallback a respuesta básica
                mensaje_respuesta = self._generar_respuesta_checkin_fallback(estado_emocional, nombre)
            
            # Análisis automático para detectar patrones preocupantes
            await self._ejecutar_analisis_automatico(user_id, telegram_id, estado_emocional)
            
            logger.info(f"Check-in procesado: {estado_emocional} para user {user_id}")
            return mensaje_respuesta
            
        except Exception as e:
            logger.error(f"Error procesando check-in de {user_id}: {e}")
            return "Hubo un problema procesando tu respuesta. Por favor intenta más tarde."
    
    def _generar_respuesta_checkin_fallback(self, estado_emocional: str, nombre: str = "Usuario") -> str:
        """Genera respuesta básica cuando falla la respuesta adaptativa"""
        
        if estado_emocional == "bien":
            return f"¡Me alegra saber que te sientes bien hoy, {nombre}! 😊💙"
        elif estado_emocional == "normal":
            return f"Gracias por contarme cómo te sientes, {nombre} 💙"
        else:  # difícil
            return f"Gracias por confiar en mí, {nombre}. Sé que no es fácil 💙"
    
    async def _ejecutar_analisis_automatico(self, user_id: str, telegram_id: int, estado_emocional: str):
        """
        Ejecuta análisis automático después de un check-in y envía alertas si es necesario.
        
        Args:
            user_id: ID del usuario en BD
            telegram_id: Telegram ID para enviar mensajes
            estado_emocional: Estado emocional recién registrado
        """
        try:
            # Solo ejecutar análisis automático en ciertos casos para no sobrecargar
            ejecutar_analisis = False
            
            # Caso 1: Estado emocional preocupante
            if estado_emocional in ['dificil', 'mal', 'muy_mal']:
                ejecutar_analisis = True
            
            # Caso 2: Cada 3 días para usuarios normales (para detectar tendencias)
            elif datetime.now().day % 3 == 0:
                ejecutar_analisis = True
                
            if not ejecutar_analisis:
                return
            
            # Importar motor de análisis (importación tardía para evitar circular imports)
            try:
                from motor_analisis import MotorAnalisisContextual, NivelAlerta
            except ImportError:
                logger.warning("Motor de análisis no disponible para análisis automático")
                return
            
            # Crear instancia del motor
            motor = MotorAnalisisContextual(self.db)
            
            # Ejecutar análisis de 7 días
            analisis = await motor.analizar_usuario_completo(user_id, 7)
            
            if "error" in analisis:
                logger.error(f"Error en análisis automático para {user_id}: {analisis['error']}")
                return
            
            # Revisar alertas críticas y preocupantes
            alertas_importantes = [a for a in analisis["alertas"] 
                                 if a.nivel in [NivelAlerta.CRITICO, NivelAlerta.PREOCUPANTE]]
            
            if not alertas_importantes:
                logger.info(f"✅ Análisis automático OK para usuario {user_id}")
                return
            
            # Enviar notificación de alerta automática
            await self._enviar_alerta_automatica(telegram_id, alertas_importantes, analisis)
            
            logger.info(f"🚨 Análisis automático detectó {len(alertas_importantes)} alertas para usuario {user_id}")
            
        except Exception as e:
            logger.error(f"Error en análisis automático para usuario {user_id}: {e}")
    
    async def _enviar_alerta_automatica(self, telegram_id: int, alertas: List, analisis: Dict):
        """
        Envía notificación automática cuando se detectan patrones preocupantes.
        
        Args:
            telegram_id: ID de Telegram del usuario
            alertas: Lista de alertas importantes detectadas
            analisis: Resultado completo del análisis
        """
        try:
            # Determinar tipo de mensaje según la alerta más crítica
            alerta_maxima = max(alertas, key=lambda a: ["atencion", "preocupante", "critico"].index(a.nivel.value))
            
            if alerta_maxima.nivel.value == "critico":
                emoji_nivel = "🚨"
                titulo = "Alerta Crítica"
            else:
                emoji_nivel = "⚠️"
                titulo = "Patrón Detectado"
            
            # Crear mensaje personalizado
            mensaje = f"{emoji_nivel} **{titulo}**\n\n"
            
            # Agregar alerta principal
            mensaje += f"He detectado un patrón que me preocupa:\n\n"
            mensaje += f"📋 {alerta_maxima.mensaje}\n\n"
            
            # Agregar recomendación principal
            mensaje += f"💡 **Recomendación:**\n{alerta_maxima.recomendacion}\n\n"
            
            # Agregar recordatorio de apoyo
            if alerta_maxima.nivel.value == "critico":
                mensaje += (
                    "💙 **Recuerda que no estás solo/a.**\n"
                    "Si necesitas ayuda inmediata, no dudes en contactar:\n"
                    "• Tu red de apoyo personal\n"
                    "• Servicios de crisis locales\n"
                    "• Teléfono de la esperanza: 717 003 717\n\n"
                )
            else:
                mensaje += (
                    "💙 **Estoy aquí contigo.**\n"
                    "Puedes hablar conmigo cuando lo necesites.\n"
                    "También considera contactar tu red de apoyo.\n\n"
                )
            
            # Botón para ver análisis completo
            from telegram import InlineKeyboardButton, InlineKeyboardMarkup
            keyboard = InlineKeyboardMarkup([
                [InlineKeyboardButton("📊 Ver análisis completo", callback_data=f"analisis_completo_{analisis['user_id']}")]
            ])
            
            await self.bot.send_message(
                chat_id=telegram_id,
                text=mensaje,
                reply_markup=keyboard,
                parse_mode='Markdown'
            )
            
        except Exception as e:
            logger.error(f"Error enviando alerta automática a {telegram_id}: {e}")
    
    # ------------------------------------------------------------------ #
    #  Generación de mensajes personalizados                              #
    # ------------------------------------------------------------------ #
    
    async def ofrecer_checkin_reactivo(self, telegram_id: int, user_id: str) -> str:
        """
        Ofrece check-in cuando el usuario interactúa y no lo ha hecho hoy.
        
        Args:
            telegram_id: Telegram ID del usuario
            user_id: ID del usuario en BD
            
        Returns:
            str: Mensaje con opciones de check-in o None si no es necesario
        """
        try:
            # Verificar si ya hizo check-in hoy
            ya_hizo_checkin = await self.db.verificar_checkin_hoy(user_id)
            
            if ya_hizo_checkin:
                return None  # No necesita check-in
            
            # Crear teclado inline
            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("😊 Bien", callback_data=f"checkin_bien_{user_id}"),
                    InlineKeyboardButton("😐 Normal", callback_data=f"checkin_normal_{user_id}"),
                    InlineKeyboardButton("😔 Difícil", callback_data=f"checkin_dificil_{user_id}")
                ],
                [
                    InlineKeyboardButton("Ahora no ⏰", callback_data=f"checkin_postpone_{user_id}")
                ]
            ])
            
            mensaje = (
                "Por cierto... ¿cómo te sientes hoy? 💙\n\n"
                "Solo si quieres compartirlo conmigo:"
            )
            
            await self.bot.send_message(
                chat_id=telegram_id,
                text=mensaje,
                reply_markup=keyboard
            )
            
            return mensaje
            
        except Exception as e:
            logger.error(f"Error ofreciendo check-in reactivo: {e}")
            return None
    
    # ------------------------------------------------------------------ #
    #  Registro de usuarios activos                                        #
    # ------------------------------------------------------------------ #
    
    def registrar_usuario_activo(self, usuario: UsuarioTelegram):
        """Registra un usuario como activo para check-ins"""
        if usuario.estado.value == "activo" and usuario.perfil:
            self.usuarios_activos[usuario.telegram_id] = usuario
            logger.info(f"👤 Usuario registrado para check-ins: {usuario.telegram_id}")
    
    def desregistrar_usuario(self, telegram_id: int):
        """Desregistra un usuario de check-ins activos"""
        if telegram_id in self.usuarios_activos:
            del self.usuarios_activos[telegram_id]
            logger.info(f"👤 Usuario desregistrado de check-ins: {telegram_id}")