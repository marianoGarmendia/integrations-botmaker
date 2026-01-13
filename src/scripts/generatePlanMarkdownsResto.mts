import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MarkdownFile {
  filename: string;
  content: string;
}

const markdownFiles: MarkdownFile[] = [
  // ==========================================
  // PLAN ELITE
  // ==========================================
  {
    filename: 'plan_elite_caracteristicas_generales.md',
    content: `---
metadata:
  document_id: "plan_elite_caracteristicas_generales"
  document_type: "plan_caracteristicas"
  plan: "elite"
  categoria_prestacion: "informacion_general"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["plan elite", "prepaga", "aportes", "contribuciones", "desregulación", "sin bonos", "sin recetarios"]
  prestaciones: ["urgencias", "consultas", "diagnostico", "medicamentos", "odontologia", "internaciones"]
  ciudad: "todas"
  modalidades: ["desregulacion", "prepaga"]
---

# Plan ELITE - Características Generales

## Modalidades de Acceso

### Plan Elite (Desregulación)
Se accede a través de la suma de aportes y contribuciones, y un aporte complementario superador, en caso que aquellos no cubran el costo del plan. 

Este aporte complementario superador puede ser abonado por distintos medios de pago electrónicos.

**IMPORTANTE:** En caso de producirse la mora en el pago del aporte complementario, y no efectuase su cancelación, automáticamente tendrán los servicios médicos establecidos en el P.M.O (Programa Médico Obligatorio).

### Plan Elite de Medicina Prepaga
Se accede mediante el pago voluntario, de acuerdo al rango etario y composición del grupo familiar. 

**Requisitos:**
- Presentación de estudios médicos actualizados
- Detallados en la planilla de "Afiliaciones Prepaga"
- Condiciones de ingreso sujeto a modificaciones

---

## Características Principales
- **Tipo de plan:** Con copagos en determinadas prestaciones (laboratorio, prácticas especiales, salud mental, mediana y alta complejidad)
- **Cartilla:** Amplia cartilla de prestadores
- **Bonos:** Sin bonos
- **Recetarios:** Sin recetarios
- **Atención:** Con credencial (y presentando autorización aprobada previamente por auditoría médica en los casos que corresponda)
- **Vigencia:** Desde 01/01/2025
`
  },
  {
    filename: 'plan_elite_urgencias_emergencias.md',
    content: `---
metadata:
  document_id: "plan_elite_urgencias_emergencias"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "urgencias"
  subcategoria: "emergencias_medicas"
  vigencia: "2025-01-01"
  tiene_copago: false
  cobertura_porcentaje: 100
  requiere_autorizacion: false
  keywords: ["urgencias", "emergencias", "traslados", "ambulancia", "plan elite"]
  prestaciones: ["urgencias", "emergencias", "traslados programados"]
  ciudad: "todas"
---

# Plan ELITE - Urgencias y Emergencias Médicas

## Cobertura
Se accede solamente con la presentación de la credencial.

## Servicios Incluidos
- ✅ Urgencias médicas
- ✅ Emergencias médicas
- ✅ Traslados programados sin costo (con autorización previa)

## Servicios NO Incluidos
- ❌ Médicos a domicilio

## Requisitos
- **Autorización previa:** Solo para traslados programados
- **Copago:** No tiene copago
- **Credencial:** Presentación de credencial
`
  },
  {
    filename: 'plan_elite_consultas_medicas.md',
    content: `---
metadata:
  document_id: "plan_elite_consultas_medicas"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "consultas_medicas"
  subcategoria: "todas_especialidades"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  requiere_autorizacion: false
  keywords: ["consultas", "médicos", "especialidades", "AMP", "categorías profesionales", "plan elite", "CIM"]
  prestaciones: ["consultas medicas", "especialidades"]
  ciudad: "la_plata"
  convenios: ["AMP", "CIM"]
  copagos_enero_2025:
    cat_a: 0
    cat_b: 1936
    cat_c: 3630
---

# Plan ELITE - Consultas Médicas (Todas las Especialidades)

## Consultas en Centro Integral de Medicina (CIM)
- **Dirección:** Calle 11 nro 729
- **Costo:** SIN CARGO
- **Requisito:** Presentación de credencial

## Consultas con Médicos de A.M.P
**Cobertura:** La Plata, Berisso y Ensenada

### Acceso
- Se accede con la sola presentación de la credencial
- Las consultas se pueden realizar en cualquier consultorio o sanatorio
- **Incluye:** Médicos agremiados que atienden en clínicas y sanatorios
- **EXCEPCIÓN:** Hospital Italiano NO tiene convenio (enero 2025)

### Aranceles Médicos por Categoría

| Categoría | Copago (Enero 2025) |
|-----------|---------------------|
| CAT. A    | SIN COSTO           |
| CAT. B    | $1,936              |
| CAT. C    | $3,630              |

**NOTA:** Los médicos perciben un arancel diferenciado según la categoría del profesional
`
  },
  {
    filename: 'plan_elite_diagnostico_imagenes.md',
    content: `---
metadata:
  document_id: "plan_elite_diagnostico_imagenes"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "diagnostico_imagenes"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["radiografías", "ecografías", "tomografías", "resonancias", "mamografías", "doppler", "diagnóstico", "plan elite"]
  prestaciones: ["diagnostico por imagenes", "radiografias", "ecografias", "tomografias", "resonancias"]
  ciudad: "todas"
  prestadores_con_copago: ["MON", "Clínicas", "CIMED"]
---

# Plan ELITE - Diagnóstico por Imágenes

## Baja Complejidad

### Prácticas Nomencladas
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo adicional

### Ecografías
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo adicional

### Radiografías
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo adicional

---

## Mediana Complejidad

### Mamografías
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo

### Doppler
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo

---

## Alta Complejidad

### Resonancias
- **Autorización previa:** SÍ requiere
- **Copago:** Variable según prestador

### Tomografías
- **Autorización previa:** SÍ requiere
- **Copago:** Variable según prestador

### Prestadores CON copago:
- MON
- Clínicas
- CIMED

### Prestadores SIN copago:
- Otros prestadores de cartilla
`
  },
  {
    filename: 'plan_elite_analisis_clinicos.md',
    content: `---
metadata:
  document_id: "plan_elite_analisis_clinicos"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "laboratorio"
  subcategoria: "analisis_clinicos"
  vigencia: "2025-01-01"
  tiene_copago: false
  cobertura_porcentaje: 100
  keywords: ["análisis", "laboratorio", "bioquímica", "cargas virales", "hormonas", "vitaminas", "plan elite"]
  prestaciones: ["analisis clinicos", "laboratorio"]
  ciudad: "todas"
---

# Plan ELITE - Análisis Clínicos

## Cobertura General
**Cobertura del 100%** en el costo del acto bioquímico

## Autorización Previa
**Requieren autorización previa** solo códigos específicos:
- Cargas virales
- Hormonas
- Vitaminas
- Otros estudios específicos

## Copagos
**Sin copago** en acto bioquímico

---

## Ventajas del Plan Elite
- Cobertura completa del acto bioquímico
- Sin costos adicionales para el afiliado
- Acceso a laboratorios de cartilla
`
  },
  {
    filename: 'plan_elite_rehabilitacion.md',
    content: `---
metadata:
  document_id: "plan_elite_rehabilitacion"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "rehabilitacion"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["rehabilitación", "fisiatría", "kinesiología", "fonoaudiología", "plan elite"]
  prestaciones: ["rehabilitacion", "fisiatra", "kinesiologia", "fonoaudiologia"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Fonoaudiólogos"]
  cobertura_mensual: 5
  cobertura_anual: 25
---

# Plan ELITE - Rehabilitación, Fisiatría, Kinesiología, Fonoaudiología

## Rehabilitación, Fisiatría y Kinesiología

### Cobertura
- **Mensual:** Hasta 5 sesiones
- **Anual:** Hasta 25 sesiones

### Copago
**Sin copago**

---

## Fonoaudiología

### Cobertura
**4 sesiones mensuales**

### Centro Integral de Medicina (CIM)
- **Copago:** NO abona copago

### Elección - Colegio de Fonoaudiólogos
- **Copago:** NO abona copago

---

## Ventajas del Plan Elite
- Sin copagos en ninguna modalidad
- Libre elección de profesionales del Colegio de Fonoaudiólogos
- Atención de calidad sin costo adicional
`
  },
  {
    filename: 'plan_elite_salud_mental.md',
    content: `---
metadata:
  document_id: "plan_elite_salud_mental"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "salud_mental"
  subcategoria: "psicologia"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["psicología", "salud mental", "terapia", "psicólogo", "plan elite", "psiquiatría"]
  prestaciones: ["psicologia", "salud mental", "psiquiatria"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Psicólogos"]
  requiere_bonos: true
  cobertura_mensual: 4
  cobertura_anual: 30
---

# Plan ELITE - Salud Mental / Psicología - Psiquiatría

## Requisitos
**Requiere presentación de bonos**

## Cobertura
- **Mensual:** 4 sesiones
- **Anual:** 30 sesiones

---

## Atención en CIM (Centro Integral de Medicina)
- **Copago:** SIN copago
- **Cobertura:** 4 sesiones mensuales

---

## Elección a través del Colegio de Psicólogos
- **Copago:** SIN copago
- **Libre elección** de profesional
- **Cobertura:** 4 sesiones mensuales

---

## Ventajas del Plan Elite
- Sin copagos tanto en CIM como en libre elección
- Mayor flexibilidad para elegir profesional
- Cobertura integral de salud mental
`
  },
  {
    filename: 'plan_elite_medicamentos.md',
    content: `---
metadata:
  document_id: "plan_elite_medicamentos"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "medicamentos"
  subcategoria: "ambulatorios"
  vigencia: "2025-01-01"
  tiene_copago: true
  cobertura_porcentaje: 40
  cobertura_especial:
    oncologicos: 100
    diabetes: 100
    hiv: 100
    asma: 70
    tiroides: 70
    hta: 70
  keywords: ["medicamentos", "farmacia", "recetas", "cobertura", "plan elite"]
  prestaciones: ["medicamentos ambulatorios"]
  ciudad: "todas"
  requiere_formulario_amp: true
---

# Plan ELITE - Medicamentos Ambulatorios

## Cobertura General
**Cobertura del 40%** sobre el precio de venta del medicamento

### Requisitos
- **Vademecum:** Sin vademecum (todos los medicamentos cubiertos)
- **Prescripción:** Formulario de AMP
- **Autorización previa:** NO requiere para medicamentos comunes

---

## Coberturas Especiales

### Cobertura al 100%
- 🔴 Medicamentos oncológicos
- 💉 Medicamentos para diabetes
- 🔬 Medicamentos para HIV

### Cobertura al 70%
- 🫁 Asma
- 🦋 Tiroides
- ❤️ HTA (Hipertensión Arterial)

---

## Forma de Uso
1. Obtener prescripción médica en formulario de AMP
2. Presentar en farmacia con credencial
3. Pagar el porcentaje correspondiente según cobertura
`
  },
  {
    filename: 'plan_elite_odontologia.md',
    content: `---
metadata:
  document_id: "plan_elite_odontologia"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "odontologia"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["odontología", "dentista", "prótesis", "ortodoncia", "plan elite"]
  prestaciones: ["odontologia general", "protesis", "ortodoncia"]
  ciudad: "la_plata"
  convenios: ["CIM", "Sociedad Odontológica de La Plata", "Agremiación Odontológica Bonaerense"]
  practicas_mensuales: 2
  reintegro_ortodoncia_enero_2025:
    denticion_mixta: 47500
    denticion_permanente: 74000
---

# Plan ELITE - Odontología General

## Cobertura
**Hasta 2 prácticas mensuales**

## Prestadores
### Con Convenio:
- ✅ CIM (Centro Integral de Medicina)
- ✅ Sociedad Odontológica de La Plata (SOLP)
- ✅ Agremiación Odontológica Bonaerense (AOB)

---

## Copagos
**SIN copagos** en todos los tratamientos

### Tratamientos Incluidos:
- Consultas
- Extracciones
- Tratamientos de conducto
- Limpiezas
- Otros tratamientos generales

---

## Prótesis Dentales
**Plan de cobertura:**
- 20% de descuento aplicado sobre el presupuesto realizado por los odontólogos del CIM

---

## Ortodoncia
**Reintegro hasta 15 años de edad**

Montos fijos según tipo de dentición:

| Tipo de Dentición | Reintegro (Enero 2025) |
|-------------------|------------------------|
| Dentición mixta | $47,500 |
| Dentición permanente | $74,000 |

**NOTA:** Valores sujetos a modificaciones

---

## Ventajas del Plan Elite
- Sin copagos en tratamientos generales
- Mayor reintegro en ortodoncia
- Cobertura completa en prestadores de cartilla
`
  },
  {
    filename: 'plan_elite_internaciones.md',
    content: `---
metadata:
  document_id: "plan_elite_internaciones"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "internaciones"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  cobertura_pension: 100
  cobertura_medicamentos: 100
  cobertura_material_descartable: 100
  cobertura_honorarios_medicos: 100
  keywords: ["internaciones", "cirugías", "clínicas", "honorarios médicos", "plan elite", "terapia intensiva"]
  prestaciones: ["internaciones clinicas", "internaciones quirurgicas", "terapia intensiva", "unidad coronaria"]
  ciudad: "todas"
---

# Plan ELITE - Internaciones Clínicas y Quirúrgicas

## Cobertura Base
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable

---

## Honorarios Médicos
✅ **Cobertura al 100%** en honorarios médicos

### Todas las Categorías Profesionales
- **CAT. A:** 100% (sin costo adicional)
- **CAT. B:** 100% (sin costo adicional)
- **CAT. C:** 100% (sin costo adicional)

---

## Alta Complejidad

### Neurocirugía, Cirugía Cardiovascular y Otros
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable

⚠️ **Copago variable:**
- Dependiendo del sanatorio
- Dependiendo de la intervención a realizar

---

## Internaciones Psiquiátricas
**Cobertura:** Hasta 30 días al año

---

## Ventajas del Plan Elite
- Cobertura completa en honorarios médicos para cirugías estándar
- Sin diferenciación por categoría de profesional (excepto alta complejidad)
- Mayor tranquilidad económica ante internaciones
`
  },
  {
    filename: 'plan_elite_maternidad.md',
    content: `---
metadata:
  document_id: "plan_elite_maternidad"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "maternidad"
  vigencia: "2025-01-01"
  tiene_copago: false
  cobertura_porcentaje: 100
  keywords: ["maternidad", "embarazo", "parto", "cesárea", "bebé", "plan elite"]
  prestaciones: ["partos", "embarazo", "control prenatal", "control pediatrico"]
  ciudad: "todas"
---

# Plan ELITE - Maternidad

## Cobertura Integral
**Partos y embarazos con cobertura integral**

---

## Cobertura para la Mamá
✅ **Atención completa del embarazo:**
- Controles prenatales
- Estudios de laboratorio
- Ecografías
- Parto o cesárea
- Honorarios médicos incluidos

---

## Cobertura para el Bebé
✅ **Controles hasta el primer año de vida:**
- Controles pediátricos
- Vacunación
- Estudios de rutina
- Atención médica general

---

## Ventajas del Plan Elite
- Cobertura completa sin diferenciación por categoría médica
- Sin copagos adicionales
- Tranquilidad total durante el embarazo
`
  },
  {
    filename: 'plan_elite_protesis_ortesis.md',
    content: `---
metadata:
  document_id: "plan_elite_protesis_ortesis"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "protesis_ortesis"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["prótesis", "ortesis", "implantes", "plan elite"]
  prestaciones: ["protesis", "ortesis"]
  ciudad: "todas"
  cobertura_protesis_nacionales: 100
  cobertura_protesis_importadas: 50
  cobertura_ortesis: 50
---

# Plan ELITE - Prótesis y Ortesis

## Prótesis

### Prótesis Nacionales
**Cobertura: 100%**
- Sin costo adicional para el afiliado
- **NO incluye prótesis odontológicas**

### Prótesis Importadas
**Cobertura: 50%**
- El afiliado abona el 50% restante
- **NO incluye prótesis odontológicas**

---

## Ortesis

### Cobertura General
**Cobertura: 50%**

### Requisitos
- **Sujeto a aprobación** del presupuesto presentado por el afiliado
- Presentar presupuesto para evaluación
- Autorización previa de auditoría médica

---

## Notas Importantes
- Las prótesis odontológicas tienen cobertura específica (ver documento de Odontología)
- Para ambos casos se requiere autorización previa
- Los porcentajes se aplican sobre el presupuesto aprobado
`
  },
  {
    filename: 'plan_elite_otras_prestaciones.md',
    content: `---
metadata:
  document_id: "plan_elite_otras_prestaciones"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "otras_prestaciones"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["cirugías laparoscópicas", "cirugía refractiva", "PMO", "plan elite"]
  prestaciones: ["cirugia laparoscopica", "cirugia refractiva"]
  ciudad: "todas"
  segun_pmo: true
---

# Plan ELITE - Otras Prestaciones

## Cirugías Laparoscópicas
**Cobertura según reglamento P.M.O** (Programa Médico Obligatorio)

### Características:
- Cobertura de acuerdo a normativa vigente del PMO
- Requiere autorización previa
- Cobertura en clínicas de cartilla

---

## Cirugía Refractiva
**Cobertura según reglamento P.M.O** (Programa Médico Obligatorio)

### Características:
- Cobertura de acuerdo a normativa vigente del PMO
- Requiere autorización previa
- Evaluación por auditoría médica
- Cobertura en prestadores autorizados

---

## Notas
Las prestaciones están sujetas a las condiciones y requisitos establecidos en el Programa Médico Obligatorio (PMO) vigente.
`
  },
  {
    filename: 'plan_elite_opticas.md',
    content: `---
metadata:
  document_id: "plan_elite_opticas"
  document_type: "plan_prestaciones"
  plan: "elite"
  categoria_prestacion: "opticas"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["ópticas", "anteojos", "lentes", "plan elite"]
  prestaciones: ["opticas", "anteojos", "lentes"]
  ciudad: "todas"
  cobertura_anual: 1
  descuento_fuera_stock_enero_2025: 30000
---

# Plan ELITE - Ópticas

## Cobertura Anual
**Un (1) par de anteojos por año**

---

## Anteojos con Cobertura al 100%
**Sin cargo** en ópticas de cartilla según convenio vigente

### Condiciones:
- Stock disponible en ópticas con convenio
- Presentación de prescripción oftalmológica
- Credencial del afiliado

---

## Anteojos Fuera de Stock

### Descuento Especial
Si solicita anteojos que están fuera del stock con cobertura al 100%, se aplicará:

**Descuento: $30,000** (Enero 2025 - sujeto a modificaciones)

---

## Lentes de Laboratorio
❌ **Sin cobertura**
- Los lentes de laboratorio no tienen cobertura
- Costo 100% a cargo del afiliado

---

## Ópticas de Cartilla
Consultar listado actualizado de ópticas con convenio en la cartilla de prestadores.
`
  },
  {
    filename: 'plan_elite_servicios_adicionales.md',
    content: `---
metadata:
  document_id: "plan_elite_servicios_adicionales"
  document_type: "plan_servicios_adicionales"
  plan: "elite"
  categoria_prestacion: "servicios_adicionales"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["asistencia al viajero", "cobertura por fallecimiento", "plan elite"]
  prestaciones: ["asistencia al viajero"]
  ciudad: "todas"
  proveedor_asistencia: "Universal Assistance"
  cobertura_fallecimiento_meses: 3
---

# Plan ELITE - Servicios Adicionales

## Asistencia al Viajero
**Dentro del país**

### Proveedor:
**Universal Assistance**

### Cobertura:
- Asistencia médica en viajes dentro de Argentina
- Emergencias médicas
- Traslados sanitarios

**NOTA:** Servicio sujeto a modificaciones

---

## Cobertura por Fallecimiento del Titular
**Protección extendida para el grupo familiar**

### Beneficio:
**3 meses de cobertura sin cargo** para el grupo familiar en caso de fallecimiento del afiliado titular

### Condiciones:
- Automático al fallecimiento del titular
- Cubre todo el grupo familiar inscripto
- Período: **3 meses** desde el fallecimiento (1 mes más que Plan Basic)
- Permite reorganización de la cobertura familiar

---

## Ventajas del Plan Elite
- Mayor período de cobertura por fallecimiento (3 meses vs 2 meses)
- Protección extendida para la familia
`
  },

  // ==========================================
  // PLAN SUPERIOR / B1
  // ==========================================
  {
    filename: 'plan_superior_caracteristicas_generales.md',
    content: `---
metadata:
  document_id: "plan_superior_caracteristicas_generales"
  document_type: "plan_caracteristicas"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "informacion_general"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["plan superior", "plan b1", "prepaga", "aportes", "contribuciones", "desregulación", "sin bonos", "sin recetarios"]
  prestaciones: ["urgencias", "consultas", "diagnostico", "medicamentos", "odontologia", "internaciones"]
  ciudad: "todas"
  modalidades: ["desregulacion", "prepaga"]
---

# Plan SUPERIOR / B1 - Características Generales

## Modalidades de Acceso

### Plan Superior (Desregulación)
Se accede a través de la suma de aportes y contribuciones, y un aporte complementario superador, en caso que aquellos no cubran el costo del plan.

Este aporte complementario superador puede ser abonado por distintos medios de pago electrónicos.

**IMPORTANTE:** En caso de producirse la mora en el pago del aporte complementario, y no efectuase su cancelación, automáticamente tendrán los servicios médicos establecidos en el P.M.O (Programa Médico Obligatorio).

### Plan B1 de Medicina Prepaga
Se accede mediante el pago voluntario, de acuerdo al rango etario y composición del grupo familiar.

**Requisitos:**
- Presentación de estudios médicos actualizados
- Detallados en la planilla de "Afiliaciones Prepaga"
- Condiciones de ingreso sujeto a modificaciones

---

## Características Principales
- **Tipo de plan:** Con copagos en determinadas prestaciones (laboratorio, prácticas especiales, salud mental, mediana y alta complejidad)
- **Cartilla:** Amplia cartilla de prestadores
- **Bonos:** Sin bonos
- **Recetarios:** Sin recetarios
- **Atención:** Con credencial virtual (y presentando autorización aprobada previamente por auditoría médica en los casos que corresponda)
- **Vigencia:** Desde 01/01/2025
`
  },
  {
    filename: 'plan_superior_urgencias_emergencias.md',
    content: `---
metadata:
  document_id: "plan_superior_urgencias_emergencias"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "urgencias"
  subcategoria: "emergencias_medicas"
  vigencia: "2025-01-01"
  tiene_copago: false
  cobertura_porcentaje: 100
  requiere_autorizacion: false
  keywords: ["urgencias", "emergencias", "traslados", "ambulancia", "plan superior", "plan b1"]
  prestaciones: ["urgencias", "emergencias", "traslados programados"]
  ciudad: "todas"
---

# Plan SUPERIOR / B1 - Urgencias y Emergencias Médicas

## Cobertura
Se accede solamente con la presentación de la credencial.

## Servicios Incluidos
- ✅ Urgencias médicas
- ✅ Emergencias médicas
- ✅ Traslados programados sin costo (con autorización previa)

## Servicios NO Incluidos
- ❌ Médicos a domicilio

## Requisitos
- **Autorización previa:** Solo para traslados programados
- **Copago:** No tiene copago
- **Credencial:** Presentación de credencial
`
  },
  {
    filename: 'plan_superior_consultas_medicas.md',
    content: `---
metadata:
  document_id: "plan_superior_consultas_medicas"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "consultas_medicas"
  subcategoria: "todas_especialidades"
  vigencia: "2025-01-01"
  tiene_copago: true
  requiere_autorizacion: false
  keywords: ["consultas", "médicos", "especialidades", "AMP", "categorías profesionales", "plan superior", "plan b1", "CIM", "reintegro"]
  prestaciones: ["consultas medicas", "especialidades"]
  ciudad: "la_plata"
  convenios: ["AMP", "CIM"]
  copagos_enero_2025:
    cat_a: 2178
    cat_b: 2420
    cat_c: 4840
  reintegro_cat_b: 2420
---

# Plan SUPERIOR / B1 - Consultas Médicas (Todas las Especialidades)

## Consultas en Centro Integral de Medicina (CIM)
- **Dirección:** Calle 11 nro 729
- **Costo:** SIN CARGO
- **Requisito:** Presentación de credencial

## Consultas con Médicos de A.M.P
**Cobertura:** La Plata, Berisso y Ensenada

### Acceso
- Se accede con la sola presentación de la credencial
- Las consultas se pueden realizar en consultorio o sanatorios con convenio
- **EXCEPCIÓN:** Hospital Italiano NO tiene convenio (enero 2025)

### Aranceles Médicos por Categoría

| Categoría | Copago (Enero 2025) |
|-----------|---------------------|
| CAT. A    | $2,178              |
| CAT. B    | $2,420              |
| CAT. C    | $4,840              |

**Valores Enero 2025 - sujeto a modificaciones según AMP**

---

## Sistema de Reintegro

### Reintegro para Categoría C
**Vía reintegro, Primedic reconoce hasta categoría B**

**Ejemplo:**
- Si el médico categoría C actuante percibe $4,840
- Con la presentación del recibo se reintegra $2,420

**Valores vigentes Enero 2025**
`
  },
  {
    filename: 'plan_superior_diagnostico_imagenes.md',
    content: `---
metadata:
  document_id: "plan_superior_diagnostico_imagenes"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "diagnostico_imagenes"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["radiografías", "ecografías", "tomografías", "resonancias", "mamografías", "doppler", "diagnóstico", "plan superior", "plan b1"]
  prestaciones: ["diagnostico por imagenes", "radiografias", "ecografias", "tomografias", "resonancias"]
  ciudad: "todas"
  prestadores_con_copago: ["CIMED", "MON", "Clínicas"]
---

# Plan SUPERIOR / B1 - Diagnóstico por Imágenes

## Baja Complejidad

### Ecografías
- **Autorización previa:** NO requiere (excepto mediana complejidad)
- **Copago:** NO tiene costo adicional

**EXCEPCIÓN:** Ecografías de mediana complejidad SÍ requieren autorización:
- Ecografía abdominal
- Ecografía endovaginal

### Radiografías
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo adicional

---

## Mediana y Alta Complejidad

### Prácticas que requieren autorización previa:
- Tomografías
- Resonancias
- Mamografías
- Doppler

### Copagos

#### En CIM (Centro Integral de Medicina):
- **SIN copagos**

#### Prestadores CON copago:
- CIMED
- MON
- Clínicas

---

## Ventajas del Plan
- Sin copago en CIM
- Radiografías y ecografías simples sin autorización
`
  },
  {
    filename: 'plan_superior_analisis_clinicos.md',
    content: `---
metadata:
  document_id: "plan_superior_analisis_clinicos"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "laboratorio"
  subcategoria: "analisis_clinicos"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["análisis", "laboratorio", "bioquímica", "cargas virales", "hormonas", "vitaminas", "plan superior", "plan b1"]
  prestaciones: ["analisis clinicos", "laboratorio"]
  ciudad: "todas"
  copago_acto_bioquimico_enero_2025: 15000
---

# Plan SUPERIOR / B1 - Análisis Clínicos

## Cobertura General
**Cobertura:** Prácticas sin costo, a excepción del acto bioquímico

## Autorización Previa
**Requieren autorización previa** solo códigos específicos:
- Cargas virales
- Hormonas
- Vitaminas
- Otros estudios específicos

## Copagos
**Acto bioquímico:** $15,000 (Enero 2025)

**NOTA:** Valores sujetos a modificaciones del Colegio de Bioquímicos
`
  },
  {
    filename: 'plan_superior_rehabilitacion.md',
    content: `---
metadata:
  document_id: "plan_superior_rehabilitacion"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "rehabilitacion"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["rehabilitación", "fisiatría", "kinesiología", "fonoaudiología", "plan superior", "plan b1"]
  prestaciones: ["rehabilitacion", "fisiatra", "kinesiologia", "fonoaudiologia"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Fonoaudiólogos"]
  cobertura_mensual: 5
  cobertura_anual: 25
  copago_enero_2025: 6100
  copago_fonoaudiologia_enero_2025: 7800
---

# Plan SUPERIOR / B1 - Rehabilitación, Fisiatría, Kinesiología, Fonoaudiología

## Rehabilitación, Fisiatría y Kinesiología

### Cobertura
- **Mensual:** Hasta 5 sesiones
- **Anual:** Hasta 25 sesiones

### Copago
**$6,100 por sesión** (Enero 2025 - sujeto a modificaciones)

---

## Fonoaudiología

### Cobertura
**4 sesiones mensuales**

### Centro Integral de Medicina (CIM)
- **Copago:** NO abona copago

### Libre Elección - Colegio de Fonoaudiólogos
- **Copago:** $7,800 por sesión (Enero 2025 - sujeto a modificaciones)
`
  },
  {
    filename: 'plan_superior_salud_mental.md',
    content: `---
metadata:
  document_id: "plan_superior_salud_mental"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "salud_mental"
  subcategoria: "psicologia"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["psicología", "salud mental", "terapia", "psicólogo", "plan superior", "plan b1"]
  prestaciones: ["psicologia", "salud mental"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Psicólogos"]
  requiere_bonos: true
  cobertura_mensual: 4
  cobertura_anual: 30
  copago_cim_enero_2025: 11000
  copago_colegio_enero_2025: 4000
---

# Plan SUPERIOR / B1 - Salud Mental / Psicología

## Requisitos
**Requiere presentación de bonos**

## Cobertura
- **Mensual:** 4 sesiones
- **Anual:** 30 sesiones

---

## Atención en CIM (Centro Integral de Medicina)

### Copago
**$11,000 por sesión** (Enero 2025 - sujeto a modificaciones)

### Cobertura
4 sesiones mensuales

---

## Libre Elección - Colegio de Psicólogos

### Arancel Diferenciado
**$4,000 por sesión** (Enero 2025 - sujeto a modificaciones)

### Características
- Libre elección de profesional
- Presentación de bonos
- Cobertura de 4 sesiones mensuales
`
  },
  {
    filename: 'plan_superior_medicamentos.md',
    content: `---
metadata:
  document_id: "plan_superior_medicamentos"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "medicamentos"
  subcategoria: "ambulatorios"
  vigencia: "2025-01-01"
  tiene_copago: true
  cobertura_porcentaje: 40
  cobertura_especial:
    oncologicos: 100
    diabetes: 100
    hiv: 100
    asma: 70
    tiroides: 70
    hta: 70
  keywords: ["medicamentos", "farmacia", "recetas", "cobertura", "plan superior", "plan b1"]
  prestaciones: ["medicamentos ambulatorios"]
  ciudad: "todas"
  requiere_formulario_amp: true
---

# Plan SUPERIOR / B1 - Medicamentos Ambulatorios

## Cobertura General
**Cobertura del 40%** sobre el precio de venta del medicamento

### Requisitos
- **Vademecum:** Sin vademecum (todos los medicamentos cubiertos)
- **Prescripción:** Formulario R/P de A.M.P
- **Autorización previa:** NO requiere para medicamentos comunes

---

## Coberturas Especiales

### Cobertura al 100%
- 🔴 Medicamentos oncológicos
- 💉 Medicamentos para diabetes
- 🔬 Medicamentos para HIV

### Cobertura al 70%
**Prestador asignado:**
- 🫁 Asma
- 🦋 Tiroides
- ❤️ HTA (Hipertensión Arterial)

---

## Forma de Uso
1. Obtener prescripción médica en formulario R/P de A.M.P
2. Presentar en farmacia con credencial
3. Pagar el porcentaje correspondiente según cobertura
`
  },
  {
    filename: 'plan_superior_odontologia.md',
    content: `---
metadata:
  document_id: "plan_superior_odontologia"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "odontologia"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["odontología", "dentista", "prótesis", "ortodoncia", "plan superior", "plan b1"]
  prestaciones: ["odontologia general", "protesis", "ortodoncia"]
  ciudad: "la_plata"
  convenios: ["CIM", "Sociedad Odontológica de La Plata", "Agremiación Odontológica Bonaerense"]
  practicas_mensuales: 2
  copagos_octubre_2024:
    consultas: 2100
    extracciones: 4500
    conducto: 11600
  reintegro_ortodoncia_enero_2025:
    denticion_mixta: 40000
    denticion_permanente: 61000
---

# Plan SUPERIOR / B1 - Odontología General

## Cobertura
**Hasta 2 prácticas mensuales**

## Prestadores
### Con Convenio:
- ✅ CIM (Centro Integral de Medicina)
- ✅ Sociedad Odontológica de La Plata (SOLP)
- ✅ Agremiación Odontológica Bonaerense (AOB)

---

## Copagos por Tratamiento
**Valores Octubre 2024 (sujeto a modificaciones)**

| Tratamiento | Copago |
|-------------|---------|
| Consultas | $2,100 |
| Extracciones | $4,500 |
| Tratamiento de conducto | $11,600 |

---

## Prótesis Dentales
**Plan de cobertura:**
- 20% de descuento aplicado sobre el presupuesto realizado por los odontólogos del CIM

---

## Ortodoncia
**Reintegro hasta 15 años de edad**

Montos fijos según tipo de dentición:

| Tipo de Dentición | Reintegro (Enero 2025) |
|-------------------|------------------------|
| Dentición mixta | $40,000 |
| Dentición permanente | $61,000 |

**NOTA:** Valores sujetos a modificaciones
`
  },
  {
    filename: 'plan_superior_internaciones.md',
    content: `---
metadata:
  document_id: "plan_superior_internaciones"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "internaciones"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  cobertura_pension: 100
  cobertura_medicamentos: 100
  cobertura_material_descartable: 100
  keywords: ["internaciones", "cirugías", "clínicas", "honorarios médicos", "plan superior", "plan b1", "terapia intensiva"]
  prestaciones: ["internaciones clinicas", "internaciones quirurgicas", "terapia intensiva", "unidad coronaria"]
  ciudad: "todas"
  honorarios_enero_2025:
    parto_cesarea_cat_c: 42700
---

# Plan SUPERIOR / B1 - Internaciones Clínicas y Quirúrgicas

## Cobertura Base
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable

---

## Honorarios Médicos
**Los costos varían según la categoría del profesional**

### Ejemplo: Parto/Cesárea

| Categoría Profesional | Cobertura |
|-----------------------|-----------|
| **CAT. A** | 100% (sin costo adicional) |
| **CAT. B** | 100% (sin costo adicional) |
| **CAT. C** | Especialista: $42,700 |

**Valores Enero 2025 - sujeto a modificaciones**

**Nota:** Profesionales CAT. A y CAT. B no abonan honorarios médicos

### Otras Cirugías
- **Misma estructura de cobertura**
- Costos mayores o menores dependiendo del tipo de intervención
- Siempre cobertura 100% en categorías A y B
- Copagos solo en categoría C

---

## Alta Complejidad

### Neurocirugía / Cirugía Cardiovascular
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable

⚠️ **Honorarios médicos:**
- Misma cobertura que cirugías estándar
- Solo especialista categoría C tiene costo adicional

**Valores sujeto a modificaciones**

---

## Internaciones Psiquiátricas
**Cobertura:** Hasta 30 días al año
`
  },
  {
    filename: 'plan_superior_maternidad.md',
    content: `---
metadata:
  document_id: "plan_superior_maternidad"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "maternidad"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  cobertura_porcentaje: 100
  keywords: ["maternidad", "embarazo", "parto", "cesárea", "bebé", "plan superior", "plan b1"]
  prestaciones: ["partos", "embarazo", "control prenatal", "control pediatrico"]
  ciudad: "todas"
---

# Plan SUPERIOR / B1 - Maternidad

## Cobertura Integral
**Partos y embarazos con cobertura integral**

---

## Cobertura para la Mamá
✅ **Atención completa del embarazo:**
- Controles prenatales
- Estudios de laboratorio
- Ecografías
- Parto o cesárea

---

## Cobertura para el Bebé
✅ **Controles hasta el primer año de vida:**
- Controles pediátricos
- Vacunación
- Estudios de rutina
- Atención médica general

---

## Detalles de Cobertura
Para información sobre costos de parto/cesárea según categoría del profesional, ver documento de **Internaciones**.

**Nota:** Solo profesionales categoría C tienen costo adicional
`
  },
  {
    filename: 'plan_superior_protesis_ortesis.md',
    content: `---
metadata:
  document_id: "plan_superior_protesis_ortesis"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "protesis_ortesis"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["prótesis", "ortesis", "implantes", "plan superior", "plan b1"]
  prestaciones: ["protesis", "ortesis"]
  ciudad: "todas"
  cobertura_protesis_nacionales: 100
  cobertura_protesis_importadas: 50
  cobertura_ortesis: 50
---

# Plan SUPERIOR / B1 - Prótesis y Ortesis

## Prótesis

### Prótesis Nacionales
**Cobertura: 100%**
- Sin costo adicional para el afiliado
- **NO incluye prótesis odontológicas**

### Prótesis Importadas
**Cobertura: 50%**
- El afiliado abona el 50% restante
- **NO incluye prótesis odontológicas**

---

## Ortesis

### Cobertura General
**Cobertura: 50%**

### Requisitos
- **Sujeto a aprobación** del presupuesto presentado por el afiliado
- Presentar presupuesto para evaluación
- Autorización previa de auditoría médica

---

## Notas Importantes
- Las prótesis odontológicas tienen cobertura específica (ver documento de Odontología)
- Para ambos casos se requiere autorización previa
- Los porcentajes se aplican sobre el presupuesto aprobado
`
  },
  {
    filename: 'plan_superior_opticas.md',
    content: `---
metadata:
  document_id: "plan_superior_opticas"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "opticas"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["ópticas", "anteojos", "lentes", "plan superior", "plan b1"]
  prestaciones: ["opticas", "anteojos", "lentes"]
  ciudad: "todas"
  cobertura_anual: 1
  descuento_fuera_stock_enero_2025: 30000
---

# Plan SUPERIOR / B1 - Ópticas

## Cobertura Anual
**Un (1) par de anteojos por año**

---

## Anteojos con Cobertura al 100%
**Sin cargo** en ópticas de cartilla según convenio vigente

### Condiciones:
- Stock disponible en ópticas con convenio
- Presentación de prescripción oftalmológica
- Credencial del afiliado

---

## Anteojos Fuera de Stock

### Descuento Especial
Si solicita anteojos que están fuera del stock con cobertura al 100%, se aplicará:

**Descuento: $30,000** (Enero 2025 - sujeto a modificaciones)

---

## Lentes de Laboratorio
❌ **Sin cobertura**
- Los lentes de laboratorio no tienen cobertura
- Costo 100% a cargo del afiliado

---

## Ópticas de Cartilla
Consultar listado actualizado de ópticas con convenio en la cartilla de prestadores.
`
  },
  {
    filename: 'plan_superior_otras_prestaciones.md',
    content: `---
metadata:
  document_id: "plan_superior_otras_prestaciones"
  document_type: "plan_prestaciones"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "otras_prestaciones"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["cirugías laparoscópicas", "cirugía refractiva", "PMO", "plan superior", "plan b1"]
  prestaciones: ["cirugia laparoscopica", "cirugia refractiva"]
  ciudad: "todas"
  segun_pmo: true
---

# Plan SUPERIOR / B1 - Otras Prestaciones

## Cirugías Laparoscópicas
**Cobertura según reglamento P.M.O** (Programa Médico Obligatorio)

### Características:
- Cobertura de acuerdo a normativa vigente del PMO
- Requiere autorización previa
- Cobertura en clínicas de cartilla

---

## Cirugía Refractiva
**Cobertura según reglamento P.M.O** (Programa Médico Obligatorio)

### Características:
- Cobertura de acuerdo a normativa vigente del PMO
- Requiere autorización previa
- Evaluación por auditoría médica
- Cobertura en prestadores autorizados

---

## Notas
Las prestaciones están sujetas a las condiciones y requisitos establecidos en el Programa Médico Obligatorio (PMO) vigente.
`
  },
  {
    filename: 'plan_superior_servicios_adicionales.md',
    content: `---
metadata:
  document_id: "plan_superior_servicios_adicionales"
  document_type: "plan_servicios_adicionales"
  plan: "superior"
  plan_prepaga: "b1"
  categoria_prestacion: "servicios_adicionales"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["asistencia al viajero", "seguro de sepelio", "cobertura por fallecimiento", "plan superior", "plan b1"]
  prestaciones: ["asistencia al viajero", "seguro de sepelio"]
  ciudad: "todas"
  proveedor_asistencia: "Universal Assistance"
  cobertura_fallecimiento_meses: 2
---

# Plan SUPERIOR / B1 - Servicios Adicionales

## Asistencia al Viajero
**Dentro del país**

### Proveedor:
**Universal Assistance**

### Cobertura:
- Asistencia médica en viajes dentro de Argentina
- Emergencias médicas
- Traslados sanitarios

**NOTA:** Servicio sujeto a modificaciones

---

## Seguro de Sepelio
**Servicio adicional**

### Características:
- Servicio complementario
- Sujeto a modificaciones

---

## Cobertura por Fallecimiento del Titular
**Protección para el grupo familiar**

### Beneficio:
**2 meses de cobertura sin cargo** para el grupo familiar ante el fallecimiento del afiliado titular

### Condiciones:
- Automático al fallecimiento del titular
- Cubre todo el grupo familiar inscripto
- Período: 2 meses desde el fallecimiento
- Permite reorganización de la cobertura familiar
`
  },
];

async function generateMarkdowns() {
  const outputDir = path.join(__dirname, '../data/plan_documents');
  
  // Crear carpeta si no existe
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('📝 Generando archivos Markdown adicionales...\n');
  
  let countElite = 0;
  let countSuperior = 0;
  
  for (const file of markdownFiles) {
    const filePath = path.join(outputDir, file.filename);
    await fs.writeFile(filePath, file.content, 'utf-8');
    console.log(`✅ Creado: ${file.filename}`);
    
    if (file.filename.includes('elite')) countElite++;
    if (file.filename.includes('superior')) countSuperior++;
  }
  
  console.log(`\n🎉 Resumen:`);
  console.log(`   - Plan ELITE: ${countElite} archivos`);
  console.log(`   - Plan SUPERIOR/B1: ${countSuperior} archivos`);
  console.log(`   - Total: ${markdownFiles.length} archivos`);
  console.log(`\n📁 Ubicación: ${outputDir}`);
}

generateMarkdowns().catch(console.error);