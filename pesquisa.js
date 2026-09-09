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
// Função: pesquisarPorCodigo()
//
// Responsabilidade:
//
// Obtém o texto digitado no campo de Código
// e procura esse texto SOMENTE dentro do
// campo "codigo" dos materiais.
//
// Exemplo:
//
// Campo Código:
// 3692
//
// Poderá encontrar:
//
// 3692
// 3692P
// 3692-01
//
// Mesmo que "3692" apareça na descrição
// ou referência de outro material, ele NÃO
// será apresentado por essa pesquisa.
//
// ==================================================

function pesquisarPorCodigo() {

    const busca =
        document
            .getElementById("campoPesquisaCodigo")
            .value
            .trim()
            .toLowerCase();


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
    // Pesquisa SOMENTE no código.
    // ----------------------------------------------

    const resultados =
        materiais.filter(material =>

            String(
                material.codigo || ""
            )
            .toLowerCase()
            .includes(busca)

        );


    // ----------------------------------------------
    // Exibe os resultados encontrados.
    // ----------------------------------------------

    exibirResultadosPesquisa(
        resultados,
        areaResultado
    );
}


// ==================================================
// PESQUISA POR DESCRIÇÃO
// ==================================================
//
// Função: pesquisarPorDescricao()
//
// Responsabilidade:
//
// Obtém o texto digitado no campo de Descrição
// e procura esse texto SOMENTE dentro do
// campo "descricao" dos materiais.
//
// Exemplo:
//
// Campo Descrição:
// filtro
//
// Encontrará materiais cuja descrição contenha
// a palavra "filtro".
//
// O código, referência e marca não participam
// dessa pesquisa.
//
// ==================================================

function pesquisarPorDescricao() {

    const busca =
        document
            .getElementById("campoPesquisaDescricao")
            .value
            .trim()
            .toLowerCase();


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
    // Pesquisa SOMENTE na descrição.
    // ----------------------------------------------

    const resultados =
        materiais.filter(material =>

            String(
                material.descricao || ""
            )
            .toLowerCase()
            .includes(busca)

        );


    // ----------------------------------------------
    // Exibe os resultados encontrados.
    // ----------------------------------------------

    exibirResultadosPesquisa(
        resultados,
        areaResultado
    );
}


// ==================================================
// PESQUISA POR REFERÊNCIA
// ==================================================
//
// Função: pesquisarPorReferencia()
//
// Responsabilidade:
//
// Obtém o texto digitado no campo de Referência
// e procura esse texto SOMENTE dentro do
// campo "referencia" dos materiais.
//
// Exemplo:
//
// Campo Referência:
// ABC
//
// Encontrará referências como:
//
// ABC
// ABC-123
// 123-ABC
//
// A pesquisa não verifica código, descrição
// ou marca.
//
// ==================================================

function pesquisarPorReferencia() {

    const busca =
        document
            .getElementById("campoPesquisaReferencia")
            .value
            .trim()
            .toLowerCase();


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
    // Pesquisa SOMENTE na referência.
    // ----------------------------------------------

    const resultados =
        materiais.filter(material =>

            String(
                material.referencia || ""
            )
            .toLowerCase()
            .includes(busca)

        );


    // ----------------------------------------------
    // Exibe os resultados encontrados.
    // ----------------------------------------------

    exibirResultadosPesquisa(
        resultados,
        areaResultado
    );
}


// ==================================================
// EXIBIR RESULTADOS DA PESQUISA
// ==================================================
//
// Função: exibirResultadosPesquisa()
//
// Responsabilidade:
//
// Recebe:
// - A lista de materiais encontrados
// - A área HTML onde os resultados devem
//   ser apresentados
//
// Essa função é compartilhada pelas três
// pesquisas.
//
// Ela NÃO realiza a pesquisa.
//
// Quem decide onde pesquisar são:
//
// - pesquisarPorCodigo()
// - pesquisarPorDescricao()
// - pesquisarPorReferencia()
//
// Essa função apenas apresenta os materiais
// encontrados.
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