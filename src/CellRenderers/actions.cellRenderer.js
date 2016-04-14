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

