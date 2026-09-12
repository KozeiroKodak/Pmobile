// ============================================================
// PMOBILE
// ARQUIVO: script.js
// ============================================================
//
// OBJETIVO:
//
// Este arquivo controla principalmente a navegação entre
// as diferentes telas do PMOBILE.
//
// Também contém as funções responsáveis pelo modal de
// zeramento do inventário.
//
// IMPORTANTE:
//
// As funções relacionadas aos dados dos materiais continuam
// nos arquivos específicos, como dados.js e supabase.js.
//
// ============================================================


// ============================================================
// TELA INICIAL
// ============================================================
//
// FUNÇÃO:
//     abrirSistema()
//
// OBJETIVO:
//
// Sair da tela inicial do PMOBILE e abrir o menu principal.
//
// FUNCIONAMENTO:
//
// 1. Esconde a tela "inicio".
// 2. Mostra a tela "sistema".
//
// USADO PELO:
//
//     Botão "Entrar" / acesso ao sistema.
//
// ============================================================

function abrirSistema() {

    document.getElementById("inicio").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// PESQUISA
// ============================================================
//
// FUNÇÃO:
//     abrirPesquisa()
//
// OBJETIVO:
//
// Abrir a tela de pesquisa de materiais.
//
// FUNCIONAMENTO:
//
// 1. Esconde o menu principal.
// 2. Mostra a tela de pesquisa.
//
// A pesquisa é controlada pelo arquivo:
//     pesquisa.js
//
// ============================================================

function abrirPesquisa() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("pesquisa").style.display = "block";
}


// ============================================================
// VOLTAR DA PESQUISA
// ============================================================
//
// FUNÇÃO:
//     voltarMenu()
//
// OBJETIVO:
//
// Fechar a tela de pesquisa e retornar ao menu principal.
//
// FUNCIONAMENTO:
//
// 1. Esconde a tela de pesquisa.
// 2. Mostra novamente o menu principal.
//
// ============================================================

function voltarMenu() {

    document.getElementById("pesquisa").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// CONFERÊNCIA
// ============================================================
//
// FUNÇÃO:
//     abrirConferencia()
//
// OBJETIVO:
//
// Abrir a tela utilizada para realizar a conferência física
// dos materiais.
//
// FUNCIONAMENTO:
//
// 1. Esconde o menu principal.
// 2. Mostra a tela de conferência.
//
// A lógica da conferência fica no arquivo:
//     conferencia.js
//
// ============================================================

function abrirConferencia() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("conferencia").style.display = "block";
}


// ============================================================
// VOLTAR DA CONFERÊNCIA
// ============================================================
//
// FUNÇÃO:
//     voltarMenuConferencia()
//
// OBJETIVO:
//
// Fechar a tela de conferência e retornar ao menu principal.
//
// ============================================================

function voltarMenuConferencia() {

    document.getElementById("conferencia").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// CONFERÊNCIAS REALIZADAS
// ============================================================
//
// FUNÇÃO:
//     abrirConferencias()
//
// OBJETIVO:
//
// Abrir o histórico das conferências realizadas.
//
// FUNCIONAMENTO:
//
// 1. Esconde o menu principal.
// 2. Mostra a tela de conferências.
// 3. Executa exibirConferencias() para atualizar os dados.
//
// A função exibirConferencias() pertence ao sistema de
// histórico de conferências.
//
// ============================================================

function abrirConferencias() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("conferencias").style.display = "block";

    exibirConferencias();
}


// ============================================================
// VOLTAR DAS CONFERÊNCIAS
// ============================================================
//
// FUNÇÃO:
//     voltarMenuConferencias()
//
// OBJETIVO:
//
// Fechar o histórico de conferências e retornar ao menu.
//
// ============================================================

function voltarMenuConferencias() {

    document.getElementById("conferencias").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// DIVERGÊNCIAS
// ============================================================
//
// FUNÇÃO:
//     abrirDivergencias()
//
// OBJETIVO:
//
// Abrir a tela que apresenta as divergências encontradas
// durante as conferências.
//
// FUNCIONAMENTO:
//
// 1. Esconde o menu principal.
// 2. Mostra a tela de divergências.
// 3. Executa exibirDivergencias() para atualizar os dados.
//
// A lógica das divergências fica no arquivo:
//     divergencias.js
//
// ============================================================

function abrirDivergencias() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("divergencias").style.display = "block";

    exibirDivergencias();
}


