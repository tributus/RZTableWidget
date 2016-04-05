/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", rz.widgets.RZTableWidgetHelpers.TableWidgetInterface, [], function () {
    var $this = this;
    var sortingHelper = rz.widgets.RZTableWidgetHelpers.sortingHelpers;

    this.initialize = function (params, initialized) {
        var defaultParams = {
            tableData:{
                dataSource:undefined,
                getDataMethod:function(src,callback){
                    //callback(status,result); //where result contains {header(pagingInfo) and rowsSource([array-of-objects])}
                }
            },
            columns:undefined,
            ui:{
                tableClass:"ui basic table",                            //initial table style
                renderTableHead:true,                                   //define if table header will be rendered
                elementID:generateRandomID(8),                          //root element id;
                addedAfterRowClass:"added-after-row",                   //css class to associate with new added rows
                displayEmptyMessage:true,                               //define if empry message will be displayed
                displayTableFooter:false,                               //define if table footer will be rendered
                emptyTableMessage: "no data to display",                //empty message
                emptyMessageRenderer: emptyMessageRendererFunction,     //default renderer for empty messages
                errorMessageRenderer:errorMessageRendererFunction       //default renderer for error messages
            },
            language:{                                                  //localized strings for widget
                paginate:{                                              //localized strings for pagination
                    page: "Page",                                       //"Page" localized string
                    of:"of",                                            //"of" localized string
                    first:"first",                                      //"first" localized string
                    previous:"previous",                                //"previous" localized string
                    next:"next",                                        //"next" localized string
                    last:"last"                                         //"last" localized string
                }
            },
            paging:{                                                    //pagination definition for plugin
                enablePaging:false,                                     //enables or disable paging
                pageSize:20,                                            //default page size
                currentPage:1                                           //default page
            }
        };
        $this.params = $.extend(defaultParams,params);
        initialized();
    };

    this.render = function (target) {
        renderTableStructure(target,renderTableRows);
    };

    var renderTableStructure = function (target,renderRowsMethod) {
        var sb = new StringBuilder();
        sb.appendFormat('<table id="{1}" class="{0}">', $this.params.ui.tableClass, $this.params.ui.elementID);
        if($this.params.columns !== undefined){
            renderTableHeader(sb);
        }
        if($this.params.paging.enablePaging || $this.params.ui.displayTableFooter){
            renderTableFooter(sb);
        }
        sb.appendFormat('</table>');
        $('#' + target).html(sb.toString());
    };

    /**********************ATENÇÃO*****************************/
    /*ESTE DEVE SER O ÚNICO MÉTODO RESPONSÁVEL PELA RENDERIZAÇÃO DO TABLE HEADER, INDEPENDENTE DA ESTRATÉGIA*/
    /*ÇEJE FIEL A ISTO*/
    var renderTableHeader = function (sb) {
        //columnRefs pode ser: Objeto de definição de colunas SEMPRE.
        //Quando não for definido, a mesma deverá ser criada à partir de uma amostra (obj) cujas colunas serão extraídas
        //e sua definição criada em $this.params.columns (ensureColumnDefs)


        if ($this.params.ui.renderTableHead && $this.params.columns!==undefined) {
            sb.append('<thead>');
            sb.append('<tr>');
            $this.params.columns.forEach(function (col) {
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


    var renderTableRows = function () {

    };

    var resolveHeaderClass = function (col) {
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
        if(col.sortable===undefined) col.sortable=true;
        if(!col.sortable){
            classData += " unsortable ";
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    };

    var renderTableFooter = function (sb) {
        sb.appendFormat('<tfoot></tfoot>');
    };
//---------------------------------------------------------------------------------------------------------------------------------------------
    var getServerData = function (target, params) {
        var hasColumnDefinitions = params.columns !== undefined;
        if (hasColumnDefinitions) {
            var sb = new StringBuilder();
            sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass, params.elementID);
            renderTableHead(sb, params);
            sb.appendFormat('</table>');
            $("#" + target).append(sb.toString());
        }
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
    };

    //todo implementar em ruteZangada após a renderização do widget (widgetRendered_event
    var executeAfterRenderScripts = function (bypassSetupHeaders) {
        postRenderScripts.forEach(function (it) {
            it();
        });
        postRenderScripts = [];
        if(!bypassSetupHeaders){
            setupSortableTable();
            setupPaging();
        }
    };

    var setupPaging = function(){
        var baseid = $this.params.elementID;
        var inputID = "#" + baseid + "_paginginput";
        var btCL = "." + baseid + "-paging-button";
        var doPagingAction = function(src){
            var action = $(src.currentTarget).data("paging-action");
            switch(action){
                case "first":
                case "previous":
                case "next":
                case "last": $this.gotoPage(action); break;
                case "specific": $this.gotoPage($(inputID).val()); break;
            }
        };
        $(btCL).click(doPagingAction);
        $(inputID).keyup(function(e){
            if(e.keyCode == 13)
            {
                doPagingAction(e);
            }
        });
    };

    var setupSortableTable = function () {
        var isSortable = $("#" + $this.params.elementID).hasClass("sortable");
        if(isSortable){
            $("#" + $this.params.elementID + " th").click(function (e) {
                var el = $(e.currentTarget);
                var bs = el.data("bindingsource");
                if(!el.hasClass("unsortable")){
                    var isAscending = el.hasClass("sorted ascending");
                    $("#" + $this.params.elementID + " th").removeClass("sorted ascending descending");
                    var cssClass = (isAscending) ? "sorted descending": "sorted ascending";
                    el.addClass(cssClass);
                    if(bs!=""){
                        var sortData = {
                            column:bs,
                            sortDir: (isAscending) ? "desc": "asc"
                        };
                        $this.sort(sortData);
                    }
                }
            });
        }
    };

    var renderRowsData = function (target, params, onlyRows) {
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
    };

    //todo Levar estes métodos para o ruteZangada
    var postRenderScripts = [];
    this.registerAfterRenderScript = function (f) {
        postRenderScripts.push(f);
    };

    var emptyMessageRendererFunction = function (message) {
        return '<h1>*</h1>'.replace("*", message);
    };

    var errorMessageRendererFunction = function () {
        return '<tbody><tr><td class="error-message">error getting server data</td></tr></tbody>';
    };

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
    */


    var renderTableBody = function (sb, params) {
        sb.append('<tbody>');
        if (params.rowsData !== undefined && params.rowsData.length > 0) {
            renderDataRows(sb, params.rowsData);
        }
        else {
            if ($this.params.displayEmptyMessage) {
                renderEmptyDataRow(sb);
            }
        }
        sb.append('</tbody>');
        renderTableFooter(sb,params);
    };

    var calculateTotalPages = function(rowsData,pageSize){
        var totalPages =  Math.ceil(rowsData.length/pageSize);
        $this.params.paging.totalPages = totalPages;
        return totalPages;
    };

    var renderTableFooterXXXXXXXX = function (sb, params) {
        if(params.paging !==undefined && params.paging.enablePaging){
            sb.appendFormat('<tfoot>');
            sb.appendFormat('   <tr><td colspan="{0}">',params.columns.length);

            sb.appendFormat('<div class="ui right floated pagination menu">');
            sb.appendFormat('    <div style="padding: 10px 5px">{0} </div><input id="{4}_paginginput" type="text" style="width: 60px;text-align: center;border: none;outline: none;" value="{2}" data-paging-action="specific"> <div style="padding: 10px 5px">{1} {3}</div>',
                $this.params.language.paginate.page,
                $this.params.language.paginate.of,
                $this.params.paging.currentPage,
                calculateTotalPages(params.rowsData,params.paging.pageSize),
                $this.params.elementID
            );
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="first"><i class="double angle left icon"></i></a>',$this.params.language.paginate.first,$this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="previous"><i class="angle left icon"></i></a>',$this.params.language.paginate.previous,$this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="next"><i class="angle right icon"></i></a>',$this.params.language.paginate.next,$this.params.elementID);
            sb.appendFormat('    <a class="icon item {1}-paging-button" title="{0}" data-paging-action="last"><i class="double angle right icon"></i></a>',$this.params.language.paginate.last,$this.params.elementID);
            sb.appendFormat('</div>');

            sb.appendFormat('    </td>');
            sb.appendFormat('    </tr>');
            sb.appendFormat('    </tfoot>');
        }
    };

    var renderEmptyDataRow = function (sb) {
        var ccount = $this.params.columns.length;
        sb.appendFormat('<tr class="empty-row"><td colspan="{0}">{1}</td></tr>', ccount.toString(),
            $this.params.emptyMessageRenderer($this.params.emptyTableMessage));
    };

    var removeEmptyDataRow = function () {
        $('#' + $this.params.elementID + ' .empty-row').detach();
    };

    var resolveTDClass = function (col) {
        var classData = "";
        //column alignement
        if (col.alignment !== undefined && col.alignment != "left") {
            classData += col.alignment + " aligned "
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    };

    var renderCellData = function (rowData, colData, sb, rowIndex) {
        var renderer = rz.widgets.tableHelpers.getCellRenderer(colData.cellRenderer || 'default');
        sb.append(renderer(rowData[colData.bindingSource], rowData, colData, $this, rowIndex));
    };

    var getDataPage = function (rowData,params) {
        if(params.paging!==undefined && params.paging.enablePaging){
            if(params.paging.pageSize >=rowData.length){
                return rowData;
            }
            else{
                var pSize = params.paging.pageSize;
                var curPage = params.paging.currentPage;
                var startIndex = (curPage -1) * pSize;
                var endIndex = startIndex + pSize;
                return rowData.slice(startIndex,endIndex);
            }
        }
        else{
            return rowData;
        }
    };

    var renderDataRows = function (sb, rowData, isPostAddedRow) {
        var page = getDataPage(rowData,$this.params);
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

    var ensureColumns = function () {
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
    };

    var getNewRowHTML = function (rowData,isRefresh) {
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

    var getColumnInfo = function (cellName) {
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

    var getTableRequestParams = function () {
        var paramObj = {
            page:$this.params.paging.currentPage || 1, //todo $this.currentPage
            filter:$this.currentFilter, //todo $this.currentFilter
            sortColumn: $this.sortColumn,
            sortDirection:$this.sortDir
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

    this.getRowCount = function () {
        return $('#' + this.params.elementID + ' tbody > tr').length;
    };

    this.addRows = function (rowData) {
        var html = getNewRowHTML(rowData);
        $this.params.rowsData = $this.params.rowsData.concat(rowData);
        $('#' + this.params.elementID + ' tbody').append(html);
        executeAfterRenderScripts(true);
        removeEmptyDataRow();
        removeChangeAnimationClass();
    };

    this.refresh = function(){
        var html = getNewRowHTML($this.params.rowsData,true);
        $('#' + this.params.elementID + ' tbody').empty();
        $('#' + this.params.elementID + ' tbody').append(html);
        executeAfterRenderScripts(true);
        removeEmptyDataRow();
        removeChangeAnimationClass();
    };

    this.insertRows = function (position, rowData) {
        if (position < 0 || position >= this.getRowCount()) {
            this.addRows(rowData);
        }
        else {
            var html = getNewRowHTML(rowData);
            $this.params.rowsData.splice.apply($this.params.rowsData, [position, 0].concat(rowData));
            $('#' + this.params.elementID + ' tbody > tr').eq(position).before(html);
            executeAfterRenderScripts(true);
            removeEmptyDataRow();
            removeChangeAnimationClass();
        }
    };

    this.getRowData = function (position) {
        var tprd = $this.params.rowsData;
        return (tprd !== undefined && tprd.length > position) ? $this.params.rowsData[position] : undefined;
    };

    this.clear = function () {
        $('#' + this.params.elementID + ' tbody').empty();
        if ($this.params.displayEmptyMessage) {
            var sb = new StringBuilder();
            renderEmptyDataRow(sb);
            $('#' + this.params.elementID + ' tbody').append(sb.toString());
        }
        $this.params.rowsData = [];
    };

    this.sort = function (sortData) {
        var colData = sortingHelper.findColData({prop:"bindingSource", value:sortData.column},$this);
        if($this.dataSourceLocation == "local"){
            $this.gotoPage("first");
            if(sortData.sortDir=="asc"){
                if(colData.sortAscMethod!==undefined){
                    $this.params.rowsData.sort(colData.sortAscMethod);
                }
                else{
                    var columnToSort = sortData.column;
                    $this.params.rowsData.sort(sortingHelper.sortAscMethod($this,columnToSort));
                }
            }
            else{
                if(colData.sortAscMethod!==undefined){
                    $this.params.rowsData.sort(colData.sortDescMethod);
                }
                else{
                    var columnToSort = sortData.column;
                    $this.params.rowsData.sort(sortingHelper.sortDescMethod($this,columnToSort));
                }
            }
            //$('#' + this.params.elementID + ' tbody').empty();
            $this.refresh();
        }
        else{
            var originalURL = $this.params.sourceURL;
            $this.sortColumn = sortData.sortColumn;
            $this.sortDir = sortData.sortDir;
            var paramObj = getTableRequestParams();
            var pstr = btoa(JSON.stringify(paramObj));
            var url = rz.utils.uri.mergeParam(originalURL, "tableParams", pstr);

            ruteZangada.get(url, function (d, r) {
                if (r == "success") {
                    $this.params.rowsData = d;
                    $('#' + $this.params.elementID + ' tbody').empty();
                    $this.refresh();
                }
                else {
                    $("#" + params.elementID).append(params.errorMessageRenderer());
                }
            });
        }
    };

    this.changeCellData = function (position, cellName, newValue) {
        if (position >= 0 && position < this.getRowCount()) {
            $this.params.rowsData[position][cellName] = newValue;
            var cInfo = getColumnInfo(cellName);
            if (cInfo.index != -1) {
                var row = $('#' + this.params.elementID + ' tbody > tr')[position];
                var sb = new StringBuilder();
                renderCellData($this.params.rowsData[position], cInfo.cellData, sb);
                $($(row).children("td")[cInfo.index]).html(sb.toString());
                var tTd = $($(row).children("td")[cInfo.index]);
                tTd.addClass("changed-cell-1");
                setTimeout(function () {
                    tTd.removeClass("changed-cell-1");
                }, 500);
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
        if($this.dataSourceLocation == "local"){
            if($this.params.unfilteredData===undefined){
                $this.params.unfilteredData = $this.params.rowsData;
            }
            if(typeof(filterExpression)=="function"){
                $this.params.rowsData = $this.params.unfilteredData.filter(filterExpression);
            }
            else{
                var jfe = new rz.plugins.jsonFilterEngine();
                var f = jfe.buildFilterFunction(filterExpression);
                $this.params.rowsData = $this.params.unfilteredData.filter(f);
            }
            $('#' + $this.params.elementID + ' tbody').empty();
            $this.refresh();
        }
        else{
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

    this.gotoPage = function(page){
        var inputID = "#" + $this.params.elementID + "_paginginput";
        var totalPages = $this.params.paging.totalPages;
        var ensureValidPage = function (pg) {
            var n = parseInt(pg);
            if(isNaN(n)){
                return 1;
            }
            else{
                if(n < 1){
                    return 1;
                }
                else if(n > totalPages){
                    return totalPages;
                }
                else{
                    return n;
                }
            }
        };
        var currentPage = $this.params.paging.currentPage;

        switch(page){
            case "first":
                $this.params.paging.currentPage = 1;
                break;
            case "previous":
                $this.params.paging.currentPage = ensureValidPage($this.params.paging.currentPage - 1);
                break;
            case "next":
                $this.params.paging.currentPage = ensureValidPage($this.params.paging.currentPage + 1);
                break;
            case "last":
                $this.params.paging.currentPage = totalPages;
                break;
            default:
                $this.params.paging.currentPage = ensureValidPage(page);
                break;
        }
        if(currentPage !== $this.params.paging.currentPage){

            /*
            var pSize = params.paging.pageSize;
            var curPage = params.paging.currentPage;
            var startIndex = (curPage -1) * pSize;
            var endIndex = startIndex + pSize;
            return rowData.slice(startIndex,endIndex);
            */

            var p = {
                paging:{
                    pageSize:$this.params.paging.pageSize,
                    currentPage:currentPage
                }
            };
            var pgData = getDataPage($this.params.rowsData,p);
            $this.params.rowsData = pgData;
            $(inputID).val($this.params.paging.currentPage);
            $this.refresh();
        }
    }
});