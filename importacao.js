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
// IMPORTANTE:
//
// O arquivo exportado pelo DOGO que estamos testando
// possui extensão .xls, mas seu conteúdo real é HTML.
//
// Por isso ele NÃO deve ser obrigatoriamente tratado
// como uma planilha Excel pelo SheetJS.
//
// ====================================================


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
    //
    // O limite definido para o PMOBILE é:
    //
    // 100 MB
    //
    // O arquivo é rejeitado antes do processamento
    // caso ultrapasse esse limite.
    //
    // Observação:
    //
    // 100 MB é o limite do arquivo original.
    // Um arquivo Excel/HTML pode consumir muito mais
    // memória durante o processamento.
    //
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
        //
        // SheetJS continua sendo utilizado para arquivos
        // Excel verdadeiros.
        //
        // Para o HTML do DOGO utilizaremos um processamento
        // próprio mais leve.
        //
        // ====================================================

        if (!window.XLSX) {

            throw new Error(
                "Biblioteca Excel não carregada."
            );

        }


        // ====================================================
        // LER O COMEÇO DO ARQUIVO
        // ====================================================
        //
        // Antes de decidir como processar o arquivo,
        // verificamos seu conteúdo real.
        //
        // Isso é necessário porque o DOGO pode gerar:
        //
        //     arquivo.xls
        //
        // cujo conteúdo é:
        //
        //     HTML
        //
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
        // VARIÁVEIS DO PROCESSAMENTO
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
        //
        // Isso é uma proteção importante.
        //
        // Se o salvamento do novo inventário falhar,
        // restauramos o inventário que estava em memória.
        //
        // O IndexedDB também utiliza uma transação,
        // portanto o inventário anterior deverá continuar
        // preservado caso a gravação seja abortada.
        //
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
            "<p>⏳ Salvando inventário...</p>";


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
        //
        // Esta função só é chamada depois que:
        //
        // 1. O arquivo foi lido.
        // 2. Os dados foram processados.
        // 3. As colunas foram validadas.
        // 4. O novo inventário foi salvo com sucesso.
        //
        // Portanto, uma importação com erro não remove
        // a marca de inventário zerado.
        //
        // ====================================================

        desmarcarInventarioZerado();


        // ====================================================
        // MENSAGEM DE SUCESSO
        // ====================================================

        resultado.innerHTML =
            "<p>✅ Inventário importado com sucesso!</p>" +
            "<p><strong>" +
            novoInventario.length.toLocaleString(
                "pt-BR"
            ) +
            "</strong> materiais processados.</p>";


        // ====================================================
        // DIAGNÓSTICOS
        // ====================================================

        console.log(
            "Importação concluída com sucesso."
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
// FUNÇÃO: lerInicioArquivo()
// ====================================================
//
// Lê somente os primeiros bytes do arquivo.
//
// Objetivo:
//
// descobrir rapidamente se o conteúdo parece HTML,
// sem precisar carregar os 45 MB do arquivo apenas
// para fazer a detecção.
//
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


            // =================================================
            // O DOGO utiliza texto compatível com Windows-1252.
            // =================================================

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
//
// Recebe o começo do arquivo e verifica se ele possui
// características de uma tabela HTML.
//
// O arquivo do DOGO começa com:
//
//     <table border='1'>
//
// Portanto será identificado corretamente.
//
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
//
// Processa o formato utilizado pelo DOGO:
//
//     arquivo .xls
//          ↓
//     conteúdo HTML
//          ↓
//     tabela <table>
//          ↓
//     linhas <tr>
//          ↓
//     células <td>/<th>
//
// NÃO utilizamos XLSX.read() neste caminho.
//
// Isso evita criar uma estrutura de workbook gigantesca
// para um arquivo HTML de aproximadamente 45 MB.
//
// ====================================================

async function processarArquivoHTML(arquivo) {

    // ====================================================
    // LER O ARQUIVO COMO TEXTO
    // ====================================================

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
    // LOCALIZAR TODAS AS LINHAS DA TABELA
    // ====================================================
    //
    // O arquivo do DOGO possui uma estrutura semelhante a:
    //
    // <tr>
    //     <th>Produto</th>
    //     ...
    // </tr>
    //
    // <tr>
    //     <td>...</td>
    //     ...
    // </tr>
    //
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
    // PROCESSAR UMA LINHA POR VEZ
    // ====================================================

    while (
        (
            linhaEncontrada =
                regexLinha.exec(texto)
        ) !== null
    ) {

        const conteudoLinha =
            linhaEncontrada[1];


        // ================================================
        // EXTRAIR CÉLULAS
        // ================================================

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
        //
        // Não atualizamos a tela em todas as 92 mil linhas,
        // pois isso deixaria o navegador ainda mais pesado.
        //
        // Atualizamos aproximadamente a cada 1.000 linhas.
        //
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
    // LIBERAR REFERÊNCIA DO TEXTO
    // ====================================================
    //
    // Não podemos forçar o Garbage Collector do navegador,
    // mas ao sair desta função a variável deixará de ser
    // utilizada.
    //
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
//
// Lê o arquivo inteiro como texto utilizando Windows-1252.
//
// Esse é o formato de texto encontrado no arquivo
// exportado pelo DOGO.
//
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
//
// Extrai o conteúdo de <th> e <td> de uma linha.
//
// Exemplo:
//
// <td>74778</td>
// <td>FILTRO AR</td>
//
// vira:
//
// [
//     "74778",
//     "FILTRO AR"
// ]
//
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
//
// Remove tags HTML e transforma entidades HTML em texto.
//
// Exemplos:
//
//     &nbsp;
//     &amp;
//     &lt;
//     &gt;
//
// Também remove espaços desnecessários nas extremidades.
//
// ====================================================

function limparTextoHTML(valor) {

    let texto =
        String(
            valor ?? ""
        );


    // ====================================================
    // CONVERTER QUEBRAS DE LINHA
    // ====================================================

    texto =
        texto.replace(
            /<br\s*\/?>/gi,
            " "
        );


    // ====================================================
    // REMOVER OUTRAS TAGS HTML
    // ====================================================

    texto =
        texto.replace(
            /<[^>]*>/g,
            ""
        );


    // ====================================================
    // CONVERTER ENTIDADES HTML
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
//
// Verifica se a planilha possui as colunas obrigatórias
// para o PMOBILE.
//
// Obrigatórias:
//
//     Produto
//     Descricao / Descrição
//     Qtde. Est.
//     Qtde. Rsr.
//
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
//
// Processa arquivos Excel verdadeiros utilizando SheetJS.
//
// Esse caminho continua disponível para:
//
//     .xlsx
//     .xls verdadeiro
//
// O .xls HTML do DOGO não passa por aqui.
//
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
//
// Converte uma linha da planilha em um objeto de material
// utilizado pelo PMOBILE.
//
// Campos:
//
//     codigo
//     descricao
//     referencia
//     marca
//     local
//     quantidade
//     quantidadeReservada
//     disponivel
//     ultimaEntrada
//
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
    //
    // Disponível =
    //
    // estoque total - quantidade reservada
    //
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
//
// Converte valores da planilha para número.
//
// O arquivo do DOGO utiliza valores como:
//
//     0.00
//     3.320
//
// Também tratamos espaços extras.
//
// Se o valor não puder ser convertido,
// retornamos 0.
//
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
// de atualizar a interface durante o processamento de
// milhares de linhas.
//
// Isso é especialmente importante no arquivo do DOGO,
// que possui aproximadamente 92 mil registros.
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