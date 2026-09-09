// ==================================================
// FUNÇÕES DE PESQUISA
// ==================================================
//
// Responsável pela tela "Pesquisar material".
//
// A pesquisa é dividida em três campos
// independentes:
//
// 1. Código
// 2. Descrição
// 3. Referência
//
// Cada campo possui sua própria função.
//
// IMPORTANTE:
//
// A pesquisa por Código procura SOMENTE
// no código do material.
//
// A pesquisa por Descrição procura SOMENTE
// na descrição do material.
//
// A pesquisa por Referência procura SOMENTE
// na referência do material.
//
// Marca, Local e Quantidade NÃO participam
// da pesquisa.
//
// A busca é:
// - Parcial
// - Não diferencia letras maiúsculas
//   de minúsculas
//
// ==================================================


// ==================================================
// PESQUISA POR CÓDIGO
// ==================================================
//
// Agora a pesquisa é feita DIRETAMENTE
// no Supabase.
//
// ==================================================

async function pesquisarPorCodigo() {

    const busca =
        document
            .getElementById("campoPesquisaCodigo")
            .value
            .trim();


    const areaResultado =
        document.getElementById(
            "resultadoPesquisaCodigo"
        );


    // ----------------------------------------------
    // Verifica se o campo está vazio.
    // ----------------------------------------------

    if (busca === "") {

        areaResultado.innerHTML =
            "<p>Digite um código para pesquisar.</p>";

        return;
    }


    // ----------------------------------------------
    // Verifica se o cliente Supabase existe.
    // ----------------------------------------------

    if (!window.clienteSupabase) {

        areaResultado.innerHTML =
            "<p>🔴 Conexão com o Supabase não encontrada.</p>";

        return;
    }


    // ----------------------------------------------
    // Mostra que a pesquisa está sendo realizada.
    // ----------------------------------------------

    areaResultado.innerHTML =
        "<p>🔎 Pesquisando...</p>";


    try {

        // ------------------------------------------
        // Pesquisa SOMENTE no campo codigo.
        //
        // ilike = não diferencia maiúsculas
        // e minúsculas.
        //
        // %texto% = pesquisa parcial.
        // ------------------------------------------

        const resposta =
            await window.clienteSupabase
                .from("materiais")
                .select(
                    "id,codigo,descricao,referencia,marca,local,quantidade"
                )
                .ilike(
                    "codigo",
                    "%" + busca + "%"
                )
                .order(
                    "codigo",
                    { ascending: true }
                );


        // ------------------------------------------
        // Verifica erro do Supabase.
        // ------------------------------------------

        if (resposta.error) {

            throw resposta.error;
        }


        // ------------------------------------------
        // Exibe os resultados.
        // ------------------------------------------

        exibirResultadosPesquisa(
            resposta.data || [],
            areaResultado
        );

    } catch (erro) {

        console.error(
            "Erro na pesquisa por código:",
            erro
        );

        areaResultado.innerHTML =
            "<p>🔴 Erro ao pesquisar no Supabase.</p>" +
            "<p>" +
            (erro.message || "Erro desconhecido.") +
            "</p>";
    }
}


// ==================================================
// PESQUISA POR DESCRIÇÃO
// ==================================================

async function pesquisarPorDescricao() {

    const busca =
        document
            .getElementById("campoPesquisaDescricao")
            .value
            .trim();


    const areaResultado =
        document.getElementById(
            "resultadoPesquisaDescricao"
        );


    // ----------------------------------------------
    // Verifica se o campo está vazio.
    // ----------------------------------------------

    if (busca === "") {

        areaResultado.innerHTML =
            "<p>Digite uma descrição para pesquisar.</p>";

        return;
    }


    // ----------------------------------------------
    // Verifica se o cliente Supabase existe.
    // ----------------------------------------------

    if (!window.clienteSupabase) {

        areaResultado.innerHTML =
            "<p>🔴 Conexão com o Supabase não encontrada.</p>";

        return;
    }


    areaResultado.innerHTML =
        "<p>🔎 Pesquisando...</p>";


    try {

        // ------------------------------------------
        // Pesquisa SOMENTE na descrição.
        // ------------------------------------------

        const resposta =
            await window.clienteSupabase
                .from("materiais")
                .select(
                    "id,codigo,descricao,referencia,marca,local,quantidade"
                )
                .ilike(
                    "descricao",
                    "%" + busca + "%"
                )
                .order(
                    "descricao",
                    { ascending: true }
                );


        if (resposta.error) {

            throw resposta.error;
        }


        exibirResultadosPesquisa(
            resposta.data || [],
            areaResultado
        );

    } catch (erro) {

        console.error(
            "Erro na pesquisa por descrição:",
            erro
        );

        areaResultado.innerHTML =
            "<p>🔴 Erro ao pesquisar no Supabase.</p>" +
            "<p>" +
            (erro.message || "Erro desconhecido.") +
            "</p>";
    }
}


