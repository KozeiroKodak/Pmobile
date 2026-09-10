// ============================================================
// PMOBILE
// IMPORTAÇÃO DE INVENTÁRIO
// ============================================================
//
// Responsável por:
//
// 1. Receber o arquivo selecionado.
// 2. Validar tamanho.
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
// IMPORTANTE:
// A conexão com o Supabase permanece no supabase.js.
// Este arquivo utiliza:
//      window.clienteSupabase
//
// ============================================================


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const LIMITE_ARQUIVO_MB = 100;
const TAMANHO_LOTE_SUPABASE = 500;


// ============================================================
// CONTROLE DE IMPORTAÇÃO
// ============================================================

let importacaoSupabaseEmAndamento = false;


// ============================================================
// FUNÇÃO: atualizarBarraProgresso
// ============================================================
//
// Atualiza a barra visual de progresso da importação.
//
// A etapa DOGO/Excel utiliza 0–50%.
// O envio para o Supabase utiliza 50–100%.
//
// ============================================================

function atualizarBarraProgresso(percentual, mensagem) {

    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );

    if (!resultado) {
        return;
    }

    const valor =
        Math.max(
            0,
            Math.min(100, Math.round(percentual))
        );

    resultado.innerHTML =
        "<p><strong>" +
        (mensagem || "Importando inventário...") +
        "</strong></p>" +

        "<div style=\"" +
            "width:100%;" +
            "height:22px;" +
            "background:#e5e7eb;" +
            "border-radius:11px;" +
            "overflow:hidden;" +
            "margin:10px 0;" +
        "\">" +

            "<div style=\"" +
                "width:" + valor + "%;" +
                "height:100%;" +
                "background:#2563eb;" +
                "transition:width 0.15s ease;" +
            "\"></div>" +

        "</div>" +

        "<p style=\"text-align:center;\"><strong>" +
            valor +
            "%" +
        "</strong></p>";

}


// ============================================================
// DIAGNÓSTICO DA IMPORTAÇÃO
// ============================================================

let diagnosticoImportacao = {
    total: 0,
    ok: 0,
    observacoes: [],
    erros: [],
    codigosEncontrados: new Map()
};


// ============================================================
// FUNÇÃO: iniciarDiagnosticoImportacao
// ============================================================
//
// Limpa o diagnóstico anterior.
//
// Deve ser executada no início de cada importação.
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
// FUNÇÃO: valorVazio
// ============================================================
//
// Verifica se determinado valor está vazio.
//
// Considera vazio:
//
// null
// undefined
// ""
// espaços
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
// FUNÇÃO: numeroValidoOriginal
// ============================================================
//
// Valida o valor ORIGINAL antes da conversão.
//
// Exemplos:
//
// ""       → válido/vazio
// 0        → válido
// "0"      → válido
// "10"     → válido
// "10,50"  → válido
// "10.50"  → válido
// "1.000"  → válido
// "1.000,50" → válido
// "ABC"    → inválido
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


    let texto = String(valor)
        .trim()
        .replace(/\s/g, "");


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
// FUNÇÃO: analisarMaterialImportado
// ============================================================
//
// Analisa uma linha ANTES de criar o material.
//
// 🟢 OK
// 🟡 OBSERVAÇÃO
// 🔴 ERRO
//
// Observações:
//
// Código vazio
// Descrição vazia
// Referência vazia
// Marca vazia
// Local vazio
// Última Entrada vazia
//
// Erros:
//
// Qtde. Est. inválida
// Qtde. Rsr. inválida
// Código duplicado
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

            mensagem:
                "Código do produto vazio."

        });

    } else {

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

        } else {

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

            mensagem:
                "Descrição vazia."

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

            mensagem:
                "Referência vazia."

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

            mensagem:
                "Marca vazia."

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

            mensagem:
                "Local vazio."

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

            mensagem:
                "Data da última entrada vazia."

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
    // CLASSIFICAÇÃO FINAL
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
// FUNÇÃO: converterNumero
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
// "1.000"
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


    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {

        texto =
            texto
                .replace(/\./g, "")
                .replace(",", ".");

    } else if (
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
// FUNÇÃO: criarMaterial
// ============================================================
//
// Converte uma linha da planilha para o formato PMOBILE.
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
// FUNÇÃO: atualizarDiagnosticoTela
// ============================================================
//
// Mostra o resultado do diagnóstico.
//
// ============================================================

function atualizarDiagnosticoTela() {

    // O diagnóstico continua sendo calculado internamente.
    // A interface principal utiliza somente a barra de progresso.

}


// ============================================================
// FUNÇÃO: lerInicioArquivo
// ============================================================
//
// Lê somente o início do arquivo para descobrir seu formato.
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
// FUNÇÃO: detectarHTML
// ============================================================
//
// O DOGO pode entregar:
//
// arquivo.xls
//
// mas internamente:
//
// HTML
//
// ============================================================

function detectarHTML(texto) {

    if (!texto) {

        return false;

    }


    const inicio =
        texto
            .trim()
            .substring(0, 2000)
            .toLowerCase();


    return (

        inicio.includes("<html") ||

        inicio.includes("<table") ||

        inicio.includes("<!doctype html") ||

        inicio.includes("<meta") ||

        inicio.includes("<head")

    );

}


// ============================================================
// FUNÇÃO: limparTextoHTML
// ============================================================
//
// Remove tags e entidades HTML.
//
// ============================================================

function limparTextoHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }


    let resultado =
        String(texto)

            .replace(
                /<br\s*\/?>/gi,
                " "
            )

            .replace(
                /<[^>]*>/g,
                ""
            )

            .replace(
                /&nbsp;/gi,
                " "
            )

            .replace(
                /&amp;/gi,
                "&"
            )

            .replace(
                /&quot;/gi,
                '"'
            )

            .replace(
                /&#39;/gi,
                "'"
            )

            .replace(
                /&lt;/gi,
                "<"
            )

            .replace(
                /&gt;/gi,
                ">"
            );


    return resultado
        .replace(/\s+/g, " ")
        .trim();

}


