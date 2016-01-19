/**
 * Created by Anderson on 18/01/2016.
 */
rz.widgets.tableHelpers = {
    cellRenderers : {},
    createCellRenderer: function (n, d) {
        this.cellRenderers[n] = d;
    },
    getCellRenderer: function (n) {
        if(typeof(n)=="string"){
            return this.cellRenderers[n] || this.cellRenderers["default"];
        }
        else{
            return n;
        }
    }
};