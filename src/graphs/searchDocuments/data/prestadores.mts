// ESTRATEGIA 1: Estructura JSON jerarquizada por categorías
export const primedicsaludData = {
    informacion_general: {
      plan: "PLAN A BASIC",
      periodo: "Abril 2025",
      registro: "RNEMP Prov. N 1-1065-7",
      contactos: {
        urgencias_medicas: {
          servicio: "SIPEM",
          telefonos: ["221 451-3145", "453-1419"],
          direccion: "Calle 63 N° 672 e/ 8 y 9"
        },
        casa_central: {
          direccion: "Calle 46 e/ 11 y 12 N° 840",
          telefonos: ["423-4495", "423-0913"]
        },
        afiliaciones: {
          direccion: "Calle 50 e/ 10 y 11 N° 781",
          telefono: "221-407 8888"
        },
        sucursal_chascomus: {
          direccion: "Calle Soler N°229",
          telefono: "(02241) 436891"
        },
        asistente_virtual: "221-399 1351"
      }
    },
    
    servicios: {
      clinicas_sanatorios: {
        la_plata: [
          {
            nombre: "INSTITUTO MÉDICO PLATENSE",
            direccion: "51 N° 315 e/ 1 y 2",
            telefono: "221 425-8390"
          },
          {
            nombre: "CIM - Centro Integral de Medicina",
            direccion: "11 N° 729 e/ 46 y 47",
            telefono: "221 421-9236",
            servicios: ["Consultas médicas", "Especialistas", "Odontología Integral", "Diagnóstico por imágenes", "Psicología", "Rehabilitación", "Vacunatorio", "Fonoaudiología"]
          },
          {
            nombre: "INSTITUTO DEL DIAGNÓSTICO",
            direccion: "62 N° 370 e/ 2 y 3",
            telefono: "221 4259700/05"
          },
          {
            nombre: "INSTITUTO CENTRAL DE MEDICINA",
            direccion: "43 N° 585 e/ 6 y 7",
            telefono: "221 423-1142"
          },
          {
            nombre: "SANATORIO LOS TILOS",
            direccion: "41 N° 347 esq. 2",
            telefono: "221 421-1952"
          },
          {
            nombre: "INSTITUTO OLAZÁBAL",
            direccion: "Pza. Olazábal N° 163",
            telefono: "221 422-6871"
          },
          {
            nombre: "CLÍNICA DEL NIÑO",
            especialidad: "Pediatría y Neonatología",
            direccion: "63 N° 763 e/ 11 y 12",
            telefono: "221 423-4940"
          },
          {
            nombre: "CLÍNICA PRIVADA NEUROPSIQUIÁTRICA",
            direccion: "6 N° 123 e/ 34 y 35",
            telefono: "221 482-9748"
          },
          {
            nombre: "CLÍNICA BELGRANO",
            direccion: "4 N° 1074 e/ 54 y 55",
            telefono: "221 424-4591"
          },
          {
            nombre: "HOSPITAL PRIVADO SUDAMERICANO",
            direccion: "2 N° 432 e/ 40 y 41",
            telefono: "221 424-4591"
          }
        ],
        villa_elisa: [
          {
            nombre: "INSTITUTO PRIVADO SAN JOSÉ",
            direccion: "15 esq. 55",
            telefono: "473-0266"
          }
        ],
        ensenada: [
          {
            nombre: "CLÍNICA DE LA RIBERA",
            direccion: "La Merced N° 286",
            telefono: "429-8280"
          }
        ],
        berisso: [
          {
            nombre: "INSTITUTO MÉDICO",
            direccion: "48 e/ 11 y 12",
            telefono: "221-6399753"
          }
        ]
      },
      
      centros_especializados: {
        la_plata: [
          {
            nombre: "CENTRO MÉDICO DEAN FUNES",
            direccion: "Calle 42 N° 670",
            telefono: "483-9333"
          },
          {
            nombre: "CLÍNICA PRIVADA PLATENSE DE LAS ENFERMEDADES DE LOS OJOS",
            direccion: "42 N° 763 e/ 10 y 11",
            telefono: "482-1669"
          },
          {
            nombre: "INSTITUTO DEL DIAGNÓSTICO CARDIOVASCULAR",
            direccion: "Calle 13 N°525",
            telefono: "422-2664"
          },
          {
            nombre: "BREAST CLÍNICA DE MAMAS",
            direccion: "Calle 7 N° 432",
            telefono: "427-2700"
          },
          {
            nombre: "INSTITUTO DE CARDIOLOGÍA",
            direccion: "6 N° 212 e/ 36 y 37",
            telefono: "427-1000"
          },
          {
            nombre: "CLÍNICA PRIVADA DR. ALZA",
            direccion: "12 e/ 45 y 46 N° 662",
            telefono: "380-1263"
          }
        ]
      },
  
      farmacias: {
        la_plata: [
          { nombre: "INTERNACIONAL 3", direccion: "N° 761 e/ 47 y 48", telefono: "223-8857" },
          { nombre: "BENTABERRY", direccion: "22 N° 2169 e/ 76 y 77", telefono: "600-0469" },
          { nombre: "BRUNO", direccion: "55 N° 499 esq. 5", telefono: "421-0984" },
          { nombre: "BOULEVARD", direccion: "Av. 31 e/ 66 y 67", telefono: "451-1979" },
          { nombre: "NAGY ELICABE", direccion: "59 N° 443 e/ 3 y 4", telefono: "424-1902" },
          { nombre: "PIÑEIRO", direccion: "Av. 32 N° 1839 e/ 131 y 132", telefono: "470-3813" },
          { nombre: "RAVASSI", direccion: "58 e/ esq. diag 75", telefono: "451-5074" },
          { nombre: "RINGUELET", direccion: "511 N° 1514 e/10 y 10 Bis", telefono: "603-5090" },
          { nombre: "CATALA", direccion: "7 y 520 N° 1160", telefono: "589-3658" },
          { nombre: "OJEDA", direccion: "Diag.80 N°105esq.49", telefono: "421-7018" },
          { nombre: "SAN CAYETANO", direccion: "24 N° 600 e/ 44 y 45", telefono: "479-6725" },
          { nombre: "SAN MIGUEL", direccion: "14 N° 1349 esq. 60", telefono: "451-2840" },
          { nombre: "SANTA TERESITA", direccion: "38 N°94 e/ 120 y 121", telefono: "425-3255" },
          { nombre: "SARTI", direccion: "38 N° 751 esq. 10", telefono: "482-3296" },
          { nombre: "SANTA LUCIA", direccion: "64 esq. 14", telefono: "451-9796" },
          { nombre: "SEGLIE", direccion: "13 N° 420 e/ 40 y 41", telefono: "425-8844" },
          { nombre: "CRIVARO", direccion: "63 N º748 1/2 Esq. 10", telefono: "4573957" },
          { nombre: "SANCHEZ", direccion: "54 N°1372 e/22 y 23", telefono: "451-0186" },
          { nombre: "QUANTIN", direccion: "27 N°739 e/ 46 y 47", telefono: "" },
          { nombre: "AGRELO", direccion: "43 N° 785 e/ 10 y 11", telefono: "423-0324" },
          { nombre: "ALOY", direccion: "43 N° 439 e/ 3 y 4", telefono: "421-0926" },
          { nombre: "BALDO", direccion: "Diag. 80 N° 717", telefono: "421-3607" },
          { nombre: "DEL INCA", direccion: "Diag. 73 esq. 64", telefono: "421-2846" },
          { nombre: "DEL PASEO", direccion: "Diag. 80 N° 960", telefono: "483-0257" },
          { nombre: "EL INDIO", direccion: "10 N° 780", telefono: "423-3453" },
          { nombre: "FERRANDO", direccion: "Av.7 esq. 34", telefono: "425-7449" },
          { nombre: "FRENCH", direccion: "122 N° 179 e/ 35 y 36", telefono: "482-3180" },
          { nombre: "GLOWKO", direccion: "58 N° 1765 e/ 30 y 31", telefono: "457-0224" },
          { nombre: "ITALIA", direccion: "Diag.79 N° 202 esq. 64", telefono: "424-3650" },
          { nombre: "LA ESPAÑOLA", direccion: "35 N° 713 e/ 9 y 10", telefono: "482-8812" },
          { nombre: "LA ESTRELLA", direccion: "12 N° 848 esq. 48", telefono: "422-8370" },
          { nombre: "LA PROTECTORA DE ARANTZAZU", direccion: "49 N° 711 e/ 9 y 10", telefono: "421-8127" },
          { nombre: "MANES", direccion: "49 N° 636 e/ 7 y 8", telefono: "422-0220" }
        ],
        otras_localidades: {
          san_carlos: [
            { nombre: "LAZZA", direccion: "32 N° 141 Y 142", telefono: "498-1619" }
          ],
          altos_san_lorenzo: [
            { nombre: "SAN LORENZO", direccion: "13 esq. 73", telefono: "453-3358" },
            { nombre: "LEYES", direccion: "26 N° 2288 e/ 78 y 79", telefono: "453-1877" }
          ],
          romero: [
            { nombre: "FERNÁNDEZ", direccion: "520 N° 8733 e/ 182 y 182 bis", telefono: "491-4626" }
          ],
          villa_elisa: [
            { nombre: "VILLA ELISA", direccion: "419 N° 489", telefono: "473-3152" }
          ],
          villa_elvira: [
            { nombre: "TEMPESTA", direccion: "80 N° 731 e/9 y 10", telefono: "453-6416" }
          ],
          los_hornos: [
            { nombre: "ALONSO", direccion: "137 N°1402 e/61 y 62", telefono: "450-6730" },
            { nombre: "LANDIVAR", direccion: "44 N° 2599 e/ 146 y 147", telefono: "470-8590" },
            { nombre: "SAN FRANCISCO", direccion: "143 N°860 e/49 y 50", telefono: "470-8816" },
            { nombre: "CASTRO", direccion: "60 N°2573 e/146 y 147", telefono: "314-6810" }
          ],
          city_bell: [
            { nombre: "AGOSTINI", direccion: "Cno. Centenario y Diag. 92", telefono: "472-2573" },
            { nombre: "LÓPEZ", direccion: "Cantilo N°1425 e/20 y 21", telefono: "472-2337" },
            { nombre: "ALTOS DEL BELL", direccion: "28 N° 6 esq. 476", telefono: "221 616-87475" },
            { nombre: "ALTOS DEL GOLF", direccion: "467 (ex 11)esq. 135 N° 4007", telefono: "221-5120013" }
          ],
          gonnet: [
            { nombre: "CENTRAL", direccion: "493 N° 1827 esq. Centenario", telefono: "221-3517444" },
            { nombre: "MOUZO", direccion: "14 N° 3007", telefono: "484-0199" },
            { nombre: "BLANCO", direccion: "489 N° 2069", telefono: "471-0403" },
            { nombre: "GARCIA", direccion: "Cno. Centenario N° 2888", telefono: "471-0147" }
          ],
          berisso: [
            { nombre: "GALVEZ", direccion: "Montevideo N° 1711", telefono: "422-9760" },
            { nombre: "BERISSO", direccion: "Calle 11 N° 2282", telefono: "461-3463" },
            { nombre: "POLSKA", direccion: "Calle 12 esq.161 N°999", telefono: "461-1498" },
            { nombre: "MEDEA", direccion: "Montevideo N° 1381", telefono: "461-4396" },
            { nombre: "CATTONI", direccion: "Calle 159 Y 14", telefono: "221 461-6489" },
            { nombre: "PENACCA", direccion: "Av. Génova N° 4211", telefono: "461-2159" },
            { nombre: "MARSICO", direccion: "Av. 7 N° 445 esq. 41", telefono: "422-9760" },
            { nombre: "MORALES", direccion: "12 N° 4295", telefono: "464-5615" },
            { nombre: "ALEMANIA", direccion: "Av. 122 N° 2345", telefono: "609-1160" }
          ],
          ensenada: [
            { nombre: "BORON", direccion: "Av. H Cestino 579", telefono: "469-4366" },
            { nombre: "BORZI", direccion: "122 e/43 y 44 N 598", telefono: "640-1010" },
            { nombre: "ROUX", direccion: "La Merced 121", telefono: "360-9103" },
            { nombre: "LAGOS", direccion: "San Martín 939", telefono: "469-1882" },
            { nombre: "HARAMBOURE", direccion: "Dr. Sidoti 500", telefono: "469-1327" },
            { nombre: "GALLI", direccion: "Av. 520 N°4904", telefono: "677-8613" },
            { nombre: "GRAY", direccion: "Santilli 48 esq. Calzetta", telefono: "469-4567" },
            { nombre: "GATELLI", direccion: "La Merced N° 380", telefono: "469-1279" },
            { nombre: "PIERRI", direccion: "Cno. Rivadavia esq. 124", telefono: "422-8972" }
          ]
        }
      },
  
      opticas: {
        la_plata: [
          { nombre: "ÓPTICA RENÓ", direccion: "Diag. 79 N° 735", telefono: "482-5544" },
          { nombre: "ÓPTICA 12", direccion: "12 N° 668 e/ 45 y 46", telefono: "" },
          { nombre: "ÓPTICA TOLABA", direccion: "2 N° 630 e/ 44 y 45", telefono: "422-4169" },
          { nombre: "ÓPTICA ESPACIO VISIÓN", direccion: "47 N° 839 e/ 11 y 12", telefono: "512-1722" },
          { nombre: "ÓPTICA RETILENT", direccion: "50 N° 798 e/ 10 y 11", telefono: "421-5230" },
          { nombre: "VÍA ÓPTICA", direccion: "48 Nº 863 e/ 12 y 13", telefono: "424 -4158" }
        ],
        otras_localidades: {
          ringuelet: [
            { nombre: "ÓPTICA VEO", direccion: "520 esq. 5 N° 1004", telefono: "221-5271216" }
          ],
          gorina: [
            { nombre: "ÓPTICA VEO", direccion: "485 e/ 137 y 138", telefono: "221-6988-888" }
          ],
          gonnet: [
            { nombre: "ÓPTICA GONNET", direccion: "503 N° 2088 esq.16", telefono: "471-8822" }
          ],
          berisso: [
            { nombre: "VÍA ÓPTICA", direccion: "Av. Montevideo casi esq.16", telefono: "464-1562" },
            { nombre: "ÓPTICA VEO", direccion: "122 N° 1852 esq.13", telefono: "221-6375073" }
          ]
        }
      },
  
      odontologia: {
        convenios: [
          "Agremiación Odontológica de La Plata, Berisso, Ensenada",
          "Sociedad Odontológica de La Plata"
        ],
        centros: {
          la_plata: [
            { nombre: "CIM - Centro Integral de Medicina", direccion: "11 N° 729 e/ 46 y 47", telefono: "421-9236" },
            { nombre: "DEN'S", direccion: "7 N° 564 e/ 43 y Pza. Italia", telefono: "423-6014" },
            { nombre: "IMAGO (Diagnostico por imágenes, no atienden consultas)", direcciones: ["AV.13 NO 473 E/41 Y 42", "40 NO 1429 (ESQ. 20)"], telefonos: ["421-7872", "482-1997"] },
            { nombre: "RAYODENT (Diagnostico por imágenes, no atienden consultas)", direccion: "44 NO 519 E/ 4 Y 5", telefono: "421-2481" },
            { nombre: "CENTRO ODONTOLÓGICO INTEGRAL DR. OLIVERO", direccion: "Calle 6 N° 9 e/ 32 y 33", telefono: "483-0693" },
            { nombre: "CONSULTORIO INTEGRAL ODONTOLÓGICO", direccion: "19 ESQ. 32 (LOCAL N° 5)", telefono: "221 306-6344" },
            { nombre: "CONSULTORIO INTEGRAL ODONTOLÓGICO LUCERO", direccion: "44 e/ 14 y 15", telefono: "306-6344" },
            { nombre: "CENTRO ODONTOLÓGICO DRA. FEDERICO", direccion: "Calle 12 N° 123 e/ 34 y 35", telefono: "602-3491" }
          ],
          otras_localidades: {
            hernandez: [
              { nombre: "CENTRO ODONTOLÓGICO ALANIZ", direccion: "511 N° 3400 esq. 29", telefono: "548-9149" }
            ],
            villa_elvira: [
              { nombre: "CENTRO ODONTOLÓGICO INTEGRAL BARREIRO", direccion: "6 N° 2201 e/ 76 y 77", telefono: "457-3997" }
            ],
            los_hornos: [
              { nombre: "CENTRO ODONTOLÓGICO LOS HORNOS", direccion: "66 N° 2001 esq. 135", telefono: "564-6930" },
              { nombre: "CENTRO ODONTOLÓGICO FEDERICI", direccion: "69 N° 2008 e/ 135 y 136", telefono: "608-2050" }
            ],
            romero: [
              { nombre: "CENTRO ODONTOLÓGICO ROMERO", direccion: "169 esq. 520", telefono: "491-6400" }
            ],
            berisso: [
              { nombre: "CONSULTORIO INTEGRAL ODONTOLÓGICO", direccion: "8 No 4443 e/ Mont. y 166", telefono: "221 601-6521" },
              { nombre: "CENTRO ODONTOLÓGICO TULIZ", direccion: "10 Este N° 4005 e/ 162 norte y 163", telefono: "457-3997" }
            ],
            city_bell: [
              { nombre: "CENTRO ODONTOLÓGICO DRA. CHACON", direccion: "46 N° 1413 e/ 23 y 24", telefono: "660-4132" }
            ]
          }
        }
      },
  
      diagnostico_imagenes: {
        la_plata: [
          { nombre: "CIM - Centro Integral de Medicina", direccion: "11 Nº 729 e/ 46 y 47", telefono: "421-9236" },
          { nombre: "CEMPLAM", direccion: "6 N°1256 e/ 58 y 59", telefono: "489-2327" },
          { nombre: "CENTRO DIAUDE", direccion: "70 N° 343 e/ 1 y 2", telefono: "482-0702" },
          { nombre: "CIENCIA Y TECNOLOGÍA", direccion: "8 N° 607 e/ 44 y 45", telefono: "421-1067" },
          { nombre: "POLICLÍNICA PRIVADA DRES. CANEDO", direccion: "17 N° 1207 esq. 57", telefono: "452-1167" },
          { nombre: "CENTRO MÉDICO OPEN IMAGE", direccion: "4 bis N° 329 e/ 528 bis y 529", telefono: "422-0639" }
        ],
        otras_localidades: {
          berisso: [
            { nombre: "CIB - CENTRO DE IMÁGENES", direccion: "165 esq. 10", telefono: "464-2661" }
          ],
          ensenada: [
            { nombre: "CIEN CENTRO DE IMÁGENES", direccion: "Sidotti N° 281", telefono: "469-2002" }
          ],
          city_bell: [
            { nombre: "CENTRO DE IMÁGENES DRES. CANEDO", direccion: "17 N° 1207 esq. 57", telefono: "" }
          ]
        }
      },
  
      rehabilitacion: {
        la_plata: [
          { nombre: "CORPUS CENTRO DE REHABILITACIÓN", direccion: "56 N° 1469 e/ 24 y 25", telefono: "417-6701" },
          { nombre: "IFI CENTRO DE KINESIOLOGÍA Y REHABILITACIÓN", direccion: "Calle 3 N° 1524", telefono: "421-9902" },
          { nombre: "CREAA CENTRO DE REHABILITACIÓN", direccion: "Calle 58 N° 1338", telefono: "452-7752" },
          { nombre: "CIREC KINESIOLOGÍA & ESTÉTICA", direccion: "Calle 35 N° 828", telefono: "221-512 5134" },
          { nombre: "FUNDACIÓN QUARELLO", direccion: "Calle 14 N° 529", telefono: "472-4040" }
        ],
        villa_elisa: [
          { nombre: "COMPLEJO FORZA", direccion: "Av. Arana esq. 23 N° 419", telefono: "473-2149" }
        ],
        city_bell: [
          { nombre: "CIPRES CENTRO DE REHABILITACIÓN", direccion: "Calle 473 bis N° 1055", telefono: "221-353 3684" }
        ]
      },
  
      fonoaudiologia: {
        la_plata: [
          { nombre: "FONIATRÍA, AUDIOLOGÍA, LOGOPEDIA PLATENSE", direccion: "Calle 39 N° 323 e/ 1 y 2", telefono: "425-9281" }
        ],
        villa_elisa: [
          { nombre: "CIVE", direccion: "9 N° 875", telefono: "473-2401" }
        ]
      },
  
      laboratorios: {
        convenio: "Federación Bioquímica de la Provincia de Buenos Aires (FABA)",
        modalidad: "Libre elección"
      },
  
      psicologia: {
        convenio: "Colegio de Psicólogos",
        modalidad: "Libre elección"
      }
    }
  };