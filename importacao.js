// ============================================================
// PMOBILE
// IMPORTAÇÃO DE INVENTÁRIO
// ============================================================
//
// Responsável por:
//
// 1. Receber o arquivo selecionado.
// 2. Validar o tamanho.
// 3. Detectar o formato real.
// 4. Processar HTML do DOGO.
// 5. Processar Excel verdadeiro.
// 6. Validar os registros ANTES da conversão.
// 7. Classificar:
//      🟢 OK
//      🟡 OBSERVAÇÃO
//      🔴 ERRO
// 8. Criar o inventário do PMOBILE.
// 9. Salvar no IndexedDB.
// 10. Enviar automaticamente para o Supabase.
// 11. Substituir o inventário anterior no Supabase.
// 12. Enviar em lotes.
// 13. Impedir importações simultâneas.
//
// ============================================================


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const LIMITE_ARQUIVO_MB = 100;
const TAMANHO_LOTE_SUPABASE = 500;


// ============================================================
// CONTROLE DE IMPORTAÇÃO SUPABASE
// ============================================================
//
// Impede que o usuário clique duas vezes e envie
// o mesmo inventário simultaneamente.
//
// ============================================================

let importacaoSupabaseEmAndamento = false;


// ============================================================
// DIAGNÓSTICO DA IMPORTAÇÃO
// ============================================================
//
// Guarda o resultado da análise de TODOS os registros.
//
// ============================================================

let diagnosticoImportacao = {
    total: 0,
    ok: 0,
    observacoes: [],
    erros: [],
    codigosEncontrados: new Map()
};


// ============================================================
// FUNÇÃO: iniciarDiagnosticoImportacao()
// ============================================================
//
// Limpa o diagnóstico anterior.
//
// Deve ser chamada no início de cada importação.
//
// ============================================================

function iniciarDiagnosticoImportacao() {

    diagnosticoImportacao = {

        total: 0,

        ok: 0,

        observacoes: [],

        erros: [],

        codigosEncontrados: new Map()

    };

}


// ============================================================
// FUNÇÃO: valorVazio()
// ============================================================
//
// Verifica se um valor está vazio.
//
// Considera vazio:
// - null
// - undefined
// - ""
// - espaços
//
// ============================================================

function valorVazio(valor) {

    return (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    );

}


// ============================================================
// FUNÇÃO: numeroValidoOriginal()
// ============================================================
//
// Verifica o valor ORIGINAL da planilha.
//
// IMPORTANTE:
//
// Esta função acontece ANTES de converter o número.
//
// Assim conseguimos diferenciar:
//
// ""       → vazio
// "0"      → válido
// "10"     → válido
// "10,50"  → válido
// "ABC"    → erro
//
// ============================================================

function numeroValidoOriginal(valor) {

    if (valorVazio(valor)) {

        return {
            valido: true,
            vazio: true
        };

    }

    if (typeof valor === "number") {

        return {
            valido: Number.isFinite(valor),
            vazio: false
        };

    }

    let texto = String(valor).trim();

    texto = texto.replace(/\s/g, "");

    // Formatos aceitos:
    //
    // 10
    // 10.5
    // 10,5
    // 1.000
    // 1.000,50
    // 1000.50

    const formatoNumero =
        /^[+-]?\d+(?:[.,]\d+)?$/;

    const formatoMilhar =
        /^[+-]?\d{1,3}(?:\.\d{3})+(?:,\d+)?$/;

    if (
        formatoNumero.test(texto) ||
        formatoMilhar.test(texto)
    ) {

        return {
            valido: true,
            vazio: false
        };

    }

    return {
        valido: false,
        vazio: false
    };

}


// ============================================================
// FUNÇÃO: analisarMaterialImportado()
// ============================================================
//
// Analisa o registro ANTES de criar o material definitivo.
//
// Classificação:
//
// 🟢 OK
// Registro sem problemas.
//
// 🟡 OBSERVAÇÃO
// Informação ausente, mas que não impede o material
// de ser utilizado.
//
// 🔴 ERRO
// Informação inválida ou inconsistente.
//
// Regras atuais:
//
// Código vazio              → observação
// Descrição vazia           → observação
// Referência vazia          → observação
// Marca vazia               → observação
// Local vazio               → observação
// Última Entrada vazia      → observação
//
// Qtde. Est. inválida       → erro
// Qtde. Rsr. inválida       → erro
// Código duplicado          → erro
//
// ============================================================

