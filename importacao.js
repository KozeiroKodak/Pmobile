// ====================================================
// IMPORTAÇÃO DE INVENTÁRIO
// ====================================================
//
// Responsável por:
//
// 1. Receber o arquivo selecionado pelo usuário.
// 2. Verificar o limite máximo de 100 MB.
// 3. Detectar o formato real do arquivo.
// 4. Aceitar:
//      - Excel verdadeiro (.xls / .xlsx)
//      - .xls do DOGO que contém HTML
// 5. Ler e validar as colunas obrigatórias.
// 6. Transformar os dados em materiais do PMOBILE.
// 7. Calcular a quantidade disponível.
// 8. Salvar o novo inventário no IndexedDB.
// 9. Remover a marca de "inventário zerado"
//    somente após o salvamento bem-sucedido.
//
// SUPABASE:
//
// 10. Enviar o inventário para a tabela
//     "materiais" do Supabase.
//
// 11. Antes do envio, limpar o inventário anterior
//     existente no Supabase.
//
// 12. Enviar os materiais em lotes de 500.
//
// 13. Impedir que duas importações para o Supabase
//     sejam executadas simultaneamente.
//
// IMPORTANTE:
//
// O IndexedDB continua funcionando normalmente.
//
// O Supabase passa a ser o banco central do PMOBILE.
//
// ====================================================


// ====================================================
// CONTROLE DE IMPORTAÇÃO SUPABASE
// ====================================================
//
// Essa variável funciona como uma trava.
//
// Quando false:
//     nenhuma importação para o Supabase está acontecendo.
//
// Quando true:
//     uma importação está em andamento.
//
// Isso impede que o usuário clique duas vezes
// no botão e envie o mesmo inventário novamente.
//
// ====================================================

let importacaoSupabaseEmAndamento = false;


// ====================================================
// FUNÇÃO: importarExcel()
// ====================================================
//
// Função principal da importação.
//
// É chamada pelo botão da tela de Importação:
//
//     <button onclick="importarExcel()">
//
// ====================================================

