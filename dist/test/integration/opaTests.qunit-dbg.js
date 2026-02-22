/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["crm/crmbatchtest/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
