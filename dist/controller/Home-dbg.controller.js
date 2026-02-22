sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("crm.crmbatchtest.controller.Home", {

        ALL_STAGES: [
            "HSM",
            "Pickling",
            "Oiling",
            "Rewinding",
            "Color Coating",
            "Galvanizing"
        ],

        onInit: function () {

            const batches = this._createRoutingModel();

            const oData = {
                selectedBatch: "H12345",
                batchList: Object.keys(batches).map(id => ({ id })),
                batches: batches
            };

            oData.current = this._deriveDashboardData(
                oData.selectedBatch,
                batches[oData.selectedBatch]
            );

            this.getView().setModel(new JSONModel(oData));
        },

        // =====================================================
        // MASTER ROUTING MODEL
        // =====================================================

        _createRoutingModel: function () {

            return {

                H12345: { required: 5, current: 2, delay: 2, sold: false, physical: 260, sap: 245, soReserved: 85, soOpen: 92 },
                H12346: { required: 2, current: 2, delay: null, sold: true, physical: 200, sap: 200, soReserved: 40, soOpen: 40 },
                H12347: { required: 3, current: 3, delay: null, sold: false, physical: 180, sap: 180, soReserved: 50, soOpen: 60 },
                H12348: { required: 5, current: 4, delay: null, sold: false, physical: 300, sap: 295, soReserved: 70, soOpen: 80 },
                H12349: { required: 5, current: 5, delay: null, sold: false, physical: 320, sap: 320, soReserved: 100, soOpen: 90 },
                H12350: { required: 1, current: 1, delay: null, sold: true, physical: 150, sap: 150, soReserved: 30, soOpen: 30 },
                H12351: { required: 4, current: 2, delay: 2, sold: false, physical: 210, sap: 205, soReserved: 60, soOpen: 70 },
                H12352: { required: 3, current: 1, delay: null, sold: false, physical: 170, sap: 170, soReserved: 55, soOpen: 65 },
                H12353: { required: 5, current: 5, delay: null, sold: false, physical: 400, sap: 390, soReserved: 120, soOpen: 110 },
                H12354: { required: 2, current: 0, delay: null, sold: false, physical: 130, sap: 125, soReserved: 20, soOpen: 30 }

            };
        },

        // =====================================================
        // DERIVE DASHBOARD FROM ROUTING
        // =====================================================

        _deriveDashboardData: function (batchId, batch) {

            const stageName = this.ALL_STAGES[batch.current];

            const delayCount = batch.delay !== null ? 1 : 0;

            const shortfall = batch.soOpen - batch.soReserved;

            const netMTS = batch.physical - batch.soReserved;

            const variance = batch.physical - batch.sap;

            const accuracy = ((batch.sap / batch.physical) * 100).toFixed(1);

            return {
                id: batchId,   // ✅ FIXED HERE

                rootInfo: batch.sold
                    ? `${stageName} → SOLD`
                    : `${stageName} → In Process`,

                rootStatus: batch.delay !== null ? "🔴 Delay" : "🟢 Normal",

                wip: {
                    pickling: batch.current >= 1 ? 12 : 0,
                    oiling: batch.current >= 2 ? 18 : 0,
                    rewinding: batch.current >= 3 ? 9 : 0,
                    delay: delayCount
                },

                so: {
                    reserved: batch.soReserved,
                    open: batch.soOpen,
                    shortfall: shortfall
                },

                mts: {
                    unrestricted: batch.physical,
                    semi: 40,
                    net: netMTS
                },

                aging: {
                    fresh: batch.current < 3 ? batch.physical : 0,
                    risk: batch.current >= 3 ? 42 : 10,
                    critical: batch.current >= 5 ? 18 : 5
                },

                accuracy: {
                    physical: batch.physical,
                    sap: batch.sap,
                    variance: variance,
                    percent: accuracy
                }
            };
        },

        // =====================================================
        // EVENTS
        // =====================================================

        onBatchChange: function (oEvent) {

            const sKey = oEvent.getSource().getSelectedKey();
            const oModel = this.getView().getModel();

            const routing = oModel.getProperty("/batches/" + sKey);

            oModel.setProperty("/selectedBatch", sKey);

            oModel.setProperty("/current",
                this._deriveDashboardData(sKey, routing)
            );
        },

        onSectionPress: function (oEvent) {

            const sType = oEvent.getSource().data("type");

            this.getOwnerComponent().getRouter().navTo("batchList", {
                type: sType
            });
        },

        onRootPress: function () {

            const sId = this.getView().getModel().getProperty("/selectedBatch");

            this.getOwnerComponent().getRouter().navTo("batchDetail", {
                id: sId
            });
        }

    });
});