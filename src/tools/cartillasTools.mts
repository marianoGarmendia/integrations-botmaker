import { tool } from "langchain";
import { z } from "zod";

export const cartillasTools = tool(
    async ({query}:{query: string})=>{
        return `
        Enlaces a las cartillas de planes y prestadores de primedic salud:

        ### [ENLACES A LAS CARTILLAS DE PLANES]

        - [Cartilla de Plan Basic/A](https://primedicsalud.com.ar/wp-content/uploads/2025/04/2025.-CARTILLA-PLAN-A-BASIC-digital.pdf)
        - [Cartilla de Plan Elite](https://primedicsalud.com.ar/wp-content/uploads/2025/04/2025.-CARTILLA-PLAN-B1-SUP-ELITE-digital.pdf)
        - [Cartilla de Plan Superior/B1](https://primedicsalud.com.ar/wp-content/uploads/2025/04/2025.-CARTILLA-PLAN-B1-SUP-ELITE-digital.pdf)
        - [Cartilla plan chascomus](https://primedicsalud.com.ar/download/81603/?tmstv=1716566058)
        - [Cartilla Magdalena](https://primedicsalud.com.ar/wp-content/uploads/2025/05/2025.05-Cartilla-magdalena-digital.pdf)



        ## Contexto de la query del usuario:
        ${query}
        `
    },
    {
        name: "cartillas_tools",
        description: "Obtiene los enlaces a las cartillas de planes y prestadores de primedic salud para enviarselos por mensajes a los usuarios",
        schema: z.object({
            query: z.string().describe("La query del usuario que contiene información sobre el tipo de cartilla o tema de consulta por la cual debe iferirse la cartilla que quiere"),
        }),
    }
)