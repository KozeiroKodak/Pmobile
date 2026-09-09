// ============================
// DADOS DAS CONFERÊNCIAS
// ============================
// Armazena todas as conferências
// realizadas durante o inventário.
//
// Os dados ficam salvos no navegador
// através do localStorage para que
// não sejam perdidos ao fechar ou
// recarregar o PMOBILE.

let conferencias = [];


// ============================
// CARREGAR CONFERÊNCIAS
// ============================
// Recupera as conferências salvas
// anteriormente no dispositivo.
//
// Caso não exista nenhum dado salvo,
// inicia o sistema com uma lista vazia.

function carregarConferencias() {
  
  const dadosSalvos =
    localStorage.getItem("pmobile_conferencias");
  
  if (dadosSalvos) {
    
    conferencias =
      JSON.parse(dadosSalvos);
    
  } else {
    
    conferencias = [];
  }
}


// ============================
// SALVAR CONFERÊNCIAS
// ============================
// Salva a lista atual de conferências
// no armazenamento local do dispositivo.
//
// Esta função será chamada sempre que
// uma nova conferência for registrada.

function salvarConferencias() {
  
  localStorage.setItem(
    "pmobile_conferencias",
    JSON.stringify(conferencias)
  );
}


// ============================
// CARREGAR DADOS AO INICIAR
// ============================
// Executa automaticamente quando
// o arquivo é carregado pelo PMOBILE.

carregarConferencias();