function analisarMaterialImportado(
    linha,
    numeroRegistro
) {

    diagnosticoImportacao.total++;

    let possuiObservacao = false;
    let possuiErro = false;


    // ========================================================
    // CÓDIGO
    // ========================================================

    const codigo =
        linha.Produto ??
        linha.produto ??
        linha.Codigo ??
        linha.codigo ??
        "";

    if (valorVazio(codigo)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Produto",

            mensagem: "Código do produto vazio."

        });

    }
    else {

        const codigoTexto =
            String(codigo).trim();

        if (
            diagnosticoImportacao
                .codigosEncontrados
                .has(codigoTexto)
        ) {

            possuiErro = true;

            const registroAnterior =
                diagnosticoImportacao
                    .codigosEncontrados
                    .get(codigoTexto);

            diagnosticoImportacao.erros.push({

                registro: numeroRegistro,

                campo: "Produto",

                mensagem:
                    "Código duplicado. " +
                    "Também aparece no registro " +
                    registroAnterior +
                    "."

            });

        }
        else {

            diagnosticoImportacao
                .codigosEncontrados
                .set(
                    codigoTexto,
                    numeroRegistro
                );

        }

    }


    // ========================================================
    // DESCRIÇÃO
    // ========================================================

    const descricao =
        linha.Descricao ??
        linha.descricao ??
        linha.Descrição ??
        linha.descrição ??
        "";

    if (valorVazio(descricao)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Descricao",

            mensagem: "Descrição vazia."

        });

    }


    // ========================================================
    // REFERÊNCIA
    // ========================================================

    const referencia =
        linha.Referencia ??
        linha.referencia ??
        linha.Referência ??
        linha.referência ??
        "";

    if (valorVazio(referencia)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Referencia",

            mensagem: "Referência vazia."

        });

    }


    // ========================================================
    // MARCA
    // ========================================================

    const marca =
        linha.Marca ??
        linha.marca ??
        "";

    if (valorVazio(marca)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Marca",

            mensagem: "Marca vazia."

        });

    }


    // ========================================================
    // LOCAL
    // ========================================================

    const local =
        linha.Local ??
        linha.local ??
        "";

    if (valorVazio(local)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Local",

            mensagem: "Local vazio."

        });

    }


    // ========================================================
    // ÚLTIMA ENTRADA
    // ========================================================

    const ultimaEntrada =
        linha["Ultima Entrada"] ??
        linha["Última Entrada"] ??
        linha.ultimaEntrada ??
        "";

    if (valorVazio(ultimaEntrada)) {

        possuiObservacao = true;

        diagnosticoImportacao.observacoes.push({

            registro: numeroRegistro,

            campo: "Ultima Entrada",

            mensagem: "Data da última entrada vazia."

        });

    }


    // ========================================================
    // QUANTIDADE ESTIMADA
    // ========================================================

    const quantidade =
        linha["Qtde. Est."] ??
        linha["Qtde Est."] ??
        linha.quantidade ??
        "";

    const quantidadeValida =
        numeroValidoOriginal(
            quantidade
        );

    if (!quantidadeValida.valido) {

        possuiErro = true;

        diagnosticoImportacao.erros.push({

            registro: numeroRegistro,

            campo: "Qtde. Est.",

            mensagem:
                "Quantidade estimada inválida: " +
                String(quantidade)

        });

    }


    // ========================================================
    // QUANTIDADE RESERVADA
    // ========================================================

    const quantidadeReservada =
        linha["Qtde. Rsr."] ??
        linha["Qtde Rsr."] ??
        linha.quantidadeReservada ??
        "";

    const reservadaValida =
        numeroValidoOriginal(
            quantidadeReservada
        );

    if (!reservadaValida.valido) {

        possuiErro = true;

        diagnosticoImportacao.erros.push({

            registro: numeroRegistro,

            campo: "Qtde. Rsr.",

            mensagem:
                "Quantidade reservada inválida: " +
                String(quantidadeReservada)

        });

    }


    // ========================================================
    // CLASSIFICAÇÃO FINAL DO REGISTRO
    // ========================================================

    if (possuiErro) {

        return "ERRO";

    }

    if (possuiObservacao) {

        return "OBSERVACAO";

    }

    diagnosticoImportacao.ok++;

    return "OK";

}