// ============================================================
// VOLTAR DAS DIVERGÊNCIAS
// ============================================================
//
// FUNÇÃO:
//     voltarMenuDivergencias()
//
// OBJETIVO:
//
// Fechar a tela de divergências e retornar ao menu principal.
//
// ============================================================

function voltarMenuDivergencias() {

    document.getElementById("divergencias").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// IMPORTAÇÃO
// ============================================================
//
// FUNÇÃO:
//     abrirImportacao()
//
// OBJETIVO:
//
// Abrir a tela utilizada para importar a planilha de materiais.
//
// FUNCIONAMENTO:
//
// 1. Esconde o menu principal.
// 2. Mostra a tela de importação.
// 3. Verifica se a biblioteca XLSX já está carregada.
// 4. Caso não esteja, carrega "xlsx.full.min.js".
//
// A biblioteca SheetJS é utilizada para leitura dos arquivos
// Excel.
//
// ============================================================

function abrirImportacao() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("importacao").style.display = "block";


    // ========================================================
    // VERIFICAR SE XLSX JÁ ESTÁ CARREGADO
    // ========================================================
    //
    // Se window.XLSX existir, significa que a biblioteca
    // já está disponível.
    //
    // Nesse caso não precisamos carregá-la novamente.
    //
    // ========================================================

    if (window.XLSX) {
        return;
    }


    // ========================================================
    // CRIAR ELEMENTO SCRIPT
    // ========================================================
    //
    // Cria dinamicamente uma tag <script> para carregar
    // a biblioteca Excel.
    //
    // ========================================================

    const script = document.createElement("script");

    script.src = "xlsx.full.min.js";


    // ========================================================
    // BIBLIOTECA CARREGADA
    // ========================================================
    //
    // Executado quando o arquivo XLSX é carregado com sucesso.
    //
    // ========================================================

    script.onload = function() {

        console.log(
            "SheetJS carregado com sucesso."
        );
    };


    // ========================================================
    // ERRO AO CARREGAR BIBLIOTECA
    // ========================================================
    //
    // Caso o arquivo XLSX não possa ser carregado, informa
    // o problema na tela de importação.
    //
    // ========================================================

    script.onerror = function() {

        document.getElementById(
            "resultadoImportacao"
        ).innerHTML =
            "<p>❌ Não foi possível carregar a biblioteca Excel.</p>";
    };


    // ========================================================
    // ADICIONAR SCRIPT À PÁGINA
    // ========================================================

    document.body.appendChild(script);
}


// ============================================================
// VOLTAR DA IMPORTAÇÃO
// ============================================================
//
// FUNÇÃO:
//     voltarMenuImportacao()
//
// OBJETIVO:
//
// Fechar a tela de importação e retornar ao menu principal.
//
// ============================================================

