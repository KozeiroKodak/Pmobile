// ============================
// FUNÇÕES DE CONFERÊNCIA
// ============================
// Cuida da tela "Conferência".
//
// Permite:
// - Buscar materiais por código
// - Buscar materiais por descrição
// - Buscar materiais por referência
// - Selecionar um material
// - Informar a quantidade física
// - Comparar a quantidade física com o estoque esperado
// - Registrar o resultado da conferência
// - Salvar a conferência no dispositivo


// ============================
// BUSCAR MATERIAL PARA CONFERÊNCIA
// ============================
// Localiza os materiais através de:
// - Código
// - Descrição
// - Referência
//
// Local e Marca são apenas informações
// exibidas no resultado.
//
// Depois da busca, apresenta os materiais
// encontrados para que o usuário possa
// selecionar o produto desejado.

function buscarMaterialConferencia() {

    const busca = document
        .getElementById("campoConferencia")
        .value
        .toLowerCase();

    const areaResultado =
        document.getElementById("resultadoConferencia");


    // Verifica se o campo de pesquisa
    // está vazio.

    if (busca.trim() === "") {

        areaResultado.innerHTML =
            "<p>Digite um código, descrição ou referência.</p>";

        return;
    }


    // Procura os materiais cujo código,
    // descrição ou referência contenha
    // o texto pesquisado.

    const resultados = materiais.filter(material =>
        (material.codigo || "").toLowerCase().includes(busca) ||
        (material.descricao || "").toLowerCase().includes(busca) ||
        (material.referencia || "").toLowerCase().includes(busca)
    );


    // Caso nenhum material seja encontrado,
    // informa o usuário.

    if (resultados.length === 0) {

        areaResultado.innerHTML =
            "<p>Nenhum material encontrado.</p>";

        return;
    }


    // Limpa os resultados anteriores
    // antes de mostrar a nova pesquisa.

    areaResultado.innerHTML = "";


    // Percorre todos os materiais encontrados
    // e cria sua apresentação na tela.

    resultados.forEach(material => {

        areaResultado.innerHTML += `

            <hr>

            <h3>
                ${material.descricao}
            </h3>

            <p>
                <strong>Código:</strong>
                ${material.codigo}
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
                <strong>Estoque esperado:</strong>
                ${material.quantidade}
            </p>

            <button
                data-codigo="${material.codigo}"
                class="botao-selecionar"
            >
                Selecionar
            </button>
        `;
    });


    // Localiza todos os botões "Selecionar"
    // que foram criados nos resultados.

    document
        .querySelectorAll(".botao-selecionar")
        .forEach(botao => {


            // Adiciona uma ação ao clicar
            // em cada botão.

            botao.addEventListener("click", function () {

                const codigo =
                    this.getAttribute("data-codigo");


                // Envia o código do material
                // para a função responsável
                // por selecionar o produto.

                selecionarMaterialConferencia(codigo);
            });
        });
}


// ============================
// SELECIONAR MATERIAL
// ============================
// Localiza o material escolhido através
// do código.
//
// Depois apresenta as informações do produto
// e disponibiliza o campo para que o usuário
// informe a quantidade física encontrada.

function selecionarMaterialConferencia(codigo) {

    const material = materiais.find(
        material => material.codigo === codigo
    );


    // Caso o material não seja encontrado,
// encerra a função.

    if (!material) {
        return;
    }


    const areaResultado =
        document.getElementById(
            "resultadoConferencia"
        );


    // Mostra as informações do material
    // selecionado e o campo para informar
    // a quantidade física.

    areaResultado.innerHTML = `

        <h3>
            ${material.descricao}
        </h3>

        <p>
            <strong>Código:</strong>
            ${material.codigo}
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
            <strong>Estoque esperado:</strong>
            ${material.quantidade}
        </p>

        <hr>

        <input
            type="number"
            id="campoQuantidadeFisica"
            placeholder="Quantidade física"
        >

        <button id="botaoConfirmarContagem">
            CONFIRMAR
        </button>
    `;


    // Localiza o botão CONFIRMAR
    // que acabou de ser criado.

    const botaoConfirmar =
        document.getElementById(
            "botaoConfirmarContagem"
        );


    // Adiciona a ação do botão.
    //
    // Em vez de colocar a função diretamente
    // dentro do HTML, usamos addEventListener.
    //
    // Isso evita problemas com aspas e caracteres
    // especiais no código do produto.

    botaoConfirmar.addEventListener(
        "click",
        function () {

            registrarContagem(codigo);

        }
    );
}