// ============================================================
// FUNÇÃO: converterNumero()
// ============================================================
//
// Converte números provenientes da planilha.
//
// Aceita:
//
// 10
// "10"
// "10,50"
// "10.50"
// "1.000,50"
//
// Valores vazios retornam 0.
//
// ============================================================

function converterNumero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === ""
    ) {

        return 0;

    }


    if (typeof valor === "number") {

        return Number.isFinite(valor)
            ? valor
            : 0;

    }


    let texto =
        String(valor)
            .trim()
            .replace(/\s/g, "");


    // Formato brasileiro:
    //
    // 1.234,56
    //

    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    }

    // Apenas vírgula:
    //
    // 10,50
    //

    else if (
        texto.includes(",")
    ) {

        texto =
            texto.replace(",", ".");

    }


    const numero =
        Number(texto);

    return Number.isFinite(numero)
        ? numero
        : 0;

}


// ============================================================
// FUNÇÃO: criarMaterial()
// ============================================================
//
// Transforma uma linha da planilha no formato usado pelo
// PMOBILE.
//
// ============================================================

function criarMaterial(linha) {

    const codigo =
        linha.Produto ??
        linha.produto ??
        linha.Codigo ??
        linha.codigo ??
        "";

    const descricao =
        linha.Descricao ??
        linha.descricao ??
        linha.Descrição ??
        linha.descrição ??
        "";

    const referencia =
        linha.Referencia ??
        linha.referencia ??
        linha.Referência ??
        linha.referência ??
        "";

    const marca =
        linha.Marca ??
        linha.marca ??
        "";

    const local =
        linha.Local ??
        linha.local ??
        "";

    const quantidade =
        converterNumero(
            linha["Qtde. Est."] ??
            linha["Qtde Est."] ??
            linha.quantidade
        );

    const quantidadeReservada =
        converterNumero(
            linha["Qtde. Rsr."] ??
            linha["Qtde Rsr."] ??
            linha.quantidadeReservada
        );

    const disponivel =
        quantidade -
        quantidadeReservada;

    const ultimaEntrada =
        linha["Ultima Entrada"] ??
        linha["Última Entrada"] ??
        linha.ultimaEntrada ??
        "";


    return {

        codigo:
            valorVazio(codigo)
                ? ""
                : String(codigo).trim(),

        descricao:
            valorVazio(descricao)
                ? ""
                : String(descricao).trim(),

        referencia:
            valorVazio(referencia)
                ? null
                : String(referencia).trim(),

        marca:
            valorVazio(marca)
                ? null
                : String(marca).trim(),

        local:
            valorVazio(local)
                ? null
                : String(local).trim(),

        quantidade,

        quantidadeReservada,

        disponivel,

        ultimaEntrada:
            valorVazio(ultimaEntrada)
                ? null
                : String(ultimaEntrada).trim()

    };

}


// ============================================================
// FUNÇÃO: atualizarDiagnosticoTela()
// ============================================================
//
// Mostra o resumo do diagnóstico na tela.
//
// ============================================================