// ============================================================
// FUNÇÃO: normalizarCabecalho
// ============================================================
//
// Facilita a identificação dos cabeçalhos.
//
// Exemplo:
//
// "Última Entrada"
// "Ultima Entrada"
//
// tornam-se equivalentes.
//
// ============================================================

function normalizarCabecalho(valor) {

    if (valor === null || valor === undefined) {

        return "";

    }


    return String(valor)

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .toLowerCase()

        .replace(
            /[^a-z0-9]/g,
            ""
        );

}


// ============================================================
// FUNÇÃO: localizarColuna
// ============================================================
//
// Procura uma coluna através de possíveis nomes.
//
// ============================================================

function localizarColuna(
    cabecalhos,
    possibilidades
) {

    const normalizados =
        cabecalhos.map(
            cabecalho =>
                normalizarCabecalho(
                    cabecalho
                )
        );


    for (
        const possibilidade
        of possibilidades
    ) {

        const alvo =
            normalizarCabecalho(
                possibilidade
            );


        const indice =
            normalizados.indexOf(
                alvo
            );


        if (indice !== -1) {

            return indice;

        }

    }


    return -1;

}


// ============================================================
// FUNÇÃO: validarColunas
// ============================================================
//
// Valida as quatro colunas fundamentais:
//
// Produto
// Descricao
// Qtde. Est.
// Qtde. Rsr.
//
// ============================================================

function validarColunas(
    cabecalhos
) {

    const produto =
        localizarColuna(
            cabecalhos,
            [
                "Produto",
                "Codigo",
                "Código"
            ]
        );


    const descricao =
        localizarColuna(
            cabecalhos,
            [
                "Descricao",
                "Descrição"
            ]
        );


    const quantidade =
        localizarColuna(
            cabecalhos,
            [
                "Qtde. Est.",
                "Qtde Est.",
                "Quantidade"
            ]
        );


    const reservada =
        localizarColuna(
            cabecalhos,
            [
                "Qtde. Rsr.",
                "Qtde Rsr.",
                "Quantidade Reservada"
            ]
        );


    const faltantes = [];


    if (produto === -1) {

        faltantes.push(
            "Produto"
        );

    }


    if (descricao === -1) {

        faltantes.push(
            "Descricao"
        );

    }


    if (quantidade === -1) {

        faltantes.push(
            "Qtde. Est."
        );

    }


    if (reservada === -1) {

        faltantes.push(
            "Qtde. Rsr."
        );

    }


    return {

        valido:
            faltantes.length === 0,

        faltantes,

        produto,

        descricao,

        quantidade,

        reservada

    };

}