// ============================
// REGISTRAR CONTAGEM
// ============================
// Recebe o código do material selecionado
// e a quantidade física informada.
//
// Depois:
// - Valida a quantidade informada
// - Calcula a diferença
// - Define o status
// - Registra a conferência
// - Salva os dados no dispositivo
// - Mostra o resultado para o usuário

function registrarContagem(codigo) {

    const material = materiais.find(
        material => material.codigo === codigo
    );


    // Verifica se o material existe.

    if (!material) {
        return;
    }


    // Obtém a quantidade física digitada
    // pelo usuário.

    const quantidadeFisica = parseInt(
        document
            .getElementById("campoQuantidadeFisica")
            .value
    );


    // Verifica se foi informada
    // uma quantidade válida.

    if (isNaN(quantidadeFisica)) {

        document.getElementById(
            "resultadoConferencia"
        ).innerHTML =
            "<p>Informe uma quantidade válida.</p>";

        return;
    }


    // Calcula a diferença entre a quantidade
    // física encontrada e o estoque esperado.
    //
    // Resultado:
    //  0 = quantidade correta
    // <0 = falta
    // >0 = sobra

    const diferenca =
        quantidadeFisica - material.quantidade;


    // Cria as variáveis utilizadas
    // para apresentar o status.

    let status = "";
    let emoji = "";


    // Se a diferença for zero,
    // o estoque físico está de acordo
    // com o estoque esperado.

    if (diferenca === 0) {

        status = "OK / CONFERIDO";
        emoji = "✅";


    // Caso exista diferença,
    // o item será considerado divergente.

    } else {

        status = "DIVERGÊNCIA";
        emoji = "❌";
    }


    // Adiciona a conferência à lista
    // mantida pelo PMOBILE.
    //
    // As informações continuam armazenadas
    // mesmo que algumas delas não sejam
    // exibidas na tela de divergências.

    conferencias.push({

        codigo:
            material.codigo,

        descricao:
            material.descricao,

        referencia:
            material.referencia || "",

        quantidadeEsperada:
            material.quantidade,

        quantidadeFisica:
            quantidadeFisica,

        diferenca:
            diferenca,

        status:
            status
    });


    // Salva a conferência no dispositivo.
    //
    // Essa função pertence ao arquivo
    // "conferencias.js".
    //
    // Dessa forma, a conferência não é perdida
    // quando o PMOBILE for recarregado.

    salvarConferencias();


    // Obtém a área onde o resultado
    // da conferência será apresentado.

    const areaResultado =
        document.getElementById(
            "resultadoConferencia"
        );


    // Exibe o resultado completo
    // da conferência realizada.

    areaResultado.innerHTML = `

        <h3>
            ${material.descricao}
        </h3>

        <p>
            <strong>Código:</strong>
            ${material.codigo}
        </p>

        <p>
            <strong>Referência:</strong>
            ${material.referencia || "-"}
        </p>

        <p>
            <strong>Estoque esperado:</strong>
            ${material.quantidade}
        </p>

        <p>
            <strong>Quantidade física:</strong>
            ${quantidadeFisica}
        </p>

        <p>
            <strong>Diferença:</strong>
            ${diferenca}
        </p>

        <hr>

        <p>
            <strong>
                ${emoji} ${status}
            </strong>
        </p>

        <p>
            📌 Contagem registrada.
        </p>

        <button id="botaoNovaConsulta">
            Nova consulta
        </button>
    `;


    // Localiza o botão "Nova consulta".

    const botaoNovaConsulta =
        document.getElementById(
            "botaoNovaConsulta"
        );


    // Adiciona a ação para iniciar
    // uma nova pesquisa.

    botaoNovaConsulta.addEventListener(
        "click",
        function () {

            buscarMaterialConferencia();

        }
    );


    // Limpa o campo de pesquisa
    // depois da conferência.

    document.getElementById(
        "campoConferencia"
    ).value = "";


    // Coloca novamente o cursor no campo
    // de pesquisa para facilitar a próxima
    // consulta.

    document.getElementById(
        "campoConferencia"
    ).focus();
}