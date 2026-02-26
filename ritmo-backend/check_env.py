#!/usr/bin/env python3
"""
Script para verificar las variables de entorno necesarias para RITMO
"""

import os
import sys
from typing import Dict, List

def check_environment_variables() -> Dict[str, str]:
    """
    Verifica que todas las variables de entorno necesarias estén configuradas
    
    Returns:
        Dict con el estado de cada variable
    """
    required_vars = {
        "SUPABASE_URL": "URL de tu proyecto Supabase",
        "SUPABASE_KEY": "Clave anónima de Supabase",
        "OPENAI_API_KEY": "Clave de API de OpenAI (opcional ahora)",
    }
    
    results = {}
    
    print("🔍 Verificando variables de entorno...")
    print("=" * 50)
    
    for var_name, description in required_vars.items():
        value = os.getenv(var_name)
        
        if value:
            # Mostrar solo los primeros y últimos caracteres por seguridad
            if len(value) > 10:
                masked_value = f"{value[:4]}...{value[-4:]}"
            else:
                masked_value = f"{value[:2]}..."
            
            print(f"✅ {var_name}: {masked_value}")
            results[var_name] = "OK"
        else:
            print(f"❌ {var_name}: NO CONFIGURADA")
            print(f"   Descripción: {description}")
            results[var_name] = "MISSING"
    
    return results

def test_supabase_connection():
    """
    Prueba la conexión a Supabase
    """
    print("\n🔗 Probando conexión a Supabase...")
    print("=" * 50)
    
    try:
        from db.supabase_client import SupabaseClient
        
        # Intentar crear cliente
        client = SupabaseClient()
        supabase = client.client
        
        print("✅ Cliente Supabase creado exitosamente")
        
        # Probar una consulta simple
        response = supabase.table('usuarios').select('id').limit(1).execute()
        print("✅ Consulta de prueba exitosa")
        print(f"📊 Datos obtenidos: {len(response.data)} registros")
        
        return True
        
    except ValueError as e:
        if "SUPABASE_URL" in str(e) or "SUPABASE_KEY" in str(e):
            print("❌ Variables de entorno de Supabase no configuradas")
            print(f"   Error: {e}")
        else:
            print(f"❌ Error de configuración: {e}")
        return False
        
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {e}")
        print(f"   Tipo de error: {type(e).__name__}")
        return False

def main():
    """
    Función principal del script de verificación
    """
    print("🚀 RITMO - Verificador de Configuración")
    print("=" * 50)
    
    # Verificar variables de entorno
    env_results = check_environment_variables()
    
    # Contar problemas
    missing_vars = [var for var, status in env_results.items() if status == "MISSING"]
    
    if missing_vars:
        print(f"\n⚠️  Faltan {len(missing_vars)} variables de entorno:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Crea un archivo .env en el directorio raíz con estas variables")
        return False
    
    # Probar conexión a Supabase
    supabase_ok = test_supabase_connection()
    
    # Resumen final
    print("\n📋 RESUMEN")
    print("=" * 50)
    
    if not missing_vars and supabase_ok:
        print("✅ Todo configurado correctamente")
        print("🎉 Tu aplicación debería funcionar sin problemas")
        return True
    else:
        print("❌ Hay problemas de configuración")
        if missing_vars:
            print("   - Variables de entorno faltantes")
        if not supabase_ok:
            print("   - Problema de conexión a Supabase")
        print("\n🔧 Revisa la configuración antes de continuar")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)