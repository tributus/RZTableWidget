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
                    $("#" + $this.params.ui.elementID + " th").removeClass("sorted ascending descending");
                    var cssClass = (isAscending) ? "sorted descending" : "sorted ascending";
                    el.addClass(cssClass);
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