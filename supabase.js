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
// 8. Mostrar os problemas encontrados na tela.
//
// IMPORTANTE:
//
// O Supabase é o banco central do PMOBILE.
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
// Criar ou atualizar uma mensagem visual fixa na tela.
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
// 🟡 Verificando todos os materiais...
//
// 🟢 Supabase OK! 92.735 materiais verificados sem erros.
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
// FUNÇÃO: mostrarErrosSupabase()
// ============================================================
//
// OBJETIVO:
//
// Mostrar na tela os problemas encontrados durante
// a verificação dos materiais.
//
// PARÂMETROS:
//
// erros
//     Array contendo as mensagens dos problemas.
//
// totalEncontrado
//     Quantidade total de materiais analisados.
//
// quantidadeErros
//     Quantidade total de problemas encontrados.
//
// IMPORTANTE:
//
// Para evitar uma tela gigantesca, mostramos no máximo
// os primeiros 20 problemas.
//
// Todos os problemas continuam sendo enviados para
// o console do navegador.
//
// ============================================================

function mostrarErrosSupabase(
    erros,
    totalEncontrado,
    quantidadeErros
) {

    // ========================================================
    // PROCURAR ÁREA DE RESULTADO
    // ========================================================

    let area =
        document.getElementById(
            "resultadoVerificacaoSupabase"
        );


    // ========================================================
    // SE NÃO EXISTIR, CRIAR
    // ========================================================

    if (!area) {

        area =
            document.createElement(
                "div"
            );


        area.id =
            "resultadoVerificacaoSupabase";


        // ====================================================
        // APARÊNCIA
        // ====================================================

        area.style.position =
            "fixed";

        area.style.top =
            "80px";

        area.style.left =
            "10px";

        area.style.right =
            "10px";

        area.style.maxHeight =
            "70vh";

        area.style.overflowY =
            "auto";

        area.style.padding =
            "15px";

        area.style.background =
            "#ffffff";

        area.style.border =
            "1px solid #999";

        area.style.borderRadius =
            "8px";

        area.style.zIndex =
            "9998";


        // ====================================================
        // ADICIONAR À PÁGINA
        // ====================================================

        document.body.appendChild(
            area
        );

    }


    // ========================================================
    // INICIAR HTML
    // ========================================================

    let html = "";


    html +=
        "<h3>⚠️ Problemas encontrados</h3>";


    html +=
        "<p><strong>" +
        totalEncontrado.toLocaleString(
            "pt-BR"
        ) +
        "</strong> materiais verificados.</p>";


    html +=
        "<p><strong>" +
        quantidadeErros.toLocaleString(
            "pt-BR"
        ) +
        "</strong> problemas encontrados.</p>";


    html +=
        "<hr>";


    // ========================================================
    // VERIFICAR SE EXISTEM ERROS
    // ========================================================

    if (
        erros.length === 0
    ) {

        html +=
            "<p>🟢 Nenhum problema detalhado encontrado.</p>";

    } else {

        html +=
            "<p><strong>Detalhes:</strong></p>";


        html +=
            "<ul>";


        // ====================================================
        // MOSTRAR NO MÁXIMO 20
        // ====================================================

        erros
            .slice(
                0,
                20
            )
            .forEach(
                erro => {

                    html +=
                        "<li>" +
                        escaparHTML(
                            erro
                        ) +
                        "</li>";

                }
            );


        html +=
            "</ul>";


        // ====================================================
        // AVISAR SE HOUVER MAIS DE 20
        // ====================================================

        if (
            erros.length > 20
        ) {

            html +=
                "<p>⚠️ Apenas os primeiros 20 problemas " +
                "estão sendo exibidos.</p>";

        }

    }


    // ========================================================
    // BOTÃO FECHAR
    // ========================================================

    html +=
        "<br>" +
        "<button type=\"button\" " +
        "onclick=\"fecharErrosSupabase()\">" +
        "Fechar" +
        "</button>";


    // ========================================================
    // INSERIR RESULTADO NA TELA
    // ========================================================

    area.innerHTML =
        html;

}



// ============================================================
// FUNÇÃO: fecharErrosSupabase()
// ============================================================
//
// OBJETIVO:
//
// Fechar/remover da tela o painel de problemas
// apresentado pela função mostrarErrosSupabase().
//
// ============================================================

function fecharErrosSupabase() {

    const area =
        document.getElementById(
            "resultadoVerificacaoSupabase"
        );

    if (!area) {
        return;
    }

    area.remove();

}



// ============================================================
// FUNÇÃO: escaparHTML()
// ============================================================
//
// OBJETIVO:
//
// Evitar que informações vindas do banco sejam
// interpretadas como HTML.
//
// Isso é importante porque os dados dos materiais
// vêm diretamente do Supabase.
//
// PARÂMETRO:
//
// texto
//     Texto que será exibido.
//
// RETORNO:
//
// Texto seguro para ser utilizado dentro de HTML.
//
// ============================================================

function escaparHTML(texto) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

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
        // terminou de carregar.
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
// Fazer uma verificação completa da tabela:
//
//     public.materiais
//
// A função verifica TODOS os registros disponíveis.
//
// ============================================================
//
// VERIFICAÇÕES:
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
// Isso evita carregar os 92.735 materiais de uma
// única vez no celular.
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

        const tamanhoLote =
            1000;


        // ====================================================
        // PRIMEIRO REGISTRO
        // ====================================================

        let inicio =
            0;


        // ====================================================
        // CONTADOR TOTAL
        // ====================================================

        let totalEncontrado =
            0;


        // ====================================================
        // CONTADOR DE PROBLEMAS
        // ====================================================

        let quantidadeErros =
            0;


        // ====================================================
        // LISTA DE PROBLEMAS
        // ====================================================

        const erros = [];


        // ====================================================
        // CONTROLE DE CÓDIGOS
        // ====================================================
        //
        // Utilizado para encontrar códigos duplicados.
        //
        // ====================================================

        const codigosEncontrados =
            new Set();



        // ====================================================
        // CONSULTAR TODOS OS LOTES
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
            // NENHUM REGISTRO
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
            // VERIFICAR SE FOI O ÚLTIMO LOTE
            // =================================================

            if (
                dados.length <
                tamanhoLote
            ) {

                break;

            }


            // =================================================
            // PRÓXIMO LOTE
            // =================================================

            inicio +=
                tamanhoLote;


            // =================================================
            // PERMITIR ATUALIZAÇÃO DA INTERFACE
            // =================================================

            await permitirAtualizacaoNavegador();

        }



        // ====================================================
        // VERIFICAÇÃO CONCLUÍDA
        // ====================================================

        console.log(
            "🟢 Verificação completa concluída."
        );


        console.log(
            "Total de materiais:",
            totalEncontrado
        );


        console.log(
            "Quantidade de problemas:",
            quantidadeErros
        );


        console.log(
            "Problemas:",
            erros
        );



        // ====================================================
        // CASO 1:
        // BANCO VAZIO
        // ====================================================

        if (
            totalEncontrado === 0
        ) {

            mostrarStatusSupabase(
                "🟡 Supabase respondeu, mas a tabela materiais está vazia."
            );


            return;

        }



        // ====================================================
        // CASO 2:
        // NENHUM PROBLEMA
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
                "🟢 Nenhum problema encontrado."
            );


            return;

        }



        // ====================================================
        // CASO 3:
        // PROBLEMAS ENCONTRADOS
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
        // MOSTRAR PROBLEMAS NA TELA
        // ====================================================

        mostrarErrosSupabase(
            erros,
            totalEncontrado,
            quantidadeErros
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
