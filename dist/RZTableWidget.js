/**
 * Created by Anderson on 20/01/2016.
 */
rz.widgets.RZTableWidgetHelpers = {
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

/**
 * Created by Anderson on 18/01/2016.
 */
rz.widgets.tableHelpers = {
    cellRenderers: {},
    createCellRenderer: function (n, d) {
        this.cellRenderers[n] = d;
    },
    getCellRenderer: function (n) {
        if (typeof(n) == "string") {
            return this.cellRenderers[n] || this.cellRenderers["default"];
        }
        else {
            return n;
        }
    },
    sizeNames: ["","one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fiveteen", "sixteen"]
};
/**
 * Created by anderson.santos on 07/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.renderingHelpers = function (t) {
    var $this = t;
    var that = this;

    this.hasFooter = function () {
        return $this.params.paging.enablePaging; //|| anotherFooterElement
    };
    this.renderTableStructure = function (target, renderRowsMethod) {
        var sb = new StringBuilder();
        sb.appendFormat('<table id="{1}" class="rz-table-widget {0}">', $this.params.ui.tableClass, $this.params.ui.elementID);
        that.renderTableHeader(sb);
        sb.append('<tbody></tbody>');
        if ($this.params.paging.enablePaging || $this.params.ui.displayTableFooter) {
            that.renderTableFooter(sb);
        }
        sb.appendFormat('</table>');
        $('#' + target).html(sb.toString());
        if ($this.params.columns !== undefined) $this.setupHelpers.setupSorting();
        renderRowsMethod()
    };
    this.renderTableHeader = function (sb) {
        if ($this.params.ui.renderTableHead) {
            sb.append('<thead>');
            that.renderTableHeaderContent(sb);
            sb.append('</thead>');
        }
    };
    this.renderTableHeaderContent = function (sb) {
        if ($this.params.columns !== undefined) {
            var plot = false;
            if (sb == undefined) {
                plot = true;
                sb = new StringBuilder();
            }
            sb.append('<tr>');
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<th{0} data-bindingsource="{1}">', $this.internals.resolveHeaderClass(col), col.bindingSource || "");
                var renderer = rz.widgets.tableHelpers.getCellRenderer(col.headerRender || 'default');
                var value = col.headerText || col.bindingSource;
                sb.append(renderer(value, col));
                sb.append('</th>');
            });
            sb.append('</tr>');
            if (plot) {
                $("#" + $this.params.ui.elementID + " thead").html(sb.toString());
                $this.setupHelpers.setupSorting();
            }
        }
    };
    this.renderTableRows = function () {
        $this.runtimeHelpers.getRows(function (data) {
            if ($this.internals.isEmptyResult(data)) {
                that.renderEmptyDataRow();
                that.removePagingToolBox();
            }
            else {
                var ds = $this.internals.ensureDataSource(data);
                $this.params.paging.currentPage = ds.header.currentPage;
                $this.params.paging.totalPages = ds.header.totalPages;
                $this.rowsData = ds.rows;


                var defined = $this.setupHelpers.ensureColumns(($this.rowsData !==undefined && $this.rowsData.length > 0)?$this.rowsData[0]:undefined);
                if (defined || $this.recreateFromOriginalDefinition) {
                    that.renderTableHeaderContent();
                    $this.recreateFromOriginalDefinition = false;
                }
                that.renderAndPlotRows();
                that.renderPagingToolBox();
            }
            $this.runtimeHelpers.executePostRenderScripts();
        });
    };
    this.renderAndPlotRows = function (isPostAddedRow,rowsSource,preserveActualRows,position) {
        var rows = rowsSource || $this.rowsData;
        var sb = new StringBuilder();
        rows.forEach(function (it, rowIndex) {
            it.__uid = generateRandomID(16);
            sb.appendFormat('<tr{0} data-refid="{1}">', (isPostAddedRow) ? ' class="' + $this.params.ui.addedAfterRowClass + '"' : '',it.__uid);
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td{0}>', $this.internals.resolveTDClass(col));
                $this.internals.renderCellData($this, it, col, sb, rowIndex);
                sb.appendFormat('</td>');
            });
            sb.appendFormat('</tr>');
        });
        $this.internals.plotOnBody(sb, "#" + $this.params.ui.elementID,preserveActualRows,position);
    };
    this.renderTableFooter = function (sb) {
        if (that.hasFooter()) {
            sb.appendFormat('<tfoot><tr><td colspan="6000"></td></tr></tfoot>');
        }
    };
    this.removePagingToolBox = function () {
        var pagingToolboxID = "#" + $this.params.ui.elementID + "_paging_toolbox";
        $(pagingToolboxID).remove();
    };
    this.renderPagingToolBox = function () {
        if ($this.params.paging.enablePaging) {
            var pagingToolboxID = $this.params.ui.elementID + "_paging_toolbox";
            if ($("#" + pagingToolboxID).length == 1) {
                var piid = "#@_paginginput".replace("@", $this.params.ui.elementID);
                var tpid = "#@_total_pages_el".replace("@", $this.params.ui.elementID);
                $(piid).val($this.params.paging.currentPage);
                $(tpid).html($this.params.paging.totalPages);
            }
            else {
                var sb = new StringBuilder();
                //sb.appendFormat('   <td colspan="{0}">', params.columns.length);

                sb.appendFormat('<div id="{0}" class="ui right floated pagination menu rz-pagination-bar">', pagingToolboxID);
                sb.appendFormat('    <div>{0} </div><input id="{4}_paginginput" type="text" class="paging-input" value="{2}" data-paging-action="specific"> <span>{1}</span> <span id="{4}_total_pages_el">{3}</span>',
                    $this.params.language.paginate.page,
                    $this.params.language.paginate.of,
                    $this.params.paging.currentPage,
                    $this.params.paging.totalPages,
                    $this.params.ui.elementID
                );
                sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="first"><i class="double angle left icon"></i></a>', $this.params.language.paginate.first, $this.params.ui.elementID);
                sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="previous"><i class="angle left icon"></i></a>', $this.params.language.paginate.previous, $this.params.ui.elementID);
                sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="next"><i class="angle right icon"></i></a>', $this.params.language.paginate.next, $this.params.ui.elementID);
                sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="last"><i class="double angle right icon"></i></a>', $this.params.language.paginate.last, $this.params.ui.elementID);
                sb.appendFormat('</div>');

                //sb.appendFormat('    </td>');
                $("#" + $this.params.ui.elementID + " tfoot > tr > td").html(sb.toString());
                $this.setupHelpers.setupPaging();
            }
        }

    };
    this.renderEmptyDataRow = function () {
        if ($this.params.ui.displayEmptyMessage) {
            var sb = new StringBuilder();
            var ccount = ($this.params.columns !== undefined) ? $this.params.columns.length || 1 : 1;
            sb.appendFormat('<tr class="empty-row"><td colspan="6000">{0}</td></tr>',
                $this.params.ui.emptyMessageRenderer($this.params.language.emptyTableMessage)
            );
            $this.internals.plotOnBody(sb, "#" + $this.params.ui.elementID);
        }
    };
    this.renderErrorDataRow = function () {
        var sb = new StringBuilder();
        var ccount = ($this.params.columns !== undefined) ? $this.params.columns.length || 1 : 1;
        sb.appendFormat('<tr class="error-row"><td colspan="60000">{0}</td></tr>',
            $this.params.ui.errorMessageRenderer($this.params.language.errorGettingDataMessage)
        );
        $this.internals.plotOnBody(sb, "#" + $this.params.ui.elementID);
    };
    this.emptyMessageRendererFunction = function (message) {
        return '<h1>*</h1>'.replace("*", message);
    };
    this.errorMessageRendererFunction = function () {
        return '<div class="error-message">error getting server data</div>';
    };
    this.removeEmptyDataRow = function () {
        $(".empty-row").detach();
    };
    this.removeErrorRow = function () {
        $(".error-row").detach();
    };
    this.removeAfterAddedRowsClass = function () {
        setTimeout(function () {
            $("#" + $this.params.ui.elementID + " tbody > tr").removeClass("added-after-row");
        }, 500);

    };
    this.renderChangedCell = function(cInfo,rd,position){
        var row = $('#' + $this.params.ui.elementID + ' tbody > tr')[position];
        var sb = new StringBuilder();
        $this.internals.renderCellData($this,rd, cInfo.cellData, sb,position);
        $($(row).children("td")[cInfo.index]).html(sb.toString());
        var tTd = $($(row).children("td")[cInfo.index]);
        tTd.removeClass("changed-cell-1");
        tTd.addClass("changed-cell-1");
        setTimeout(function () {
            tTd.removeClass("changed-cell-1");
        }, 500);

    }
    this.renderSortingIndicator = function (column, sortDir) {
        var isAscending = sortDir != "desc";
        var cssClass = (isAscending) ? "sorted ascending":"sorted descending";
        $("#" + $this.params.ui.elementID + " th").removeClass("sorted ascending descending");
        $("#" + $this.params.ui.elementID + ' th[data-bindingsource="'+column+'"]').addClass(cssClass);
        //$("#" + $this.params.ui.elementID + " th").addClass(cssClass);

    }
};
/**
 * Created by anderson.santos on 07/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.setupHelpers = function (t) {
    var $this = t;
    this.ensureColumns = function (dataRow) {
        if ($this.params.columns === undefined) {
            var keys = Object.keys(dataRow);
            $this.params.columns = [];
            keys.forEach(function (it) {
                var columnDefinition = {
                    bindingSource: it,
                    renderer: "text"
                };
                $this.params.columns.push(columnDefinition);
            });
            return true;
        }
        else {
            return false;
        }
    };
    this.setupSorting = function () {
        if ($this.params.ui.allowSorting) {
            $("#" + $this.params.ui.elementID).addClass("sortable");
            $("#" + $this.params.ui.elementID + " th").click(function (e) {
                var el = $(e.currentTarget);
                var bs = el.data("bindingsource");
                if (!el.hasClass("unsortable")) {
                    var isAscending = el.hasClass("sorted ascending");
                    var sortOrder = (isAscending)?"desc":"asc";
                    $this.renderingHelpers.renderSortingIndicator(bs,sortOrder);
                    if (bs != "") {
                        $this.sorting.sortCol = bs;
                        $this.sorting.sortDir = (isAscending) ? "desc" : "asc";
                        $this.params.paging.currentPage = 1;
                        $this.renderingHelpers.renderTableRows();
                    }
                }
            });
        }
    };
    this.setupPaging = function () {
        var baseid = $this.params.ui.elementID;
        var inputID = "#" + baseid + "_paginginput";
        var btCL = "." + baseid + "-paging-button";
        var doPagingAction = function (src) {
            var action = $(src.currentTarget).data("paging-action");
            switch (action) {
                case "first":
                case "previous":
                case "next":
                case "last":
                    $this.gotoPage(action);
                    break;
                case "specific":
                    $this.gotoPage($(inputID).val());
                    break;
            }
        };
        $(btCL).click(doPagingAction);
        $(inputID).keyup(function (e) {
            if (e.keyCode == 13) {
                doPagingAction(e);
            }
        });
    }
};
/**
 * Created by anderson.santos on 07/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.runtimeHelpers = function (t) {
    var $this = t;
    this.getRows = function (callback) {
        var getDataCallback = function (result, status, info) {
            if (status == "error") {
                console.error("error getting table rows with:","result: ", result,"info: ",info);
                $this.renderingHelpers.renderErrorDataRow();
                //renderError()
            }
            else {
                callback(result);
            }
        };
        if ($this.params.tableData.dataSource !== undefined) {
            var dsType = typeof $this.params.tableData.dataSource;
            if (dsType == "function") {
                var p = {
                    paging: $this.params.paging,
                    filter: $this.filterExpression,
                    sorting: $this.sorting
                };
                $this.params.tableData.dataSource(p, getDataCallback);
            }
            else if (dsType == "string") {
                var url = $this.params.tableData.dataSource;
                //paging
                url = rz.utils.uri.mergeParam(url, "paging", $this.params.paging.enablePaging);
                url = rz.utils.uri.mergeParam(url, "curpage", $this.params.paging.currentPage);
                url = rz.utils.uri.mergeParam(url, "psize", $this.params.paging.pageSize);
                //sorting
                url = rz.utils.uri.mergeParam(url, "sortcol", $this.sorting.sortCol);
                url = rz.utils.uri.mergeParam(url, "sortdir", $this.sorting.sortDir);
                //filtering
                url = rz.utils.uri.mergeParam(url, "filter", btoa(JSON.stringify($this.filterExpression)));
                ruteZangada.get(url, getDataCallback);
            }
            else {
                console.error("invalid data source type: ", dsType);
                $this.renderingHelpers.renderErrorDataRow();
            }
        }
        else {
            $this.renderingHelpers.renderEmptyDataRow();
        }
    };
    //todo Levar estes m�todos para o ruteZangada
    this.enqueuePostRenderScript = function (f) {
        $this.postRenderScripts.push(f);
    };

    this.executePostRenderScripts = function () {
        $this.postRenderScripts.forEach(function (it) {
           try{
               it($this);
           }
           catch(err){
               console.error("error running postRenderScript","error:",err, "sender:",$this,"script:",it);
           }
        });
        $this.postRenderScripts = [];
    };
    this.getColumnInfo = function (cellName) {
        var info = {};
        info.index = $this.params.columns.findIndex(
            function (element, index, array) {
                var result = element.bindingSource == cellName;
                if (result) info.cellData = element;
                return result;
            }
        );
        return info;
    };

};
/**
 * Created by anderson.santos on 06/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.Internals = {
    resolveHeaderClass: function (col) {
        var classData = "";
        //column size
        if (col.size !== undefined) {
            classData += rz.widgets.tableHelpers.sizeNames[col.size] + " wide ";
        }
        //column alignement
        var align = col.headerAlignment || col.alignment || "left";
        if (align != "left") {
            classData += align + " aligned "
        }
        if (col.sortable === undefined) col.sortable = true;
        if (!col.sortable) {
            classData += " unsortable ";
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    },
    plotOnBody: function (sb, target, preserve,position) {
        if (!preserve) {
            $(target + " tbody").empty();
            $(target + " tbody").html(sb.toString());
        }
        else{
            if(position===undefined){
                $(target + " tbody").append(sb.toString());
            }
            else{
                $(target + " tbody > tr").eq(position).before(sb.toString());
            }
        }
    },
    getServerData: function (target, params) {
        ruteZangada.get(params.rowsData, function (d, r) {
            if (r == "success") {
                var url = params.rowsData;
                params.rowsData = d;
                params.sourceURL = url;
                renderRowsData(target, params, hasColumnDefinitions);
                //todo wait and display progress
            }
            else {
                $("#" + params.elementID).append(params.errorMessageRenderer());
            }
        });
    },
    isEmptyResult: function (r) {
        return !(r !== undefined && (r.length > 0 || (r.rows !== undefined && r.rows.length > 0)));
    },
    ensureDataSource: function (dataRows) {
        /*ensures dataRows with the following format:
         {
         header:{},
         rowsData:[]
         }
         */
        if (dataRows.header !== undefined && dataRows.rows !== undefined) {
            return dataRows;
        }
        else {
            return {
                header: {
                    currentPage: 1,
                    totalPages: 1,
                    sortColumn: "",
                    sortDir: ""
                },
                rows: dataRows
            }
        }
    },
    resolveTDClass: function (col) {
        var classData = "";
        //column alignement
        if (col.alignment !== undefined && col.alignment != "left") {
            classData += col.alignment + " aligned "
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    },
    renderCellData: function ($this, rowData, colData, sb, rowIndex) {
        var renderer = rz.widgets.tableHelpers.getCellRenderer(colData.cellRenderer || 'default');
        sb.append(renderer(rowData[colData.bindingSource], rowData, colData, $this, rowIndex));
    }
};
/**
 * Created by Anderson on 27/01/2016.
 */
