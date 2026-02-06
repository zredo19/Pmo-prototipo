
import pandas as pd
import random
from datetime import datetime, timedelta
import numpy as np

def generate_priority_test_data():
    print("Generando dataset para prueba de Priorización (20 proyectos)...")

    # Listas de datos aleatorios para dar variedad
    areas = ["TI", "Recursos Humanos", "Finanzas", "Operaciones", "Marketing", "Legal", "Ventas", "Logística"]
    fases = ["Iniciación", "Planificación", "Ejecución", "Cierre", "Monitorización"]
    sponsors = ["Roberto D.", "Carlos Ruiz", "Maria Gon.", "Ana Silva", "Elena M."]
    jefes = ["Laura Mer.", "Pedro Gon.", "Juan Perez", "Sofia L.", "Diego R."]
    estados_aprobacion = ["Aprobado", "En Revisión", "Pendiente", "Rechazado"]
    
    nombres_proyectos = [
        "Migración Cloud Híbrida", "Automatización Nómina", "Dashboard Financiero AI", 
        "App Móvil Ventas 2.0", "Bots Atención Cliente", "Campaña Q3 Redes", 
        "Cumplimiento GDPR 2025", "Actualización ERP SAP", "Programa Liderazgo", 
        "Optimización Rutas Logísticas", "Portal Proveedores", "Ciberseguridad Zero Trust",
        "Analítica de Fuga Clientes", "Gestión Documental", "Renovación Hardware",
        "Capacitación Nuevos Ingresos", "CRM Integración Global", "Auditoría Interna Automatizada",
        "Marketplace Interno", "Asistente Virtual RRHH"
    ]
    
    descripciones = [
        "Mover infraestructura crítica a nube híbrida", "Automatizar cálculo de nómina regional", 
        "Visualización predictiva de flujo de caja", "Nueva versión app para fuerza de ventas", 
        "Bots para resolver tickets de nivel 1", "Lanzamiento campaña viral Q3", 
        "Auditoría y remediación de privacidad", "Upgrade de versión core financiero", 
        "Programa de capacitación directiva", "Algoritmo genético para rutas",
        "Portal autogestión para compras", "Implementación arquitectura zero trust",
        "Modelo predictivo de churn", "Digitalización de expedientes legales",
        "Recambio de laptops a leasing", "Onboarding digital gamificado",
        "Unificación de Salesforce Latam", "Bots de auditoría continua",
        "E-commerce para empleados", "Chatbot para dudas de beneficios"
    ]

    # Asegurar que tenemos exactamente 20 items para el zip
    # Si las listas son más cortas, las rellenamos o cortamos
    
    data = []
    
    for i in range(20):
        # Generar métricas variadas para probar el algoritmo
        # Intentamos crear algunos casos claros de "Crítico", "Medio", "Bajo"
        
        # Caso aleatorio ponderado
        scenario = random.choice(['high', 'med', 'low', 'random'])
        
        if scenario == 'high':
            roi = random.uniform(70, 99)
            urgencia = random.uniform(70, 99)
            riesgo = random.uniform(10, 40) # Bajo riesgo
            alineacion = random.uniform(80, 100)
        elif scenario == 'med':
            roi = random.uniform(40, 70)
            urgencia = random.uniform(40, 70)
            riesgo = random.uniform(30, 60)
            alineacion = random.uniform(40, 70)
        elif scenario == 'low':
            roi = random.uniform(5, 40)
            urgencia = random.uniform(10, 40)
            riesgo = random.uniform(60, 90) # Alto riesgo
            alineacion = random.uniform(10, 40)
        else:
            roi = random.uniform(10, 95)
            urgencia = random.uniform(10, 95)
            riesgo = random.uniform(10, 90)
            alineacion = random.uniform(20, 95)
            
        recursos = random.uniform(30, 95)
        
        # Presupuestos y fechas
        presupuesto = random.randint(50000, 1000000)
        gastado = int(presupuesto * random.uniform(0, 0.8))
        beneficio = int(presupuesto * (roi/10)) # Heurística simple
        payback = random.randint(6, 48)
        
        start_date = datetime.now() + timedelta(days=random.randint(10, 180))
        
        project = {
            "id_proyecto": f"PROJ-2024-{i+100}",
            "nombre_proyecto": nombres_proyectos[i],
            "descripcion_alcance": descripciones[i],
            "sponsor_ejecutivo": random.choice(sponsors),
            "jefe_proyecto": random.choice(jefes),
            "area_negocio": random.choice(areas),
            "fase_actual": random.choice(fases),
            "metric_roi_0_100": round(roi, 1),
            "metric_urgencia_0_100": round(urgencia, 1),
            "metric_riesgo_0_100": round(riesgo, 1),
            "metric_alineacion_0_100": round(alineacion, 1),
            "metric_recursos_0_100": round(recursos, 1),
            "presupuesto_estimado": presupuesto,
            "presupuesto_gastado": gastado,
            "estimacion_beneficios": beneficio,
            "payback_meses": payback,
            "fecha_inicio_target": start_date.strftime("%Y-%m-%d"),
            "duracion_estimada_semanas": random.randint(8, 52),
            "estado_aprobacion": random.choice(estados_aprobacion)
        }
        data.append(project)

    df = pd.DataFrame(data)
    
    output_file = "dataset_priorizacion_20.xlsx"
    df.to_excel(output_file, index=False)
    
    print(f"Archivo generado exitosamente: {output_file}")
    print(df.head())

if __name__ == "__main__":
    generate_priority_test_data()
