sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("crm.crmbatchtest.controller.BatchList", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("batchList")
                .attachPatternMatched(this._onMatched, this);
        },

        _onMatched: function (oEvent) {
            var sType = oEvent.getParameter("arguments").type;

            var aData = [
                { id: "1", batch: "H12345", stage: "OILING", qty: 17, delay: 3 },
                { id: "2", batch: "H67890", stage: "PICKLING", qty: 20, delay: 0 },
                { id: "3", batch: "H33321", stage: "REWINDING", qty: 15, delay: 4 }
            ];

            if (sType === "DELAY") {
                aData = aData.filter(b => b.delay > 2);
            }

            var oModel = new JSONModel({ items: aData });
            this.getView().setModel(oModel);
        },

        onSelect: function (oEvent) {
            var sId = oEvent.getSource()
                .getBindingContext()
                .getObject().id;

            this.getOwnerComponent().getRouter().navTo("batchDetail", {
                id: sId
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("home");
        }

    });
});