function atualizarDiagnosticoTela() {

    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );

    if (!resultado) {

        return;

    }


    const total =
        diagnosticoImportacao.total;

    const ok =
        diagnosticoImportacao.ok;

    const observacoes =
        diagnosticoImportacao.observacoes.length;

    const erros =
        diagnosticoImportacao.erros.length;


    resultado.innerHTML +=

        "<hr>" +

        "<h3>🔎 Diagnóstico da importação</h3>" +

        "<p>📦 Total de registros analisados: <strong>" +
        total.toLocaleString("pt-BR") +
        "</strong></p>" +

        "<p>🟢 Registros OK: <strong>" +
        ok.toLocaleString("pt-BR") +
        "</strong></p>" +

        "<p>🟡 Observações: <strong>" +
        observacoes.toLocaleString("pt-BR") +
        "</strong></p>" +

        "<p>🔴 Erros: <strong>" +
        erros.toLocaleString("pt-BR") +
        "</strong></p>";


    // ========================================================
    // OBSERVAÇÕES
    // ========================================================

    if (observacoes > 0) {

        resultado.innerHTML +=

            "<details>" +

            "<summary>🟡 Ver observações</summary>" +

            "<ul>";

        diagnosticoImportacao
            .observacoes
            .slice(0, 200)
            .forEach(
                observacao => {

                    resultado.innerHTML +=

                        "<li>" +

                        "Registro " +
                        observacao.registro +
                        " — " +

                        observacao.campo +
                        ": " +

                        observacao.mensagem +

                        "</li>";

                }
            );

        if (observacoes > 200) {

            resultado.innerHTML +=

                "<li><em>" +
                "Exibindo apenas as primeiras 200 observações." +
                "</em></li>";

        }

        resultado.innerHTML +=

            "</ul>" +

            "</details>";

    }


    // ========================================================
    // ERROS
    // ========================================================

    if (erros > 0) {

        resultado.innerHTML +=

            "<details open>" +

            "<summary>🔴 Ver erros</summary>" +

            "<ul>";

        diagnosticoImportacao
            .erros
            .slice(0, 200)
            .forEach(
                erro => {

                    resultado.innerHTML +=

                        "<li>" +

                        "Registro " +
                        erro.registro +
                        " — " +

                        erro.campo +
                        ": " +

                        erro.mensagem +

                        "</li>";

                }
            );

        if (erros > 200) {

            resultado.innerHTML +=

                "<li><em>" +
                "Exibindo apenas os primeiros 200 erros." +
                "</em></li>";

        }

        resultado.innerHTML +=

            "</ul>" +

            "</details>";

    }

}


// ============================================================
// FUNÇÃO: lerInicioArquivo()
// ============================================================
//
// Lê apenas o começo do arquivo.
//
// Serve para identificar se o arquivo é HTML ou Excel.
//
// ============================================================

async function lerInicioArquivo(arquivo) {

    const tamanhoLeitura =
        Math.min(
            arquivo.size,
            100 * 1024
        );

    const blob =
        arquivo.slice(
            0,
            tamanhoLeitura
        );

    return await blob.text();

}


// ============================================================
// FUNÇÃO: detectarHTML()
// ============================================================
//
// Identifica se o arquivo é realmente HTML.
//
// O DOGO pode entregar um arquivo com extensão .xls,
// mas internamente ele é HTML.
//
// ============================================================

function detectarHTML(texto) {

    if (!texto) {

        return false;

    }

    const inicio =
        texto
            .trim()
            .substring(0, 1000)
            .toLowerCase();

    return (
        inicio.includes("<html") ||
        inicio.includes("<table") ||
        inicio.includes("<!doctype html")
    );

}


// ============================================================
// FUNÇÃO: limparTextoHTML()
// ============================================================
//
// Remove tags HTML e decodifica entidades básicas.
//
// ============================================================

function limparTextoHTML(texto) {

    if (texto === null || texto === undefined) {

        return "";

    }

    let resultado =
        String(texto)
            .replace(/<br\s*\/?>/gi, " ")
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">");

    return resultado.trim();

}


// ============================================================
// FUNÇÃO: extrairCelulasHTML()
// ============================================================
//
// Extrai as células de uma linha <tr>.
//
// ============================================================

function extrairCelulasHTML(linhaHTML) {

    const celulas = [];

    const regex =
        /<(?:td|th)\b[^>]>([\s\S]?)<\/(?:td|th)>/gi;

    let resultado;

    while (
        (resultado = regex.exec(linhaHTML)) !== null
    ) {

        celulas.push(
            limparTextoHTML(
                resultado[1]
            )
        );

    }

    return celulas;

}


// ============================================================
// FUNÇÃO: normalizarCabecalho()
// ============================================================
//
// Normaliza o nome das colunas para facilitar comparação.
//
// ============================================================

