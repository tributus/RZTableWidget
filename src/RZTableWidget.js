/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table",
    rz.widgets.RZTableWidgetHelpers.TableWidgetInterface,
    rz.widgets.RZTableWidgetHelpers.TableWidgetEvents,
    function () {

    //internals declares
    var $this = this;
    $this.sorting = {sortCol: "", sortDir: ""};
    $this.filterExpression = undefined;
    $this.postRenderScripts = [];

    //helpers
    $this.internals = rz.widgets.RZTableWidgetHelpers.Internals;
    $this.renderingHelpers = new rz.widgets.RZTableWidgetHelpers.renderingHelpers($this);
    $this.setupHelpers = new rz.widgets.RZTableWidgetHelpers.setupHelpers($this);
    $this.runtimeHelpers = new rz.widgets.RZTableWidgetHelpers.runtimeHelpers($this);


    //widget interface
    this.initialize = function (p, initialized) {
        var elementID = generateRandomID(8);
        var defaultParams = {
            tableData: {
                dataSource: undefined
            },
            columns: undefined,
            ui: {
                tableClass: "ui basic table",                            //initial table style
                renderTableHead: true,                                   //define if table header will be rendered
                elementID: elementID,                                    //root element id;
                allowSorting: true,                                      //define if table allow sorting
                addedAfterRowClass: "added-after-row",                   //css class to associate with new added rows
                displayEmptyMessage: true,                               //define if empry message will be displayed
                displayTableFooter: false,                               //define if table footer will be rendered
                emptyMessageRenderer: $this.renderingHelpers.emptyMessageRendererFunction,     //default renderer for empty messages
                errorMessageRenderer: $this.renderingHelpers.errorMessageRendererFunction       //default renderer for error messages
            },
            language: {                                                  //localized strings for widget
                paginate: {                                              //localized strings for pagination
                    page: "Page",                                       //"Page" localized string
                    of: "of",                                            //"of" localized string
                    first: "first",                                      //"first" localized string
                    previous: "previous",                                //"previous" localized string
                    next: "next",                                        //"next" localized string
                    last: "last"                                         //"last" localized string
                },
                emptyTableMessage: "no data to display",                //empty message
                errorGettingDataMessage: "error getting table data"     //empty message
            },
            paging: {                                                    //pagination definition for plugin
                enablePaging: false,                                     //enables or disable paging
                pageSize: 20,                                            //default page size
                currentPage: 1                                           //default page
            }
        };
        $this.params = $.extend(true, {}, defaultParams, p);
        initialized();
    };

    this.render = function (target) {
        $this.renderingHelpers.renderTableStructure(target, $this.renderingHelpers.renderTableRows);
    };

    /**
     * Ordena os dados de uma determinada coluna da tabela
     * @param column
     * nome da coluna (bindingsource)
     * @param direction
     * "asc" para ascendente ou "desc" para descendente
     */
    this.sort = function (column,direction) {
        direction =  direction || "asc";
        $this.sorting = {
            sortCol:column,
            sortDir:direction
        };
        $this.params.paging.currentPage=1;
        $this.renderingHelpers.renderSortingIndicator(column,direction);
        $this.refresh();
    };

    /**
     * Navega para uma página específica da tabela.
     * @param page
     * Página desejada. Os valores aceitáveis são "first","previous", "next", "last" ou um número de página
     * Quando um valor menor que 1 é informado, a tabela navega para a primeira página
     * Quando um valor maior que a quantidade de páginas é informada, a tabela navega para a última página
     */
    this.gotoPage = function (page) {
        var totalPages = $this.params.paging.totalPages;
        var ensureValidPage = function (pg) {
            var n = parseInt(pg);
            if (isNaN(n)) {
                return 1;
            }
            else {
                if (n < 1) {
                    return 1;
                }
                else if (n > totalPages) {
                    return totalPages;
                }
                else {
                    return n;
                }
            }
        };
        var currentPage = $this.params.paging.currentPage;

        switch (page) {
            case "f":
            case "first":
                $this.params.paging.currentPage = 1;
                break;
            case "p":
            case "previous":
                $this.params.paging.currentPage = ensureValidPage($this.params.paging.currentPage - 1);
                break;
            case "n":
            case "next":
                $this.params.paging.currentPage = ensureValidPage($this.params.paging.currentPage + 1);
                break;
            case "l":
            case "last":
                $this.params.paging.currentPage = totalPages;
                break;
            default:
                $this.params.paging.currentPage = ensureValidPage(page);
                break;
        }
        if (currentPage !== $this.params.paging.currentPage) {
            $this.renderingHelpers.renderTableRows();
        }
    };

    /**
     * retorna o objeto de dado associado com uma linha da tabela (local apenas)
     * @param position
     * posição (linha) da qual o valor será retornado
     * @returns {*}
     */
    this.getRowData = function (position) {
        var p = parseInt(position);
        var r = $("#" + $this.params.ui.elementID + " tbody > tr")[position];
        if(r!==undefined){
            var refid = $(r).data("refid");
            if(refid!==undefined){
                return ($this.rowsData===undefined)?undefined:$this.rowsData.find(function(i){return i.__uid==refid});
            }
            else{
                return undefined;
            }
        }
    };

    /**
     * Retorna a quantidade de linhas da tabela (considera apenas as linhas exibidas localmente)
     * @returns {number|jQuery}
     */
    this.getRowCount = function () {
        return $('#' + this.params.ui.elementID + ' tbody > tr').length;
    };

    /**
     * Limpa a tabela removendo todas as suas linhas.
     * @param removeColumns
     * [opcional] Quando true, remove as colunas, mantendo apenas a estrutura básica da tabela.
     * <table>
     *     <thead></thead>
     *     <tbody></tbody>
     * </table>
     * Caso este valor não seja informado ou seja false, apenas as linhas da tabela são removidas.
     * @param removeColumnDefinitions
     * Quando true, remove a definição das colunas da tabela (forçando a recriação das colunas com
     * base em objetos que serão incluídos na mesma posteriormente).
     * A definição das colunas é utilizada pelo widget para construir as colunas da tabela durante
     * a atualização dos dados. Esta definição pode ser passada via parâmetro de inicialização
     * (params.columns). Quando a mesma não é passada  na inicialização, o widget o cria durante
     * a renderização da tabela, baseado nas propriedades dos objetos que estão sendo inseridos na tabela
     * (O primeiro item da coleção serve de base).
     * Esta definição e a renderização das colunas é feita apenas na primeira renderização da tabela. Assim,
     * se a definição for removida neste método, as colunas serão recriadas no caso de uma posterior inclusão
     * de dados na tabela
     *
     * este parâmetro só é considerado quando removeColumns=true
     */
    this.clear = function (removeColumns,removeColumnDefinitions) {
        $('#' + $this.params.ui.elementID + ' tbody').empty();
        $('#' + $this.params.ui.elementID + ' thead th').removeClass("sorted");
        $this.renderingHelpers.removePagingToolBox();
        if ($this.params.ui.displayEmptyMessage) {
            $this.renderingHelpers.renderEmptyDataRow();
        }
        $this.params.paging.currentPage = 1;
        $this.sorting = {sortCol: "", sortDir: ""};

        $this.rowsData = [];
        if(removeColumns){
            $('#' + $this.params.ui.elementID + ' thead').empty();
            if(removeColumnDefinitions){
                $this.params.columns = undefined;
            }
            else{
                $this.recreateFromOriginalDefinition = true;
            }

        }
    };

    /**
     * Atualiza os dados da tabela
     */
    this.refresh = function () {
        $this.renderingHelpers.renderTableRows();
    };

    /**
     * Insere uma nova linha na tabela (somente local)
     * @param rowData
     */
    this.addRows = function (rowData) {
        this.insertRows(-1,rowData);
    };

    /**
     * Insere uma linha na tabela em determinada posição (somente local)
     * @param position
     * Local (baseado em zero) onde a nova linha será inserida
     * @param rowData
     * Objeto ou coleção de objetos que serão inseridos na tabela como linhas
     */
    this.insertRows = function (position, rowData) {
        if (position===undefined || position < 0 || position >= $this.getRowCount()) {
            position = undefined
        }
        if(rowData!==undefined) {
            if(rowData.length ===undefined){
                rowData = [rowData];
            }
            $this.rowsData = $this.rowsData.concat(rowData);
            $this.renderingHelpers.renderAndPlotRows(true, rowData, true,position);
            $this.runtimeHelpers.executePostRenderScripts();
            $this.renderingHelpers.removeEmptyDataRow();
            $this.renderingHelpers.removeErrorRow();
            $this.renderingHelpers.removeAfterAddedRowsClass();
        }
    };

    /**
     * Altera o valor de uma célula da tabela (apenas localmente)
     * @param position
     * Linha na qual a modificação será feita
     * @param cellName
     * Nome da coluna (é o valor de bindingSource da coluna ou o nome da propriedade do objeto associado à coluna)
     * @param newValue
     * Novo valor da célula
     */
    this.changeCellData = function (position, cellName, newValue) {
        if (position >= 0 && position < $this.getRowCount()) {
            var rd = $this.getRowData([position]);
            rd[cellName] = newValue;

            var cInfo = $this.runtimeHelpers.getColumnInfo(cellName);
            if (cInfo.index != -1) {
                $this.renderingHelpers.renderChangedCell(cInfo,rd,position)
            }
            else {
                throw "INVALID CELL";
            }
        }
        else {
            throw "INVALID POSITION";
        }
    };

    this.filter = function (filterExpression) {
        $this.filterExpression = filterExpression;
        $this.params.paging.currentPage=1;
        $this.refresh();
    };
    this.find = function (searchKey) {
        $this.filterExpression = {format:"simple-search", searchKey:searchKey};
        $this.params.paging.currentPage=1;
        $this.refresh();
    };
        this.getElementID = function(prefix){
            var p = prefix || "";
            return p + this.params.ui.elementID;
        }
});