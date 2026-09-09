// ============================================================
// PMOBILE
// ARQUIVO: supabase.js
// ============================================================
//
// OBJETIVO:
//
// Inicializar e verificar a conexão do PMOBILE
// com o Supabase.
//
// RESPONSABILIDADES DESTE ARQUIVO:
//
// 1. Configurar a URL do projeto Supabase.
// 2. Configurar a Publishable Key.
// 3. Inicializar o cliente Supabase.
// 4. Disponibilizar o cliente para os demais arquivos.
// 5. Testar a leitura da tabela "materiais".
// 6. Verificar TODOS os materiais existentes.
// 7. Verificar possíveis problemas nos registros.
//
// IMPORTANTE:
//
// O Supabase agora é o banco central do PMOBILE.
//
// A importação dos materiais é realizada pelo
// arquivo "importacao.js".
//
// Este arquivo NÃO realiza a importação.
//
// Este arquivo também NÃO altera o IndexedDB.
//
// ============================================================



// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================
//
// URL principal do projeto Supabase.
//
// ============================================================

const SUPABASE_URL =
    "https://rxyvllbebtgbfbqoimwe.supabase.co";


// ============================================================
// CHAVE PÚBLICA DO SUPABASE
// ============================================================
//
// Essa é a Publishable Key.
//
// Ela pode ser utilizada no frontend.
//
// IMPORTANTE:
//
// Chaves secretas/service_role NUNCA devem ser
// colocadas neste arquivo.
//
// ============================================================

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Ckh6ls7eIh_11wviwxMlCQ_25Oes0QF";



// ============================================================
// FUNÇÃO: mostrarStatusSupabase()
// ============================================================
//
// OBJETIVO:
//
// Criar ou atualizar uma mensagem visual na tela.
//
// Isso é especialmente útil durante os testes pelo
// celular, onde nem sempre temos acesso ao console
// do navegador.
//
// PARÂMETRO:
//
// mensagem
//     Texto que será mostrado ao usuário.
//
// EXEMPLOS:
//
// 🟢 Supabase inicializado com sucesso
//
// 🟡 Verificando materiais...
//
// 🟢 Supabase OK! 92.735 materiais verificados
//
// ============================================================

function mostrarStatusSupabase(mensagem) {

    // ========================================================
    // PROCURAR ÁREA DE STATUS EXISTENTE
    // ========================================================

    let status =
        document.getElementById(
            "statusSupabase"
        );


    // ========================================================
    // SE NÃO EXISTIR, CRIAR
    // ========================================================

    if (!status) {

        status =
            document.createElement(
                "div"
            );


        status.id =
            "statusSupabase";


        // ====================================================
        // POSIÇÃO
        // ====================================================

        status.style.position =
            "fixed";

        status.style.bottom =
            "10px";

        status.style.left =
            "10px";

        status.style.right =
            "10px";


        // ====================================================
        // APARÊNCIA
        // ====================================================

        status.style.padding =
            "12px";

        status.style.background =
            "#eeeeee";

        status.style.border =
            "1px solid #999";

        status.style.borderRadius =
            "8px";

        status.style.textAlign =
            "center";

        status.style.fontWeight =
            "bold";

        status.style.zIndex =
            "9999";


        // ====================================================
        // ADICIONAR À PÁGINA
        // ====================================================

        document.body.appendChild(
            status
        );

    }


    // ========================================================
    // ATUALIZAR TEXTO
    // ========================================================

    status.textContent =
        mensagem;

}



// ============================================================
// INICIALIZAÇÃO DO CLIENTE SUPABASE
// ============================================================
//
// OBJETIVO:
//
// Criar o cliente Supabase que será utilizado pelos
// demais arquivos do PMOBILE.
//
// Depois da inicialização:
//
// window.clienteSupabase
//
// ficará disponível globalmente.
//
// Dessa forma outros arquivos podem fazer:
//
// window.clienteSupabase
//     .from("materiais")
//     ...
//
// ============================================================