function normalizarCabecalho(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ============================================================
// FUNÇÃO: localizarColuna()
// ============================================================
//
// Procura uma coluna por diferentes nomes possíveis.
//
// ============================================================

function localizarColuna(
    cabecalhos,
    nomes
) {

    for (
        let i = 0;
        i < cabecalhos.length;
        i++
    ) {

        const atual =
            normalizarCabecalho(
                cabecalhos[i]
            );

        for (
            const nome of nomes
        ) {

            if (
                atual ===
                normalizarCabecalho(nome)
            ) {

                return i;

            }

        }

    }

    return -1;

}


// ============================================================
// FUNÇÃO: validarColunas()
// ============================================================
//
// Verifica se as colunas essenciais existem.
//
// Obrigatórias:
//
// Produto
// Descricao
// Qtde. Est.
// Qtde. Rsr.
//
// ============================================================

function validarColunas(cabecalhos) {

    const indiceProduto =
        localizarColuna(
            cabecalhos,
            [
                "Produto",
                "Codigo",
                "Código"
            ]
        );

    const indiceDescricao =
        localizarColuna(
            cabecalhos,
            [
                "Descricao",
                "Descrição"
            ]
        );

    const indiceQuantidade =
        localizarColuna(
            cabecalhos,
            [
                "Qtde. Est.",
                "Qtde Est."
            ]
        );

    const indiceReservada =
        localizarColuna(
            cabecalhos,
            [
                "Qtde. Rsr.",
                "Qtde Rsr."
            ]
        );


    const faltando = [];


    if (indiceProduto === -1) {

        faltando.push(
            "Produto"
        );

    }

    if (indiceDescricao === -1) {

        faltando.push(
            "Descricao"
        );

    }

    if (indiceQuantidade === -1) {

        faltando.push(
            "Qtde. Est."
        );

    }

    if (indiceReservada === -1) {

        faltando.push(
            "Qtde. Rsr."
        );

    }


    if (faltando.length > 0) {

        throw new Error(
            "Colunas obrigatórias ausentes: " +
            faltando.join(", ")
        );

    }


    return true;

}


// ============================================================
// FUNÇÃO: criarLinhaPorCabecalhos()
// ============================================================
//
// Converte uma linha de valores em um objeto.
//
// ============================================================

function criarLinhaPorCabecalhos(
    cabecalhos,
    valores
) {

    const linha = {};


    cabecalhos.forEach(
        (cabecalho, indice) => {

            linha[cabecalho] =
                valores[indice] ?? "";

        }
    );


    return linha;

}


// ============================================================
// FUNÇÃO: processarArquivoHTML()
// ============================================================
//
// Processa o arquivo DOGO.
//
// O arquivo pode ter extensão .xls, mas ser HTML.
//
// ============================================================

async function processarArquivoHTML(
    arquivo
) {

    const texto =
        await arquivo.text();


    const linhasHTML =
        texto.match(
            /<tr\b[^>]>[\s\S]?<\/tr>/gi
        );


    if (
        !linhasHTML ||
        linhasHTML.length === 0
    ) {

        throw new Error(
            "Nenhuma tabela foi encontrada no arquivo DOGO."
        );

    }


    let cabecalhos = null;

    const novoInventario = [];


    for (
        let i = 0;
        i < linhasHTML.length;
        i++
    ) {

        const valores =
            extrairCelulasHTML(
                linhasHTML[i]
            );


        if (
            valores.length === 0
        ) {

            continue;

        }


        // ====================================================
        // PRIMEIRA LINHA VÁLIDA = CABEÇALHO
        // ====================================================

        if (!cabecalhos) {

            const primeiraLinha =
                valores.map(
                    valor =>
                        limparTextoHTML(valor)
                );


            if (
                primeiraLinha.includes(
                    "Produto"
                ) ||
                primeiraLinha.some(
                    valor =>
                        normalizarCabecalho(
                            valor
                        ) === "produto"
                )
            ) {

                cabecalhos =
                    primeiraLinha;

                validarColunas(
                    cabecalhos
                );

                continue;

            }

            continue;

        }


        // ====================================================
        // IGNORAR LINHAS SEM DADOS
        // ====================================================

        if (
            valores.every(
                valor =>
                    valorVazio(valor)
            )
        ) {

            continue;

        }


        const linha =
            criarLinhaPorCabecalhos(
                cabecalhos,
                valores
            );


        const numeroRegistro =
            i + 1;


        // ====================================================
        // DIAGNÓSTICO ANTES DA CONVERSÃO
        // ====================================================

        analisarMaterialImportado(
            linha,
            numeroRegistro
        );


        // ====================================================
        // CRIAR MATERIAL
        // ====================================================

        const material =
            criarMaterial(
                linha
            );


        novoInventario.push(
            material
        );


        // ====================================================
        // LIBERAR O NAVEGADOR PERIODICAMENTE
        // ====================================================

        if (
            i % 1000 === 0
        ) {

            await permitirAtualizacaoNavegador();

        }

    }


    if (!cabecalhos) {

        throw new Error(
            "Cabeçalho do DOGO não encontrado."
        );

    }


    return novoInventario;

}


// ============================================================
// FUNÇÃO: processarArquivoExcel()
// ============================================================
//
// Processa Excel verdadeiro usando SheetJS.
//
// ============================================================

async function processarArquivoExcel(
    arquivo
) {

    if (!window.XLSX) {

        throw new Error(
            "Biblioteca Excel não carregada."
        );

    }


    const arrayBuffer =
        await arquivo.arrayBuffer();


    const workbook =
        XLSX.read(
            arrayBuffer,
            {
                type: "array",
                cellDates: false
            }
        );


    if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
    ) {

        throw new Error(
            "Nenhuma planilha encontrada."
        );

    }


    const nomePlanilha =
        workbook.SheetNames[0];


    const planilha =
        workbook.Sheets[
            nomePlanilha
        ];


    const linhas =
        XLSX.utils.sheet_to_json(
            planilha,
            {
                defval: "",
                raw: true
            }
        );


    if (
        linhas.length === 0
    ) {

        throw new Error(
            "A planilha está vazia."
        );

    }


    const cabecalhos =
        Object.keys(
            linhas[0]
        );


    validarColunas(
        cabecalhos
    );


    const novoInventario = [];


    linhas.forEach(
        (
            linha,
            indice
        ) => {

            // =================================================
            // DIAGNÓSTICO ANTES DA CONVERSÃO
            // =================================================

            analisarMaterialImportado(
                linha,
                indice + 2
            );


            // =================================================
            // CRIAR MATERIAL
            // =================================================

            const material =
                criarMaterial(
                    linha
                );


            novoInventario.push(
                material
            );

        }
    );


    return novoInventario;

}


