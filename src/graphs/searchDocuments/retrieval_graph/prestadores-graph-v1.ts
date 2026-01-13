import { primedicsaludData } from "../data/prestadores.mjs";
import {z} from "zod"
import { tool } from "@langchain/core/tools";  
 // SISTEMA DE BÚSQUEDA ROBUSTO PARA PRESTADORES DE SALUD

// 1. UTILIDADES DE NORMALIZACIÓN
function removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  function normalizeText(text: string): string {
    return removeAccents(text)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')     // Reemplaza puntuación por espacios
      .replace(/\s+/g, ' ')         // Normaliza espacios múltiples
      .trim();
  }
  
  // 2. KEYWORDS EXPANDIDAS CON VARIACIONES Y RAÍCES
  const expandedSearchKeywords = {
    // Servicios generales
    "urgencia|emergencia|guardia|urgente|emergente": ["urgencias_medicas"],
    "turno|cita|consulta|reserva|agendar|programar": ["asistente_virtual", "CIM"],
    "afiliacion|afiliar|inscribir|inscripcion|asociar": ["afiliaciones"],
    
    // Especialidades médicas con variaciones
    "pediatr|niño|bebe|infant|neonat|peque": ["CLÍNICA DEL NIÑO"],
    "ojo|oftalm|vision|vista|ver|visual|ocular": ["CLÍNICA PRIVADA PLATENSE DE LAS ENFERMEDADES DE LOS OJOS"],
    "corazon|cardio|cardiovascular|cardiac|coronar|arterial|tension": ["INSTITUTO DEL DIAGNÓSTICO CARDIOVASCULAR", "INSTITUTO DE CARDIOLOGÍA"],
    "mama|seno|pecho|breast|mastolog": ["BREAST CLÍNICA DE MAMAS"],
    "neuro|psiquiatr|mental|cerebro|mente|depres|ansied": ["CLÍNICA PRIVADA NEUROPSIQUIÁTRICA"],
    "rehabilit|kinesio|fisio|terapia.fisica|recuperac|lesion|dolor|muscul|articular|rodilla|espalda|hombro": ["CORPUS", "IFI", "CREAA", "CIREC", "FUNDACIÓN QUARELLO"],
    "fonoaudio|habla|lenguaj|comunicac|tartamude|pronunciac": ["FONIATRÍA, AUDIOLOGÍA, LOGOPEDIA PLATENSE", "CIVE"],
    
    // Servicios específicos expandidos
    "farmaci|medicament|remedi|droga|pastilla|jarabe": ["farmacias"],
    "optic|antejo|lente|gafa|vision|graduac": ["opticas"],
    "odonto|diente|dental|dentist|muela|carie|ortodoncia|endodoncia": ["odontologia"],
    "radiograf|tomograf|ecograf|resonanc|scanner|imagen|diagnostico.imagen": ["diagnostico_imagenes"],
    "analisis|laboratori|sangre|orina|estudio|extraccion": ["laboratorios"],
    "psicolog|terapia|salud.mental|estres|emotion": ["psicologia"],
    
    // Ubicaciones (mantenidas)
    "la.plata|centro|casco.historico": ["la_plata"],
    "berisso": ["berisso"],
    "ensenada": ["ensenada"],
    "city.bell": ["city_bell"],
    "gonnet": ["gonnet"],
    "villa.elisa": ["villa_elisa"],
    "villa.elvira": ["villa_elvira"],
    "los.hornos": ["los_hornos"],
    "romero": ["romero"],
    "ringuelet": ["ringuelet"],
    "gorina": ["gorina"]
  };
  
  // 3. DICCIONARIO DE SINÓNIMOS Y VARIACIONES
  const synonymDictionary = {
    // Raíces médicas comunes
    "cardio": ["corazon", "cardiaco", "cardiovascular", "coronario"],
    "neuro": ["cerebro", "mental", "neurologico", "nervioso"],
    "oftalmo": ["ojo", "ocular", "vision", "visual"],
    "odonto": ["diente", "dental", "bucal"],
    "traumato": ["hueso", "fractura", "ortopedico"],
    "dermato": ["piel", "cutaneo", "dermatologico"],
    "gastro": ["estomago", "digestivo", "intestinal"],
    "uro": ["orina", "riñon", "urinario"],
    
    // Variaciones comunes
    "doctor": ["medico", "dr", "profesional"],
    "clinica": ["centro", "instituto", "sanatorio"],
    "rehabilitar": ["recuperar", "sanar", "curar", "mejorar"],
    "dolor": ["molestia", "malestar", "problema"],
    "turno": ["cita", "consulta", "hora", "reserva"]
  };

   // Expandir una palabra con sus sinónimos
   function expandWordWithSynonyms(word: string): string[] {
    const expanded = [word];
    
    // Buscar sinónimos exactos
    if (synonymDictionary[word as keyof typeof synonymDictionary]) {
      expanded.push(...synonymDictionary[word as keyof typeof synonymDictionary]);
    }
    
    // Buscar por raíces (palabras que contienen la palabra)
    Object.keys(synonymDictionary).forEach(root => {
      if (word.includes(root) && root !== word) {
        expanded.push(...synonymDictionary[root as keyof typeof synonymDictionary]);
      }
    });
    
    return [...new Set(expanded)]; // Eliminar duplicados
  }
  
    // Crear regex flexible para una palabra
    function createFlexibleWordRegex(word: string): RegExp {
        // Expandir con sinónimos
        const variations = expandWordWithSynonyms(word);
        
        // Crear patrón que busque cualquier variación como palabra completa o parcial
        const patterns = variations.map((variation: string) => {
          // Si es una palabra corta (raíz), buscarla como parte de palabra
          if (variation.length <= 4) {
            return `\\b\\w*${variation}\\w*\\b`;
          }
          // Si es palabra larga, buscarla más específicamente
          return `\\b\\w*${variation}\\w*\\b|\\b${variation}\\b`;
        });
        
        return new RegExp(`(${patterns.join('|')})`, 'gi');
      }

   // Método principal de matching
   function matchKeywords(query: string, keywordPattern: string): {
    matches: boolean;
    foundKeywords: string[];
    score: number;
  } {
    const normalizedQuery = normalizeText(query);
    const keywords = keywordPattern.split('|').map(k => k.trim());
    
    let foundKeywords: string[] = [];
    let totalMatches = 0;
    
    for (const keyword of keywords) {
      const keywordRegex = new RegExp(keyword.replace(/\./g, '\\.'), 'gi');
      const flexibleRegex = createFlexibleWordRegex(keyword);
      
      // Buscar coincidencia exacta
      if (keywordRegex.test(normalizedQuery)) {
        foundKeywords.push(keyword);
        totalMatches += 2; // Peso mayor para coincidencias exactas
        continue;
      }
      
      // Buscar coincidencia flexible
      if (flexibleRegex.test(normalizedQuery)) {
        foundKeywords.push(keyword);
        totalMatches += 1; // Peso menor para coincidencias flexibles
      }
    }
    
    // Calcular score basado en matches y longitud de keywords
    const score = totalMatches / keywords.length;
    
    return {
      matches: foundKeywords.length > 0,
      foundKeywords: [...new Set(foundKeywords)],
      score
    };
  }
  



  // ESTRATEGIA 3: Función de búsqueda inteligente para LangGraph

  export const createPrimedicsaludSearchTool = tool(
    async ({query}:{query:string})=>{
        const cleanQuery =  query
        .trim()                    // Elimina espacios al inicio y final
        .toLowerCase()             // Convierte a minúsculas
        .replace(/\s+/g, ' ')      // Reemplaza múltiples espacios por uno solo
        .replace(/\s/g, ''); 
        const normalizedQuery = cleanQuery;
        const results = [];

        console.log("normalizedQuery in tool createPrimedicsaludSearchTool: ", normalizedQuery)
        
        // Buscar por tipo de servicio
        for (const [keywords, services] of Object.entries(expandedSearchKeywords)) {
          const match = matchKeywords(normalizedQuery, keywords);
          console.log("match in tool createPrimedicsaludSearchTool: ", match)
          if (match.matches) {
            console.log("services in tool createPrimedicsaludSearchTool: ", services)
            services.forEach(serviceKey => {
              const serviceData = findServiceInData(serviceKey, primedicsaludData);
              if (serviceData) results.push(...serviceData);
            });
          }
        }
        
        // Buscar por nombre específico
        if (results.length === 0) {
            console.log("No se encontraron resultados por tipo de servicio")
          results.push(...searchByName(normalizedQuery, primedicsaludData));
        }
        
        console.log("results finder in tool createPrimedicsaludSearchTool: ")
        console.dir(results, {depth: null})
        // Filtrar por ubicación si se especifica
        const locationResults = filterByLocation(results, normalizedQuery);

        console.log("locationResults finder in tool createPrimedicsaludSearchTool: ")
        console.dir(locationResults, {depth: null})
        
        return {
          query: query,
          results: locationResults.length > 0 ? locationResults : results,
          total: locationResults.length || results.length
        };
    },
    {
    name: "buscar_prestador_primedicsalud",
    description: "Busca prestadores de salud de Primedic Salud según ubicación, especialidad o tipo de servicio, pueden ser servicios generales, especialidades médicas, servicios específicos, ubicaciones",
    schema: z.object({
      query: z.string().describe("La consulta del usuario, por ejemplo: 'Quiero buscar un odontólogo en la ciudad de La Plata','Con que farmacias tengo descuentos','Quiero sacar un turno para kinesiología' ") ,
    }),
  })
