/**
 * Created by anderson.santos on 18/01/2016.
 */
rz.widgets.TableWidget = ruteZangada.widget("rz-table", ["getDataRowAt"], [], function () {
    var $this = this;

    this.initialize = function (params, initialized) {
        $this.params = params;
        $this.params.tableClass = params.tableClass || "ui celled table";
        $this.params.renderTableHead = (params.renderTableHead === undefined) ? true : !!params.renderTableHead;
        //set params
        initialized($this.params);
    };

    this.render = function (target, params) {
        ensureColumns();
        var sb = new StringBuilder();
        sb.appendFormat('<table class="{0}">', params.tableClass);
        renderTableHead(sb, params);
        renderTableBody(sb, params);
        sb.append('</table>');
        $("#" + target).append(sb.toString());
    };

    var renderTableHead = function (sb, params) {
        //sb.append('<thead>');
        //sb.append('<tr>');
        //sb.append('<th>Name</th><th>Age</th><th>Gender</th>');
        //sb.append('</tr>');
        //sb.append('</thead>');
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

    //rowData = [
    //  {name:'Anderson',age:'38',gender:'m'}
    //  {name:'natty',age:'30',gender:'f'}
    // ]

    var renderDataRows = function (sb, rowData) {
        var keys = undefined;
        var numCols = 0;
        rowData.forEach(function (it) {
            sb.appendFormat('<tr>');
            //first row defines data format
            //if(keys===undefined) {
            //    keys = Object.keys(it);
            //    numCols = keys.length;
            //}
            $this.params.columns.forEach(function (col) {
                sb.appendFormat('<td>');
                sb.append(it[col.name]);
                //renderColUsingProperColRenderer(col.name,col.renderer);
                sb.appendFormat('</td>');
            });


            sb.appendFormat('</tr>');
        });
    };

    var ensureColumns = function () {
        if ($this.params.columns === undefined) {
            var dataRow = $this.getDataRowAt(0);
            var keys = Object.keys(dataRow);
            $this.params.columns = [];
            keys.forEach(function (it) {
                var columnDefinition = {
                    name: it,
                    renderer: "text"
                };
                $this.params.columns.push(columnDefinition);
            });
        }
    };

    this.getDataRowAt = function (position) {
        var tprd = $this.params.rowsData;
        return (tprd !== undefined && tprd.length > position) ? $this.params.rowsData[position] : undefined;
    };


});