/**
 * Created by Anderson on 20/01/2016.
 */
rz.widgets.RZTableWidgetHelpers = {
    TableWidgetEvents:[
        "data-loaded"
    ],
    TableWidgetInterface:[
        {
            name:"addRows", description:"Adiciona uma ou mais linhas à tabela", friendlyName:"Adicionar linhas",
            params:[
                {
                    name:"rowData",
                    friendlyName:"Dados da nova linha",
                    description:"Objeto ou coleção de objetos que serão adicionados à tabela na forma de linhas (ver especificação)",
                    type:"any"
                }
            ]
        },
        {
            name: "insertRows",
            friendlyName:"Inserir linhas",
            description:"Insere uma ou mais linhas em uma posição na tabela",
            params:[
                {
                    name:"position",
                    friendlyName:"Linha",
                    description:"Posição onde a(s) linha(s) será(ão) inserida(s)",
                    type:"int"
                },
                {
                    name:"rowData",
                    friendlyName:"Dados das novas linhas",
                    description:"Objeto ou coleção de objetos que serão adicionados à tabela na forma de linhas (ver especificação)",
                    type:"any"
                }
            ]
        },
        {
            name: "getRowData",
            friendlyName:"Obter dados da linha",
            description:"Recupera o objeto de dados associado a uma linha da tabela",
            params:[
                {
                    name:"rowIndex",
                    friendlyName:"Linha",
                    description:"Posição da linha da qual se quer obter os dados",
                    type:"int"
                }
            ]
        },
        {
            name:"clear",
            friendlyName:"Limpar",
            description:"Limpa todos os dados da tabela"
        },
        {
            name:"changeCellData",
            friendlyName:"Alterar dados de célula",
            description:"Altera os dados de uma célula e renderiza-a",
            params:[
                {
                    name:"position",
                    friendlyName:"Linha",
                    description:"Posição da linha da qual se quer alterar os dados",
                    type:"int"
                },
                {
                    name:"cellName",
                    friendlyName:"Nome da célula",
                    description:"nome da propriedade que será alterada",
                    type:"string"
                },
                {
                    name:"newValue",
                    friendlyName:"Valor",
                    description:"Novo valor da célula",
                    type:"any"
                }
            ]
        },
        {
            name: "sort",
            friendlyName:"Ordenar",
            description:"Ordena os dados da tabela",
            params:[
                {
                    name:"sortParams",
                    friendlyName:"Opções de ordenação",
                    description:"Parâmetros utilizados na ordenação da tabela",
                    type:"object"
                }
            ]
        },
        {
            name:"filter",
            friendlyName:"Filtrar",
            description:"Filtra os dados de acordo com uma expressão de filtro",
            params:[
                {
                    name:"filterExpression",
                    friendlyName:"Expressão de filtro",
                    description:"Expressão utilizada para filtragem dos dados",
                    type:"object"
                }
            ]
        },
        {
            name:"find",
            friendlyName:"Procurar",
            description:"Executa uma pesquisa arbitrária de dados",
            params:[
                {
                    name:"searchKey",
                    friendlyName:"Chave da busca",
                    description:"Chave da pesquisa de dados",
                    type:"any"
                }
            ]
        },
        {
            name:"gotoPage",
            friendlyName:"Ir para página",
            description:"Navega para uma página de dados específica",
            params:[
                {
                    name:"page",
                    friendlyName:"Página",
                    description:"Página",
                    type:"object"
                }
            ]
        },
        {
            name:"refresh",
            friendlyName:"Atualizar",
            description:"Atualiza o conteúdo da página"
        }
    ]
};