async function importarExcel() {

    // ====================================================
    // LOCALIZAR ELEMENTOS DA TELA
    // ====================================================

    const input =
        document.getElementById(
            "arquivoExcel"
        );


    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );


    // ====================================================
    // VERIFICAR SE O ELEMENTO EXISTE
    // ====================================================

    if (!input) {

        console.error(
            "Elemento arquivoExcel não encontrado."
        );

        return;
    }


    if (!resultado) {

        console.error(
            "Elemento resultadoImportacao não encontrado."
        );

        return;
    }


    // ====================================================
    // VERIFICAR SE UM ARQUIVO FOI SELECIONADO
    // ====================================================

    if (
        !input.files ||
        input.files.length === 0
    ) {

        resultado.innerHTML =
            "<p>❌ Selecione um arquivo para importar.</p>";

        return;
    }


    // ====================================================
    // OBTER O ARQUIVO SELECIONADO
    // ====================================================

    const arquivo =
        input.files[0];


    // ====================================================
    // LIMITE MÁXIMO DO ARQUIVO
    // ====================================================

    const limiteMB = 100;


    const limiteBytes =
        limiteMB *
        1024 *
        1024;


    if (
        arquivo.size >
        limiteBytes
    ) {

        resultado.innerHTML =
            "<p>❌ Arquivo muito grande.</p>" +
            "<p>O tamanho máximo permitido é " +
            limiteMB +
            " MB.</p>";

        return;
    }


    // ====================================================
    // INICIAR PROCESSAMENTO
    // ====================================================

    resultado.innerHTML =
        "<p>⏳ Preparando arquivo...</p>";


    try {

        // ====================================================
        // VERIFICAR SHEETJS
        // ====================================================

        if (!window.XLSX) {

            throw new Error(
                "Biblioteca Excel não carregada."
            );

        }


        // ====================================================
        // LER O COMEÇO DO ARQUIVO
        // ====================================================

        resultado.innerHTML =
            "<p>⏳ Identificando formato do arquivo...</p>";


        const inicioArquivo =
            await lerInicioArquivo(
                arquivo
            );


        // ====================================================
        // DETECTAR HTML
        // ====================================================

        const ehHTML =
            detectarHTML(
                inicioArquivo
            );


        console.log(
            "Arquivo selecionado:",
            arquivo.name
        );


        console.log(
            "Tamanho:",
            arquivo.size,
            "bytes"
        );


        console.log(
            "Formato detectado:",
            ehHTML
                ? "HTML"
                : "Excel"
        );


        // ====================================================
        // VARIÁVEL DO INVENTÁRIO PROCESSADO
        // ====================================================

        let novoInventario = [];


        // ====================================================
        // CAMINHO 1:
        // ARQUIVO HTML DO DOGO
        // ====================================================

        if (ehHTML) {

            resultado.innerHTML =
                "<p>⏳ Arquivo DOGO detectado.</p>" +
                "<p>Processando tabela...</p>";


            novoInventario =
                await processarArquivoHTML(
                    arquivo
                );

        }


        // ====================================================
        // CAMINHO 2:
        // EXCEL VERDADEIRO
        // ====================================================

        else {

            resultado.innerHTML =
                "<p>⏳ Processando planilha Excel...</p>";


            novoInventario =
                await processarArquivoExcel(
                    arquivo
                );

        }


        // ====================================================
        // VERIFICAR RESULTADO
        // ====================================================

        console.log(
            "Materiais processados:",
            novoInventario.length
        );


        if (
            novoInventario.length === 0
        ) {

            throw new Error(
                "Nenhum material válido foi encontrado."
            );

        }


        // ====================================================
        // GUARDAR INVENTÁRIO ATUAL
        // ====================================================

        const inventarioAnterior =
            materiais;


        // ====================================================
        // COLOCAR NOVO INVENTÁRIO EM MEMÓRIA
        // ====================================================

        materiais =
            novoInventario;


        // ====================================================
        // SALVAR NO INDEXEDDB
        // ====================================================

        resultado.innerHTML =
            "<p>⏳ Salvando inventário local...</p>";


        try {

            await salvarMateriais();

        } catch (erroSalvar) {

            // ================================================
            // RESTAURAR INVENTÁRIO ANTERIOR EM MEMÓRIA
            // ================================================

            materiais =
                inventarioAnterior;


            throw erroSalvar;
        }


        // ====================================================
        // REMOVER MARCA DE INVENTÁRIO ZERADO
        // ====================================================

        desmarcarInventarioZerado();


        // ====================================================
        // MENSAGEM ANTES DO SUPABASE
        // ====================================================

        resultado.innerHTML =
            "<p>✅ Inventário processado com sucesso!</p>" +

            "<p><strong>" +
            novoInventario.length.toLocaleString(
                "pt-BR"
            ) +
            "</strong> materiais processados.</p>" +

            "<br>" +

            "<p>💾 Inventário salvo localmente.</p>" +

            "<p>☁️ Preparando envio para o Supabase...</p>";


        // ====================================================
        // ENVIAR AUTOMATICAMENTE PARA O SUPABASE
        // ====================================================
        //
        // Agora o Supabase faz parte da importação oficial.
        //
        // Não existe mais botão separado de teste.
        //
        // ====================================================

        await importarParaSupabase(
            materiais
        );


        // ====================================================
        // DIAGNÓSTICOS
        // ====================================================

        console.log(
            "Importação completa concluída."
        );


        console.log(
            "Materiais processados:",
            novoInventario.length
        );


        console.log(
            "Inventário zerado:",
            "não"
        );


    } catch (erro) {

        // ====================================================
        // TRATAMENTO GERAL DE ERRO
        // ====================================================

        console.error(
            "Erro durante a importação:",
            erro
        );


        resultado.innerHTML =
            "<p>❌ Erro durante a importação.</p>" +

            "<p>" +
            (
                erro.message ||
                "Erro desconhecido."
            ) +
            "</p>";

    }

}


// ====================================================
// FUNÇÃO: importarParaSupabase()
// ====================================================
//
// Envia o inventário atual para o Supabase.
//
// FLUXO:
//
// 1. Verifica conexão.
// 2. Verifica se já existe uma importação em andamento.
// 3. Ativa a trava.
// 4. Limpa a tabela materiais.
// 5. Divide o inventário em lotes de 500.
// 6. Envia cada lote.
// 7. Atualiza o progresso.
// 8. Libera a trava.
//
// IMPORTANTE:
//
// Essa função substitui a antiga:
//
//     testarEnvioSupabase()
//
// Agora o envio para o Supabase é definitivo.
//
// ====================================================

