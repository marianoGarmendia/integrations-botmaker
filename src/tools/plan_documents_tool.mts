    import { z } from "zod";
    import { tool } from "@langchain/core/tools";
    import { buildRetriever } from "../graphs/useRetrievers.mjs";
    import { createRetrieverTool } from "@langchain/classic/tools/retriever";
    import { SystemMessage, HumanMessage } from "@langchain/core/messages";
    // import { ChatDeepSeek } from "@langchain/deepseek";
    import { ChatOpenAI } from "@langchain/openai";
    import dotenv from "dotenv";
    dotenv.config();

    const keywordsFaqs = [
        'ambulancia',
        'amp',
        'analisis',
        'anteojos',
        'aportes',
        'asistencia al viajero',
        'bebe',
        'bioquimica',
        'cargas virales',
        'categorias profesionales',
        'cesarea',
        'cim',
        'cirugia refractiva',
        'cirugias',
        'cirugias laparoscopicas',
        'clinicas',
        'cobertura',
        'cobertura por fallecimiento',
        'consultas',
        'contribuciones',
        'copagos',
        'credencial virtual',
        'dentista',
        'desregulacion',
        'diagnostico',
        'doppler',
        'ecografias',
        'embarazo',
        'emergencias',
        'especialidades',
        'farmacia',
        'fisiatria',
        'fonoaudiologia',
        'honorarios medicos',
        'hormonas',
        'implantes',
        'internaciones',
        'kinesiologia',
        'laboratorio',
        'lentes',
        'mamografias',
        'maternidad',
        'medicamentos',
        'medicos',
        'odontologia',
        'opticas',
        'ortesis',
        'ortodoncia',
        'parto',
        'plan b1',
        'plan basic',
        'plan elite',
        'plan superior',
        'pmo',
        'prepaga',
        'protesis',
        'psicologia',
        'psicologo',
        'psiquiatria',
        'radiografias',
        'recetas',
        'rehabilitacion',
        'reintegro',
        'resonancias',
        'salud mental',
        'seguro de sepelio',
        'sin bonos',
        'sin recetarios',
        'terapia',
        'terapia intensiva',
        'tomografias',
        'traslados',
        'urgencias',
        'vademecum',
        'vitaminas'
    ];

    /*
    - armar un schema con los posibles valores de 'documents_md'
    - construir el retriever en base a ese schema
    - crear una tool con ese retriever
    - inyectar la tool al modelo
    - usar DeepSeek en esta instancia para achicar gastos
    */

    const schema = z.object({
    ciudades: z
        .enum(["la_plata", "todas"])
        .describe(
        "La ciudad en la que vive el usuario y donde busca el prestador o el servicio de primedic, si el afiliado vive en magdalena, chascomus, ensenada o alguna otra que no sea la plata, debes seleccionar 'todas'",
        )
        .nullable()
        .optional(),
    planes: z
        .enum(["b1", "elite", "plan_a_basic", "superior"])
        .describe("El plan que tiene el usuario en primedic salud")
        .nullable(),
    keywords: z
        .enum(keywordsFaqs as [string, ...string[]])
        .describe(
        "Las palabras clave que el usuario usa para buscar el prestador o el servicio de primedic, debes seleccionar la o las que crees que tengan relacion con la consulta del usuario",
        )
        .nullable(),
    });

    // Opcion A con withStructuredOutput
    export const PlansToolRetriever = tool(
    async ({ query }: { query: string }) => {
        try {
        const model = new ChatOpenAI({
            model: "gpt-4o",
            apiKey: process.env.OPENAI_API_KEY,
            temperature: 0,
        })
            .withStructuredOutput(schema)
            .withConfig({ tags: ["nostream"] });

        console.log("query in buildSchemaTool: ", query);

        const systemPrompt = `
        Debes tomar la consulta del usuario y construir un schema basado en los posibles valores de 'plan_documents'
        Tu respuesta debe ser siempre un json válido de acuerdo al schema proporcionado.
        `;

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(query),
        ]);

        const parsed = schema.safeParse(response);
        if (parsed.success) {
            console.log("schema parse PlansToolRetriever: ", parsed.data);
            const retriever = await buildRetriever("plan_documents", response);
            const retrieverToolSearch = createRetrieverTool(retriever, {
            name: "plans_documents_retriever_search",
            description:
                "Busca informacion relevante para responder a una consulta dentro de las coberturas y prestaciones de los planes de primedic salud",
            });

            const responseRetriever = await retrieverToolSearch.invoke({
            query: query,
            });
            console.log("responseRetriever: >>>>>");
            console.log(responseRetriever);
            return responseRetriever;
        } else {
            return { error: "Error al construir el schema" };
        }
        } catch (error) {
        console.error("Error in buildSchemaTool: ", error);
        return { error: "Error al construir el schema" };
        }
    },
    {
        name: "plans_tool_retriever",
        description:
        "Busca informacion relevante para responder a una consulta dentro de las coberturas y prestaciones de los planes de primedic salud",
        schema: z.object({
        query: z.string().describe("La consulta del usuario"),
        }),
    },
    );

    // const retriever = await buildRetriever("documents_md", {});

    // const retrieverTool = createRetrieverTool(retriever, {
    //   name: "faq_documents_retriever_search",
    //   description:
    //     "Busca informacion relevante para responder a una consulta dentro de las preguntas frecuentes",
    // });

    // const modelGraph = new ChatOpenAI({
    //   model: "gpt-4o",
    //   temperature: 0,
    // }).bindTools([buildSchemaTool], {tool_choice: "build_schema_tool"});

    // const response = await modelGraph.invoke("Necesito encontrar un prestador de odontologia en la ciudad de la plata");

    // console.log(response);

    // const res = await buildSchemaTool.invoke({query: "prestador de odontología en la ciudad de La Plata"});
    // console.log(res);

    // const retrieverTool = createRetrieverTool(retriever, {
    //   name: "faq_documents_retriever_search",
    //   description:
    //     "Busca informacion relevante para responder a una consulta dentro de las preguntas frecuentes",
    // });

    // const response = await retriever.invoke("Necesito encontrar un prestador de odontologia en la ciudad de la plata");

    // console.log(response);

    // const modelGraph = new ChatOpenAI({
    //   model: "gpt-4o",
    //   temperature: 0,
    // }).bindTools([retrieverTool], {tool_choice: "faq_documents_retriever_search"});

    // const response = await modelGraph.invoke("Necesito encontrar un prestador de odontologia en la ciudad de la plata");

    // console.log(response);

    // const resRetriever = await retrieverTool.invoke({query: "prestador de odontología en La Plata"});
    // console.log("resRetriever: >>>>>");
    // console.log(resRetriever);
