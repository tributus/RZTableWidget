/**
 * Created by Anderson on 27/01/2016.
 */

rz.widgets.tableHelpers.createCellRenderer("actions-renderer", function (value, full, columnDef,targetInstance) {

    //var ref = {
    //    cellRenderer: "actions-renderer",
    //    actions: [
    //        {action: "action1", label: "Action 1"},
    //        {action: "action2", label: "Action 2"},
    //        {action: "action3", label: "Action 3"}
    //    ],
    //    clickHandler: function (action, rowData, rowIndex) {
    //
    //    }
    //};

    var sb = new StringBuilder();
    sb.append('<div class="ui icon top right basic pointing dropdown button table-actions-button">');
    sb.append('  <i class="ellipsis vertical icon"></i>');
    sb.append('  <div class="menu">');
    //sb.append('    <div class="header">Ações</div>');
    columnDef.actions.forEach(function (it) {
        sb.appendFormat('    <div class="item" data-action="{1}">{0}</div>',it.label,it.action);
    });

    sb.append('  </div>');
    sb.append('</div>');

    targetInstance.registerAfterRenderScript(function () {
        var selector1 = '#' + targetInstance.params.elementID + ' .ui.dropdown';
        var selector2 = '#' + targetInstance.params.elementID + ' .ui.dropdown .menu .item';
        $(selector1).dropdown();
        $(selector2).click(function(){alert("clicou")})
    });

    return sb.toString();

});