function voltarMenuImportacao() {

    document.getElementById("importacao").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// CONFIGURAÇÕES
// ============================================================
//
// FUNÇÃO:
//     abrirConfiguracoes()
//
// OBJETIVO:
//
// Abrir a área de configurações do PMOBILE.
//
// ESTRUTURA ATUAL:
//
// Configurações
// └── Limpar banco de dados
//       └── Materiais importados
//
// IMPORTANTE:
//
// Esta função NÃO altera nenhum dado.
//
// Ela somente controla a navegação entre:
//     Menu principal
//          ↓
//     Configurações
//
// ============================================================

function abrirConfiguracoes() {

    document.getElementById("sistema").style.display = "none";

    document.getElementById("configuracoes").style.display = "block";
}


// ============================================================
// VOLTAR DAS CONFIGURAÇÕES
// ============================================================
//
// FUNÇÃO:
//     voltarMenuConfiguracoes()
//
// OBJETIVO:
//
// Fechar a tela de configurações e retornar ao menu principal.
//
// FUNCIONAMENTO:
//
// 1. Esconde a tela de configurações.
// 2. Mostra novamente o menu principal.
//
// IMPORTANTE:
//
// Esta função também NÃO altera nenhum dado.
//
// ============================================================

function voltarMenuConfiguracoes() {

    document.getElementById("configuracoes").style.display = "none";

    document.getElementById("sistema").style.display = "block";
}


// ============================================================
// MODAL DE ZERAMENTO DO INVENTÁRIO
// ============================================================
//
// O bloco abaixo controla o modal antigo de zeramento
// existente na tela de importação.
//
// Ele é independente da nova área:
//
//     Configurações
//          ↓
//     Materiais importados
//
// Portanto, NÃO estamos removendo nem alterando essa lógica.
//
// ============================================================


// ============================================================
// ABRIR MODAL
// ============================================================
//
// FUNÇÃO:
//     abrirModalZerarInventario()
//
// OBJETIVO:
//
// Exibir a janela de confirmação para zerar o inventário.
//
// IMPORTANTE:
//
// Neste momento nenhum dado é apagado.
//
// Apenas o modal é exibido.
//
// ============================================================

function abrirModalZerarInventario() {

    document.getElementById(
        "modalZerarInventario"
    ).style.display = "block";
}


// ============================================================
// FECHAR MODAL
// ============================================================
//
// FUNÇÃO:
//     fecharModalZerarInventario()
//
// OBJETIVO:
//
// Fechar o modal sem executar nenhuma alteração.
//
// Equivale ao botão:
//
//     CANCELAR
//
// ============================================================

function fecharModalZerarInventario() {

    document.getElementById(
        "modalZerarInventario"
    ).style.display = "none";
}


// ============================================================
// CONFIRMAR ZERAMENTO
// ============================================================
//
// FUNÇÃO:
//     confirmarZeramento(apagarConferencias)
//
// OBJETIVO:
//
// Executar o zeramento do inventário após a confirmação
// do usuário.
//
// PARÂMETRO:
//
// apagarConferencias
//
//     true
//         Apaga o inventário e as conferências.
//
//     false
//         Apaga somente o inventário.
//
// FUNCIONAMENTO:
//
// 1. Fecha o modal.
// 2. Limpa os materiais.
// 3. Limpa a variável "materiais" em memória.
// 4. Marca o inventário como zerado.
// 5. Opcionalmente remove as conferências.
// 6. Mostra o resultado na tela.
//
// ============================================================

async function confirmarZeramento(
    apagarConferencias
) {

    try {

        // ====================================================
        // FECHAR MODAL
        // ====================================================

        fecharModalZerarInventario();


        // ====================================================
        // LIMPAR INVENTÁRIO
        // ====================================================
        //
        // Executa a função limparMateriais().
        //
        // Essa função é responsável pela limpeza dos dados
        // do inventário no armazenamento utilizado pelo
        // sistema.
        //
        // ====================================================

        await limparMateriais();


        // ====================================================
        // LIMPAR MATERIAIS DA MEMÓRIA
        // ====================================================
        //
        // Também limpa a variável que contém os materiais
        // carregados atualmente.
        //
        // ====================================================

        materiais = [];


        // ====================================================
        // MARCAR INVENTÁRIO COMO ZERADO
        // ====================================================
        //
        // Registra que o inventário foi zerado
        // propositalmente.
        //
        // Isso evita que o sistema interprete a ausência
        // de materiais como um erro inesperado.
        //
        // ====================================================

        marcarInventarioZerado();


        // ====================================================
        // LIMPAR CONFERÊNCIAS — OPCIONAL
        // ====================================================
        //
        // Somente executa quando:
        //
        //     apagarConferencias === true
        //
        // ====================================================

        if (apagarConferencias === true) {

            conferencias = [];

            localStorage.removeItem(
                "pmobile_conferencias"
            );
        }


        // ====================================================
        // RESULTADO DA OPERAÇÃO
        // ====================================================

        const resultado =
            document.getElementById(
                "resultadoImportacao"
            );


        // ====================================================
        // MENSAGEM — INVENTÁRIO + CONFERÊNCIAS
        // ====================================================

        if (apagarConferencias === true) {

            resultado.innerHTML =
                "<p>✅ Inventário e conferências foram apagados com sucesso.</p>";


        // ====================================================
        // MENSAGEM — SOMENTE INVENTÁRIO
        // ====================================================

        } else {

            resultado.innerHTML =
                "<p>✅ Inventário apagado com sucesso. As conferências foram mantidas.</p>";
        }


    } catch (erro) {

        // ====================================================
        // TRATAMENTO DE ERRO
        // ====================================================
        //
        // Caso alguma etapa do zeramento apresente erro,
        // o erro é registrado no console e uma mensagem
        // é mostrada na tela.
        //
        // ====================================================

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