rz.widgets.tableHelpers.createCellRenderer("actions-renderer", function (value, full, columnDef,targetInstance) {
    var sb = new StringBuilder();
    sb.appendFormat('<div id="{1}-{0}" class="ui icon top right basic pointing dropdown button table-actions-button" data-rowref="{0}">',
        full.__uid,
        targetInstance.params.ui.elementID
    );
    sb.append('  <i class="ellipsis vertical icon"></i>');
    sb.append('  <div class="menu">');
    //sb.append('    <div class="header">Ações</div>');
    columnDef.actions.forEach(function (it) {
        sb.appendFormat('    <div class="item" data-value="{1}">{0}</div>',it.label,it.action);
    });

    sb.append('  </div>');
    sb.append('</div>');

    targetInstance.runtimeHelpers.enqueuePostRenderScript(function () {
        //full.__uid targetInstance.params.ui.elementID
        var selector1 = '#' + targetInstance.params.ui.elementID + '-' + full.__uid;
        $(selector1).dropdown(
            {
                action: "hide",
                onChange: function(action) {
                    var rowRef = $(this).data("rowref");
                    var rowData = targetInstance.rowsData.find(function(it){return it.__uid==rowRef});
                    columnDef.clickHandler(action,rowData,rowRef);
            }}
        );
    });

    return sb.toString();

});


/**
 * Created by Anderson on 18/01/2016.
 */
rz.widgets.tableHelpers.createCellRenderer("default", function (value) {
    return value;
});
/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", rz.widgets.RZTableWidgetHelpers.TableWidgetInterface, [], function () {

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
});