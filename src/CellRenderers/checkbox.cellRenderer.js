/**
 * Created by anderson.santos on 01/07/2016.
 */
rz.widgets.tableHelpers.createCellRenderer("checkbox", function (value, full, params,targetInstance) {
    var resolveStates = function(){
        var states = "";
        if(params.disabled) states='disabled="disabled"';
        if(params.checked) states+=' checked=""';
        return states;
    };

    var resolveClasses = function(){
        var classes = params.cssClass || '';
        if(params.disabled) classes=' disabled';
        if(params.checked) classes+=' checked';
        return classes;
    };

    var sb = new StringBuilder();
    var id = "*-*".replace('*',full.__uid).replace('*',targetInstance.params.ui.elementID);
    sb.appendFormat('<div id="{0}" class="ui {1} checkbox">',id,resolveClasses());
    sb.appendFormat('<input type="checkbox" name="{0}" {1}>',params.name || "", resolveStates());
    if(params.label!==undefined){
        sb.appendFormat('<label>{0}</label>',params.label);
    }
    sb.appendFormat('</div');

    targetInstance.runtimeHelpers.enqueuePostRenderScript(function () {
        var handler = params.checkConverter || function(v){return v};
        $('#' + id).checkbox({
            onChecked: function () {
                var checkProperty = params.checkProperty || "checked";
                var value = handler(true);
                rz.helpers.jsonUtils.setDataAtPath(full,value,checkProperty);
                if(params.onChange !==undefined){
                    params.onChange("checked",full,value,params,targetInstance);
                }
            },
            onUnchecked: function () {
                var checkProperty = params.checkProperty || "checked";
                rz.helpers.jsonUtils.setDataAtPath(full,handler(false),checkProperty);
                if(params.onChange !==undefined){
                    params.onChange("unchecked",full,value,params,targetInstance);
                }
            }
        });

    });


    return sb.toString();

});