async function importarParaSupabase(
    inventario
) {

    // ====================================================
    // LOCALIZAR RESULTADO
    // ====================================================

    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );


    if (!resultado) {

        console.error(
            "Elemento resultadoImportacao não encontrado."
        );

        return;
    }


    // ====================================================
    // VERIFICAR CLIENTE SUPABASE
    // ====================================================

    if (
        !window.clienteSupabase
    ) {

        resultado.innerHTML =
            "<p>🔴 Cliente Supabase não encontrado.</p>";

        throw new Error(
            "Cliente Supabase não encontrado."
        );
    }


    // ====================================================
    // VERIFICAR INVENTÁRIO
    // ====================================================

    if (
        !inventario ||
        inventario.length === 0
    ) {

        resultado.innerHTML =
            "<p>❌ Nenhum material disponível para enviar.</p>";

        throw new Error(
            "Nenhum material disponível para enviar ao Supabase."
        );
    }


    // ====================================================
    // PROTEÇÃO CONTRA DUPLO CLIQUE
    // ====================================================

    if (
        importacaoSupabaseEmAndamento
    ) {

        resultado.innerHTML =
            "<p>⚠️ Já existe uma importação para o Supabase em andamento.</p>";

        return;
    }


    // ====================================================
    // ATIVAR TRAVA
    // ====================================================

    importacaoSupabaseEmAndamento =
        true;


    // ====================================================
    // TAMANHO DOS LOTES
    // ====================================================
    //
    // Cada requisição enviará até 500 materiais.
    //
    // Exemplo:
    //
    // 92.735 materiais
    //
    // serão enviados em aproximadamente 186 lotes.
    //
    // ====================================================

    const tamanhoLote = 500;


    // ====================================================
    // CONTADORES
    // ====================================================

    let enviados = 0;


    const total =
        inventario.length;


    const quantidadeLotes =
        Math.ceil(
            total /
            tamanhoLote
        );


    try {

        // ====================================================
        // AVISAR QUE O SUPABASE SERÁ PREPARADO
        // ====================================================

        resultado.innerHTML =
            "<p>☁️ Preparando banco central...</p>" +

            "<p>O inventário anterior será substituído.</p>" +

            "<p>📦 " +
            total.toLocaleString(
                "pt-BR"
            ) +
            " materiais para importar.</p>";


        // ====================================================
        // LIMPAR INVENTÁRIO ANTERIOR
        // ====================================================
        //
        // A importação representa um novo retrato
        // do estoque vindo do DOGO.
        //
        // Portanto, removemos os materiais anteriores
        // antes de gravar o novo inventário.
        //
        // ====================================================

        const respostaLimpeza =
            await window.clienteSupabase
                .from("materiais")
                .delete()
                .not(
                    "id",
                    "is",
                    null
                );


        // ====================================================
        // VERIFICAR ERRO NA LIMPEZA
        // ====================================================

        if (
            respostaLimpeza.error
        ) {

            throw new Error(
                "Não foi possível limpar os materiais anteriores: " +
                respostaLimpeza.error.message
            );

        }


        // ====================================================
        // CONFIRMAR LIMPEZA
        // ====================================================

        resultado.innerHTML =
            "<p>🧹 Inventário anterior removido.</p>" +

            "<p>☁️ Iniciando importação para o Supabase...</p>" +

            "<p>0 de <strong>" +
            total.toLocaleString(
                "pt-BR"
            ) +
            "</strong> materiais enviados.</p>";


        // ====================================================
        // PROCESSAR LOTES
        // ====================================================

        for (
            let inicio = 0;
            inicio < total;
            inicio += tamanhoLote
        ) {

            // =================================================
            // DEFINIR FINAL DO LOTE
            // =================================================

            const fim =
                Math.min(
                    inicio +
                    tamanhoLote,
                    total
                );


            // =================================================
            // SEPARAR LOTE
            // =================================================

            const lote =
                inventario.slice(
                    inicio,
                    fim
                );


            // =================================================
            // TRANSFORMAR OBJETOS DO PMOBILE
            // PARA O FORMATO DA TABELA SUPABASE
            // =================================================

            const dadosSupabase =
                lote.map(
                    material => ({

                        codigo:
                            material.codigo,

                        descricao:
                            material.descricao,

                        referencia:
                            material.referencia || null,

                        marca:
                            material.marca || null,

                        local:
                            material.local || null,

                        quantidade:
                            material.quantidade ?? 0,

                        quantidade_reservada:
                            material.quantidadeReservada ?? 0,

                        disponivel:
                            material.disponivel ?? 0,

                        ultima_entrada:
                            material.ultimaEntrada || null

                    })
                );


            // =================================================
            // NÚMERO DO LOTE ATUAL
            // =================================================

            const numeroLote =
                Math.floor(
                    inicio /
                    tamanhoLote
                ) + 1;


            // =================================================
            // ENVIAR LOTE
            // =================================================

            const resposta =
                await window.clienteSupabase
                    .from("materiais")
                    .insert(
                        dadosSupabase
                    );


            // =================================================
            // VERIFICAR ERRO
            // =================================================

            if (
                resposta.error
            ) {

                throw new Error(
                    "Erro no lote " +
                    numeroLote +
                    " de " +
                    quantidadeLotes +
                    ": " +
                    resposta.error.message
                );

            }


            // =================================================
            // ATUALIZAR CONTADOR
            // =================================================

            enviados =
                fim;


            // =================================================
            // ATUALIZAR TELA
            // =================================================

            resultado.innerHTML =
                "<p>☁️ Importando inventário para o Supabase...</p>" +

                "<p><strong>" +
                enviados.toLocaleString(
                    "pt-BR"
                ) +
                "</strong> de <strong>" +
                total.toLocaleString(
                    "pt-BR"
                ) +
                "</strong> materiais enviados.</p>" +

                "<p>📦 Lote " +
                numeroLote +
                " de " +
                quantidadeLotes +
                "</p>";


            // =================================================
            // PERMITIR ATUALIZAÇÃO DO NAVEGADOR
            // =================================================

            await permitirAtualizacaoNavegador();

        }


        // ====================================================
        // SUCESSO
        // ====================================================

        resultado.innerHTML =
            "<p>🟢 <strong>Importação concluída com sucesso!</strong></p>" +

            "<p>" +
            enviados.toLocaleString(
                "pt-BR"
            ) +
            " materiais foram gravados no Supabase.</p>" +

            "<p>☁️ Banco central atualizado.</p>" +

            "<p>💾 O IndexedDB local também foi atualizado.</p>";


        // ====================================================
        // DIAGNÓSTICOS
        // ====================================================

        console.log(
            "Importação Supabase concluída."
        );


        console.log(
            "Materiais enviados:",
            enviados
        );


        console.log(
            "Quantidade de lotes:",
            quantidadeLotes
        );


    } catch (erro) {

        // ====================================================
        // ERRO NO ENVIO
        // ====================================================

        console.error(
            "Erro durante importação Supabase:",
            erro
        );


        resultado.innerHTML =
            "<p>🔴 <strong>Erro durante a importação para o Supabase.</strong></p>" +

            "<p>" +
            (
                erro.message ||
                "Erro desconhecido."
            ) +
            "</p>" +

            "<p>Foram enviados " +
            enviados.toLocaleString(
                "pt-BR"
            ) +
            " de " +
            total.toLocaleString(
                "pt-BR"
            ) +
            " materiais.</p>" +

            "<p>⚠️ O Supabase pode estar com um inventário parcial.</p>" +

            "<p>💾 O IndexedDB local permanece disponível.</p>";


        // ====================================================
        // PROPAGAR ERRO
        // ====================================================

        throw erro;


    } finally {

        // ====================================================
        // LIBERAR TRAVA
        // ====================================================
        //
        // Mesmo que ocorra erro, a trava precisa
        // ser liberada.
        //
        // ====================================================

        importacaoSupabaseEmAndamento =
            false;

    }

}


