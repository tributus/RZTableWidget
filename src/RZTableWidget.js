/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", rz.widgets.RZTableWidgetHelpers.TableWidgetInterface, [], function () {

    //internals declares
    var $this = this;
    $this.sorting = {sortCol: "", sortDir: ""};
    $this.filter = {};
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

    this.sort = function (column,direction) {
        direction =  direction || "asc";
        $this.sorting = {
            sortCol:column,
            sortDir:direction
        };
        $this.params.paging.currentPage=1;
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

//---------------------------------------------------------------------------------------------------------------------------------------------


    //todo implementar em ruteZangada após a renderização do widget (widgetRendered_event
    /*
     var executeAfterRenderScripts = function (bypassSetupHeaders) {
     postRenderScripts.forEach(function (it) {
     it();
     });
     postRenderScripts = [];
     if (!bypassSetupHeaders) {
     setupSortableTable();
     setupPaging();
     }
     };
     */

    /*var renderRowsData = function (target, params, onlyRows) {
     var sb = new StringBuilder();

     if (!onlyRows) {
     ensureColumns();
     sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass, params.elementID);
     renderTableHead(sb, params);
     renderTableBody(sb, params);
     //renderTableFooter(sb,params);
     sb.append('</table>');
     $("#" + target).append(sb.toString());
     executeAfterRenderScripts();
     }
     else {
     renderTableBody(sb, params);
     $("#" + params.elementID + " tbody").detach();
     $("#" + params.elementID).append(sb.toString());
     executeAfterRenderScripts();
     }
     };*/


    /*
     var renderTableHead = function (sb, params) {
     if (params.renderTableHead) {
     sb.append('<thead>');
     sb.append('<tr>');
     params.columns.forEach(function (col) {
     sb.appendFormat('<th{0} data-bindingsource="{1}">', resolveHeaderClass(col),col.bindingSource || "");
     var renderer = rz.widgets.tableHelpers.getCellRenderer(col.headerRender || 'default');
     var value = col.headerText || col.bindingSource;
     sb.append(renderer(value, col));
     sb.append('</th>');

     });
     sb.append('</tr>');
     sb.append('</thead>');
     }
     };



    var renderTableBody = function (sb, params) {
        sb.append('<tbody>');
        if (params.rowsData !== undefined && params.rowsData.length > 0) {
            renderDataRows(sb, params.rowsData);
        }
        else {
            if ($this.params.displayEmptyMessage) {
                $this.renderingHelpers.renderEmptyDataRow(sb);
            }
        }
        sb.append('</tbody>');
        renderTableFooter(sb, params);
    };

    var calculateTotalPages = function (rowsData, pageSize) {
        var totalPages = Math.ceil(rowsData.length / pageSize);
        $this.params.paging.totalPages = totalPages;
        return totalPages;
    };

    var renderTableFooterXXXXXXXX = function (sb, params) {
        if (params.paging !== undefined && params.paging.enablePaging) {
            sb.appendFormat('<tfoot>');
            sb.appendFormat('   <tr><td colspan="{0}">', params.columns.length);

            sb.appendFormat('<div class="ui right floated pagination menu">');
            sb.appendFormat('    <div style="padding: 10px 5px">{0} </div><input id="{4}_paginginput" type="text" style="width: 60px;text-align: center;border: none;outline: none;" value="{2}" data-paging-action="specific"> <div style="padding: 10px 5px">{1} {3}</div>',
                $this.params.language.paginate.page,
                $this.params.language.paginate.of,
                $this.params.paging.currentPage,
                calculateTotalPages(params.rowsData, params.paging.pageSize),
                $this.params.elementID
            );
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="first"><i class="double angle left icon"></i></a>', $this.params.language.paginate.first, $this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="previous"><i class="angle left icon"></i></a>', $this.params.language.paginate.previous, $this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="next"><i class="angle right icon"></i></a>', $this.params.language.paginate.next, $this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="last"><i class="double angle right icon"></i></a>', $this.params.language.paginate.last, $this.params.elementID);
            sb.appendFormat('</div>');

            sb.appendFormat('    </td>');
            sb.appendFormat('    </tr>');
            sb.appendFormat('    </tfoot>');
        }
    };


    var removeEmptyDataRow = function () {
        $('#' + $this.params.elementID + ' .empty-row').detach();
    };


    var getDataPage = function (rowData, params) {
        if (params.paging !== undefined && params.paging.enablePaging) {
            if (params.paging.pageSize >= rowData.length) {
                return rowData;
            }
            else {
                var pSize = params.paging.pageSize;
                var curPage = params.paging.currentPage;
                var startIndex = (curPage - 1) * pSize;
                var endIndex = startIndex + pSize;
                return rowData.slice(startIndex, endIndex);
            }
        }
        else {
            return rowData;
        }
    };

    var renderDataRows = function (sb, rowData, isPostAddedRow) {
        var page = getDataPage(rowData, $this.params);
        page.forEach(function (it, rowIndex) {
            it.__uid = generateRandomID(16);
            sb.appendFormat('<tr{0}>', (isPostAddedRow) ? ' class="' + $this.params.addedAfterRowClass + '"' : '');
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td{0}>', resolveTDClass(col));
                renderCellData(it, col, sb, rowIndex);
                sb.appendFormat('</td>');
            });
            sb.appendFormat('</tr>');
        });
    };
    */

    /*var ensureColumns = function () {
     if ($this.params.columns === undefined) {
     var dataRow = $this.getRowData(0);
     var keys = Object.keys(dataRow);
     $this.params.columns = [];
     keys.forEach(function (it) {
     var columnDefinition = {
     bindingSource: it,
     renderer: "text"
     };
     $this.params.columns.push(columnDefinition);
     });
     }
     };*/

    var getNewRowHTML = function (rowData, isRefresh) {
        var sb = new StringBuilder();
        if (Object.prototype.toString.call(rowData) != "[object Array]") {
            rowData = [rowData];
        }
        renderDataRows(sb, rowData, !isRefresh);
        return sb.toString();
    };

    var removeChangeAnimationClass = function () {
        setTimeout(function () {
            $('#' + $this.params.elementID + ' tbody > tr').removeClass($this.params.addedAfterRowClass);
        }, 500);
    };



    var getTableRequestParams = function () {
        var paramObj = {
            page: $this.params.paging.currentPage || 1, //todo $this.currentPage
            filter: $this.currentFilter, //todo $this.currentFilter
            sortColumn: $this.sortColumn,
            sortDirection: $this.sortDir
        };

        return paramObj;
    };

    //region sort columns helpers
    /*
     var findColData = function(findData){

     var cdata = $this.params.columns.find(function(it){
     return it[findData.prop] == findData.value;
     });
     return cdata;
     };

     var sortAscMethod = function (a, b) {
     return genericSortMethod(a,b);
     };
     var sortDescMethod = function (a, b) {
     return genericSortMethod(b,a);
     };

     var columnToSort;
     var genericSortMethod = function (a, b) {
     var r = 0;
     var colDef = sortingHelper.findColData({prop:"bindingSource", value:columnToSort},$this);
     var va = a[columnToSort];
     var vb = b[columnToSort];

     if(colDef.dataType=="numeric"){
     va = parseFloat(va);
     vb = parseFloat(vb);
     }
     else if(colDef.dataType=="datetime"){
     va = new Date(va);
     vb = new Date(vb);
     }

     if(va < vb) r = -1;
     if(va > vb) r = 1;
     return r;
     };
     */
    //endregion


/*
    this.addRows = function (rowData) {
        var html = getNewRowHTML(rowData);
        $this.params.rowsData = $this.params.rowsData.concat(rowData);
        $('#' + this.params.elementID + ' tbody').append(html);
        executeAfterRenderScripts(true);
        removeEmptyDataRow();
        removeChangeAnimationClass();
    };
*/





    this.filter = function (filterExpression) {
        if ($this.dataSourceLocation == "local") {
            if ($this.params.unfilteredData === undefined) {
                $this.params.unfilteredData = $this.params.rowsData;
            }
            if (typeof(filterExpression) == "function") {
                $this.params.rowsData = $this.params.unfilteredData.filter(filterExpression);
            }
            else {
                var jfe = new rz.plugins.jsonFilterEngine();
                var f = jfe.buildFilterFunction(filterExpression);
                $this.params.rowsData = $this.params.unfilteredData.filter(f);
            }
            $('#' + $this.params.elementID + ' tbody').empty();
            $this.refresh();
        }
        else {
            //send expressions to server


            var originalURL = $this.params.sourceURL;
            //$this.sortColumn = sortData.sortColumn;
            //$this.sortDir = sortData.sortDir;
            $this.currentFilter = filterExpression;

            var paramObj = getTableRequestParams();
            var pstr = btoa(JSON.stringify(paramObj));
            var url = rz.utils.uri.mergeParam(originalURL, "tableParams", pstr);

            //todo create a "mergeParams" method on ruteZangada lib to handle that
            //var paramSymbol = (originalURL.indexOf("?")==-1)? "?":"&";
            //var url = originalURL + paramSymbol + "sortcolumn=" + sortData.column + "&sortdirection=" + sortData.sortDir;

            ruteZangada.get(url, function (d, r) {
                if (r == "success") {
                    //var url = params.rowsData;
                    $this.params.rowsData = d;
                    $('#' + $this.params.elementID + ' tbody').empty();
                    $this.refresh();
                    //renderRowsData(target, params, hasColumnDefinitions);
                }
                else {
                    $("#" + params.elementID).append(params.errorMessageRenderer());
                }
            });
        }
    };


});