if (!window.supabase) {

    // ========================================================
    // BIBLIOTECA NÃO ENCONTRADA
    // ========================================================

    console.error(
        "❌ Biblioteca do Supabase não foi carregada."
    );


    mostrarStatusSupabase(
        "❌ Biblioteca do Supabase não foi carregada"
    );

} else {

    // ========================================================
    // BIBLIOTECA ENCONTRADA
    // ========================================================

    console.log(
        "✅ Biblioteca do Supabase carregada."
    );


    try {

        // ====================================================
        // CRIAR CLIENTE
        // ====================================================

        const clienteSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        // ====================================================
        // DISPONIBILIZAR GLOBALMENTE
        // ====================================================
        //
        // Outros arquivos do PMOBILE poderão utilizar:
        //
        // window.clienteSupabase
        //
        // ====================================================

        window.clienteSupabase =
            clienteSupabase;


        // ====================================================
        // LOG
        // ====================================================

        console.log(
            "✅ Cliente Supabase inicializado com sucesso."
        );


        // ====================================================
        // STATUS VISUAL
        // ====================================================

        mostrarStatusSupabase(
            "🟢 Supabase inicializado com sucesso"
        );


        // ====================================================
        // INICIAR VERIFICAÇÃO
        // ====================================================
        //
        // Pequeno atraso para garantir que a página
        // terminou de carregar antes de iniciar a consulta.
        //
        // ====================================================

        setTimeout(
            testarLeituraSupabase,
            500
        );


    } catch (erro) {

        // ====================================================
        // ERRO NA INICIALIZAÇÃO
        // ====================================================

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
// FUNÇÃO: testarLeituraSupabase()
// ============================================================
//
// OBJETIVO:
//
// Fazer uma VERIFICAÇÃO COMPLETA da tabela:
//
//     public.materiais
//
// Diferentemente do teste antigo, esta função NÃO utiliza:
//
//     .limit(1)
//
// Portanto, ela verifica todos os registros.
//
// ============================================================
//
// O QUE SERÁ VERIFICADO:
//
// 1. Se o Supabase responde.
// 2. Quantos materiais existem.
// 3. Se todos possuem código.
// 4. Se existem códigos duplicados.
// 5. Se todos possuem descrição.
// 6. Se quantidade está preenchida.
// 7. Se quantidade_reservada está preenchida.
// 8. Se disponivel está preenchido.
//
// ============================================================
//
// A consulta é realizada em lotes de 1.000 registros.
//
// Isso evita tentar carregar os 92.735 materiais
// de uma única vez no celular.
//
// ============================================================

async function testarLeituraSupabase() {

    console.log(
        "🟡 Iniciando verificação completa da tabela materiais..."
    );


    mostrarStatusSupabase(
        "🟡 Verificando todos os materiais..."
    );


    try {

        // ====================================================
        // TAMANHO DO LOTE
        // ====================================================
        //
        // Cada consulta buscará no máximo 1.000 registros.
        //
        // ====================================================

        const tamanhoLote =
            1000;


        // ====================================================
        // PRIMEIRO REGISTRO DO LOTE
        // ====================================================

        let inicio =
            0;


        // ====================================================
        // CONTADOR TOTAL
        // ====================================================

        let totalEncontrado =
            0;


        // ====================================================
        // CONTADOR DE ERROS
        // ====================================================

        let quantidadeErros =
            0;


        // ====================================================
        // LISTA DE ERROS
        // ====================================================
        //
        // Guardaremos aqui os problemas encontrados.
        //
        // No máximo os primeiros 20 serão exibidos
        // visualmente ao usuário.
        //
        // ====================================================

        const erros = [];


        // ====================================================
        // CONTROLE DE CÓDIGOS
        // ====================================================
        //
        // Set permite verificar rapidamente se um código
        // já foi encontrado anteriormente.
        //
        // Isso será utilizado para procurar duplicidades.
        //
        // ====================================================

        const codigosEncontrados =
            new Set();



        // ====================================================
        // LOOP PRINCIPAL
        // ====================================================

        while (true) {

            // =================================================
            // DEFINIR FINAL DO LOTE
            // =================================================

            const fim =
                inicio +
                tamanhoLote -
                1;


            console.log(
                "🔎 Consultando registros:",
                inicio,
                "até",
                fim
            );


            // =================================================
            // CONSULTAR SUPABASE
            // =================================================

            const resultado =
                await window.clienteSupabase
                    .from("materiais")
                    .select(
                        "id,codigo,descricao,referencia,marca,local,quantidade,quantidade_reservada,disponivel,ultima_entrada"
                    )
                    .order(
                        "id",
                        {
                            ascending: true
                        }
                    )
                    .range(
                        inicio,
                        fim
                    );


            // =================================================
            // VERIFICAR ERRO DA CONSULTA
            // =================================================

            if (
                resultado.error
            ) {

                console.error(
                    "❌ Erro retornado pelo Supabase:",
                    resultado.error
                );


                throw resultado.error;

            }


            // =================================================
            // OBTER DADOS
            // =================================================

            const dados =
                resultado.data || [];


            // =================================================
            // SE NÃO HOUVE RESULTADOS,
            // A CONSULTA TERMINOU.
            // =================================================

            if (
                dados.length === 0
            ) {

                break;

            }


            // =================================================
            // ANALISAR CADA MATERIAL
            // =================================================

            dados.forEach(
                material => {

                    // =========================================
                    // CONTAR MATERIAL
                    // =========================================

                    totalEncontrado++;


                    // =========================================
                    // VERIFICAR CÓDIGO
                    // =========================================

                    if (
                        !material.codigo ||
                        String(
                            material.codigo
                        ).trim() === ""
                    ) {

                        quantidadeErros++;


                        erros.push(
                            "ID " +
                            material.id +
                            ": código vazio."
                        );

                    } else {

                        // =====================================
                        // NORMALIZAR CÓDIGO
                        // =====================================

                        const codigo =
                            String(
                                material.codigo
                            ).trim();


                        // =====================================
                        // VERIFICAR DUPLICIDADE
                        // =====================================

                        if (
                            codigosEncontrados.has(
                                codigo
                            )
                        ) {

                            quantidadeErros++;


                            erros.push(
                                "Código duplicado: " +
                                codigo +
                                " (ID " +
                                material.id +
                                ")."
                            );

                        } else {

                            codigosEncontrados.add(
                                codigo
                            );

                        }

                    }


                    // =========================================
                    // VERIFICAR DESCRIÇÃO
                    // =========================================

                    if (
                        !material.descricao ||
                        String(
                            material.descricao
                        ).trim() === ""
                    ) {

                        quantidadeErros++;


                        erros.push(
                            "ID " +
                            material.id +
                            ": descrição vazia."
                        );

                    }


                    // =========================================
                    // VERIFICAR QUANTIDADE
                    // =========================================

                    if (
                        material.quantidade === null ||
                        material.quantidade === undefined
                    ) {

                        quantidadeErros++;


                        erros.push(
                            "ID " +
                            material.id +
                            ": quantidade ausente."
                        );

                    }


                    // =========================================
                    // VERIFICAR QUANTIDADE RESERVADA
                    // =========================================

                    if (
                        material.quantidade_reservada === null ||
                        material.quantidade_reservada === undefined
                    ) {

                        quantidadeErros++;


                        erros.push(
                            "ID " +
                            material.id +
                            ": quantidade reservada ausente."
                        );

                    }


                    // =========================================
                    // VERIFICAR DISPONÍVEL
                    // =========================================

                    if (
                        material.disponivel === null ||
                        material.disponivel === undefined
                    ) {

                        quantidadeErros++;


                        erros.push(
                            "ID " +
                            material.id +
                            ": quantidade disponível ausente."
                        );

                    }

                }
            );


            // =================================================
            // ATUALIZAR STATUS
            // =================================================

            mostrarStatusSupabase(
                "🟡 Verificando materiais: " +
                totalEncontrado.toLocaleString(
                    "pt-BR"
                )
            );


            // =================================================
            // VERIFICAR SE ESTE FOI O ÚLTIMO LOTE
            // =================================================

            if (
                dados.length <
                tamanhoLote
            ) {

                break;

            }


            // =================================================
            // AVANÇAR PARA O PRÓXIMO LOTE
            // =================================================

            inicio +=
                tamanhoLote;


            // =================================================
            // PERMITIR ATUALIZAÇÃO DA INTERFACE
            // =================================================

            await permitirAtualizacaoNavegador();

        }



        // ====================================================
        // VERIFICAÇÃO TERMINADA
        // ====================================================

        console.log(
            "🟢 Verificação completa concluída."
        );


        console.log(
            "Total de materiais encontrados:",
            totalEncontrado
        );


        console.log(
            "Quantidade de problemas:",
            quantidadeErros
        );


        console.log(
            "Lista de problemas:",
            erros
        );



        // ====================================================
        // CASO 1:
        // NENHUM MATERIAL
        // ====================================================

        if (
            totalEncontrado === 0
        ) {

            mostrarStatusSupabase(
                "🟡 Supabase respondeu, mas a tabela materiais está vazia."
            );


            console.warn(
                "A tabela public.materiais não possui registros."
            );


            return;

        }



        // ====================================================
        // CASO 2:
        // TODOS OS MATERIAIS ESTÃO CORRETOS
        // ====================================================

        if (
            quantidadeErros === 0
        ) {

            mostrarStatusSupabase(
                "🟢 Supabase OK! " +
                totalEncontrado.toLocaleString(
                    "pt-BR"
                ) +
                " materiais verificados sem erros."
            );


            console.log(
                "🟢 Nenhum problema encontrado nos materiais."
            );


            return;

        }



        // ====================================================
        // CASO 3:
        // FORAM ENCONTRADOS ERROS
        // ====================================================

        mostrarStatusSupabase(
            "⚠️ " +
            totalEncontrado.toLocaleString(
                "pt-BR"
            ) +
            " materiais verificados. " +
            quantidadeErros.toLocaleString(
                "pt-BR"
            ) +
            " problemas encontrados."
        );


        // ====================================================
        // MOSTRAR DETALHES NO CONSOLE
        // ====================================================

        console.warn(
            "⚠️ Problemas encontrados:",
            erros
        );


    } catch (erro) {

        // ====================================================
        // ERRO DURANTE A VERIFICAÇÃO
        // ====================================================

        console.error(
            "❌ Erro durante a verificação do Supabase:",
            erro
        );


        mostrarStatusSupabase(
            "🔴 Erro ao verificar os materiais no Supabase."
        );

    }

}



// ============================================================
// FUNÇÃO: permitirAtualizacaoNavegador()
// ============================================================
//
// OBJETIVO:
//
// Dar uma pequena oportunidade para o navegador atualizar
// a interface entre os lotes.
//
// Isso é importante principalmente no celular.
//
// Sem essa pausa, o navegador pode ficar ocupado
// processando os lotes e demorar para atualizar
// a mensagem de progresso.
//
// ============================================================

function permitirAtualizacaoNavegador() {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                0
            );

        }
    );

}