//   function xcreatePrimedicsaludSearchTool() {
//     return {
//       name: "buscar_prestador_primedicsalud",
//       description: "Busca prestadores de salud de Primedic Salud según ubicación, especialidad o tipo de servicio",
      
//       async execute(query: string) {
//         const normalizedQuery = query.toLowerCase();
//         const results = [];
        
//         // Buscar por tipo de servicio
//         for (const [keywords, services] of Object.entries(searchKeywords)) {
//           const regex = new RegExp(keywords, 'i');
//           if (regex.test(normalizedQuery)) {
//             services.forEach(serviceKey => {
//               const serviceData = findServiceInData(serviceKey, primedicsaludData);
//               if (serviceData) results.push(...serviceData);
//             });
//           }
//         }
        
//         // Buscar por nombre específico
//         if (results.length === 0) {
//           results.push(...searchByName(normalizedQuery, primedicsaludData));
//         }
        
//         // Filtrar por ubicación si se especifica
//         const locationResults = filterByLocation(results, normalizedQuery);
        
//         return {
//           query: query,
//           results: locationResults.length > 0 ? locationResults : results,
//           total: locationResults.length || results.length
//         };
//       }
//     };
//   }
  
 
function findServiceInData(serviceKey: string, data: any) {
    // Implementar búsqueda recursiva en la estructura de datos
    const results:Record<string, any>[] = [];
    
    function searchRecursive(obj: any, path: string[] = []) {
        console.log("path:", path)
      for (const [key, value] of Object.entries(obj)) {
        if (key.includes(serviceKey) || (typeof value === 'string' && value.toLowerCase().includes(serviceKey.toLowerCase()))) {
          if (Array.isArray(value)) {
            results.push(...value.map(item => ({...item, categoria: path.join(' > ')})));
          } else if (typeof value === 'object') {
            results.push({...value, categoria: path.join(' > ')});
          }
        }
        
        if (typeof value === 'object' && value !== null) {
          searchRecursive(value, [...path, key]);
        }
      }
    }
    
    searchRecursive(data);
    console.log("results:", results)
    return results;
  }
  
  function searchByName(query: string, data: any) {
    const results:any[] = [];
    const queryWords = query.split(/\s+/);
    
    function searchInObject(obj: any, category = '') {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (item.nombre) {
            const match = queryWords.some(word => 
              item.nombre.toLowerCase().includes(word.toLowerCase())
            );
            if (match) {
              results.push({...item, categoria: category});
            }
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          const newCategory = category ? `${category} > ${key}` : key;
          searchInObject(value, newCategory);
        });
      }
    }
    
    searchInObject(data);
    return results;
  }
  
  function filterByLocation(results: any, query: string) {
    const locationKeywords = {
      'la plata': ['la_plata', 'centro'],
      'berisso': ['berisso'],
      'ensenada': ['ensenada'],
      'city bell': ['city_bell'],
      'gonnet': ['gonnet'],
      'villa elisa': ['villa_elisa'],
      'villa elvira': ['villa_elvira'],
      'los hornos': ['los_hornos'],
      'romero': ['romero'],
      'ringuelet': ['ringuelet'],
      'gorina': ['gorina']
    };
    
    for (const [location, keys] of Object.entries(locationKeywords)) {
      if (query.includes(location)) {
        return results.filter((result: any) => 
          keys.some(key => result.categoria?.includes(key))
        );
      }
    }
    
    return results;
  }
  
  // ESTRATEGIA 4: Funciones auxiliares para el agente
  export const assistantHelpers = {
    
    // Función para obtener información de contacto general
    getContactInfo() {
      return primedicsaludData.informacion_general.contactos;
    },
    searchProviders(serviceType: string) {
        return "Función para buscar el prestador más cercano por dirección"
    },
    
    // Función para buscar el prestador más cercano por dirección
    findNearestProvider(address: string, serviceType: string) {
      // Esta función podría integrar con APIs de geolocalización
      const providers = this.searchProviders(serviceType);
      return providers.slice(0, 3); // Retorna los 3 más relevantes
    },
    
    // Función para formatear respuestas del agente
    formatResponse(results: any, queryType: string) {
      if (results.length === 0) {
        return "No encontré prestadores que coincidan con tu búsqueda. ¿Podrías ser más específico o probar con otra ubicación?";
      }
      
      let response = `Encontré ${results.length} prestador(es) para tu consulta:\n\n`;
      
      results.forEach((result: any, index: number) => {
        response += `${index + 1}. **${result.nombre}**\n`;
        response += `   📍 ${result.direccion}\n`;
        if (result.telefono) {
          response += `   📞 ${result.telefono}\n`;
        }
        if (result.especialidad) {
          response += `   🩺 ${result.especialidad}\n`;
        }
        if (result.servicios) {
          response += `   🏥 Servicios: ${result.servicios.join(', ')}\n`;
        }
        response += '\n';
      });
      
      response += "¿Necesitas información adicional sobre alguno de estos prestadores?";
      return response;
    },
    
    // Función para sugerir servicios relacionados
    getSuggestedServices(currentService: string) {
      const suggestions = {
        'farmacia': ['Laboratorios', 'Diagnóstico por imágenes'],
        'odontologia': ['Diagnóstico por imágenes odontológicas', 'Centros especializados'],
        'clinica': ['Farmacias cercanas', 'Laboratorios', 'Diagnóstico por imágenes'],
        'optica': ['Oftalmología'],
        'rehabilitacion': ['Diagnóstico por imágenes', 'Centros especializados']
      };
      
      return suggestions[currentService as keyof typeof suggestions] || [];
    }
  };
  
