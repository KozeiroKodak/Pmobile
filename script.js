// ============================
// NAVEGAÇÃO DO PMOBILE
// ============================
// Este arquivo é responsável por:
// - Controlar a troca entre as telas
// - Abrir e fechar o modal de zeramento
// - Confirmar a ação de zerar inventário
//
// As funções relacionadas aos dados
// continuam no dados.js.

// ============================
// TELA INICIAL
// ============================
// Esconde a tela inicial e abre
// o menu principal.

function abrirSistema() {

    document.getElementById("inicio").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================
// ABRIR PESQUISA
// ============================
// Esconde o menu principal e abre
// a tela de pesquisa.

function abrirPesquisa() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("pesquisa").style.display = "block";
}

// ============================
// VOLTAR DA PESQUISA
// ============================
// Fecha a tela de pesquisa e retorna
// ao menu principal.

function voltarMenu() {

    document.getElementById("pesquisa").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================
// ABRIR CONFERÊNCIA
// ============================
// Esconde o menu principal e abre
// a tela de conferência.

function abrirConferencia() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("conferencia").style.display = "block";
}

// ============================
// VOLTAR DA CONFERÊNCIA
// ============================
// Fecha a tela de conferência e
// retorna ao menu principal.

function voltarMenuConferencia() {

    document.getElementById("conferencia").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================
// ABRIR CONFERÊNCIAS REALIZADAS
// ============================
// Abre o histórico de conferências
// e atualiza os dados exibidos.

function abrirConferencias() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("conferencias").style.display = "block";

    exibirConferencias();
}

// ============================
// VOLTAR DAS CONFERÊNCIAS
// ============================
// Fecha o histórico e retorna
// ao menu principal.

function voltarMenuConferencias() {

    document.getElementById("conferencias").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================
// ABRIR DIVERGÊNCIAS
// ============================
// Abre a tela de divergências
// e atualiza os dados exibidos.

function abrirDivergencias() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("divergencias").style.display = "block";

    exibirDivergencias();
}

// ============================
// VOLTAR DAS DIVERGÊNCIAS
// ============================
// Fecha a tela de divergências e
// retorna ao menu principal.

function voltarMenuDivergencias() {

    document.getElementById("divergencias").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================
// ABRIR IMPORTAÇÃO
// ============================
// Abre a tela de importação.
//
// A biblioteca SheetJS é carregada
// somente quando a tela de importação
// é aberta.

function abrirImportacao() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("importacao").style.display = "block";

    // Se a biblioteca XLSX já estiver
    // carregada, não faz nada.

    if (window.XLSX) {
        return;
    }

    // Cria dinamicamente o elemento
    // <script> para carregar a biblioteca.

    const script = document.createElement("script");

    script.src = "xlsx.full.min.js";

    // Executado quando a biblioteca
    // é carregada com sucesso.

    script.onload = function() {

        console.log(
            "SheetJS carregado com sucesso."
        );
    };

    // Executado caso a biblioteca
    // não consiga ser carregada.

    script.onerror = function() {

        document.getElementById(
            "resultadoImportacao"
        ).innerHTML =
            "<p>❌ Não foi possível carregar a biblioteca Excel.</p>";
    };

    document.body.appendChild(script);
}

// ============================
// VOLTAR DA IMPORTAÇÃO
// ============================
// Fecha a tela de importação e
// retorna ao menu principal.

function voltarMenuImportacao() {

    document.getElementById("importacao").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}

// ============================================================
// MODAL DE ZERAMENTO DO INVENTÁRIO
// ============================================================

// ============================
// ABRIR MODAL
// ============================
// Exibe a janela de confirmação
// para zerar o inventário.
//
// O inventário ainda NÃO é apagado
// nesta etapa.

function abrirModalZerarInventario() {

    document.getElementById(
        "modalZerarInventario"
    ).style.display = "block";
}

// ============================
// FECHAR MODAL
// ============================
// Fecha a janela sem realizar
// nenhuma alteração.
//
// Equivale à opção:
//
// CANCELAR

function fecharModalZerarInventario() {

    document.getElementById(
        "modalZerarInventario"
    ).style.display = "none";
}

// ============================
// CONFIRMAR ZERAMENTO
// ============================
// Recebe:
// true  → apagar inventário + conferências
// false → apagar somente o inventário
//
// Esta função é chamada pelos botões
// SIM e NÃO do modal.
//
// O botão CANCELAR não chama esta
// função.

async function confirmarZeramento(
    apagarConferencias
) {

    try {

        // Fecha o modal imediatamente
        // para impedir novos cliques.

        fecharModalZerarInventario();

        // ============================
        // LIMPAR INVENTÁRIO
        // ============================

        await limparMateriais();

        // Limpa também a variável
        // que mantém os materiais
        // em memória.

        materiais = [];

        // Marca que o inventário foi
        // zerado propositalmente.

        marcarInventarioZerado();

        // ============================
        // LIMPAR CONFERÊNCIAS
        // ============================

        if (apagarConferencias === true) {

            conferencias = [];

            localStorage.removeItem(
                "pmobile_conferencias"
            );
        }

        // ============================
        // MENSAGEM DE RESULTADO
        // ============================

        const resultado =
            document.getElementById(
                "resultadoImportacao"
            );

        if (apagarConferencias === true) {

            resultado.innerHTML =
                "<p>✅ Inventário e conferências foram apagados com sucesso.</p>";

        } else {

            resultado.innerHTML =
                "<p>✅ Inventário apagado com sucesso. As conferências foram mantidas.</p>";
        }

    } catch (erro) {

        console.error(
            "Erro ao zerar o inventário:",
            erro
        );

        document.getElementById(
            "resultadoImportacao"
        ).innerHTML =
            "<p>❌ Não foi possível zerar o inventário.</p>";
    }
}