// ============================================================
// FUNÇÃO: criarLinhaPorCabecalhos
// ============================================================
//
// Converte uma linha de células em objeto.
//
// ============================================================

function criarLinhaPorCabecalhos(
    cabecalhos,
    celulas
) {

    const linha = {};


    for (
        let i = 0;
        i < cabecalhos.length;
        i++
    ) {

        const nome =
            cabecalhos[i];


        linha[nome] =
            celulas[i] !== undefined
                ? celulas[i]
                : "";

    }


    return linha;

}


// ============================================================
// FUNÇÃO: encontrarTabelaHTML
// ============================================================
//
// NOVA VERSÃO ROBUSTA.
//
// Não assume que a primeira tabela do arquivo é a tabela
// do estoque.
//
// Procura todas as tabelas e escolhe aquela que possui
// os cabeçalhos obrigatórios do DOGO.
//
// ============================================================

function encontrarTabelaHTML(
    documento
) {

    const tabelas =
        Array.from(
            documento.querySelectorAll(
                "table"
            )
        );


    if (!tabelas.length) {

        return null;

    }


    let melhorTabela = null;
    let maiorPontuacao = -1;


    for (
        const tabela
        of tabelas
    ) {

        const linhas =
            Array.from(
                tabela.querySelectorAll(
                    "tr"
                )
            );


        if (!linhas.length) {

            continue;

        }


        let melhorCabecalho = null;
        let melhorPontuacaoTabela = -1;


        for (
            let i = 0;
            i < Math.min(
                linhas.length,
                20
            );
            i++
        ) {

            const celulas =
                Array.from(
                    linhas[i].querySelectorAll(
                        "th, td"
                    )
                );


            const cabecalhos =
                celulas.map(
                    celula =>
                        limparTextoHTML(
                            celula.textContent
                        )
                );


            const validacao =
                validarColunas(
                    cabecalhos
                );


            let pontuacao = 0;


            if (
                validacao.produto !== -1
            ) {

                pontuacao += 3;

            }


            if (
                validacao.descricao !== -1
            ) {

                pontuacao += 3;

            }


            if (
                validacao.quantidade !== -1
            ) {

                pontuacao += 2;

            }


            if (
                validacao.reservada !== -1
            ) {

                pontuacao += 2;

            }


            if (pontuacao > melhorPontuacaoTabela) {

                melhorPontuacaoTabela =
                    pontuacao;

                melhorCabecalho =
                    i;

            }

        }


        if (
            melhorPontuacaoTabela >
            maiorPontuacao
        ) {

            maiorPontuacao =
                melhorPontuacaoTabela;

            melhorTabela = {

                tabela,

                indiceCabecalho:
                    melhorCabecalho,

                pontuacao:
                    melhorPontuacaoTabela

            };

        }

    }


    if (
        !melhorTabela ||
        maiorPontuacao < 10
    ) {

        return null;

    }


    return melhorTabela;

}


// ============================================================
// FUNÇÃO: processarArquivoHTML
// ============================================================
//
// Processa o formato HTML utilizado pelo DOGO.
//
// Esta é a parte corrigida.
//
// ============================================================

