#!/usr/bin/env python3
"""
Script de prueba para validar la lógica de nombres del bot RITMO
"""
import sys
import os

# Agregar el directorio de telegram-bot al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.orchestrator import RitmoOrchestrator

def test_validacion_nombres():
    """Prueba las funciones de validación de nombres"""
    
    # Crear instancia del orquestador (sin DB para testing)
    mock_db = None
    orchestrator = RitmoOrchestrator(mock_db)
    
    print("🧪 Probando validación de respuestas negativas:")
    print("=" * 50)
    
    respuestas_negativas = [
        "no me he registrado",
        "aun no me he registrado", 
        "No estoy registrado",
        "Todavía no me registré",
        "no tengo cuenta",
        "nunca me apunté",
        "aún no me di de alta",
    ]
    
    for respuesta in respuestas_negativas:
        resultado = orchestrator._es_respuesta_negativa(respuesta)
        print(f"✅ '{respuesta}' -> {resultado}")
    
    print("\n🧪 Probando validación de nombres válidos:")
    print("=" * 50)
    
    nombres_validos = [
        "María García",
        "Juan",
        "Ana López",
        "Carlos Mendoza",
        "Luz María",
        "José Antonio",
    ]
    
    for nombre in nombres_validos:
        resultado = orchestrator._es_nombre_valido(nombre)
        print(f"✅ '{nombre}' -> {resultado}")
    
    print("\n🧪 Probando textos que NO son nombres:")
    print("=" * 50)
    
    no_nombres = [
        "hola",
        "que tal",
        "123456",
        "!@#$%",
        "bien gracias",
        "no me he registrado",
        "help",
        "test123",
        "",
        "a",
    ]
    
    for texto in no_nombres:
        resultado = orchestrator._es_nombre_valido(texto)
        print(f"❌ '{texto}' -> {resultado}")

if __name__ == "__main__":
    print("🤖 Test de Validación de Nombres - RITMO Bot")
    print("=" * 60)
    test_validacion_nombres()
    print("\n✅ Pruebas completadas!")