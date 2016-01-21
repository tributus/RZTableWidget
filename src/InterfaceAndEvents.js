/**
 * Created by Anderson on 20/01/2016.
 */
rz.widgets.RZTableWidgetHelpers = {
    TableWidgetInterface:[
        {name:"addRows", description:"Adiciona uma ou mais linhas à tabela", friendlyName:"Adicionar linhas",
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
        }
    ]
};