// ====================================================
// FUNÇÃO: lerInicioArquivo()
// ====================================================

function lerInicioArquivo(arquivo) {

    return new Promise(
        (resolve, reject) => {

            const tamanhoLeitura =
                Math.min(
                    arquivo.size,
                    8192
                );


            const blob =
                arquivo.slice(
                    0,
                    tamanhoLeitura
                );


            const leitor =
                new FileReader();


            leitor.onload =
                function() {

                    resolve(
                        leitor.result || ""
                    );

                };


            leitor.onerror =
                function() {

                    reject(
                        new Error(
                            "Não foi possível identificar o formato do arquivo."
                        )
                    );

                };


            leitor.readAsText(
                blob,
                "windows-1252"
            );

        }
    );

}


// ====================================================
// FUNÇÃO: detectarHTML()
// ====================================================

function detectarHTML(conteudo) {

    if (!conteudo) {

        return false;
    }


    const texto =
        String(conteudo)
            .trim()
            .toLowerCase();


    return (
        texto.startsWith("<") ||
        texto.includes("<html") ||
        texto.includes("<table") ||
        texto.includes("<tr") ||
        texto.includes("<meta") ||
        texto.includes("<!doctype")
    );

}


// ====================================================
// FUNÇÃO: processarArquivoHTML()
// ====================================================

