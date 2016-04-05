/**
 * Created by Anderson on 02/04/2016.
 */
rz.widgets.RZTableWidgetHelpers.sortingHelpers = {
    findColData : function(findData,$this){
        var cdata = $this.params.columns.find(function(it){
            return it[findData.prop] == findData.value;
        });
        return cdata;
    },
    sortAscMethod : function ($$this,$columnToSort) {
        return function (a, b) {
            var $this = $$this;
            var columnToSort = $columnToSort;
            var r = 0;
            var colDef = sortingHelpers.findColData({prop:"bindingSource", value:columnToSort},$this);
            var va = a[columnToSort];
            var vb = b[columnToSort];

            if(colDef.dataType=="numeric"){
                va = parseFloat(va);
                vb = parseFloat(vb);
            }
            else if(colDef.dataType=="datetime"){
                va = new Date(va);
                vb = new Date(vb);
            }
            else{
                va = va.toLowerCase();
                vb = vb.toLowerCase();
            }

            if(va < vb) r = -1;
            if(va > vb) r = 1;
            return r;
        };
    },
    sortDescMethod : function ($$this,$columnToSort) {
        return function (b, a) {
            var $this = $$this;
            var columnToSort = $columnToSort;
            var r = 0;
            var colDef = sortingHelpers.findColData({prop:"bindingSource", value:columnToSort},$this);
            var va = a[columnToSort];
            var vb = b[columnToSort];

            if(colDef.dataType=="numeric"){
                va = parseFloat(va);
                vb = parseFloat(vb);
            }
            else if(colDef.dataType=="datetime"){
                va = new Date(va);
                vb = new Date(vb);
            }

            if(va < vb) r = -1;
            if(va > vb) r = 1;
            return r;
        };
    }
    /*,genericSortMethod : function (sortData) {
        var a = sortData.a;
        var b = sortData.b;
        var $this = sortData.$this;
        var columnToSort = sortData.columnToSort;
        var r = 0;
        var colDef = this.findColData({prop:"bindingSource", value:columnToSort},$this);
        var va = a[columnToSort];
        var vb = b[columnToSort];

        if(colDef.dataType=="numeric"){
            va = parseFloat(va);
            vb = parseFloat(vb);
        }
        else if(colDef.dataType=="datetime"){
            va = new Date(va);
            vb = new Date(vb);
        }

        if(va < vb) r = -1;
        if(va > vb) r = 1;
        return r;
    }*/
};
var sortingHelpers = rz.widgets.RZTableWidgetHelpers.sortingHelpers;

//trazer todos os métodos relacionados a sorting pra cá