// ==================================================
// PESQUISA POR REFERÊNCIA
// ==================================================

async function pesquisarPorReferencia() {

    const busca =
        document
            .getElementById("campoPesquisaReferencia")
            .value
            .trim();


    const areaResultado =
        document.getElementById(
            "resultadoPesquisaReferencia"
        );


    // ----------------------------------------------
    // Verifica se o campo está vazio.
    // ----------------------------------------------

    if (busca === "") {

        areaResultado.innerHTML =
            "<p>Digite uma referência para pesquisar.</p>";

        return;
    }


    // ----------------------------------------------
    // Verifica se o cliente Supabase existe.
    // ----------------------------------------------

    if (!window.clienteSupabase) {

        areaResultado.innerHTML =
            "<p>🔴 Conexão com o Supabase não encontrada.</p>";

        return;
    }


    areaResultado.innerHTML =
        "<p>🔎 Pesquisando...</p>";


    try {

        // ------------------------------------------
        // Pesquisa SOMENTE na referência.
        //
        // A coluna referencia possui valores null
        // em alguns materiais.
        //
        // O Supabase simplesmente não retornará
        // esses registros quando procurarmos texto.
        // ------------------------------------------

        const resposta =
            await window.clienteSupabase
                .from("materiais")
                .select(
                    "id,codigo,descricao,referencia,marca,local,quantidade"
                )
                .ilike(
                    "referencia",
                    "%" + busca + "%"
                )
                .order(
                    "referencia",
                    { ascending: true }
                );


        if (resposta.error) {

            throw resposta.error;
        }


        exibirResultadosPesquisa(
            resposta.data || [],
            areaResultado
        );

    } catch (erro) {

        console.error(
            "Erro na pesquisa por referência:",
            erro
        );

        areaResultado.innerHTML =
            "<p>🔴 Erro ao pesquisar no Supabase.</p>" +
            "<p>" +
            (erro.message || "Erro desconhecido.") +
            "</p>";
    }
}


// ==================================================
// EXIBIR RESULTADOS DA PESQUISA
// ==================================================
//
// Essa função continua sendo responsável
// SOMENTE pela apresentação dos resultados.
//
// Agora ela recebe os registros vindos
// diretamente do Supabase.
//
// ==================================================

function exibirResultadosPesquisa(
    resultados,
    areaResultado
) {


    // ----------------------------------------------
    // Nenhum resultado encontrado.
    // ----------------------------------------------

    if (resultados.length === 0) {

        areaResultado.innerHTML =
            "<p>Nenhum material encontrado.</p>";

        return;
    }


    // ----------------------------------------------
    // Limpa resultados anteriores.
    // ----------------------------------------------

    areaResultado.innerHTML = "";


    // ----------------------------------------------
    // Percorre os materiais encontrados.
    // ----------------------------------------------

    resultados.forEach(material => {


        // ------------------------------------------
        // Monta o resultado do material.
        // ------------------------------------------

        areaResultado.innerHTML += `

            <hr>

            <h3>
                ${material.descricao || "Material"}
            </h3>

            <p>
                <strong>Código:</strong>
                ${material.codigo || "-"}
            </p>

            <p>
                <strong>Referência:</strong>
                ${material.referencia || "-"}
            </p>

            <p>
                <strong>Local:</strong>
                ${material.local || "-"}
            </p>

            <p>
                <strong>Marca:</strong>
                ${material.marca || "-"}
            </p>

            <p>
                <strong>Quantidade:</strong>
                ${material.quantidade ?? "-"}
            </p>

        `;
    });
}