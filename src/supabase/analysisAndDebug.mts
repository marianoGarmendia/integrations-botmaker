// import { 
//     extractMetadataKeys, 
//     extractAllMetadataValues,
//     analyzeMetadataField 
//   } from './metadataUtils.mjs';
//   import { supabaseClient } from './supabaseClient.mjs';

//   // Ver todas las claves disponibles
//   async function analyzeTable(supabaseClient: any, rpcFunction: string) {
//     const { data } = await supabaseClient.rpc(rpcFunction, {
//       p_limit: 100,
//       p_offset: 0,
//     });

//     console.log(data)
    
//     console.log('📊 Análisis de metadata\n');
    
//     // Claves únicas
//     const keys = extractMetadataKeys(data);
//     console.log('Claves encontradas:', Array.from(keys));
    
//     // Valores para cada clave
//     const metadata = extractAllMetadataValues(data);
//     console.log('\nValores por clave:');
//     for (const [key, values] of Object.entries(metadata)) {
//       console.log(`  ${key}: ${values.length} valores únicos`);
//       console.log(`    → ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}`);
//     }
    
//     // Análisis de tipos
//     console.log('\nTipos detectados:');
//     for (const key of keys) {
//       const field = analyzeMetadataField(data, key);
//       console.log(`  ${key}: ${field.type} (${field.values.length} valores)`);
//     }
//   }
  
//   // Ejecutar
// //   analyzeTable(supabaseClient, 'documents_md_get_metadata');
// //   analyzeTable(supabaseClient, 'plan_documents_get_metadata');