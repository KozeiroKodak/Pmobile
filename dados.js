// ============================
// DADOS DOS MATERIAIS
// ============================
// Este arquivo é responsável por:
// - Manter os materiais do PMOBILE em memória
// - Carregar o inventário salvo no IndexedDB
// - Salvar o inventário no IndexedDB
// - Permitir zerar o inventário
//
// O IndexedDB é utilizado porque o PMOBILE
// pode trabalhar com dezenas de milhares de
// materiais.
//
// IMPORTANTE:
// Os campos utilizados pelo PMOBILE continuam
// exatamente os mesmos:
//
// codigo
// descricao
// referencia
// marca
// local
// quantidade
// quantidadeReservada
// disponivel
// ultimaEntrada
//
// Os dados de teste continuam disponíveis
// somente quando nenhum inventário foi
// importado ou zerado.

// ============================
// DADOS DE TESTE
// ============================

const materiaisTeste = [
    {
        codigo: "001",
        descricao: "Material de teste A",
        quantidade: 100
    },
    {
        codigo: "002",
        descricao: "Material de teste B",
        quantidade: 50
    },
    {
        codigo: "003",
        descricao: "Material de teste C",
        quantidade: 25
    }
];

// ============================
// MATERIAIS EM MEMÓRIA
// ============================

let materiais = [...materiaisTeste];

// ============================
// CONTROLE DO INVENTÁRIO
// ============================
// Este marcador diferencia:
//
// - primeira utilização
// - inventário importado
// - inventário zerado propositalmente
//
// Assim, quando o IndexedDB estiver vazio,
// o PMOBILE não confundirá um inventário
// zerado com uma instalação nova.

const chaveInventarioZerado =
    "pmobile_inventario_zerado";

// ============================
// CONFIGURAÇÃO DO INDEXEDDB
// ============================

const nomeBanco = "PMOBILE";
const versaoBanco = 1;
const nomeTabela = "materiais";

// ============================
// ABRIR BANCO
// ============================
// Cria ou abre o banco de dados do PMOBILE.

function abrirBanco() {

    return new Promise((resolve, reject) => {

        const requisicao = indexedDB.open(
            nomeBanco,
            versaoBanco
        );

        // Executado quando o banco é criado
        // pela primeira vez ou quando sua
        // estrutura precisa ser atualizada.

        requisicao.onupgradeneeded = function(evento) {

            const banco = evento.target.result;

            if (!banco.objectStoreNames.contains(nomeTabela)) {

                banco.createObjectStore(
                    nomeTabela,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );
            }
        };

        // Banco aberto com sucesso.

        requisicao.onsuccess = function(evento) {

            resolve(evento.target.result);
        };

        // Erro ao abrir o banco.

        requisicao.onerror = function(evento) {

            reject(evento.target.error);
        };
    });
}

// ============================
// SALVAR MATERIAIS
// ============================
// Salva o inventário completo no IndexedDB.
//
// Diferentemente do localStorage,
// o IndexedDB consegue trabalhar com
// volumes muito maiores de dados.

async function salvarMateriais() {

    try {

        const banco = await abrirBanco();

        const transacao =
            banco.transaction(
                nomeTabela,
                "readwrite"
            );

        const tabela =
            transacao.objectStore(nomeTabela);

        // Remove o inventário anterior.

        tabela.clear();

        // Insere todos os materiais
        // atualmente carregados.

        materiais.forEach(material => {

            tabela.add({
                codigo: material.codigo,
                descricao: material.descricao,
                referencia: material.referencia || "",
                marca: material.marca || "",
                local: material.local || "",
                quantidade: material.quantidade ?? 0,
                quantidadeReservada:
                    material.quantidadeReservada ?? 0,
                disponivel:
                    material.disponivel ?? 0,
                ultimaEntrada:
                    material.ultimaEntrada || ""
            });
        });

        return new Promise((resolve, reject) => {

            transacao.oncomplete = function() {

                banco.close();

                resolve();
            };

            transacao.onerror = function(evento) {

                banco.close();

                reject(evento.target.error);
            };

            transacao.onabort = function(evento) {

                banco.close();

                reject(evento.target.error);
            };
        });

    } catch (erro) {

        console.error(
            "Erro ao salvar o inventário:",
            erro
        );

        throw erro;
    }
}