//   // ESTRATEGIA 5: Implementación para LangGraph JS
//   const langGraphIntegration = {
    
//     // Nodo principal de búsqueda
//     searchNode: {
//       name: "search_primedic_providers",
      
//       async execute(state: any) {
//         const query = state.userQuery;
//         const searchTool = createPrimedicsaludSearchTool;
//         const results = await searchTool.execute(query);
        
//         return {
//           ...state,
//           searchResults: results.results,
//           totalResults: results.total,
//           formattedResponse: assistantHelpers.formatResponse(results.results, 'general')
//         };
//       }
//     },
    
//     // Nodo de clasificación de consulta
//     classifyQueryNode: {
//       name: "classify_user_query",
      
//       execute(state) {
//         const query = state.userQuery.toLowerCase();
//         let queryType = 'general';
//         let urgency = 'normal';
        
//         // Detectar urgencias
//         if (/urgencia|emergencia|guardia|ahora|ya/i.test(query)) {
//           urgency = 'urgent';
//           queryType = 'emergency';
//         }
        
//         // Detectar tipo de consulta
//         if (/farmacia|medicamento/i.test(query)) queryType = 'pharmacy';
//         else if (/odontologo|diente/i.test(query)) queryType = 'dental';
//         else if (/ojos|vista|anteojo/i.test(query)) queryType = 'vision';
//         else if (/laboratorio|analisis/i.test(query)) queryType = 'lab';
//         else if (/turno|cita|consulta/i.test(query)) queryType = 'appointment';
        
