// ============================================================
// PMOBILE
// ARQUIVO: supabase.js
// ============================================================
// Objetivo:
// Inicializar a conexão do PMOBILE com o Supabase.
//
// Neste momento vamos apenas:
// 1. Inicializar o cliente Supabase.
// 2. Testar a leitura da tabela "materiais".
// 3. Mostrar o resultado diretamente na tela.
//
// IMPORTANTE:
// Ainda NÃO vamos alterar o IndexedDB.
// Ainda NÃO vamos salvar dados no Supabase.
// ============================================================


// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

// URL principal do projeto Supabase.
const SUPABASE_URL =
    "https://rxyvllbebtgbfbqoimwe.supabase.co";

// Chave pública (Publishable Key).
// Essa chave pode ser utilizada no aplicativo/frontend.
// A chave secreta NUNCA deve ser colocada aqui.
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Ckh6ls7eIh_11wviwxMlCQ_25Oes0QF";


// ============================================================
// FUNÇÃO: mostrarStatusSupabase
// ============================================================
// Objetivo:
// Criar ou atualizar uma mensagem visual na tela.
//
// Isso é útil porque estamos testando pelo celular,
// onde nem sempre temos acesso ao console do navegador.
// ============================================================

function mostrarStatusSupabase(mensagem) {
    
    let status =
        document.getElementById("statusSupabase");
    
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
    
    status.textContent = mensagem;
}


// ============================================================
// INICIALIZAÇÃO DO CLIENTE SUPABASE
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
    
    try {
        
        const clienteSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );
        
        // Disponibiliza o cliente para os demais arquivos
        // do PMOBILE.
        window.clienteSupabase =
            clienteSupabase;
        
        console.log(
            "✅ Cliente Supabase inicializado com sucesso."
        );
        
        mostrarStatusSupabase(
            "🟢 Supabase inicializado com sucesso"
        );
        
        // Pequeno atraso para garantir que a página
        // terminou de carregar antes do teste.
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


// ============================================================
// FUNÇÃO: testarLeituraSupabase
// ============================================================
// Objetivo:
// Fazer uma consulta simples na tabela "materiais".
//
// Neste primeiro teste vamos buscar apenas 1 registro.
//
// Se a tabela estiver vazia, isso NÃO significa que houve erro.
// Nesse caso o resultado esperado será:
//
// 🟢 Supabase respondeu! Materiais encontrados: 0
//
// Se houver algum material, veremos:
//
// 🟢 Supabase respondeu! Materiais encontrados: 1
//
// Se ocorrer algum problema de acesso, veremos a mensagem
// de erro correspondente.
// ============================================================

async function testarLeituraSupabase() {
    
    console.log(
        "🟡 Testando acesso à tabela materiais..."
    );
    
    mostrarStatusSupabase(
        "🟡 Testando acesso à tabela materiais..."
    );
    
    try {
        
        const resultado =
            await window.clienteSupabase
            .from("materiais")
            .select("*")
            .limit(1);
        
        
        // Verifica se o Supabase retornou algum erro.
        if (resultado.error) {
            
            console.error(
                "Erro retornado pelo Supabase:",
                resultado.error
            );
            
            mostrarStatusSupabase(
                "🔴 Erro ao consultar tabela materiais"
            );
            
            return;
        }
        
        
        // Quantidade de registros encontrados.
        const quantidade =
            resultado.data ?
            resultado.data.length :
            0;
        
        
        console.log(
            "🟢 Supabase respondeu!",
            resultado.data
        );
        
        
        mostrarStatusSupabase(
            "🟢 Supabase respondeu! Materiais encontrados: " +
            quantidade
        );
        
    } catch (erro) {
        
        console.error(
            "❌ Erro inesperado:",
            erro
        );
        
        mostrarStatusSupabase(
            "🔴 Erro inesperado ao consultar Supabase"
        );
    }
}