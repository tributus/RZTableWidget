#RZTableWidget
Table view Widget  

##Dependencies:
RZClientEngine >=0.0.1;
##Installation:
```html
Bower:
bower install rztablewidget
```
##Usage:

html:
```html
<div id="elementID"></div>
```

js:
```javascript
Javascript:
var params = {...}
var widgetInstance = ruteZangada.renderWidget("rz-table", "elementID", params);
```

##Params
```javascript
    var params = {
                tableData: {
                    dataSource: undefined
                },
                columns: undefined,
                ui: {
                    tableClass: "ui basic table",                                                       //initial table style
                    renderTableHead: true,                                                              //define if table header will be rendered
                    elementID: elementID,                                                               //root element id;
                    allowSorting: true,                                                                 //define if table allow sorting
                    addedAfterRowClass: "added-after-row",                                              //css class to associate with new added rows
                    displayEmptyMessage: true,                                                          //define if empry message will be displayed
                    displayTableFooter: false,                                                          //define if table footer will be rendered
                    emptyMessageRenderer: $this.renderingHelpers.emptyMessageRendererFunction,          //default renderer for empty messages
                    errorMessageRenderer: $this.renderingHelpers.errorMessageRendererFunction           //default renderer for error messages
                },
                language: {                                                                             //localized strings for widget
                    paginate: {                                                                         //localized strings for pagination
                        page: "Page",                                                                   //"Page" localized string
                        of: "of",                                                                       //"of" localized string
                        first: "first",                                                                 //"first" localized string
                        previous: "previous",                                                           //"previous" localized string
                        next: "next",                                                                   //"next" localized string
                        last: "last"                                                                    //"last" localized string
                    },
                    emptyTableMessage: "no data to display",                                            //empty message
                    errorGettingDataMessage: "error getting table data"                                 //empty message
                },
                paging: {                                                                               //pagination definition for plugin
                    enablePaging: false,                                                                //enables or disable paging
                    pageSize: 20,                                                                       //default page size
                    currentPage: 1                                                                      //default page
                }
            };
```
##Operations and events
For a complete list of widget operations and events, see the src/InterfaceAndEvents.js file 


----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
#Old Docs (move to Confluence
Este widget cria exibições de dados na forma de tabela

Depenências:
RZClientEngine >=0.0.1;

pode ser baixado via npm adicionando-se:

```html
"dependencies": {
    "RZClientEngine": "git+https://tributus@bitbucket.org/tributus/rzclientengine.git"
}
```

no arquivo package.json

##Parâmetros de inicialização:

Parâmetro|Descrição|Default
--- | --- | ---
tableClass|classe utilizada na declaração *table*. Os valores deste parâmetro obedecem as regras do semantic-ui. **Exemplos:** `'ui celled table,ui celled padded table','ui stripped table','ui very basic collapsing celled table'`| `ui celled table` 
rowsDta|dados da tabela. pode ser um objeto ou a url de  um serviço [melhorar esta definição]|`undefined`
renderTableHead|define se o cabeçalho da tabela será renderizado|`true`
columns|definição de colunas|`undefined`

#TODO DOCUMENTAR:

```html
columns = [
    { 
        headerText:'Texto do cabeçalho', 
        bindingSource:'nome da propriedade mapeada',
        cellRenderer:"renderizador da célula de dados (pode ser o nome de um render registrado ou uma function(value,[full]))",
        headerRender:"renderizador do cabeçalho de dados (pode ser o nome de um render registrado ou uma function(value,[full]))"
    }
]
```