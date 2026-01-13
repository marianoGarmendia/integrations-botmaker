Al momento estoy construyendo las tools para que puedan buscar por metadata según la consulta del usuario

en /buildTools.mts se encuentra la logica de construir el schema, inyectarlo a la tool, bindear al modelo y luego invokar para obtener los valores de los argumentos para con esos busca en la metadata

/retrieverFAQ.mts estoy construyendo los retrievers para generar las consultas



21/10 tengo dos makeRetriever tanto de plan como de documents (faqs)

y con eso ya puedo crear los retrievr por filtro

voy a construir una tool con los parametros posibles (schema) construir el retriever en base a esos parametros y crear una retrieverTool en base a ese retriever