async function processarArquivoHTML(
    arquivo
) {

    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );


    atualizarBarraProgresso(
        0,
        "📄 Processando arquivo DOGO..."
    );


    // --------------------------------------------------------
    // Ler arquivo inteiro
    // --------------------------------------------------------

    const texto =
        await arquivo.text();


    if (!texto || texto.trim() === "") {

        throw new Error(
            "O arquivo DOGO está vazio."
        );

    }


    // --------------------------------------------------------
    // Criar documento HTML
    // --------------------------------------------------------

    const parser =
        new DOMParser();


    const documento =
        parser.parseFromString(
            texto,
            "text/html"
        );


    // --------------------------------------------------------
    // Procurar a tabela correta
    // --------------------------------------------------------

    const resultadoTabela =
        encontrarTabelaHTML(
            documento
        );


    if (!resultadoTabela) {

        throw new Error(
            "Nenhuma tabela de estoque compatível foi encontrada no arquivo DOGO."
        );

    }


    const tabela =
        resultadoTabela.tabela;


    const linhas =
        Array.from(
            tabela.querySelectorAll(
                "tr"
            )
        );


    const indiceCabecalho =
        resultadoTabela
            .indiceCabecalho;


    const linhaCabecalho =
        linhas[
            indiceCabecalho
        ];


    const cabecalhos =
        Array.from(
            linhaCabecalho.querySelectorAll(
                "th, td"
            )
        ).map(
            celula =>
                limparTextoHTML(
                    celula.textContent
                )
        );


    const validacao =
        validarColunas(
            cabecalhos
        );


    if (!validacao.valido) {

        throw new Error(
            "Colunas obrigatórias não encontradas: " +
            validacao.faltantes.join(", ")
        );

    }


    atualizarBarraProgresso(
        5,
        "📄 Processando arquivo DOGO..."
    );


    // --------------------------------------------------------
    // Processar linhas
    // --------------------------------------------------------

    const novoInventario = [];


    for (
        let i =
            indiceCabecalho + 1;

        i < linhas.length;

        i++
    ) {

        const linhaHTML =
            linhas[i];


        const celulas =
            Array.from(
                linhaHTML.querySelectorAll(
                    "td, th"
                )
            );


        if (!celulas.length) {

            continue;

        }


        const valores =
            celulas.map(
                celula =>
                    limparTextoHTML(
                        celula.textContent
                    )
            );


        // Ignora linha totalmente vazia

        const possuiConteudo =
            valores.some(
                valor =>
                    !valorVazio(
                        valor
                    )
            );


        if (!possuiConteudo) {            continue;

        }


        const linha =
            criarLinhaPorCabecalhos(
                cabecalhos,
                valores
            );


        const numeroRegistro =
            novoInventario.length + 1;


        // ----------------------------------------------------
        // DIAGNÓSTICO ANTES DA CONVERSÃO
        // ----------------------------------------------------

        analisarMaterialImportado(
            linha,
            numeroRegistro
        );


        // ----------------------------------------------------
        // CRIAR MATERIAL
        // ----------------------------------------------------

        const material =
            criarMaterial(
                linha
            );


        novoInventario.push(
            material
        );


        // ----------------------------------------------------
        // Liberar processamento periodicamente
        // ----------------------------------------------------

        if (
            novoInventario.length %
            1000 ===
            0
        ) {

            const totalLinhas =
                Math.max(
                    1,
                    linhas.length -
                    (indiceCabecalho + 1)
                );

            const percentual =
                5 +
                (novoInventario.length / totalLinhas) *
                45;

            atualizarBarraProgresso(
                Math.min(50, percentual),
                "📄 Processando arquivo DOGO..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        0
                    )
            );

        }

    }


    if (
        novoInventario.length === 0
    ) {

        throw new Error(
            "A tabela foi encontrada, mas nenhum registro de material foi extraído."
        );

    }


    atualizarBarraProgresso(
        50,
        "📄 Arquivo DOGO processado."
    );


    return novoInventario;

}


// ============================================================
// FUNÇÃO: processarArquivoExcel
// ============================================================
//
// Processa arquivos Excel verdadeiros.
//
// Depende da biblioteca SheetJS:
//      window.XLSX
//
// ============================================================