//         return {
//           ...state,
//           queryType,
//           urgency,
//           needsImmediate: urgency === 'urgent'
//         };
//       }
//     },
    
//     // Nodo de respuesta personalizada
//     responseNode: {
//       name: "generate_response",
      
//       execute(state) {
//         let response = state.formattedResponse;
        
//         // Agregar información de urgencias si es necesario
//         if (state.urgency === 'urgent') {
//           const urgencyInfo = assistantHelpers.getContactInfo().urgencias_medicas;
//           response = `🚨 **URGENCIAS MÉDICAS**\n` +
//                     `📞 ${urgencyInfo.telefonos.join(' o ')}\n` +
//                     `📍 ${urgencyInfo.direccion}\n\n` + response;
//         }
        
//         // Agregar sugerencias
//         const suggestions = assistantHelpers.getSuggestedServices(state.queryType);
//         if (suggestions.length > 0) {
//           response += `\n💡 **También podrías necesitar:**\n${suggestions.map(s => `• ${s}`).join('\n')}`;
//         }
        
//         return {
//           ...state,
//           finalResponse: response
//         };
//       }
//     },
    
//     // Configuración del grafo
//     createGraph() {
//       return {
//         nodes: [
//           this.classifyQueryNode,
//           this.searchNode,
//           this.responseNode
//         ],
        
