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
            sb.appendFormat('<tr class="empty-row"><td colspan="6000">{0}</td></tr>',
                $this.params.ui.emptyMessageRenderer($this.params.language.emptyTableMessage)
            );
            $this.internals.plotOnBody(sb, "#" + $this.params.ui.elementID);
        }
    }; 
    this.renderErrorDataRow = function () {
        var sb = new StringBuilder();
        sb.appendFormat('<tr class="error-row"><td colspan="60000">{0}</td></tr>',
            $this.params.ui.errorMessageRenderer($this.params.language.errorGettingDataMessage)
        );
        $this.internals.plotOnBody(sb, "#" + $this.params.ui.elementID);
    };
    this.emptyMessageRendererFunction = function (message) {
        return '<p>*</p>'.replace("*", message);
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