async function processarArquivoHTML(arquivo) {

    const texto =
        await lerArquivoComoTexto(
            arquivo
        );


    if (!texto) {

        throw new Error(
            "O arquivo está vazio."
        );

    }


    console.log(
        "Arquivo HTML carregado."
    );


    console.log(
        "Tamanho do texto:",
        texto.length,
        "caracteres"
    );


    // ====================================================
    // LOCALIZAR LINHAS DA TABELA
    // ====================================================

    const regexLinha =
        /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;


    // ====================================================
    // CABEÇALHOS
    // ====================================================

    let cabecalhos =
        null;


    // ====================================================
    // INVENTÁRIO RESULTANTE
    // ====================================================

    const novoInventario = [];


    // ====================================================
    // CONTADOR DE LINHAS
    // ====================================================

    let quantidadeLinhas =
        0;


    let linhaEncontrada;


    // ====================================================
    // PROCESSAR LINHA POR LINHA
    // ====================================================

    while (
        (
            linhaEncontrada =
                regexLinha.exec(texto)
        ) !== null
    ) {

        const conteudoLinha =
            linhaEncontrada[1];


        // =================================================
        // EXTRAIR CÉLULAS
        // =================================================

        const celulas =
            extrairCelulasHTML(
                conteudoLinha
            );


        if (
            celulas.length === 0
        ) {

            continue;
        }


        quantidadeLinhas++;


        // =================================================
        // PRIMEIRA LINHA = CABEÇALHOS
        // =================================================

        if (
            cabecalhos === null
        ) {

            cabecalhos =
                celulas.map(
                    celula =>
                        limparTextoHTML(
                            celula
                        )
                );


            console.log(
                "Cabeçalhos encontrados:",
                cabecalhos
            );


            validarCabecalhos(
                cabecalhos
            );


            continue;
        }


        // =================================================
        // CONVERTER LINHA EM OBJETO
        // =================================================

        const linha =
            {};


        cabecalhos.forEach(
            (
                cabecalho,
                indice
            ) => {

                linha[cabecalho] =
                    limparTextoHTML(
                        celulas[indice] ??
                        ""
                    );

            }
        );


        // =================================================
        // TRANSFORMAR LINHA EM MATERIAL
        // =================================================

        const material =
            criarMaterial(
                linha
            );


        novoInventario.push(
            material
        );


        // =================================================
        // ATUALIZAR PROGRESSO
        // =================================================

        if (
            novoInventario.length % 1000 === 0
        ) {

            console.log(
                "Materiais processados:",
                novoInventario.length
            );


            await permitirAtualizacaoNavegador();

        }

    }


    // ====================================================
    // DIAGNÓSTICOS
    // ====================================================

    console.log(
        "Linhas HTML encontradas:",
        quantidadeLinhas
    );


    console.log(
        "Materiais HTML processados:",
        novoInventario.length
    );


    if (
        cabecalhos === null
    ) {

        throw new Error(
            "Nenhuma tabela foi encontrada no arquivo."
        );

    }


    return novoInventario;

}


// ====================================================
// FUNÇÃO: lerArquivoComoTexto()
// ====================================================

function lerArquivoComoTexto(arquivo) {

    return new Promise(
        (resolve, reject) => {

            const leitor =
                new FileReader();


            leitor.onload =
                function() {

                    resolve(
                        leitor.result || ""
                    );

                };


            leitor.onerror =
                function() {

                    reject(
                        new Error(
                            "Não foi possível ler o arquivo."
                        )
                    );

                };


            leitor.readAsText(
                arquivo,
                "windows-1252"
            );

        }
    );

}


