sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/danone/capcarcreation/model/models"
], function (UIComponent, Device, models) {
	"use strict";
	return UIComponent.extend("com.danone.capcarcreation.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});