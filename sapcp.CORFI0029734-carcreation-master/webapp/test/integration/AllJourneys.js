/* global QUnit*/

sap.ui.define([
	"sap/ui/test/Opa5",
	"com/danone/iarcreationop/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/danone/iarcreationop/test/integration/pages/Main",
	"com/danone/iarcreationop/test/integration/navigationJourney"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.danone.iarcreationop.view.",
		autoWait: true
	});
});