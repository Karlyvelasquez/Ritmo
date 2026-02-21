"""
Script de entrenamiento para modelo de riesgo de abandono RITMO
- Usa features exportadas por motor_analisis.py
- Entrena un modelo de regresión logística
- Guarda el modelo entrenado como 'modelo_riesgo.pkl'
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
import joblib

# 1. Cargar datos
csv_path = "features_riesgo.csv"  # Asegúrate de haber generado este archivo

df = pd.read_csv(csv_path)
print(f"Datos originales: {len(df)} usuarios")

# 2. Crear datos sintéticos para demostración (necesario para pocos usuarios reales)
np.random.seed(42)

# Generar usuarios sintéticos con diferentes perfiles
usuarios_sinteticos = []
for i in range(50):  # Crear 50 usuarios sintéticos
    # Perfil aleatorio
    usuario = {
        "user_id": f"synthetic_{i}",
        "nombre": f"Usuario_Sintetico_{i}",
        "cumplimiento_porcentaje": np.random.normal(65, 20),  # Media 65%, std 20%
        "dias_bien": np.random.poisson(3),
        "dias_normal": np.random.poisson(2),
        "dias_dificil": np.random.poisson(1),
        "racha_actual_negativa": np.random.poisson(0.5),
        "tendencia": np.random.choice(["mejorando", "estable", "empeorando"]),
        "alertas_criticas": np.random.poisson(0.3),
        "alertas_preocupantes": np.random.poisson(0.7),
        "alertas_atencion": np.random.poisson(1.2)
    }
    
    # Ajustar límites
    usuario["cumplimiento_porcentaje"] = max(0, min(100, usuario["cumplimiento_porcentaje"]))
    usuario["dias_bien"] = max(0, usuario["dias_bien"])
    usuario["dias_normal"] = max(0, usuario["dias_normal"])
    usuario["dias_dificil"] = max(0, usuario["dias_dificil"])
    usuario["racha_actual_negativa"] = max(0, usuario["racha_actual_negativa"])
    
    usuarios_sinteticos.append(usuario)

# Agregar usuarios sintéticos
df_sinteticos = pd.DataFrame(usuarios_sinteticos)
df = pd.concat([df, df_sinteticos], ignore_index=True)

print(f"Datos con sintéticos: {len(df)} usuarios")

# 3. Definir variable objetivo (target)
def heuristica_abandono(row):
    # Riesgo alto: múltiples factores negativos
    score = 0
    
    # Factor 1: Cumplimiento muy bajo
    if row["cumplimiento_porcentaje"] < 30:
        score += 2
    elif row["cumplimiento_porcentaje"] < 50:
        score += 1
    
    # Factor 2: Muchos días difíciles
    if row["dias_dificil"] >= 4:
        score += 2
    elif row["dias_dificil"] >= 2:
        score += 1
        
    # Factor 3: Racha negativa larga
    if row["racha_actual_negativa"] >= 4:
        score += 2
    elif row["racha_actual_negativa"] >= 2:
        score += 1
    
    # Factor 4: Alertas críticas
    if row["alertas_criticas"] >= 2:
        score += 2
    elif row["alertas_criticas"] >= 1:
        score += 1
    
    # Factor 5: Tendencia empeorando
    if row["tendencia"] == "empeorando":
        score += 1
    
    # Riesgo alto si score >= 3
    return 1 if score >= 3 else 0

df["abandono"] = df.apply(heuristica_abandono, axis=1)

# Verificar distribución de clases
print(f"Distribución de clases:")
print(df["abandono"].value_counts())
print(f"Porcentaje clase 1 (riesgo alto): {df['abandono'].mean():.2%}")

# Verificar que tenemos ambas clases
if len(df["abandono"].unique()) < 2:
    print("ERROR: Solo una clase disponible. Ajustando manualmente...")
    # Forzar algunos ejemplos de riesgo alto
    indices_alto_riesgo = df.nsmallest(int(len(df) * 0.3), "cumplimiento_porcentaje").index
    df.loc[indices_alto_riesgo, "abandono"] = 1
    print(f"Nueva distribución: {df['abandono'].value_counts()}")

# 4. Seleccionar features y target
features = [
    "cumplimiento_porcentaje", "dias_bien", "dias_normal", "dias_dificil",
    "racha_actual_negativa", "alertas_criticas", "alertas_preocupantes", "alertas_atencion"
]
X = df[features]
y = df["abandono"]

# 4. Split train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# 5. Entrenar modelo
modelo = LogisticRegression(max_iter=200)
modelo.fit(X_train, y_train)

# 6. Evaluar modelo
y_pred = modelo.predict(X_test)
y_proba = modelo.predict_proba(X_test)[:, 1]
print("\nReporte de clasificación:\n", classification_report(y_test, y_pred))
print("AUC ROC:", roc_auc_score(y_test, y_proba))

# 7. Guardar modelo
joblib.dump(modelo, "modelo_riesgo.pkl")
print("\nModelo guardado como 'modelo_riesgo.pkl'")
