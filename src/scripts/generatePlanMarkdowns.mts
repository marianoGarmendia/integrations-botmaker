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
  // PLAN BASIC
  // ==========================================
  {
    filename: 'plan_basic_caracteristicas_generales.md',
    content: `---
metadata:
  document_id: "plan_basic_caracteristicas_generales"
  document_type: "plan_caracteristicas"
  plan: "plan_a_basic"
  categoria_prestacion: "informacion_general"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["plan basic", "aportes", "contribuciones", "desregulación", "copagos", "credencial virtual"]
  prestaciones: ["urgencias", "consultas", "diagnostico", "medicamentos", "odontologia", "internaciones"]
  ciudad: "todas"
---

# Plan BASIC - Características Generales

## Acceso al Plan
Se accede al Plan básico a través de la suma de aportes y contribuciones; y un aporte complementario superador en caso que aquellos no cubran el costo del plan. 

Este aporte complementario superador puede ser abonado por distintos medios de pago electrónicos. 

**IMPORTANTE:** En caso que se produzca la mora en el pago de aportes complementarios y no se cancele, automáticamente tendrán los servicios médicos establecidos en el P.M.O (Programa Médico Obligatorio).

## Características Principales
- **Tipo de plan:** Con copagos en determinadas prestaciones
- **Cartilla:** Amplia cartilla de prestadores
- **Atención:** Con credencial virtual y presentando formulario de autorización previa, en aquellas prácticas y/o prestaciones que requieran auditoría médica
- **Vigencia:** Desde 01/01/2025
`
  },
  {
    filename: 'plan_basic_urgencias_emergencias.md',
    content: `---
metadata:
  document_id: "plan_basic_urgencias_emergencias"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "urgencias"
  subcategoria: "emergencias_medicas"
  vigencia: "2025-01-01"
  tiene_copago: false
  cobertura_porcentaje: 100
  requiere_autorizacion: false
  keywords: ["urgencias", "emergencias", "traslados", "ambulancia", "plan basic"]
  prestaciones: ["urgencias", "emergencias", "traslados programados"]
  ciudad: "todas"
---

# Plan BASIC - Urgencias y Emergencias Médicas

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
    filename: 'plan_basic_consultas_medicas.md',
    content: `---
metadata:
  document_id: "plan_basic_consultas_medicas"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "consultas_medicas"
  subcategoria: "todas_especialidades"
  vigencia: "2025-01-01"
  tiene_copago: true
  requiere_autorizacion: false
  keywords: ["consultas", "médicos", "especialidades", "AMP", "categorías profesionales", "plan basic", "CIM"]
  prestaciones: ["consultas medicas", "especialidades"]
  ciudad: "la_plata"
  convenios: ["AMP", "CIM"]
  copagos_enero_2025:
    cat_a: 2420
    cat_b: 4840
    cat_c: 6050
---

# Plan BASIC - Consultas Médicas (Todas las Especialidades)

## Consultas en Centro Integral de Medicina (CIM)
- **Dirección:** Calle 11 nro 729
- **Costo:** SIN CARGO
- **Requisito:** Presentación de credencial

## Consultas con Médicos de A.M.P
**Cobertura:** La Plata, Berisso y Ensenada

### Acceso
- Se accede con la sola presentación de la credencial
- Las consultas se pueden realizar en cualquier consultorio o sanatorio
- **Incluye:** Clínicas y sanatorios con convenio con Primedic Salud
- **EXCEPCIÓN:** Hospital Italiano NO tiene convenio (enero 2025)

### Aranceles Médicos por Categoría
Los médicos perciben un arancel diferenciado según la categoría profesional, y **no tiene posibilidad de reintegro**:

| Categoría | Arancel (Enero 2025) |
|-----------|---------------------|
| CAT. A    | $2,420              |
| CAT. B    | $4,840              |
| CAT. C    | $6,050              |

**NOTA:** Valores sujetos a modificaciones según AMP
`
  },
  {
    filename: 'plan_basic_diagnostico_imagenes.md',
    content: `---
metadata:
  document_id: "plan_basic_diagnostico_imagenes"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "diagnostico_imagenes"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["radiografías", "ecografías", "tomografías", "resonancias", "mamografías", "doppler", "diagnóstico", "plan basic"]
  prestaciones: ["diagnostico por imagenes", "radiografias", "ecografias", "tomografias", "resonancias"]
  ciudad: "todas"
  prestadores_sin_copago: ["CIM", "Ciencia y Tecnología", "Policlínica Dres. Canedo", "Open Image", "Progest", "Cien Ensenada"]
  prestadores_con_copago: ["CIMED", "Centro de Diagnóstico Mon", "Clínicas"]
---

# Plan BASIC - Diagnóstico por Imágenes

## Baja Complejidad

### Radiografías
- **Autorización previa:** NO requiere
- **Copago:** NO tiene costo
- **Cobertura:** 100%

### Ecografías
- **Autorización previa:** SÍ requiere
- **Copago:** Variable según prestador

#### Prestadores SIN copago:
- CIM
- Ciencia y Tecnología
- Policlínica Dres. Canedo
- Open Image
- Progest
- Cien (Ensenada)

#### Prestadores CON copago:
- CIMED
- Centro de Diagnóstico Mon
- Clínicas

---

## Mediana y Alta Complejidad

### Prácticas que requieren autorización previa:
- Tomografías
- Resonancias
- Mamografías
- Doppler

### Copagos

#### Prestadores SIN copago:
- CIM
- Ciencia y Tecnología
- Policlínica Dres. Canedo
- Open Image
- Progest
- Cien (Ensenada)

#### Prestadores CON copago:
- CIMED
- Centro de Diagnóstico Mon
- Clínicas
`
  },
  {
    filename: 'plan_basic_analisis_clinicos.md',
    content: `---
metadata:
  document_id: "plan_basic_analisis_clinicos"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "laboratorio"
  subcategoria: "analisis_clinicos"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["análisis", "laboratorio", "bioquímica", "cargas virales", "hormonas", "vitaminas", "plan basic"]
  prestaciones: ["analisis clinicos", "laboratorio"]
  ciudad: "todas"
  copago_acto_bioquimico_enero_2025: 15000
---

# Plan BASIC - Análisis Clínicos

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
    filename: 'plan_basic_rehabilitacion.md',
    content: `---
metadata:
  document_id: "plan_basic_rehabilitacion"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "rehabilitacion"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["rehabilitación", "fisiatría", "kinesiología", "fonoaudiología", "plan basic"]
  prestaciones: ["rehabilitacion", "fisiatra", "kinesiologia", "fonoaudiologia"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Fonoaudiólogos"]
  cobertura_mensual: 5
  cobertura_anual: 25
  copago_enero_2025: 11000
---

# Plan BASIC - Rehabilitación, Fisiatría, Kinesiología, Fonoaudiología

## Rehabilitación, Fisiatría y Kinesiología

### Cobertura
- **Mensual:** Hasta 5 sesiones
- **Anual:** Hasta 25 sesiones

### Copago
**$11,000 por sesión** (Enero 2025 - sujeto a modificaciones)

---

## Fonoaudiología

### Cobertura
**4 sesiones mensuales**

### Centro Integral de Medicina (CIM)
- **Copago:** NO abona copago

### Libre Elección - Colegio de Fonoaudiólogos
- **Copago:** $11,000 por sesión (Enero 2025 - sujeto a modificaciones)
`
  },
  {
    filename: 'plan_basic_salud_mental.md',
    content: `---
metadata:
  document_id: "plan_basic_salud_mental"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "salud_mental"
  subcategoria: "psicologia"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["psicología", "salud mental", "terapia", "psicólogo", "plan basic"]
  prestaciones: ["psicologia", "salud mental"]
  ciudad: "todas"
  convenios: ["CIM", "Colegio de Psicólogos"]
  requiere_bonos: true
  cobertura_mensual: 4
  cobertura_anual: 30
  copago_cim_enero_2025: 12200
  copago_colegio_enero_2025: 4500
---

# Plan BASIC - Salud Mental / Psicología

## Requisitos
**Requiere presentación de bonos**

## Cobertura
- **Mensual:** 4 sesiones
- **Anual:** 30 sesiones

---

## Atención en CIM (Centro Integral de Medicina)

### Copago
**$12,200 por sesión** (Enero 2025 - sujeto a modificaciones)

### Cobertura
4 sesiones mensuales

---

## Libre Elección - Colegio de Psicólogos

### Arancel Diferenciado
**$4,500 por sesión** (Enero 2025 - sujeto a modificaciones)

### Características
- Libre elección de profesional
- Presentación de bonos
- Cobertura de 4 sesiones mensuales
`
  },
  {
    filename: 'plan_basic_medicamentos.md',
    content: `---
metadata:
  document_id: "plan_basic_medicamentos"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
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
  keywords: ["medicamentos", "farmacia", "recetas", "cobertura", "plan basic", "vademecum"]
  prestaciones: ["medicamentos ambulatorios"]
  ciudad: "todas"
  requiere_formulario_amp: true
---

# Plan BASIC - Medicamentos Ambulatorios

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
    filename: 'plan_basic_odontologia.md',
    content: `---
metadata:
  document_id: "plan_basic_odontologia"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "odontologia"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["odontología", "dentista", "prótesis", "ortodoncia", "plan basic"]
  prestaciones: ["odontologia general", "protesis", "ortodoncia"]
  ciudad: "la_plata"
  convenios: ["CIM", "Sociedad Odontológica de La Plata", "Agremiación Odontológica Bonaerense"]
  practicas_mensuales: 2
  copagos_octubre_2024:
    consultas: 3250
    extracciones: 6300
    conducto: 14500
  reintegro_ortodoncia_enero_2025:
    denticion_mixta: 34000
    denticion_permanente: 44000
---

# Plan BASIC - Odontología General

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
| Consultas | $3,250 |
| Extracciones | $6,300 |
| Tratamiento de conducto | $14,500 |

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
| Dentición mixta | $34,000 |
| Dentición permanente | $44,000 |

**NOTA:** Valores sujetos a modificaciones
`
  },
  {
    filename: 'plan_basic_internaciones.md',
    content: `---
metadata:
  document_id: "plan_basic_internaciones"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "internaciones"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  cobertura_pension: 100
  cobertura_medicamentos: 100
  cobertura_material_descartable: 100
  keywords: ["internaciones", "cirugías", "clínicas", "honorarios médicos", "plan basic", "terapia intensiva"]
  prestaciones: ["internaciones clinicas", "internaciones quirurgicas", "terapia intensiva", "unidad coronaria"]
  ciudad: "todas"
  honorarios_enero_2025:
    parto_cesarea_cat_b_especialista: 54900
    parto_cesarea_cat_b_ayudante: 9100
    parto_cesarea_cat_c_especialista: 67800
    parto_cesarea_cat_c_ayudante: 10950
---

# Plan BASIC - Internaciones Clínicas y Quirúrgicas

## Cobertura Base
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable
- Terapia intensiva
- Unidad coronaria

---

## Honorarios Médicos
**Los costos varían según la categoría del profesional**

### Ejemplo: Parto/Cesárea

| Categoría Profesional | Cobertura |
|-----------------------|-----------|
| **CAT. A** | 100% (sin costo adicional) |
| **CAT. B** | Especialista: $54,900 <br> Ayudante: $9,100 (si se requiere) |
| **CAT. C** | Especialista: $67,800 <br> Ayudante: $10,950 (si se requiere) |

**Valores Enero 2025 - sujeto a modificaciones**

### Otras Cirugías
- **Misma estructura de cobertura**
- Costos mayores o menores dependiendo del tipo de intervención
- Siempre cobertura 100% en categoría A
- Copagos en categorías B y C

---

## Alta Complejidad

### Neurocirugía / Cirugía Cardiovascular
✅ **Cobertura al 100%:**
- Pensión
- Medicamentos
- Material descartable

⚠️ **Honorarios médicos:**
- Costos según categoría del profesional
- Costos según tipo de intervención
- Incluye ayudante si se requiere

**Valores sujeto a modificaciones**

---

## Internaciones Psiquiátricas
**Cobertura:** Hasta 30 días al año
`
  },
  {
    filename: 'plan_basic_maternidad.md',
    content: `---
metadata:
  document_id: "plan_basic_maternidad"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "maternidad"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  cobertura_porcentaje: 100
  keywords: ["maternidad", "embarazo", "parto", "cesárea", "bebé", "plan basic"]
  prestaciones: ["partos", "embarazo", "control prenatal", "control pediatrico"]
  ciudad: "todas"
---

# Plan BASIC - Maternidad

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
`
  },
  {
    filename: 'plan_basic_protesis_ortesis.md',
    content: `---
metadata:
  document_id: "plan_basic_protesis_ortesis"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "protesis_ortesis"
  vigencia: "2025-01-01"
  tiene_copago: true
  keywords: ["prótesis", "ortesis", "implantes", "plan basic"]
  prestaciones: ["protesis", "ortesis"]
  ciudad: "todas"
  cobertura_protesis_nacionales: 100
  cobertura_protesis_importadas: 50
  cobertura_ortesis: 50
---

# Plan BASIC - Prótesis y Ortesis

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
    filename: 'plan_basic_opticas.md',
    content: `---
metadata:
  document_id: "plan_basic_opticas"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "opticas"
  vigencia: "2025-01-01"
  tiene_copago: "variable"
  keywords: ["ópticas", "anteojos", "lentes", "plan basic"]
  prestaciones: ["opticas", "anteojos", "lentes"]
  ciudad: "todas"
  cobertura_anual: 1
  descuento_fuera_stock_enero_2025: 30000
---

# Plan BASIC - Ópticas

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
    filename: 'plan_basic_otras_prestaciones.md',
    content: `---
metadata:
  document_id: "plan_basic_otras_prestaciones"
  document_type: "plan_prestaciones"
  plan: "plan_a_basic"
  categoria_prestacion: "otras_prestaciones"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["cirugías laparoscópicas", "cirugía refractiva", "PMO", "plan basic"]
  prestaciones: ["cirugia laparoscopica", "cirugia refractiva"]
  ciudad: "todas"
  segun_pmo: true
---

# Plan BASIC - Otras Prestaciones

## Cirugías Laparoscópicas
**Cobertura según P.M.O** (Programa Médico Obligatorio)

### Características:
- Cobertura de acuerdo a normativa vigente del PMO
- Requiere autorización previa
- Cobertura en clínicas de cartilla

---

## Cirugía Refractiva
**Cobertura según P.M.O** (Programa Médico Obligatorio)

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
    filename: 'plan_basic_servicios_adicionales.md',
    content: `---
metadata:
  document_id: "plan_basic_servicios_adicionales"
  document_type: "plan_servicios_adicionales"
  plan: "plan_a_basic"
  categoria_prestacion: "servicios_adicionales"
  vigencia: "2025-01-01"
  tiene_copago: false
  keywords: ["asistencia al viajero", "seguro de sepelio", "cobertura por fallecimiento", "plan basic"]
  prestaciones: ["asistencia al viajero", "seguro de sepelio"]
  ciudad: "todas"
  proveedor_asistencia: "Universal Assistance"
---

# Plan BASIC - Servicios Adicionales

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
**Servicio adicional al plan de cobertura médica**

### Características:
- Servicio complementario
- No incluido en cuota base
- Contratación opcional

**NOTA:** Servicio sujeto a modificaciones

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

  // ==========================================
  // Continúa con los archivos de otros planes...
  // ==========================================
];

async function generateMarkdowns() {
  const outputDir = path.join(__dirname, '../data/plan_documents');
  
  // Crear carpeta si no existe
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('📝 Generando archivos Markdown...\n');
  
  for (const file of markdownFiles) {
    const filePath = path.join(outputDir, file.filename);
    await fs.writeFile(filePath, file.content, 'utf-8');
    console.log(`✅ Creado: ${file.filename}`);
  }
  
  console.log(`\n🎉 Se generaron ${markdownFiles.length} archivos en: ${outputDir}`);
}

generateMarkdowns().catch(console.error);