// ============================
// LIMPAR MATERIAIS
// ============================
// Remove completamente o inventário
// armazenado no IndexedDB.
//
// Esta função NÃO mexe nas conferências.
//
// A exclusão das conferências será feita
// somente quando o usuário escolher
// "SIM" na confirmação.

async function limparMateriais() {

    try {

        const banco = await abrirBanco();

        const transacao =
            banco.transaction(
                nomeTabela,
                "readwrite"
            );

        const tabela =
            transacao.objectStore(nomeTabela);

        tabela.clear();

        return new Promise((resolve, reject) => {

            transacao.oncomplete = function() {

                banco.close();

                resolve();
            };

            transacao.onerror = function(evento) {

                banco.close();

                reject(evento.target.error);
            };

            transacao.onabort = function(evento) {

                banco.close();

                reject(
                    evento.target.error ||
                    new Error("Transação abortada.")
                );
            };
        });

    } catch (erro) {

        console.error(
            "Erro ao limpar o inventário:",
            erro
        );

        throw erro;
    }
}

// ============================
// CARREGAR MATERIAIS
// ============================
// Recupera o inventário salvo no IndexedDB.
//
// Existem três situações:
//
// 1. Primeira utilização:
//    → carrega materiaisTeste
//
// 2. Inventário existente:
//    → carrega IndexedDB
//
// 3. Inventário zerado:
//    → mantém materiais vazio

async function carregarMateriais() {

    try {

        const banco = await abrirBanco();

        const transacao =
            banco.transaction(
                nomeTabela,
                "readonly"
            );

        const tabela =
            transacao.objectStore(nomeTabela);

        const requisicao =
            tabela.getAll();

        return new Promise((resolve, reject) => {

            requisicao.onsuccess =
                function(evento) {

                    const dados =
                        evento.target.result;

                    banco.close();

                    // ============================
                    // INVENTÁRIO EXISTENTE
                    // ============================

                    if (dados.length > 0) {

                        materiais = dados.map(
                            material => {

                                return {
                                    codigo:
                                        material.codigo,

                                    descricao:
                                        material.descricao,

                                    referencia:
                                        material.referencia || "",

                                    marca:
                                        material.marca || "",

                                    local:
                                        material.local || "",

                                    quantidade:
                                        material.quantidade ?? 0,

                                    quantidadeReservada:
                                        material.quantidadeReservada ?? 0,

                                    disponivel:
                                        material.disponivel ?? 0,

                                    ultimaEntrada:
                                        material.ultimaEntrada || ""
                                };
                            }
                        );

                    }

                    // ============================
                    // INVENTÁRIO ZERADO
                    // ============================

                    else if (
                        localStorage.getItem(
                            chaveInventarioZerado
                        ) === "true"
                    ) {

                        materiais = [];

                    }

                    // ============================
                    // PRIMEIRA UTILIZAÇÃO
                    // ============================

                    else {

                        materiais =
                            [...materiaisTeste];
                    }

                    resolve(materiais);
                };

            requisicao.onerror =
                function(evento) {

                    banco.close();

                    reject(evento.target.error);
                };
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar o inventário:",
            erro
        );

        // Se ocorreu erro ao acessar o banco,
        // mantemos o comportamento de segurança
        // original.

        if (
            localStorage.getItem(
                chaveInventarioZerado
            ) === "true"
        ) {

            materiais = [];

        } else {

            materiais = [...materiaisTeste];
        }

        return materiais;
    }
}

// ============================
// MARCAR INVENTÁRIO COMO ZERADO
// ============================
// Usado depois que o IndexedDB foi limpo.
//
// O marcador informa ao PMOBILE que o banco
// vazio é intencional.

function marcarInventarioZerado() {

    localStorage.setItem(
        chaveInventarioZerado,
        "true"
    );
}

// ============================
// REMOVER MARCA DE INVENTÁRIO ZERADO
// ============================
// Usado quando uma nova planilha for
// importada.
//
// Assim, depois da importação, o PMOBILE
// volta a considerar o inventário como
// existente.

function desmarcarInventarioZerado() {

    localStorage.removeItem(
        chaveInventarioZerado
    );
}

// ============================
// CARREGAR AO INICIAR
// ============================
// O carregamento é iniciado assim que
// o arquivo dados.js é executado.

carregarMateriais();