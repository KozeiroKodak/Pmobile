// ============================
// FUNÇÕES DE DIVERGÊNCIAS
// ============================
// Cuida da tela "Divergências".
//
// A tela mostra somente os materiais que,
// durante a conferência, apresentaram
// diferença entre o estoque esperado
// e a quantidade física encontrada.
//
// Classificação:
// - FALTANTE = quantidade física menor que a esperada
// - SOBRA = quantidade física maior que a esperada
//
// Além dos materiais, o resumo informa:
// - Quantos produtos estão faltantes
// - Quantas unidades estão faltando
// - Quantos produtos possuem sobra
// - Quantas unidades estão sobrando
//
// Os valores de estoque esperado,
// quantidade física e diferença continuam
// armazenados nos dados da conferência.
// Eles apenas não são exibidos individualmente
// nesta tela.


// ============================
// EXIBIR DIVERGÊNCIAS
// ============================
// Busca as conferências realizadas,
// identifica quais apresentaram diferença
// e exibe somente esses materiais.
//
// Para cada item divergente são mostrados:
// - Descrição
// - Código
// - Classificação (FALTANTE ou SOBRA)
//
// No resumo também são apresentadas:
// - Quantidade de produtos faltantes
// - Quantidade total de unidades faltantes
// - Quantidade de produtos com sobra
// - Quantidade total de unidades sobrando

function exibirDivergencias() {
    
    const areaResultado =
        document.getElementById("resultadoDivergencias");
    
    
    // Verifica se existe alguma conferência registrada.
    
    if (conferencias.length === 0) {
        
        areaResultado.innerHTML =
            "<p>Nenhuma contagem foi registrada ainda.</p>";
        
        return;
    }
    
    
    // Seleciona somente as conferências
    // que possuem diferença.
    
    const divergencias = conferencias.filter(contagem =>
        contagem.diferenca !== 0
    );
    
    
    // Se nenhuma conferência apresentou diferença,
    // informa que não existem divergências.
    
    if (divergencias.length === 0) {
        
        areaResultado.innerHTML =
            "<p>✅ Nenhuma divergência encontrada.</p>";
        
        return;
    }
    
    
    // Contadores de produtos.
    //
    // Cada produto divergente conta uma vez,
    // independentemente da quantidade da diferença.
    
    let produtosFaltantes = 0;
    let produtosSobras = 0;
    
    
    // Contadores de unidades.
    //
    // Aqui somamos a quantidade efetivamente
    // faltante ou sobrando.
    
    let unidadesFaltantes = 0;
    let unidadesSobras = 0;
    
    
    // Percorre todas as divergências
    // para identificar faltantes e sobras
    // e calcular suas respectivas quantidades.
    
    divergencias.forEach(contagem => {
        
        
        // FALTANTE
        //
        // Quando a quantidade física é menor
        // que a quantidade esperada.
        
        if (
            contagem.quantidadeFisica <
            contagem.quantidadeEsperada
        ) {
            
            produtosFaltantes++;
            
            unidadesFaltantes +=
                contagem.quantidadeEsperada -
                contagem.quantidadeFisica;
        }
        
        
        // SOBRA
        //
        // Quando a quantidade física é maior
        // que a quantidade esperada.
        
        if (
            contagem.quantidadeFisica >
            contagem.quantidadeEsperada
        ) {
            
            produtosSobras++;
            
            unidadesSobras +=
                contagem.quantidadeFisica -
                contagem.quantidadeEsperada;
        }
    });
    
    
    // Exibe o resumo das divergências
    // no início da tela.
    //
    // Exemplo:
    // Faltantes: 3 produtos / 30 unidades
    // Sobras: 2 produtos / 12 unidades
    
    areaResultado.innerHTML = `

        <p>
            🔴 <strong>Faltantes:</strong>
            ${produtosFaltantes} produtos /
            ${unidadesFaltantes} unidades
        </p>

        <p>
            🟢 <strong>Sobras:</strong>
            ${produtosSobras} produtos /
            ${unidadesSobras} unidades
        </p>

        <hr>
    `;
    
    
    // Exibe cada material que apresentou divergência.
    
    divergencias.forEach(contagem => {
        
        let classificacao = "";
        
        
        // Se a quantidade física for menor
        // que a quantidade esperada,
        // o material é classificado como FALTANTE.
        
        if (
            contagem.quantidadeFisica <
            contagem.quantidadeEsperada
        ) {
            
            classificacao = "🔴 FALTANTE";
            
            
            // Se a quantidade física for maior
            // que a quantidade esperada,
            // o material é classificado como SOBRA.
            
        } else if (
            contagem.quantidadeFisica >
            contagem.quantidadeEsperada
        ) {
            
            classificacao = "🟢 SOBRA";
        }
        
        
        // Adiciona o material na tela.
        //
        // As quantidades individuais não são exibidas
        // aqui de propósito. Elas continuam armazenadas
        // nos registros da conferência.
        
        areaResultado.innerHTML += `

            <h3>
                ${contagem.descricao}
            </h3>

            <p>
                <strong>Código:</strong>
                ${contagem.codigo}
            </p>

            <p>
                <strong>Classificação:</strong>
                ${classificacao}
            </p>

            <hr>
        `;
    });
}