async function processarArquivoExcel(
    arquivo
) {

    if (
        typeof XLSX ===
        "undefined"
    ) {

        throw new Error(
            "A biblioteca XLSX não foi carregada."
        );

    }


    const arrayBuffer =
        await arquivo.arrayBuffer();


    const workbook =
        XLSX.read(
            arrayBuffer,
            {
                type: "array"
            }
        );


    if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
    ) {

        throw new Error(
            "Nenhuma planilha encontrada no arquivo Excel."
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
                defval: ""
            }
        );


    if (!linhas.length) {

        throw new Error(
            "A planilha não possui registros."
        );

    }


    const novoInventario = [];


    for (
        let i = 0;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];


        // Ignora linha vazia

        const possuiConteudo =
            Object.values(
                linha
            ).some(
                valor =>
                    !valorVazio(
                        valor
                    )
            );


        if (!possuiConteudo) {

            continue;

        }


        const numeroRegistro =
            novoInventario.length + 1;


        analisarMaterialImportado(
            linha,
            numeroRegistro
        );


        const material =
            criarMaterial(
                linha
            );


        novoInventario.push(
            material
        );


        if (
            novoInventario.length %
            1000 ===
            0
        ) {

            const percentual =
                (novoInventario.length / linhas.length) *
                50;

            atualizarBarraProgresso(
                Math.min(50, percentual),
                "📄 Processando arquivo Excel..."
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        0
                    )
            );

        }

    }


    if (!novoInventario.length) {

        throw new Error(
            "Nenhum material válido foi encontrado na planilha."
        );

    }


    atualizarBarraProgresso(
        50,
        "📄 Arquivo Excel processado."
    );


    return novoInventario;

}


// ============================================================
// FUNÇÃO: salvarInventarioLocal
// ============================================================
//
// Salva no IndexedDB.
//
// Utiliza a função existente em dados.js.
//
// ============================================================

async function salvarInventarioLocal(
    novoInventario
) {

    if (
        typeof salvarMateriais !==
        "function"
    ) {

        throw new Error(
            "A função salvarMateriais() não está disponível."
        );

    }


    await salvarMateriais(
        novoInventario
    );

}


// ============================================================
// FUNÇÃO: importarParaSupabase
// ============================================================
//
// Envia o inventário para o Supabase.
//
// Usa:
//
// window.clienteSupabase
//
// A Publishable Key continua no supabase.js.
//
// ============================================================

async function importarParaSupabase(
    materiais
) {

    if (
        !window.clienteSupabase
    ) {

        throw new Error(
            "Cliente Supabase não está disponível."
        );

    }


    if (
        importacaoSupabaseEmAndamento
    ) {

        throw new Error(
            "Já existe uma importação para o Supabase em andamento."
        );

    }


    importacaoSupabaseEmAndamento =
        true;


    const resultado =
        document.getElementById(
            "resultadoImportacao"
        );


    try {

        atualizarBarraProgresso(
            50,
            "☁️ Enviando inventário para o Supabase..."
        );


        // ----------------------------------------------------
        // LIMPAR INVENTÁRIO ANTERIOR
        // ----------------------------------------------------

        const {
            error:
                erroExclusao
        } =
            await window.clienteSupabase
                .from("materiais")
                .delete()
                .not(
                    "id",
                    "is",
                    null
                );


        if (erroExclusao) {

            throw new Error(
                "Erro ao limpar inventário anterior no Supabase: " +
                erroExclusao.message
            );

        }


        // ----------------------------------------------------
        // ENVIAR LOTES
        // ----------------------------------------------------

        let enviados = 0;


        for (
            let inicio = 0;

            inicio < materiais.length;

            inicio +=
                TAMANHO_LOTE_SUPABASE
        ) {

            const lote =
                materiais
                    .slice(
                        inicio,
                        inicio +
                        TAMANHO_LOTE_SUPABASE
                    )
                    .map(material => ({

                        codigo:
                            material.codigo,

                        descricao:
                            material.descricao,

                        referencia:
                            material.referencia,

                        marca:
                            material.marca,

                        local:
                            material.local,

                        quantidade:
                            material.quantidade,

                        quantidade_reservada:
                            material.quantidadeReservada,

                        disponivel:
                            material.disponivel,

                        ultima_entrada:
                            material.ultimaEntrada

                    }));


            const {
                error
            } =
                await window.clienteSupabase
                    .from("materiais")
                    .insert(lote);


            if (error) {

                throw new Error(
                    "Erro no lote " +
                    (
                        Math.floor(
                            inicio /
                            TAMANHO_LOTE_SUPABASE
                        ) + 1
                    ) +
                    ": " +
                    error.message
                );

            }


            enviados +=
                lote.length;


            const percentual =
                50 +
                (enviados / materiais.length) *
                50;

            atualizarBarraProgresso(
                percentual,
                "☁️ Enviando inventário para o Supabase..."
            );


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        0
                    )
            );

        }


        atualizarBarraProgresso(
            100,
            "☁️ Inventário enviado ao Supabase."
        );


        return true;


    } finally {

        importacaoSupabaseEmAndamento =
            false;

    }

}


