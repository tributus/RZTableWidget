/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", rz.widgets.RZTableWidgetHelpers.TableWidgetInterface , [], function () {
    var $this = this;

    this.initialize = function (params, initialized) {
        $this.params = params;
        $this.params.tableClass = params.tableClass || "ui celled table";
        $this.params.renderTableHead = (params.renderTableHead === undefined) ? true : !!params.renderTableHead;
        $this.params.elementID = params.id || generateRandomID(8);
        //set params
        initialized($this.params);
    };

    this.render = function (target, params) {
        ensureColumns();
        var sb = new StringBuilder();
        sb.appendFormat('<table id="{1}" class="{0}">', params.tableClass,params.elementID);
        renderTableHead(sb, params);
        renderTableBody(sb, params);
        sb.append('</table>');
        $("#" + target).append(sb.toString());
    };

    var renderTableHead = function (sb, params) {
        if(params.renderTableHead){
            sb.append('<thead>');
            sb.append('<tr>');

            params.columns.forEach(function (col) {
                sb.appendFormat('<th{0}>',resolveHeaderClass(col));
                var renderer = rz.widgets.tableHelpers.getCellRenderer(col.headerRender || 'default');
                var value = col.headerText || col.bindingSource;
                sb.append(renderer(value,col));
                sb.append('</th>');

            });

            sb.append('</tr>');
            sb.append('</thead>');

        }
    };

    var resolveHeaderClass = function (col) {
        var classData = "";
        //column size
        if(col.size !==undefined){
            classData += rz.widgets.tableHelpers.sizeNames[col.size] +  " wide";
        }
        return (classData !="")? ' class="'+classData+'"':"";
    };

    var renderTableBody = function (sb, params) {
        sb.append('<tbody>');
        if (params.rowsData !== undefined) {
            if (typeof(params.rowsData) == "object") {
                renderDataRows(sb, params.rowsData)
            }
            else {
                //getFromServerFirstThenRender();
            }
        }
        sb.append('</tbody>');
    };

    var renderDataRows = function (sb, rowData) {
        rowData.forEach(function (it) {
            sb.appendFormat('<tr>');
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td>');
                var renderer = rz.widgets.tableHelpers.getCellRenderer(col.cellRenderer || 'default');
                sb.append(renderer(it[col.bindingSource],it));
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

    this.addRows = function (rowData) {
        var sb = new StringBuilder();
        if(Object.prototype.toString.call(rowData)!="[object Array]"){
            rowData = [rowData];
        }
        renderDataRows(sb,rowData);
        $this.params.rowsData = $this.params.rowsData.concat(rowData);
        $('#'+ this.params.elementID + ' tbody').append(sb.toString());
    };

    this.getRowData = function (position) {
        var tprd = $this.params.rowsData;
        return (tprd !== undefined && tprd.length > position) ? $this.params.rowsData[position] : undefined;
    };


});