// ====================================================
// FUNÇÃO: extrairCelulasHTML()
// ====================================================

function extrairCelulasHTML(conteudoLinha) {

    const regexCelula =
        /<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;


    const celulas = [];


    let encontrada;


    while (
        (
            encontrada =
                regexCelula.exec(
                    conteudoLinha
                )
        ) !== null
    ) {

        celulas.push(
            encontrada[1]
        );

    }


    return celulas;

}


// ====================================================
// FUNÇÃO: limparTextoHTML()
// ====================================================

function limparTextoHTML(valor) {

    let texto =
        String(
            valor ?? ""
        );


    // ====================================================
    // QUEBRAS DE LINHA
    // ====================================================

    texto =
        texto.replace(
            /<br\s*\/?>/gi,
            " "
        );


    // ====================================================
    // REMOVER TAGS
    // ====================================================

    texto =
        texto.replace(
            /<[^>]*>/g,
            ""
        );


    // ====================================================
    // ENTIDADES HTML
    // ====================================================

    texto =
        texto.replace(
            /&nbsp;/gi,
            " "
        );


    texto =
        texto.replace(
            /&amp;/gi,
            "&"
        );


    texto =
        texto.replace(
            /&lt;/gi,
            "<"
        );


    texto =
        texto.replace(
            /&gt;/gi,
            ">"
        );


    texto =
        texto.replace(
            /&quot;/gi,
            '"'
        );


    texto =
        texto.replace(
            /&#39;/gi,
            "'"
        );


    // ====================================================
    // ENTIDADES NUMÉRICAS
    // ====================================================

    texto =
        texto.replace(
            /&#(\d+);/g,
            function(
                completo,
                codigo
            ) {

                return String.fromCharCode(
                    Number(codigo)
                );

            }
        );


    texto =
        texto.replace(
            /&#x([0-9a-f]+);/gi,
            function(
                completo,
                codigo
            ) {

                return String.fromCharCode(
                    parseInt(
                        codigo,
                        16
                    )
                );

            }
        );


    // ====================================================
    // LIMPAR ESPAÇOS
    // ====================================================

    return texto.trim();

}


// ====================================================
// FUNÇÃO: validarCabecalhos()
// ====================================================

function validarCabecalhos(cabecalhos) {

    const possuiProduto =
        cabecalhos.includes(
            "Produto"
        );


    const possuiDescricao =
        cabecalhos.includes(
            "Descrição"
        ) ||
        cabecalhos.includes(
            "Descricao"
        );


    const possuiEstoque =
        cabecalhos.includes(
            "Qtde. Est."
        ) ||
        cabecalhos.includes(
            "Qtde. Est"
        );


    const possuiReservada =
        cabecalhos.includes(
            "Qtde. Rsr."
        );


    if (!possuiProduto) {

        throw new Error(
            "A coluna 'Produto' não foi encontrada."
        );

    }


    if (!possuiDescricao) {

        throw new Error(
            "A coluna 'Descrição' não foi encontrada."
        );

    }


    if (!possuiEstoque) {

        throw new Error(
            "A coluna 'Qtde. Est.' não foi encontrada."
        );

    }


    if (!possuiReservada) {

        throw new Error(
            "A coluna 'Qtde. Rsr.' não foi encontrada."
        );

    }

}


// ====================================================
// FUNÇÃO: processarArquivoExcel()
// ====================================================

