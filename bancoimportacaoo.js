// ====================================================
// BANCO TEMPORÁRIO DE IMPORTAÇÃO
// ====================================================

const nomeBancoImportacao = "PMOBILE_IMPORTACAO";
const versaoBancoImportacao = 1;
const nomeTabelaImportacao = "arquivos";

// ====================================================
// ABRIR BANCO
// ====================================================

function abrirBancoImportacao() {

    return new Promise((resolve, reject) => {

        const requisicao =
            indexedDB.open(
                nomeBancoImportacao,
                versaoBancoImportacao
            );

        requisicao.onupgradeneeded = function(evento) {

            const banco = evento.target.result;

            if (
                !banco.objectStoreNames.contains(
                    nomeTabelaImportacao
                )
            ) {

                banco.createObjectStore(
                    nomeTabelaImportacao,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

        };

        requisicao.onsuccess = function(evento) {

            resolve(evento.target.result);

        };

        requisicao.onerror = function(evento) {

            reject(evento.target.error);

        };

    });

}

// ====================================================
// SALVAR ARQUIVO TEMPORÁRIO
// ====================================================

async function salvarArquivoImportacao(arquivo) {

    try {

        const banco =
            await abrirBancoImportacao();

        const transacao =
            banco.transaction(
                nomeTabelaImportacao,
                "readwrite"
            );

        const tabela =
            transacao.objectStore(
                nomeTabelaImportacao
            );

        tabela.add({

            nomeArquivo: arquivo.name,

            tamanho: arquivo.size,

            dataHora: new Date().toISOString(),

            status: "PRÉ-CARREGADO",

            arquivo: arquivo

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

                reject(
                    evento.target.error ||
                    new Error(
                        "Transação abortada."
                    )
                );

            };

        });

    } catch (erro) {

        console.error(
            "Erro ao salvar arquivo temporário:",
            erro
        );

        throw erro;

    }

}