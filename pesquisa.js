// =========================================
// PMOBILE - PESQUISA
// =========================================
// Pesquisa diretamente no Supabase.
// Campos de pesquisa:
// 1. Código
// 2. Descrição
// 3. Referência
//
// Marca, Local e Quantidade NÃO são campos
// de pesquisa. São apenas exibidos no resultado.
// =========================================


// =========================================
// VERIFICAÇÃO DO SUPABASE
// =========================================

function obterClienteSupabase() {

    if (!window.clienteSupabase) {
        throw new Error("Cliente Supabase não foi inicializado.");
    }

    return window.clienteSupabase;
}


// =========================================
// PROTEÇÃO PARA CONSULTA ILIKE
// =========================================
// Escapa caracteres especiais usados pelo ILIKE:
// % = qualquer sequência
// _ = qualquer caractere
// \ = caractere de escape
//
// Assim, uma pesquisa como "50%" procura
// literalmente "50%" em vez de usar % como curinga.
// =========================================

function escaparBuscaILike(valor) {

    return String(valor)
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(//g, "\\");
}


// =========================================
// LIMPAR ÁREA DE RESULTADO
// =========================================

function limparResultado(areaResultado) {

    if (!areaResultado) {
        return;
    }

    areaResultado.innerHTML = "";
}


// =========================================
// PESQUISA POR CÓDIGO
// =========================================

async function pesquisarPorCodigo() {

    const campo = document.getElementById("campoPesquisaCodigo");
    const areaResultado = document.getElementById("resultadoPesquisaCodigo");

    if (!campo || !areaResultado) {
        console.error("Elementos da pesquisa por código não encontrados.");
        return;
    }

    const buscaOriginal = campo.value.trim();

    if (!buscaOriginal) {
        areaResultado.innerHTML = "<p>Digite um código para pesquisar.</p>";
        return;
    }

    const busca = escaparBuscaILike(buscaOriginal);

    limparResultado(areaResultado);

    areaResultado.innerHTML = "<p>Pesquisando...</p>";

    try {

        const clienteSupabase = obterClienteSupabase();

        const { data, error } = await clienteSupabase
            .from("materiais")
            .select(
                "id,codigo,descricao,referencia,marca,local,quantidade"
            )
            .ilike("codigo", "%" + busca + "%", { escape: "\\" })
            .order("codigo", { ascending: true });

        if (error) {
            throw error;
        }

        exibirResultadosPesquisa(
            data || [],
            areaResultado
        );

    } catch (erro) {

        console.error("Erro na pesquisa por código:", erro);

        areaResultado.innerHTML =
            "<p>Erro ao consultar o Supabase.</p>";

    }
}


// =========================================
// PESQUISA POR DESCRIÇÃO
// =========================================

async function pesquisarPorDescricao() {

    const campo = document.getElementById("campoPesquisaDescricao");
    const areaResultado = document.getElementById("resultadoPesquisaDescricao");

    if (!campo || !areaResultado) {
        console.error("Elementos da pesquisa por descrição não encontrados.");
        return;
    }

    const buscaOriginal = campo.value.trim();

    if (!buscaOriginal) {
        areaResultado.innerHTML = "<p>Digite uma descrição para pesquisar.</p>";
        return;
    }

    const busca = escaparBuscaILike(buscaOriginal);

    limparResultado(areaResultado);

    areaResultado.innerHTML = "<p>Pesquisando...</p>";

    try {

        const clienteSupabase = obterClienteSupabase();

        const { data, error } = await clienteSupabase
            .from("materiais")
            .select(
                "id,codigo,descricao,referencia,marca,local,quantidade"
            )
            .ilike("descricao", "%" + busca + "%", { escape: "\\" })
            .order("descricao", { ascending: true });

        if (error) {
            throw error;
        }

        exibirResultadosPesquisa(
            data || [],
            areaResultado
        );

    } catch (erro) {

        console.error("Erro na pesquisa por descrição:", erro);

        areaResultado.innerHTML =
            "<p>Erro ao consultar o Supabase.</p>";

    }
}


// =========================================
// PESQUISA POR REFERÊNCIA
// =========================================

async function pesquisarPorReferencia() {

    const campo = document.getElementById("campoPesquisaReferencia");
    const areaResultado = document.getElementById("resultadoPesquisaReferencia");

    if (!campo || !areaResultado) {
        console.error("Elementos da pesquisa por referência não encontrados.");
        return;
    }

    const buscaOriginal = campo.value.trim();

    if (!buscaOriginal) {
        areaResultado.innerHTML = "<p>Digite uma referência para pesquisar.</p>";
        return;
    }

    const busca = escaparBuscaILike(buscaOriginal);

    limparResultado(areaResultado);

    areaResultado.innerHTML = "<p>Pesquisando...</p>";

    try {

        const clienteSupabase = obterClienteSupabase();

        const { data, error } = await clienteSupabase
            .from("materiais")
            .select(
                "id,codigo,descricao,referencia,marca,local,quantidade"
            )
            .ilike("referencia", "%" + busca + "%", { escape: "\\" })
            .order("referencia", { ascending: true });

        if (error) {
            throw error;
        }

        exibirResultadosPesquisa(
            data || [],
            areaResultado
        );

    } catch (erro) {

        console.error("Erro na pesquisa por referência:", erro);

        areaResultado.innerHTML =
            "<p>Erro ao consultar o Supabase.</p>";

    }
}


// =========================================
// EXIBIR RESULTADOS
// =========================================

function exibirResultadosPesquisa(resultados, areaResultado) {

    if (!areaResultado) {
        return;
    }

    limparResultado(areaResultado);

    if (!Array.isArray(resultados) || resultados.length === 0) {

        areaResultado.innerHTML =
            "<p>Nenhum material encontrado.</p>";

        return;
    }

    const fragmento = document.createDocumentFragment();

    resultados.forEach(function (material) {

        const bloco = document.createElement("div");

        const linha = document.createElement("hr");

        const titulo = document.createElement("h3");
        titulo.textContent =
            material.descricao || "Material";

        const codigo = document.createElement("p");
        codigo.innerHTML = "<strong>Código:</strong> ";
        codigo.appendChild(
            document.createTextNode(
                material.codigo ?? "-"
            )
        );

        const referencia = document.createElement("p");
        referencia.innerHTML = "<strong>Referência:</strong> ";
        referencia.appendChild(
            document.createTextNode(
                material.referencia ?? "-"
            )
        );

        const local = document.createElement("p");
        local.innerHTML = "<strong>Local:</strong> ";
        local.appendChild(
            document.createTextNode(
                material.local ?? "-"
            )
        );

        const marca = document.createElement("p");
        marca.innerHTML = "<strong>Marca:</strong> ";
        marca.appendChild(
            document.createTextNode(
                material.marca ?? "-"
            )
        );

        const quantidade = document.createElement("p");
        quantidade.innerHTML = "<strong>Quantidade:</strong> ";
        quantidade.appendChild(
            document.createTextNode(
                material.quantidade ?? "-"
            )
        );

        bloco.appendChild(linha);
        bloco.appendChild(titulo);
        bloco.appendChild(codigo);
        bloco.appendChild(referencia);
        bloco.appendChild(local);
        bloco.appendChild(marca);
        bloco.appendChild(quantidade);

        fragmento.appendChild(bloco);
    });

    areaResultado.appendChild(fragmento);
}


// =========================================
// FIM - PESQUISA
// =========================================
