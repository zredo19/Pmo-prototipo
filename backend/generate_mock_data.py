
import pandas as pd
import random
from datetime import datetime, timedelta

# Define the structure based on the previous architectural definition
data = {
    "id_proyecto": [],
    "nombre_proyecto": [],
    "descripcion_alcance": [],
    "sponsor_ejecutivo": [],
    "jefe_proyecto": [],
    "area_negocio": [],
    "fase_actual": [],
    "metric_roi_0_100": [],
    "metric_urgencia_0_100": [],
    "metric_riesgo_0_100": [],
    "metric_alineacion_0_100": [],
    "metric_recursos_0_100": [],
    "presupuesto_capex": [],
    "presupuesto_opex": [],
    "vpn_estimado": [],
    "payback_meses": [],
    "fecha_inicio_target": [],
    "duracion_estimada_semanas": [],
    "estado_aprobacion": []
}

# Helper data for generating realistic entries
areas = ["TI", "Recursos Humanos", "Finanzas", "Operaciones", "Marketing", "Legal"]
fases = ["Iniciación", "Planificación", "Ejecución", "Cierre"]
sponsors = ["Carlos Ruiz", "Maria Gonzalez", "Roberto Diaz", "Ana Silva"]
pms = ["Juan Perez", "Elena Torres", "Pedro Gomez", "Laura Mendez"]
proyectos_base = [
    ("Migración Cloud", "Mover infraestructura on-premise a AWS", "TI"),
    ("Sistema de Onboarding", "Automatización de ingreso de empleados", "Recursos Humanos"),
    ("Dashboard Financiero", "Visualización de KPIs en tiempo real", "Finanzas"),
    ("App Móvil Clientes", "Nueva versión de la app de ventas para iOS/Android", "Operaciones"),
    ("Automatización RPA", "Bots para conciliación bancaria", "Finanzas"),
    ("Campaña Q3", "Lanzamiento de producto estrella", "Marketing"),
    ("Cumplimiento GDPR", "Auditoría y ajustes de privacidad de datos", "Legal"),
    ("Actualización ERP", "Upgrade de SAP a S/4HANA", "TI"),
    ("Capacitación Liderazgo", "Programa para mandos medios", "Recursos Humanos"),
    ("Optimización Logística", "Algoritmo de rutas para flota", "Operaciones")
]

# Generate 10 rows of data
for i in range(10):
    proj_name, desc, area = proyectos_base[i]
    
    data["id_proyecto"].append(f"PROJ-2024-{str(i+1).zfill(3)}")
    data["nombre_proyecto"].append(proj_name)
    data["descripcion_alcance"].append(desc)
    data["sponsor_ejecutivo"].append(random.choice(sponsors))
    data["jefe_proyecto"].append(random.choice(pms))
    data["area_negocio"].append(area)
    data["fase_actual"].append(random.choice(fases))
    
    # Priority Metrics (0-100)
    data["metric_roi_0_100"].append(round(random.uniform(20, 95), 1))
    data["metric_urgencia_0_100"].append(round(random.uniform(30, 99), 1))
    data["metric_riesgo_0_100"].append(round(random.uniform(10, 80), 1)) # Lower is better usually, but here just raw risk
    data["metric_alineacion_0_100"].append(round(random.uniform(40, 100), 1))
    data["metric_recursos_0_100"].append(round(random.uniform(50, 100), 1))
    
    # Financials
    capex = random.randint(10000, 500000)
    data["presupuesto_capex"].append(capex)
    data["presupuesto_opex"].append(int(capex * random.uniform(0.1, 0.3)))
    data["vpn_estimado"].append(int(capex * random.uniform(1.2, 3.0)))
    data["payback_meses"].append(random.randint(6, 36))
    
    # Timeline
    start_date = datetime.now() + timedelta(days=random.randint(0, 90))
    data["fecha_inicio_target"].append(start_date.strftime("%Y-%m-%d"))
    data["duracion_estimada_semanas"].append(random.randint(4, 52))
    data["estado_aprobacion"].append(random.choice(["Aprobado", "Pendiente", "En Revisión"]))

df = pd.DataFrame(data)

# Save to file
output_path = "dataset_pmo_prueba.xlsx"
df.to_excel(output_path, index=False)
print(f"File created at: {output_path}")
print(df.head())