//         edges: [
//           { from: "classify_user_query", to: "search_primedic_providers" },
//           { from: "search_primedic_providers", to: "generate_response" }
//         ],
        
//         entryPoint: "classify_user_query",
//         exitPoint: "generate_response"
//       };
//     }
//   };
  
//   // ESTRATEGIA 6: Ejemplos de uso y testing
//   const testQueries = [
//     {
//       query: "Necesito una farmacia en La Plata",
//       expectedType: "pharmacy",
//       expectedLocation: "la_plata"
//     },
//     {
//       query: "Urgencia médica ahora",
//       expectedType: "emergency",
//       expectedUrgency: "urgent"
//     },
//     {
//       query: "Odontólogo en City Bell",
//       expectedType: "dental",
//       expectedLocation: "city_bell"
//     },
//     {
//       query: "Óptica cerca de Gonnet",
//       expectedType: "vision",
//       expectedLocation: "gonnet"
//     },
//     {
//       query: "Centro de rehabilitación",
//       expectedType: "general",
//       expectedService: "rehabilitacion"
//     }
//   ];
  
//   // Función de testing
//   function testSearchSystem() {
//     const searchTool = createPrimedicsaludSearchTool();
    
//     testQueries.forEach(test => {
//       console.log(`\nTesting: "${test.query}"`);
//       const result = searchTool.execute(test.query);
//       console.log(`Results found: ${result.total}`);
//       console.log(`First result: ${result.results[0]?.nombre || 'None'}`);
//     });
//   }
  
//   // Export para uso en LangGraph
//   module.exports = {
//     primedicsaludData,
//     createPrimedicsaludSearchTool,
//     assistantHelpers,
//     langGraphIntegration,
//     searchKeywords,
//     testSearchSystem
//   };