// ============================================================
// FUNÇÃO: importarExcel
// ============================================================
//
// Função principal chamada pelo HTML:
//
// importarExcel()
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

        alert(
            "Campo de arquivo não encontrado."
        );

        return;

    }


    if (
        !input.files ||
        !input.files.length
    ) {

        alert(
            "Selecione um arquivo para importar."
        );

        return;

    }


    const arquivo =
        input.files[0];


    // --------------------------------------------------------
    // VALIDAR TAMANHO
    // --------------------------------------------------------

    const tamanhoMB =
        arquivo.size /
        (1024 * 1024);


    if (
        tamanhoMB >
        LIMITE_ARQUIVO_MB
    ) {

        alert(
            "O arquivo possui " +
            tamanhoMB.toFixed(2) +
            " MB.\n\n" +
            "O limite é " +
            LIMITE_ARQUIVO_MB +
            " MB."
        );

        return;

    }


    // --------------------------------------------------------
    // INICIAR
    // --------------------------------------------------------

    iniciarDiagnosticoImportacao();


    atualizarBarraProgresso(
        0,
        "🔎 Analisando arquivo..."
    );


    try {

        // ----------------------------------------------------
        // LER INÍCIO
        // ----------------------------------------------------

        const inicioArquivo =
            await lerInicioArquivo(
                arquivo
            );


        const ehHTML =
            detectarHTML(
                inicioArquivo
            );


        // ----------------------------------------------------
        // PROCESSAR
        // ----------------------------------------------------

        let novoInventario;


        if (ehHTML) {

            novoInventario =
                await processarArquivoHTML(
                    arquivo
                );

        } else {

            novoInventario =
                await processarArquivoExcel(
                    arquivo
                );

        }


        // ----------------------------------------------------
        // DIAGNÓSTICO
        // ----------------------------------------------------

        atualizarDiagnosticoTela();


        // ----------------------------------------------------
        // SALVAR LOCAL
        // ----------------------------------------------------

        atualizarBarraProgresso(
            50,
            "💾 Salvando inventário localmente..."
        );


        await salvarInventarioLocal(
            novoInventario
        );


        // ----------------------------------------------------
        // ATUALIZAR ARRAY GLOBAL
        // ----------------------------------------------------

        if (
            typeof materiais !==
            "undefined"
        ) {

            materiais =
                novoInventario;

        }


        // ----------------------------------------------------
        // SUPABASE
        // ----------------------------------------------------


        await importarParaSupabase(
            novoInventario
        );


        // ----------------------------------------------------
        // FINAL
        // ----------------------------------------------------

        if (resultado) {

            resultado.innerHTML =
                "<p><strong>Importação concluída!</strong></p>" +

                "<div style=\"" +
                    "width:100%;" +
                    "height:22px;" +
                    "background:#e5e7eb;" +
                    "border-radius:11px;" +
                    "overflow:hidden;" +
                    "margin:10px 0;" +
                "\">" +

                    "<div style=\"" +
                        "width:100%;" +
                        "height:100%;" +
                        "background:#16a34a;" +
                    "\"></div>" +

                "</div>" +

                "<p style=\"text-align:center;\"><strong>100%</strong></p>" +

                "<p>📦 Materiais importados: " +
                novoInventario
                    .length
                    .toLocaleString(
                        "pt-BR"
                    ) +
                "</p>";

        }


        // ----------------------------------------------------
        // MARCAR INVENTÁRIO COMO NÃO ZERADO
        // ----------------------------------------------------

        try {

            localStorage.removeItem(
                "pmobile_inventario_zerado"
            );

        } catch (erro) {

            console.warn(
                "Não foi possível atualizar o marcador de inventário.",
                erro
            );

        }


    } catch (erro) {

        console.error(
            "Erro durante a importação:",
            erro
        );


        if (resultado) {

            resultado.innerHTML =
                "<p>❌ <strong>Erro durante a importação.</strong></p>" +
                "<p>" +
                (
                    erro.message ||
                    String(erro)
                ) +
                "</p>";

        }

    }

}