// ============================================================
// PMOBILE
// ARQUIVO: supabase.js
// ============================================================
// Objetivo:
// Inicializar a conexão do PMOBILE com o Supabase.
//
// Neste momento este arquivo serve para:
// 1. Verificar se a biblioteca Supabase foi carregada.
// 2. Criar o cliente Supabase.
// 3. Testar uma leitura na tabela "materiais".
// 4. Informar os resultados diretamente na tela.
//
// IMPORTANTE:
// O IndexedDB do PMOBILE ainda NÃO foi alterado.
// As funções atuais do sistema continuam funcionando normalmente.
// ============================================================


// ============================================================
// 1. CONFIGURAÇÃO DO PROJETO
// ============================================================

// URL principal do projeto Supabase.
//
// Não colocar "/rest/v1/" no final.
const SUPABASE_URL =
    "https://rxyvllbebtgbfbqoimwe.supabase.co";


// ============================================================
// 2. CHAVE PÚBLICA
// ============================================================

// Publishable Key do projeto.
//
// IMPORTANTE:
// Utilizar somente a Publishable Key.
// NUNCA utilizar a Secret Key no aplicativo.
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Ckh6ls7eIh_11wviwxMlCQ_25Oes0QF";


// ============================================================
// 3. FUNÇÃO PARA MOSTRAR O STATUS NA TELA
// ============================================================
// Como estamos testando pelo celular, os resultados serão
// mostrados diretamente na interface do PMOBILE.
// ============================================================

function mostrarStatusSupabase(mensagem) {
    
    // Procura a área de status existente.
    let status =
        document.getElementById("statusSupabase");
    
    // Se ainda não existir, cria a área.
    if (!status) {
        
        status = document.createElement("div");
        
        status.id = "statusSupabase";
        
        status.style.position = "fixed";
        status.style.bottom = "10px";
        status.style.left = "10px";
        status.style.right = "10px";
        status.style.padding = "12px";
        status.style.background = "#eeeeee";
        status.style.border = "1px solid #999";
        status.style.borderRadius = "8px";
        status.style.textAlign = "center";
        status.style.fontWeight = "bold";
        status.style.zIndex = "9999";
        
        document.body.appendChild(status);
    }
    
    // Atualiza o texto mostrado na tela.
    status.textContent = mensagem;
}


// ============================================================
// 4. TESTAR LEITURA DA TABELA MATERIAIS
// ============================================================
// Esta função faz somente um SELECT.
//
// Ela NÃO:
// - adiciona materiais;
// - altera materiais;
// - exclui materiais;
// - altera o IndexedDB.
//
// O objetivo é descobrir se o PMOBILE consegue conversar
// com a tabela "materiais" do Supabase.
// ============================================================

async function testarLeituraSupabase() {
    
    // Informa que o teste começou.
    mostrarStatusSupabase(
        "🟡 Testando acesso à tabela materiais..."
    );
    
    try {
        
        // Executa uma consulta na tabela materiais.
        //
        // .select("*")
        //      → solicita os registros da tabela.
        //
        // .limit(1)
        //      → limita o teste a apenas um registro.
        //
        // Como a tabela está vazia neste momento,
        // esperamos receber zero registros.
        const resultado =
            await window.clienteSupabase
            .from("materiais")
            .select("*")
            .limit(1);
        
        
        // Verifica se o Supabase retornou algum erro.
        if (resultado.error) {
            
            console.error(
                "❌ Erro ao consultar materiais:",
                resultado.error
            );
            
            mostrarStatusSupabase(
                "🔴 Erro ao consultar tabela materiais"
            );
            
            return;
        }
        
        
        // Guarda os dados retornados.
        const materiaisEncontrados =
            resultado.data || [];
        
        
        // Mostra a quantidade encontrada.
        mostrarStatusSupabase(
            "🟢 Supabase respondeu! Materiais encontrados: " +
            materiaisEncontrados.length
        );
        
        
        console.log(
            "✅ Consulta ao Supabase realizada com sucesso.",
            materiaisEncontrados
        );
        
        
    } catch (erro) {
        
        // Captura erros inesperados, como problemas de rede
        // ou falhas na inicialização do cliente.
        
        console.error(
            "❌ Erro no teste do Supabase:",
            erro
        );
        
        mostrarStatusSupabase(
            "🔴 Falha na comunicação com o Supabase"
        );
    }
}


// ============================================================
// 5. VERIFICAR BIBLIOTECA DO SUPABASE
// ============================================================

if (!window.supabase) {
    
    console.error(
        "❌ Biblioteca do Supabase não foi carregada."
    );
    
    mostrarStatusSupabase(
        "❌ Biblioteca do Supabase não foi carregada"
    );
    
} else {
    
    console.log(
        "✅ Biblioteca do Supabase carregada."
    );
    
    mostrarStatusSupabase(
        "🟢 Biblioteca Supabase carregada"
    );
    
    
    // ========================================================
    // 6. CRIAR CLIENTE SUPABASE
    // ========================================================
    
    try {
        
        const clienteSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );
        
        
        // Disponibiliza o cliente para os demais arquivos.
        window.clienteSupabase =
            clienteSupabase;
        
        
        console.log(
            "✅ Cliente Supabase inicializado com sucesso."
        );
        
        mostrarStatusSupabase(
            "🟢 Supabase inicializado com sucesso"
        );
        
        
        // ====================================================
        // 7. EXECUTAR TESTE DE LEITURA
        // ====================================================
        // Pequeno atraso para permitir que a interface seja
        // atualizada antes da consulta.
        // ====================================================
        
        setTimeout(
            testarLeituraSupabase,
            500
        );
        
        
    } catch (erro) {
        
        console.error(
            "❌ Erro ao inicializar o Supabase:",
            erro
        );
        
        mostrarStatusSupabase(
            "🔴 Erro ao inicializar o Supabase"
        );
    }
}