// ============================================================
// FUNÇÃO: permitirAtualizacaoNavegador()
// ============================================================
//
// Dá uma pequena pausa para o navegador atualizar a interface.
//
// Importante para arquivos grandes.
//
// ============================================================

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


// ============================================================
// FUNÇÃO: importarExcel()
// ============================================================
//
// FUNÇÃO PRINCIPAL.
//
// Fluxo:
//
// arquivo
// ↓
// detectar formato
// ↓
// validar
// ↓
// diagnóstico
// ↓
// criar inventário
// ↓
// IndexedDB
// ↓
// Supabase
//
// ============================================================

async function importarExcel() {

    const input =
        document.getElementById(
            "arquivoExcel"
        );

    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );


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


    // ========================================================
    // VERIFICAR ARQUIVO
    // ========================================================

    if (
        !input.files ||
        input.files.length === 0
    ) {

        resultado.innerHTML =
            "<p>❌ Selecione um arquivo para importar.</p>";

        return;

    }


    const arquivo =
        input.files[0];


    // ========================================================
    // LIMITE
    // ========================================================

    const limiteBytes =
        LIMITE_ARQUIVO_MB *
        1024 *
        1024;


    if (
        arquivo.size >
        limiteBytes
    ) {

        resultado.innerHTML =

            "<p>❌ Arquivo muito grande.</p>" +

            "<p>O tamanho máximo permitido é " +
            LIMITE_ARQUIVO_MB +
            " MB.</p>";

        return;

    }


    // ========================================================
    // INICIAR DIAGNÓSTICO
    // ========================================================

    iniciarDiagnosticoImportacao();


    resultado.innerHTML =
        "<p>⏳ Preparando importação...</p>";


    try {

        // ====================================================
        // SHEETJS
        // ====================================================

        if (!window.XLSX) {

            throw new Error(
                "Biblioteca Excel não carregada."
            );

        }


        // ====================================================
        // DETECTAR FORMATO
        // ====================================================

        resultado.innerHTML =
            "<p>⏳ Identificando formato do arquivo...</p>";


        const inicioArquivo =
            await lerInicioArquivo(
                arquivo
            );


        const ehHTML =
            detectarHTML(
                inicioArquivo
            );


        console.log(
            "Arquivo:",
            arquivo.name
        );

        console.log(
            "Tamanho:",
            arquivo.size,
            "bytes"
        );

        console.log(
            "Formato:",
            ehHTML
                ? "HTML"
                : "Excel"
        );


        // ====================================================
        // PROCESSAR
        // ====================================================

        let novoInventario = [];


        if (ehHTML) {

            resultado.innerHTML =

                "<p>⏳ Arquivo DOGO detectado.</p>" +

                "<p>Processando tabela...</p>";


            novoInventario =
                await processarArquivoHTML(
                    arquivo
                );

        }
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

        if (
            novoInventario.length === 0
        ) {

            throw new Error(
                "Nenhum material válido foi encontrado."
            );

        }


        console.log(
            "Materiais processados:",
            novoInventario.length
        );


        // ====================================================
        // MOSTRAR DIAGNÓSTICO
        // ====================================================

        resultado.innerHTML =

            "<p>🔎 Análise concluída.</p>" +

            "<p><strong>" +

            novoInventario.length
                .toLocaleString("pt-BR") +

            "</strong> materiais processados.</p>";


        atualizarDiagnosticoTela();


        // ====================================================
        // GUARDAR INVENTÁRIO ANTERIOR
        // ====================================================

        const inventarioAnterior =
            materiais;


        // ====================================================
        // COLOCAR NOVO INVENTÁRIO EM MEMÓRIA
        // ====================================================

        materiais =
            novoInventario;


        // ====================================================
        // SALVAR INDEXEDDB
        // ====================================================

        resultado.innerHTML +=

            "<p>⏳ Salvando inventário local...</p>";


        try {

            await salvarMateriais();

        }
        catch (erroSalvar) {

            materiais =
                inventarioAnterior;

            throw erroSalvar;

        }


        // ====================================================
        // MARCA DE INVENTÁRIO ZERADO
        // ====================================================

        desmarcarInventarioZerado();


        // ====================================================
        // PREPARAR SUPABASE
        // ====================================================

        resultado.innerHTML +=

            "<p>💾 Inventário local atualizado.</p>" +

            "<p>☁️ Preparando banco central...</p>";


        // ====================================================
        // IMPORTAR PARA SUPABASE
        // ====================================================

        await importarParaSupabase(
            materiais
        );


        // ====================================================
        // FINAL
        // ====================================================

        console.log(
            "Importação completa concluída."
        );

    }
    catch (erro) {

        console.error(
            "Erro durante a importação:",
            erro
        );


        resultado.innerHTML +=

            "<hr>" +

            "<p>❌ <strong>Erro durante a importação.</strong></p>" +

            "<p>" +

            (
                erro.message ||
                "Erro desconhecido."
            ) +

            "</p>";

    }

}


