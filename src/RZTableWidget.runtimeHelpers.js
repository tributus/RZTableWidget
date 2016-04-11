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
    //todo Levar estes métodos para o ruteZangada
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