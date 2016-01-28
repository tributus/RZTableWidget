/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", rz.widgets.RZTableWidgetHelpers.TableWidgetInterface, [], function () {
    var $this = this;

    this.initialize = function (params, initialized) {
        //set params
        $this.params = params;
        $this.params.tableClass = params.tableClass || "ui basic table";
        $this.params.renderTableHead = (params.renderTableHead === undefined) ? true : !!params.renderTableHead;
        $this.params.elementID = params.id || generateRandomID(8);
        $this.params.addedAfterRowClass = params.addedAfterRowClass || "added-after-row";
        $this.params.displayEmptyMessage = (params.displayEmptyMessage === undefined) ? true : !!params.displayEmptyMessage;
        $this.params.emptyTableMessage = params.emptyTableMessage || "empty";
        $this.params.emptyMessageRenderer = params.emptyMessageRenderer || emptyMessageRendererFunction;
        $this.params.errorMessageRenderer = params.errorMessageRenderer || errorMessageRendererFunction;

        initialized($this.params);
    };

    this.render = function (target, params) {
        if(typeof(params.rowsData)=="string"){
            getServerData(target,params);
        }
        else{
            renderRowsData(target,params);
        }
    };

    var getServerData = function (target,params) {
        var hasColumnDefinitions = params.columns !==undefined;
        if(hasColumnDefinitions){
            var sb = new StringBuilder();
            sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass, params.elementID);
            renderTableHead(sb,params);
            sb.appendFormat('</table>');
            $("#" + target).append(sb.toString());
        }
        ruteZangada.get(params.rowsData, function (d, r) {
            if(r=="success"){
                var url = params.rowsData;
                params.rowsData = d;
                params.rowsData["sourceURL"] = url;
                renderRowsData(target,params,hasColumnDefinitions);
                //todo wait and display progress
            }
            else{
                $("#"+params.elementID).append(params.errorMessageRenderer());
            }
        });
    };

    var renderRowsData = function (target,params,onlyRows) {
        var sb = new StringBuilder();

        if(!onlyRows){
            ensureColumns();
            sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass, params.elementID);
            renderTableHead(sb, params);
            renderTableBody(sb, params);
            sb.append('</table>');
            $("#" + target).append(sb.toString());
        }
        else{
            renderTableBody(sb, params);
            $("#" + params.elementID + " tbody").detach();
            $("#" + params.elementID).append(sb.toString());
        }

        //todo implementar em ruteZangada após a renderização do widget (widgetRendered_event
        var executeAfterRenderScripts = function () {
            postRenderScripts.forEach(function (it) {
                it();
            });
        };

        executeAfterRenderScripts();
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

    var renderTableHead = function (sb, params) {
        if (params.renderTableHead) {
            sb.append('<thead>');
            sb.append('<tr>');
            params.columns.forEach(function (col) {
                sb.appendFormat('<th{0}>', resolveHeaderClass(col));
                var renderer = rz.widgets.tableHelpers.getCellRenderer(col.headerRender || 'default');
                var value = col.headerText || col.bindingSource;
                sb.append(renderer(value, col));
                sb.append('</th>');

            });
            sb.append('</tr>');
            sb.append('</thead>');
        }
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
        return (classData != "") ? ' class="' + classData + '"' : "";
    };

    var renderTableBody = function (sb, params) {
        sb.append('<tbody>');
        if(params.rowsData !==undefined && params.rowsData.length > 0){
            renderDataRows(sb, params.rowsData);
        }
        else{
            if ($this.params.displayEmptyMessage) {
                renderEmptyDataRow(sb);
            }
        }

        sb.append('</tbody>');
    };

    var renderEmptyDataRow = function (sb) {
        var ccount = $this.params.columns.length;
        sb.appendFormat('<tr class="empty-row"><td colspan="{0}">{1}</td></tr>',ccount.toString(),
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

    var renderCellData = function (rowData, colData,sb) {
        var renderer = rz.widgets.tableHelpers.getCellRenderer(colData.cellRenderer || 'default');
        sb.append(renderer(rowData[colData.bindingSource], rowData,colData,$this));
    };

    var renderDataRows = function (sb, rowData, isAfterAddedRow) {
        rowData.forEach(function (it) {
            sb.appendFormat('<tr{0}>', (isAfterAddedRow) ? ' class="' + $this.params.addedAfterRowClass + '"' : '');
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td{0}>', resolveTDClass(col));
                renderCellData(it, col,sb);
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

    var getNewRowHTML = function (rowData) {
        var sb = new StringBuilder();
        if (Object.prototype.toString.call(rowData) != "[object Array]") {
            rowData = [rowData];
        }
        renderDataRows(sb, rowData, true);
        return sb.toString();
    };

    var removeChangeAnimationClass = function () {
        setTimeout(function () {
            $('#' + $this.params.elementID + ' tbody > tr').removeClass($this.params.addedAfterRowClass);
        },500);
    };

    var getColumnInfo = function (cellName) {
        var info = {};
        info.index = $this.params.columns.findIndex(
            function (element, index, array) {
                var result = element.bindingSource == cellName;
                if(result) info.cellData = element;
                return result;
            }
        );
        return info;
    };

    this.getRowCount = function () {
        return $('#' + this.params.elementID + ' tbody > tr').length;
    };

    this.addRows = function (rowData) {
        var html = getNewRowHTML(rowData);
        $this.params.rowsData = $this.params.rowsData.concat(rowData);
        $('#' + this.params.elementID + ' tbody').append(html);
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

    this.changeCellData = function (position, cellName, newValue) {
        if (position >= 0 && position < this.getRowCount()) {
            $this.params.rowsData[position][cellName] = newValue;
            var cInfo = getColumnInfo(cellName);
            if(cInfo.index != -1){
                var row = $('#' + this.params.elementID + ' tbody > tr')[position];
                var sb = new StringBuilder();
                renderCellData($this.params.rowsData[position], cInfo.cellData,sb);
                $($(row).children("td")[cInfo.index]).html(sb.toString());
                var tTd = $($(row).children("td")[cInfo.index]);
                tTd.addClass("changed-cell-1");
               setTimeout(function () {
                    tTd.removeClass("changed-cell-1");
                },500);
            }
            else{
                throw "INVALID CELL";
            }
        }
        else {
            throw "INVALID POSITION";
        }
    }
});