// ============================================================
// FUNÇÃO: importarParaSupabase()
// ============================================================
//
// Envia o inventário para o banco central.
//
// Fluxo:
//
// 1. Verifica conexão.
// 2. Verifica trava.
// 3. Ativa trava.
// 4. Apaga materiais antigos.
// 5. Divide em lotes.
// 6. Envia lotes.
// 7. Atualiza progresso.
// 8. Libera trava.
//
// ============================================================

async function importarParaSupabase(
    inventario
) {

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


    // ========================================================
    // VERIFICAR CLIENTE
    // ========================================================

    if (
        !window.clienteSupabase
    ) {

        throw new Error(
            "Supabase não inicializado."
        );

    }


    // ========================================================
    // IMPEDIR DUPLICIDADE
    // ========================================================

    if (
        importacaoSupabaseEmAndamento
    ) {

        resultado.innerHTML +=

            "<p>⚠️ Já existe uma importação para o Supabase em andamento.</p>";

        return;

    }


    importacaoSupabaseEmAndamento =
        true;


    try {

        // ====================================================
        // VALIDAR INVENTÁRIO
        // ====================================================

        if (
            !Array.isArray(inventario) ||
            inventario.length === 0
        ) {

            throw new Error(
                "Inventário vazio."
            );

        }


        // ====================================================
        // LIMPAR INVENTÁRIO ANTERIOR
        // ====================================================

        resultado.innerHTML +=

            "<p>🗑️ Limpando inventário anterior do Supabase...</p>";


        const respostaDelete =
            await window.clienteSupabase
                .from("materiais")
                .delete()
                .not(
                    "id",
                    "is",
                    null
                );


        if (
            respostaDelete.error
        ) {

            throw new Error(

                "Não foi possível limpar o inventário anterior: " +

                respostaDelete.error.message

            );

        }


        // ====================================================
        // CALCULAR LOTES
        // ====================================================

        const total =
            inventario.length;


        const quantidadeLotes =
            Math.ceil(
                total /
                TAMANHO_LOTE_SUPABASE
            );


        let enviados = 0;


        // ====================================================
        // ENVIAR LOTES
        // ====================================================

        for (
            let inicio = 0;
            inicio < total;
            inicio += TAMANHO_LOTE_SUPABASE
        ) {

            const fim =
                Math.min(
                    inicio +
                    TAMANHO_LOTE_SUPABASE,
                    total
                );


            const lote =
                inventario.slice(
                    inicio,
                    fim
                );


            // ==================================================
            // CONVERTER PARA FORMATO SUPABASE
            // ==================================================

            const dadosSupabase =
                lote.map(
                    material => ({

                        codigo:
                            material.codigo || "",

                        descricao:
                            material.descricao || "",

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


            // ==================================================
            // NÚMERO DO LOTE
            // ==================================================

            const numeroLote =
                Math.floor(
                    inicio /
                    TAMANHO_LOTE_SUPABASE
                ) + 1;


            // ==================================================
            // ENVIAR
            // ==================================================

            const resposta =
                await window.clienteSupabase
                    .from("materiais")
                    .insert(
                        dadosSupabase
                    );


            // ==================================================
            // VERIFICAR ERRO
            // ==================================================

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


            // ==================================================
            // ATUALIZAR CONTADOR
            // ==================================================

            enviados =
                fim;


            // ==================================================
            // ATUALIZAR TELA
            // ==================================================

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


            // ==================================================
            // DAR TEMPO PARA O NAVEGADOR ATUALIZAR
            // ==================================================

            await permitirAtualizacaoNavegador();

        }


        // ====================================================
        // SUCESSO
        // ====================================================

        resultado.innerHTML +=

            "<hr>" +

            "<p>🟢 <strong>Importação concluída com sucesso!</strong></p>" +

            "<p>" +

            enviados.toLocaleString(
                "pt-BR"
            ) +

            " materiais foram gravados no Supabase.</p>" +

            "<p>☁️ Banco central atualizado.</p>" +

            "<p>💾 IndexedDB local também atualizado.</p>";


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

    }
    catch (erro) {

        console.error(
            "Erro na importação Supabase:",
            erro
        );


        resultado.innerHTML +=

            "<hr>" +

            "<p>🔴 <strong>Erro ao enviar para o Supabase.</strong></p>" +

            "<p>" +

            (
                erro.message ||
                "Erro desconhecido."
            ) +

            "</p>";


        // Repassa o erro para importarExcel()
        // não considerar a operação como concluída.

        throw erro;

    }
    finally {

        // ====================================================
        // LIBERAR TRAVA
        // ====================================================

        importacaoSupabaseEmAndamento =
            false;

    }

}
