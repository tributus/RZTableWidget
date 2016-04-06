/**
 * Created by anderson.santos on 06/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.Internals = {
    resolveHeaderClass : function (col) {
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
    },
    plotOnBody : function (sb, target,preserve) {
        if(!preserve){
            $(target + " tbody").empty();
        }
        $(target + " tbody").html(sb.toString());
    },
    getServerData : function (target, params) {
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
        return !(r!==undefined && (r.length > 0 ||(r.rows!==undefined && r.rows.length > 0)));
    },
    ensureDataSource:function(dataRows){
        /*ensures dataRows with the following format:
        {
            header:{},
            rowsData:[]
        }
        */
        if(dataRows.header!==undefined && dataRows.rows !==undefined){
            return dataRows;
        }
        else{
            return {
                header:{
                    currentPage:1,
                    totalPages:1,
                    sortColumn:"",
                    sortDir:""
                },
                rows:dataRows
            }
        }
    },
    resolveTDClass : function (col) {
        var classData = "";
        //column alignement
        if (col.alignment !== undefined && col.alignment != "left") {
            classData += col.alignment + " aligned "
        }
        return (classData != "") ? ' class="' + classData + '"' : "";
    },
    renderCellData : function ($this,rowData, colData, sb, rowIndex) {
        var renderer = rz.widgets.tableHelpers.getCellRenderer(colData.cellRenderer || 'default');
        sb.append(renderer(rowData[colData.bindingSource], rowData, colData, $this, rowIndex));
    }

};