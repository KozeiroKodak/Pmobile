// ============================
// TELA DE CONFERÊNCIAS REALIZADAS
// ============================
// Esse arquivo cuida da exibição das contagens feitas.
// Ele mostra:
// 1. Resumo geral (total, OK e divergências)
// 2. Lista com cada material conferido

function exibirConferencias() {

    // Pega a área onde o conteúdo será exibido
    const areaResultado = document.getElementById("resultadoConferencias");

    // Se ainda não há contagens registradas, mostra aviso e para
    if (conferencias.length === 0) {
        areaResultado.innerHTML = "<p>Nenhuma contagem registrada ainda.</p>";
        return;
    }

    // Contadores
    let total = conferencias.length;
    let totalOk = 0;
    let totalDivergencias = 0;

    // Percorre as contagens para contar OK e divergências
    conferencias.forEach(contagem => {
        if (contagem.diferenca === 0) {
            totalOk++;
        } else {
            totalDivergencias++;
        }
    });

    // Exibe o resumo geral no topo da tela
    areaResultado.innerHTML = `
        <p><strong>Total conferido:</strong> ${total}</p>
        <p>✅ OK: ${totalOk}</p>
        <p>❌ Divergências: ${totalDivergencias}</p>
        <hr>
    `;

    // Exibe cada contagem registrada
    conferencias.forEach(contagem => {
        areaResultado.innerHTML += `
            <h3>${contagem.descricao}</h3>
            <p>Código: ${contagem.codigo}</p>
            <p>Estoque esperado: ${contagem.quantidadeEsperada}</p>
            <p>Quantidade física: ${contagem.quantidadeFisica}</p>
            <p>Diferença: ${contagem.diferenca}</p>
            <p>Status: ${contagem.status}</p>
            <hr>
        `;
    });
}