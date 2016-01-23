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

        initialized($this.params);
    };

    this.render = function (target, params) {
        ensureColumns();
        var sb = new StringBuilder();
        sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass, params.elementID);
        renderTableHead(sb, params);
        renderTableBody(sb, params);
        sb.append('</table>');
        $("#" + target).append(sb.toString());
    };

    var emptyMessageRendererFunction = function (message) {
        return '<h1>*</h1>'.replace("*",message);
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
        if (params.rowsData !== undefined) {
            if (typeof(params.rowsData) == "object") {
                renderDataRows(sb, params.rowsData)
            }
            else {
                //todo getFromServerFirstThenRender();
            }
        }
        sb.append('</tbody>');
    };

    var resolveTDClass = function (col) {
        var classData = "";
        //column alignement
        if (col.alignment !== undefined && col.alignment != "left") {
            classData += col.alignment + " aligned "
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    };

    var renderDataRows = function (sb, rowData, isAfterAddedRow) {
        rowData.forEach(function (it) {
            sb.appendFormat('<tr{0}>', (isAfterAddedRow) ? ' class="' + $this.params.addedAfterRowClass + '"' : '');
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td{0}>', resolveTDClass(col));
                var renderer = rz.widgets.tableHelpers.getCellRenderer(col.cellRenderer || 'default');
                sb.append(renderer(it[col.bindingSource], it));
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
    this.getRowCount = function () {
        return $('#' + this.params.elementID + ' tbody > tr').length;
    };

    this.addRows = function (rowData) {
        var html = getNewRowHTML(rowData);
        $this.params.rowsData = $this.params.rowsData.concat(rowData);
        $('#' + this.params.elementID + ' tbody').append(html);
    };

    this.insertRows = function (position, rowData) {
        if (position < 0 || position >= this.getRowCount()) {
            this.addRows(rowData);
        }
        else {
            var html = getNewRowHTML(rowData);
            $this.params.rowsData.splice.apply($this.params.rowsData, [position, 0].concat(rowData));
            //$this.params.rowsData.concat(rowData);
            $('#' + this.params.elementID + ' tbody > tr').eq(position).before(html);
        }

    };

    this.getRowData = function (position) {
        var tprd = $this.params.rowsData;
        return (tprd !== undefined && tprd.length > position) ? $this.params.rowsData[position] : undefined;
    };

    this.clear = function () {
        var ccount = $this.params.columns.length;
        $('#' + this.params.elementID + ' tbody').empty();
        if ($this.params.displayEmptyMessage) {
            $('#' + this.params.elementID + ' tbody').append('<tr class="empty-row"><td colspan="*">*</td></tr>'
                .replace("*", ccount.toString())
                .replace("*",$this.params.emptyMessageRenderer($this.params.emptyTableMessage))
            );
        }
        $this.params.rowsData = [];
    }

});