async function processarArquivoExcel(arquivo) {

    // ====================================================
    // LER COMO ARRAYBUFFER
    // ====================================================

    const dados =
        await arquivo.arrayBuffer();


    // ====================================================
    // INTERPRETAR COM SHEETJS
    // ====================================================

    const workbook =
        XLSX.read(
            dados,
            {
                type: "array"
            }
        );


    // ====================================================
    // VERIFICAR ABAS
    // ====================================================

    if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
    ) {

        throw new Error(
            "Nenhuma aba foi encontrada no arquivo."
        );

    }


    // ====================================================
    // PRIMEIRA ABA
    // ====================================================

    const nomePrimeiraAba =
        workbook.SheetNames[0];


    const primeiraAba =
        workbook.Sheets[
            nomePrimeiraAba
        ];


    console.log(
        "Primeira aba:",
        nomePrimeiraAba
    );


    console.log(
        "Intervalo:",
        primeiraAba["!ref"]
    );


    // ====================================================
    // CONVERTER PARA JSON
    // ====================================================

    const linhas =
        XLSX.utils.sheet_to_json(
            primeiraAba,
            {
                defval: ""
            }
        );


    if (
        !linhas ||
        linhas.length === 0
    ) {

        throw new Error(
            "A planilha não possui dados."
        );

    }


    // ====================================================
    // VALIDAR CABEÇALHOS
    // ====================================================

    const cabecalhos =
        Object.keys(
            linhas[0]
        );


    console.log(
        "Colunas encontradas:",
        cabecalhos
    );


    validarCabecalhos(
        cabecalhos
    );


    // ====================================================
    // CRIAR NOVO INVENTÁRIO
    // ====================================================

    const novoInventario = [];


    // ====================================================
    // PROCESSAR LINHAS
    // ====================================================

    linhas.forEach(
        linha => {

            novoInventario.push(
                criarMaterial(
                    linha
                )
            );

        }
    );


    return novoInventario;

}


// ====================================================
// FUNÇÃO: criarMaterial()
// ====================================================

function criarMaterial(linha) {

    // ====================================================
    // CÓDIGO
    // ====================================================

    const codigo =
        String(
            linha["Produto"] ??
            ""
        ).trim();


    // ====================================================
    // DESCRIÇÃO
    // ====================================================

    const descricao =
        String(
            linha["Descrição"] ??
            linha["Descricao"] ??
            ""
        ).trim();


    // ====================================================
    // REFERÊNCIA
    // ====================================================

    const referencia =
        String(
            linha["Referência"] ??
            linha["Referencia"] ??
            ""
        ).trim();


    // ====================================================
    // MARCA
    // ====================================================

    const marca =
        String(
            linha["Marca"] ??
            ""
        ).trim();


    // ====================================================
    // LOCAL
    // ====================================================

    const local =
        String(
            linha["Local"] ??
            ""
        ).trim();


    // ====================================================
    // ÚLTIMA ENTRADA
    // ====================================================

    const ultimaEntrada =
        String(
            linha["Última entrada"] ??
            linha["Última Entrada"] ??
            linha["Ultima entrada"] ??
            linha["Ultima Entrada"] ??
            ""
        ).trim();


    // ====================================================
    // ESTOQUE TOTAL
    // ====================================================

    const estoqueTotal =
        converterNumero(
            linha["Qtde. Est."] ??
            linha["Qtde. Est"] ??
            0
        );


    // ====================================================
    // QUANTIDADE RESERVADA
    // ====================================================

    const quantidadeReservada =
        converterNumero(
            linha["Qtde. Rsr."] ??
            0
        );


    // ====================================================
    // QUANTIDADE DISPONÍVEL
    // ====================================================

    const disponivel =
        estoqueTotal -
        quantidadeReservada;


    // ====================================================
    // RETORNAR MATERIAL
    // ====================================================

    return {

        codigo:
            codigo,

        descricao:
            descricao,

        referencia:
            referencia,

        marca:
            marca,

        local:
            local,

        quantidade:
            estoqueTotal,

        quantidadeReservada:
            quantidadeReservada,

        disponivel:
            disponivel,

        ultimaEntrada:
            ultimaEntrada

    };

}


// ====================================================
// FUNÇÃO: converterNumero()
// ====================================================

function converterNumero(valor) {

    if (
        typeof valor === "number"
    ) {

        return isNaN(valor)
            ? 0
            : valor;

    }


    let texto =
        String(
            valor ?? ""
        ).trim();


    if (texto === "") {

        return 0;

    }


    // ====================================================
    // REMOVER ESPAÇOS
    // ====================================================

    texto =
        texto.replace(
            /\s+/g,
            ""
        );


    // ====================================================
    // CONVERTER NÚMERO
    // ====================================================

    const numero =
        Number(
            texto
        );


    return isNaN(numero)
        ? 0
        : numero;

}


// ====================================================
// FUNÇÃO: permitirAtualizacaoNavegador()
// ====================================================
//
// Permite que o navegador tenha uma pequena oportunidade
// de atualizar a interface.
//
// ====================================================

function permitirAtualizacaoNavegador() {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                0
            );

        }
    );

}