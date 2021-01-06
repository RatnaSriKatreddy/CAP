sap.ui.define([
	'com/danone/capcarcreation/controller/BaseController',
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast',
	'com/danone/capcarcreation/util/formatter',
	'com/danone/capcarcreation/util/validatorLaunch',
	'com/danone/capcarcreation/util/validatorSave',
	'com/danone/capcarcreation/controller/helper/LiveChangeController'

], function (BaseController, jquery, Controller, ResourceModel, JSONModel, MessageToast, formatter, validatorLaunch, validatorSave,
	LiveChangeController) {
	"use strict";

	// If you read this, I'm sorry for the errors... I hope you find the solution very soon!
	// If you make any changes, if necessary, please do them also in CAR Detail as well

	return BaseController.extend("com.danone.capcarcreation.controller.Main", {
		formatter: formatter,
		/* =========================================================== */
		/* Begin of LifeCycle methods */
		/* =========================================================== */
		onInit: function () {
			// If you read this, I'm sorry for the errors... I hope you find the solution very soon!
			// If you make any changes, if necessary, please do them also in CAR Detail as well
			this.getView().setBusy(true);
			var that = this;
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation"); // Used to load the models that are predefined in the application

			//General
			this.sCARcategoryId = -1;
			this.sExtensionFlag = "";
			this.bTopLineFlagInitialized = false;
			this.bInvestmentFlagInitialized = false;

			//Graphs
			this.bTopLinePosted = false;
			this.bInvestmentPosted = false;

			//Attachments
			this.CARPictureChanged = false;
			this.CARPicturePOSTToHANA = false;
			this.CAROperationsChanged = false;
			this.CAROperationsPOSTToHANA = false;
			this.CARFinancialAnalysisPOSTToHANA = false;
			this.CARBusinessCasePOSTToHANA = false;
			this.CAROptionalAttachmentPOSTToHANA = false;
			this.attachmentVersions = {
				"CAROperationsVersion": 1,
				"CARFinancialAnalysisVersion": 1,
				"CARBusinessCaseVersion": 1,
				"CAROptionalVersion": {}
			};

			var oIncrementalBusinessModel = new sap.ui.model.json.JSONModel([sRootPath, "model/incrementalBusiness.json"].join("/"));
			oIncrementalBusinessModel.attachRequestCompleted(function () { //The data in the model is fully loaded
				that.getView().setModel(oIncrementalBusinessModel, "incrementalBusinessJSONModel");
			});

			var oCARModel = new sap.ui.model.json.JSONModel([sRootPath, "model/CARModel.json"].join("/"));
			oCARModel.attachRequestCompleted(function () { //The data in the model is fully loaded
				that.getView().setModel(oCARModel, "CARModel");
				that._checkCategory();

			});

			var oCARKPIModel = new sap.ui.model.json.JSONModel([sRootPath, "model/CARKPIModel.json"].join("/"));
			oCARKPIModel.attachRequestCompleted(function () { //The data in the model is fully loaded
				that.getView().setModel(oCARKPIModel, "CARKPIModel");

			});

			var oCAROnePlanetModel = new sap.ui.model.json.JSONModel([sRootPath, "model/CAROnePlanetModel.json"].join("/"));
			oCAROnePlanetModel.attachRequestCompleted(function () { //The data in the model is fully loaded
				that.getView().setModel(oCAROnePlanetModel, "CAROnePlanetModel");

			});

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "errorModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "RandomModel");

			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({}), "errorModelInvestment");

			this.makeModelsForAttachments();
			this._attachEventHandlersForAttachments();

			var url = $.sap.getModulePath("com.danone.capcarcreation", "/images");
			this.getView().getModel("RandomModel").setProperty("/picture", url + "/CLogoForPicture.png");
			this.getView().getModel("RandomModel").setProperty("/onePagerPicture", url + "/CLogo.png");

			this.getView().getModel("RandomModel").setProperty("/WBUWatersID", this.getWBUWatersID());
			this.getView().setBusy(false);
		},
		onAfterRendering: function () {
			var that = this;

			//Description added with an icon
			//Via showValueHelp in input
			var popOverIds = ['idInputCbuRoicBefore', 'idInputFiveYearNpv', 'idInputCbuRoicAfter', 'idInputWacc', 'idInputIRR',
				'inputCurrentEnergyConsumptionId', 'inputProjectEnergyConsumptionId', 'inputSiteProjectEnergyConsumptionId',
				'inputEnergyWBUAvgId', 'inputCO2WBUId', 'inputWaterWBUId', 'inputSiteTonsBeforeProjCurrentYearId', 'inputPlantOUBeforeId',
				'inputPlantOEBeforeId', 'inputPlantOUAfterId', 'inputPlantOEAfterId', 'inputAdditionalCapacityId', 'inputNegotiatedOfferId',
				'inputBeforeGreenEnergyId',
				'inputAfterGreenEnergyId', 'inputAfterProjectPETId', 'inputProjectPETId', 'inputSitePETId',
				'inputAfterProjectPlasticRecyclableId',
				'inputSitePlasticRecyclableId', 'inputProjectPlasticRecyclableId',
				'inputSiteCO2Id', 'inputProjectCO2Id', 'inputSiteWaterId', 'inputGreenPaybackMonthsId', 'inputDebtPositionId'
			];

			popOverIds.forEach(function (input) {
				that.byId(input)._getValueHelpIcon().setSrc("sap-icon://hint");
				that.byId(input)._getValueHelpIcon().addEventDelegate({
					onclick: function (oEvent) {
						var source = oEvent.srcControl;
						that.handlePopoverPressIcon(source, "inputField");
					}
				});
			});

			//Disable manual input of datepickers
			var expValidationDatepicker = this.byId("ExpValidationDateId");
			expValidationDatepicker.addDelegate({
				onAfterRendering: function () {
					expValidationDatepicker.$().find('INPUT').attr('disabled', true);
				}
			}, expValidationDatepicker);

			var expGoLiveDatepicker = this.byId("ExpGoLiveDateId");
			expGoLiveDatepicker.addDelegate({
				onAfterRendering: function () {
					expGoLiveDatepicker.$().find('INPUT').attr('disabled', true);
				}
			}, expGoLiveDatepicker);

			var expSinceDatepicker = this.byId("SinceId");
			expSinceDatepicker.addDelegate({
				onAfterRendering: function () {
					expSinceDatepicker.$().find('INPUT').attr('disabled', true);
				}
			}, expSinceDatepicker);

		},
		/* =========================================================== */
		/* End of Lifecycle methods */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of General methods */
		/* =========================================================== */
		getFinancialModelObject: function () {
			return {
				"CARId": 0,
				"Year": null,
				"CARCashOut": null,
				"Volume": null,
				"NetSalesLC": null,
				"CO": null,
				"ROPLC": null,
				"FCFLC": null,
				"ROSLC": null,
				"CurrencyId": "",
				"LeaseCashOut": null,
				"TotalCashOut": null
			}
		},
		/** 
		 * This method gets called in the onInit to make check the environment of the application and change the WBU Waters ID for the environment
		 */
		getWBUWatersID: function () {
			var sAccountName = this.getAccountName();
			var sWBUWatersID = "20_3";
			if (sAccountName !== undefined) {
				if (sAccountName.includes("dev"))
					sWBUWatersID = "20_2";
			}
			return sWBUWatersID;
		},
		/** 
		 * This method gets called in the onInit to make all the models for the attachments and bind them to the view
		 */
		makeModelsForAttachments: function () {
			var that = this;
			//Docii
			var oDociiModel = this.getView().getModel("docii"); //General model of Docii
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiCapListModel");
			var dociiCapListModel = this.getView().getModel("dociiCapListModel");
			oDociiModel.loadData("/api_docii/list/cap");

			//Fetch all attachments of cap
			oDociiModel.attachRequestCompleted(function () {
				var dociiCapListData = [];
				dociiCapListData.push(that._filterLatestTemplatesFromDocii(oDociiModel.getData(), "Financial Analysis Template"));
				dociiCapListData.push(that._filterLatestTemplatesFromDocii(oDociiModel.getData(), "Operations Template"));

				dociiCapListModel.setData(dociiCapListData);
			});

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiOperationsModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiFinancialAnalysisModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiBusinessCaseModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiOptionalAttachmentModel");
			this.getView().getModel("dociiOptionalAttachmentModel").setData([]);
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "dociiPreviousVersionsModel");
			this.getView().getModel("dociiPreviousVersionsModel").setData([]);

			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CARAttachmentsJSONModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CARPictureJSONModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CAROperationsJSONModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CARFinancialAnalysisJSONModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CARBusinessCaseJSONModel");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "CARPreviousVersionsJSONModel");
			this.getView().getModel("CARPreviousVersionsJSONModel").setData([]);

			this.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARPictureChanged", false);
			this.getView().getModel("CARAttachmentsJSONModel").setProperty("/CAROperationsChanged", false);
			this.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARFinancialAnalysisChanged", false);
			this.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARBusinessCaseChanged", false);
			this.getView().getModel("CARAttachmentsJSONModel").setProperty("/CAROptionalAttachmentChanged", false);

			this.getView().getModel("CARPictureJSONModel").setProperty("CARPicturePOSTToHANA", false);
			this.getView().getModel("CAROperationsJSONModel").setProperty("CAROperationsPOSTToHANA", false);
			this.getView().getModel("CARFinancialAnalysisJSONModel").setProperty("CARFinancialAnalysisPOSTToHANA", false);
			this.getView().getModel("CARBusinessCaseJSONModel").setProperty("CARBusinessCasePOSTToHANA", false);

			this.getView().setModel(new JSONModel({
				"Picture": ["png", "jpeg", "jpg"],
				"Operations": ["xlsx", "pdf", "xls"],
				"FinancialAnalysis": ["xlsx", "xls"],
				"BusinessCase": ["pptx", "ppt"]
			}), "AttachmentFileTypes");

		},
		/** 
		 * Handles the event when an icon is pressed to see the Popover for more information
		 * @param oEvent
		 */
		iconButtonPress: function (oEvent) {
			this.handlePopoverPressIcon(oEvent, "button");
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInput: function (oEvent) {
			LiveChangeController.onLiveChangeInput(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputDecimal: function (oEvent) {
			LiveChangeController.onLiveChangeInputDecimal(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onChangeSelect: function (oEvent) {
			LiveChangeController.onChangeSelect(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onSelectRadio: function (oEvent) {
			LiveChangeController.onSelectRadio(this, oEvent);
		},
		/** 
		 * This method handles the event when an information icon is pressed in the view. It opens the popover fragment and adds it as a dependent to the view
		 * @param source
		 * @param control
		 */
		handlePopoverPressIcon: function (source, control) {
			var id;
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.popover", this);
				this.getView().addDependent(this._oPopover);
			}
			if (control === "inputField") {
				id = source.getParent().getId().split("--")[1] + "PopOver";
			} else {
				if (control === "button") {
					id = source["mParameters"].id.split("--")[1] + "PopOver";
				} else {
					id = source.getId().split("--")[1] + "PopOver";
				}

			}
			var text = this.getResourceBundle().getText(id);

			this._oPopover.setModel(new sap.ui.model.json.JSONModel({
				Description: text
			}));
			this._oPopover.bindElement("/");

			if (control === "button") {
				this._oPopover.openBy(source["oSource"]);
			} else {
				this._oPopover.openBy(source);
			}

		},
		/** 
		 * This method calls other methods depending on the category that is chosen
		 */
		_checkCategory: function () {
			var iCategoryId = parseFloat(this.getView().getModel("CARModel").getProperty("/CategoryId"));
			switch (iCategoryId) {
			case 1:
				this.notWithCARcategory5();
				break;
			case 2:
				this.notWithCARcategory5();
				break;
			case 3:
				this.notWithCARcategory5();
				break;
			case 4:
				this.notWithCARcategory5();
				break;
			case 5:
				this.onlyAvailableWithCARcategory5();
				break;
			case 6:
				this.notWithCARcategory5();
				break;
			case 7:
				this.notWithCARcategory5();
				break;
			}
		},
		/** 
		 * Clears the data in the Models when the category changes
		 * @param iPreviousCategory
		 * @param iCurrentCategory
		 */
		clearDataInModelsAfterChangingCategory: function (iPreviousCategory, iCurrentCategory) {
			var oCARModel = this.getView().getModel("CARModel");
			var oCARKPIModel = this.getView().getModel("CARKPIModel");
			if (iPreviousCategory === 1) { // Category changed from 1 to another
				this.clearDataInTopLineModel();
				this.clearDataInInvestmentModel();
				oCARKPIModel.setProperty("/PlantOUBefore", null);
				oCARKPIModel.setProperty("/PlantOUAfter", null);
				oCARKPIModel.setProperty("/PlantOEBefore", null);
				oCARKPIModel.setProperty("/PlantOEAfter", null);
				oCARKPIModel.setProperty("/AdditionalCapacity", null);
			}
			if (iPreviousCategory === 5) { // Category changed from 5 to another
				oCARModel.setProperty("/ForWBS", "");
			}
			if ((iPreviousCategory === 1 || iPreviousCategory === 2 || iPreviousCategory === 3) && (iCurrentCategory !== 1 || iCurrentCategory !==
					2 || iCurrentCategory !== 3)) { // Category changed from 3 to 4,5, 6 or 7
				oCARKPIModel.setProperty("/IRR", null);
			}
			if ((iPreviousCategory === 1 || iPreviousCategory === 2) && (iCurrentCategory !== 1 || iCurrentCategory !==
					2)) { // Category changed from 1 or 2 to 3, 4, 5, 6 or 7
				oCARKPIModel.setProperty("/Payback", null);
				oCARKPIModel.setProperty("/NPVLC", null);
			}
		},
		/** 
		 * Checks if there are some fields mandatory depending on the FinancingType, CARAmountLFLEUR & CategoryId
		 */
		_checkMandatoryFieldsWaterMonetizer: function () {
			var oCARModel = this.getView().getModel("CARModel").getData();
			var oRandomModel = this.getView().getModel("RandomModel");
			if ((oCARModel.FinancingTypeId === 1 && parseFloat(oCARModel.CARAmountLFLEUR) < -5000) || oCARModel.CategoryId === 3)
				oRandomModel.setProperty("/waterMandatory", true);
			else
				oRandomModel.setProperty("/waterMandatory", false);
		},
		/** 
		 * Method that is called when categoryId 5 is selected
		 */
		onlyAvailableWithCARcategory5: function () {
			this.getView().getModel("CARModel")["oData"].SubCategoryId = null;
		},
		/** 
		 * Method that is called when a CategoryId is selected except for 5
		 */
		notWithCARcategory5: function () {
			this.byId("inputDemandNumber").setValue("");
			this.byId("inputDemandUrl").setValue("");
		},
		/** 
		 * This method is called by the liveChange events of the fields that are supposed to have a ‘%’ at the back.
		 * It checks if the new value is a decimal, negative or a ‘normal’ value.
		 * There is also a check if the value is between a max and a minimum, else it sets the property in the errorModel to error
		 * @param oEvent
		 * @param sNameOfModel
		 * @param sNamePropertyForModel
		 * @param sNamePropertyForErrorModel
		 * @param iMinimumValue
		 * @param iMaximumValue
		 * @param bDecimals
		 * @param bNegative
		 */
		changePercentageInModelsAndView: function (oEvent, sNameOfModel, sNameProperty, iMinimumValue, iMaximumValue, bDecimals, bNegative) {
			var sNewValue = "";
			if (bDecimals && bNegative)
				sNewValue = this.makeNewValueWithDecimalsAndNegative(oEvent.getSource().getValue());
			if (bDecimals && !bNegative)
				sNewValue = this.makeNewValueWithDecimals(oEvent.getSource().getValue());
			if (!bDecimals && !bNegative)
				sNewValue = this.makeNewValue(oEvent.getSource().getValue());

			if (sNewValue === "" || sNewValue === null) {
				oEvent.getSource().setValue("");
				this.getView().getModel(sNameOfModel).setProperty("/" + sNameProperty, null);
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueState", "None");
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueStateText", "");
				return;
			}

			sNewValue = sNewValue.replace(",", ".");
			var iNewValue = parseFloat(sNewValue);
			this.getView().getModel(sNameOfModel).setProperty("/" + sNameProperty, String(iNewValue));
			oEvent.getSource().setValue(String(sNewValue) + " %");
			if (iNewValue < iMinimumValue || iNewValue > iMaximumValue) {
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueState", "Error");
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueStateText",
					"Percentage needs to be between " + iMinimumValue + " and " + iMaximumValue);
			} else {
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueState", "None");
				this.getView().getModel("errorModel").setProperty("/" + sNameProperty + "ValueStateText", "");
			}
		},
		/** 
		 * Makes a new value with decimals
		 * @param value
		 * @returns String
		 */
		makeNewValueWithDecimals: function (value) {
			var sNewValue = "";
			for (var i = 0; i < value.length; i++) {
				var char = value[i];
				if (!isNaN(parseInt(char, 0)) || char === "." || char === ",")
					sNewValue += char;
			}
			return sNewValue;
		},
		/** 
		 * Makes a new value with decimals and possibility to be negative
		 * @param value
		 * @returns String
		 */
		makeNewValueWithDecimalsAndNegative: function (value) {
			var sNewValue = "";
			for (var i = 0; i < value.length; i++) {
				var char = value[i];
				if (!isNaN(parseInt(char, 0)) || char === "-" || char === "." || char === ",")
					sNewValue += char;
			}
			return sNewValue;
		},
		makeNewValueWithOneDecimalAndNegative: function (value) {
			var sNewValue = "";
			for (var i = 0; i < value.length; i++) {
				var char = value[i];
				if ((!isNaN(parseInt(char, 0)) || char === "-" || char === "." || char === ",") && (sNewValue.charAt((sNewValue.length - 2)) !==
						"."))
					sNewValue += char;
			}
			return sNewValue;
		},
		/** 
		 * Makes a new value with possibility to be negative
		 * @param value
		 * @returns String
		 */
		makeNewValueWithNegative: function (value) {
			var sNewValue = "";
			for (var i = 0; i < value.length; i++) {
				var char = value[i];
				if (!isNaN(parseInt(char, 0)) || char === "-")
					sNewValue += char;
			}
			return sNewValue;
		},
		/** 
		 * Makes a new value without decimals and cannot be negative
		 * @param value
		 * @returns String
		 */
		makeNewValue: function (value) {
			var sNewValue = "";
			for (var i = 0; i < value.length; i++) {
				var char = value[i];
				if (!isNaN(parseInt(char, 0)))
					sNewValue += char;
			}
			return sNewValue;
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputNonNegativeValue: function (oEvent) {
			LiveChangeController.onLiveChangeInputNonNegativeValue(this, oEvent);
		},
		/** 
		 * Converts properties in JSON format into OData to post to HANA
		 */
		fromODataToJSON: function () {
			this.convertEpochDatesToJS();
		},
		/** 
		 * Convert properties coming from HANA into JSON format
		 */
		fromJSONToOData: function () {
			this.convertJSDatesToEpoch();
		},
		/** 
		 * Gets values from the datepickers in the view and convert the Epoch date into a Javascript date to show it in the view
		 */
		convertEpochDatesToJS: function () {
			var datepickerIds = ['ExpValidationDateId', 'ExpGoLiveDateId', 'SinceId', 'CreatedOnId', 'ChangedOnId', 'LaunchedDateId'];
			var that = this;
			var dateEpoch, propJSONModel;

			datepickerIds.forEach(function (datepicker) {
				propJSONModel = datepicker.split('Id')[0];
				dateEpoch = that.getView().getModel("CARModel").getProperty("/" + propJSONModel);
				if (dateEpoch === undefined || dateEpoch === "" || dateEpoch.includes("-"))
					return;

				that.getView().getModel("CARModel").setProperty("/" + propJSONModel, that.convertEpochDateToDateWithDayDashMonthDashYear(
					dateEpoch));
			});
		},
		/** 
		 * Gets values from the datepickers in the views and converts them into Epoch dates
		 */
		convertJSDatesToEpoch: function () {
			var datepickers = ['ExpValidationDate', 'ExpGoLiveDate', 'Since', 'CreatedOn', 'ChangedOn', 'LaunchedDate'];
			var that = this;
			var dateJS, dateEpoch, propJSONModel;

			datepickers.forEach(function (datepicker) {
				dateJS = that.convertDateToJavaScriptDateObject(datepicker);
				if (dateJS && dateJS !== "") {
					var signDateOffset = dateJS.getTimezoneOffset().toString();
					if (signDateOffset.startsWith("-")) {
						dateJS.setMinutes(parseInt(signDateOffset.split("-")[1], 10));
					}
					if (signDateOffset.startsWith("+")) {
						dateJS.setMinutes(-parseInt(signDateOffset.split("-")[1], 10));
					}
				}

				if (Date.parse(dateJS) !== 3600000 && dateJS && dateJS !== "") {
					dateEpoch = '\/Date(' + Date.parse(dateJS) + ')\/';
					propJSONModel = datepicker.split('Id')[0];
					that.getView().getModel("CARModel").setProperty("/" + propJSONModel, dateEpoch);
					that.getView().getModel("RandomModel").setProperty("/" + propJSONModel, dateEpoch);
				} else {
					dateEpoch = '/Date(0)/';
					propJSONModel = datepicker.split('Id')[0];
					that.getView().getModel("CARModel").setProperty("/" + propJSONModel, dateEpoch);
					that.getView().getModel("RandomModel").setProperty("/" + propJSONModel, dateEpoch);
				}

			});
		},
		/** 
		 * Returns the position of the property (with the name in HANA) in the incrementalBusinessJSONModel
		 * @param nameInHANA
		 * @returns Integer
		 */
		checkIndexOfNameInHANAForIncrementalBusinessModel: function (nameInHANA) {
			var oIncrementalBusinessModeloData = this.getView().getModel("incrementalBusinessJSONModel")["oData"];
			var returnValue = -1;
			for (var i = 0; i < oIncrementalBusinessModeloData.length; i++) {
				if (oIncrementalBusinessModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		/** 
		 * Returns the position of the property (with the name in HANA) in the InvestmentJSONModel
		 * @param nameInHANA
		 * @returns Integer
		 */
		checkIndexOfNameInHANAForInvestmentModel: function (nameInHANA) {
			var oInvestmentModeloData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();
			var returnValue = -1;
			for (var i = 0; i < oInvestmentModeloData.length; i++) {
				if (oInvestmentModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		/** 
		 * Removes the ‘%’ sign and changes the ‘,’ into ‘.’ as delimiter, 
		 * because OData does not accept ‘,’ as delimiter, in the values of certain properties for posting to HANA
		 */
		convertStringPercentageIntoDecimalCARKPI: function () {
			var convertProperties = ["ROICBefore", "ROICAfter", "IRR", "InterestRate", "PlantOUBefore", "PlantOEBefore", "NegotiatedOffer",
				"PlantOUAfter", "PlantOEAfter", "NPVLC"
			];
			var oCARKPIModel = this.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < convertProperties.length; i++) {
				if (parseFloat(oCARKPIModel[convertProperties[i]]) === 0 || oCARKPIModel[convertProperties[i]] ===
					"0 %") {
					oCARKPIModel[convertProperties[i]] = "0";
				} else {
					if (oCARKPIModel[convertProperties[i]] === null || oCARKPIModel[convertProperties[i]] === "") {
						oCARKPIModel[convertProperties[i]] = null;
					} else {
						oCARKPIModel[convertProperties[i]] = oCARKPIModel[convertProperties[i]].replace(",", ".");
						oCARKPIModel[convertProperties[i]] = String(oCARKPIModel[convertProperties[i]].split(" ")[0]);
					}
				}
			}
		},
		/** 
		 * Adds a ‘%’ sign in the values of certain properties after fetching data from HANA
		 */
		convertDecimalIntoStringPercentageCARKPI: function () {
			var convertProperties = ["ROICBefore", "ROICAfter", "IRR", "InterestRate", "PlantOUBefore", "PlantOEBefore", "NegotiatedOffer",
				"PlantOUAfter", "PlantOEAfter"
			];
			var oCARKPIModel = this.getView().getModel("CARKPIModel");

			for (var i = 0; i < convertProperties.length; i++) {
				if (oCARKPIModel.getProperty("/" + convertProperties[i]) !== null && oCARKPIModel.getProperty("/" + convertProperties[i]) !== "") {
					oCARKPIModel.setProperty("/" + convertProperties[i], String(oCARKPIModel.getProperty("/" + convertProperties[i])) + " %");
				} else {
					oCARKPIModel.setProperty("/" + convertProperties[i], "");
				}
			}
		},
		/** 
		 * Certain properties in the incrementalBusinessJSONModel (ROS and CO) are with a ‘%’.
		 * This method removes the sign and changes the delimiter from ‘,’ into ‘.’ For the decimal values
		 */
		convertStringPercentageIntoDecimalCARFinancial: function () {
			var oIncrementalBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");
			var mandatoryProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayROSLC = this.checkIndexOfNameInHANAForIncrementalBusinessModel("ROSLC");
			if (placeInArrayROSLC === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of ROS, please contact the IT department"
				);
			var placeInArrayCO = this.checkIndexOfNameInHANAForIncrementalBusinessModel("CO");
			if (placeInArrayCO === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of CO, please contact the IT department"
				);

			for (var j = 0; j < mandatoryProperties.length; j++) {
				//ROS
				var valueROS = oIncrementalBusinessModel.getData()[placeInArrayROSLC][mandatoryProperties[j]];
				if (valueROS === null || valueROS === "" || valueROS === "null") {
					valueROS = null;
				} else {
					valueROS =
						String(valueROS).replace(",", ".").replace(" %", "");
				}
				oIncrementalBusinessModel.getData()[placeInArrayROSLC][mandatoryProperties[j]] = valueROS;

				//CO
				var valueCO = oIncrementalBusinessModel.getData()[placeInArrayCO][mandatoryProperties[j]];
				if (valueCO === null || valueCO === "" || valueROS === "null") {
					valueCO = null;
				} else {
					valueCO =
						String(valueCO).replace(",", ".").replace(" %", ""); //OData does not accept , as delimiter
				}
				oIncrementalBusinessModel.getData()[placeInArrayCO][mandatoryProperties[j]] = valueCO;
			}
		},
		/** 
		 * Adds a ‘%’ sign in the values of the ROS and CO properties in the incrementalBusinessJSONModel when the data is fetched from HANA
		 */
		convertDecimalIntoStringPercentageCARFinancial: function () {
			var oIncrementalBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");
			var mandatoryProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayROSLC = this.checkIndexOfNameInHANAForIncrementalBusinessModel("ROSLC");
			if (placeInArrayROSLC === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of ROS, please contact the IT department"
				);
			var placeInArrayCO = this.checkIndexOfNameInHANAForIncrementalBusinessModel("CO");
			if (placeInArrayCO === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of CO, please contact the IT department"
				);

			for (var j = 0; j < mandatoryProperties.length; j++) {
				//ROS
				var valueROS = oIncrementalBusinessModel["oData"][placeInArrayROSLC][mandatoryProperties[j]];
				if (valueROS !== null && !valueROS.includes(" %")) {
					oIncrementalBusinessModel["oData"][placeInArrayROSLC][mandatoryProperties[j]] = String(valueROS + " %");
				}

				//CO
				var valueCO = oIncrementalBusinessModel["oData"][placeInArrayCO][mandatoryProperties[j]];
				if (valueCO !== null && !valueCO.includes(" %")) {
					oIncrementalBusinessModel["oData"][placeInArrayCO][mandatoryProperties[j]] = String(valueCO + " %");
				}
			}
		},
		/** 
		 * Certain properties in the InvestmentJSONModel (MarketShareWithInvestment and MarketShareWithoutInvestment) are with a ‘%’.
		 * This method removes the sign and changes the delimiter from ‘,’ into ‘.’ For the decimal values
		 */
		convertStringPercentageIntoDecimalCARInvestment: function () {
			var oInvestmentModeloData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();
			var mandatoryProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayMarketShareWithoutInvestment = this.checkIndexOfNameInHANAForInvestmentModel("MarketShareWithoutInvestment");
			if (placeInArrayMarketShareWithoutInvestment === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of Market Share Without Investment, please contact the IT department"
				);
			var placeInArrayMarketShareWithInvestment = this.checkIndexOfNameInHANAForInvestmentModel("MarketShareWithInvestment");
			if (placeInArrayMarketShareWithInvestment === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of Market Share With Investment, please contact the IT department"
				);

			for (var j = 0; j < mandatoryProperties.length; j++) {
				//MarketShareWithoutInvestment
				var marketShareWithoutInvestment = oInvestmentModeloData[placeInArrayMarketShareWithoutInvestment][mandatoryProperties[j]];
				if (marketShareWithoutInvestment === null || marketShareWithoutInvestment === "" ||
					marketShareWithoutInvestment === "null") {
					marketShareWithoutInvestment = null;
				} else {
					marketShareWithoutInvestment =
						String(marketShareWithoutInvestment).replace(" %", "");
				}
				oInvestmentModeloData[placeInArrayMarketShareWithoutInvestment][mandatoryProperties[j]] = marketShareWithoutInvestment;

				//MarketShareWithInvestment
				var marketShareWithInvestment = oInvestmentModeloData[placeInArrayMarketShareWithInvestment][mandatoryProperties[j]];
				if (marketShareWithInvestment === null || marketShareWithInvestment === "" ||
					marketShareWithInvestment === "null") {
					marketShareWithInvestment = null;
				} else {
					marketShareWithInvestment = String(marketShareWithInvestment).replace(" %", "");
				}
				oInvestmentModeloData[placeInArrayMarketShareWithInvestment][mandatoryProperties[j]] = marketShareWithInvestment;
			}
		},
		/** 
		 * Adds a ‘%’ sign in the values of the MarketShareWithInvestment and MarketShareWithoutInvestment properties
		 * in the InvestmentJSONModel when the data is fetched from HANA.
		 */
		convertDecimalIntoStringPercentageCARInvestment: function () {
			var oInvestmentModeloData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();
			var mandatoryProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayMarketShareWithoutInvestment = this.checkIndexOfNameInHANAForInvestmentModel("MarketShareWithoutInvestment");
			if (placeInArrayMarketShareWithoutInvestment === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of Market Share Without Investment, please contact the IT department"
				);
			var placeInArrayMarketShareWithInvestment = this.checkIndexOfNameInHANAForInvestmentModel("MarketShareWithInvestment");
			if (placeInArrayMarketShareWithInvestment === -1)
				sap.m.MessageBox.error(
					"Failed to find the value of Market Share With Investment, please contact the IT department"
				);

			for (var j = 0; j < mandatoryProperties.length; j++) {
				//MarketShareWithoutInvestment
				var marketShareWithoutInvestment = oInvestmentModeloData[placeInArrayMarketShareWithoutInvestment][mandatoryProperties[j]];
				if (marketShareWithoutInvestment !== null && !marketShareWithoutInvestment.includes(" %") && marketShareWithoutInvestment !==
					"null") {
					oInvestmentModeloData[placeInArrayMarketShareWithoutInvestment][mandatoryProperties[j]] = String(marketShareWithoutInvestment +
						" %");
				}

				//MarketShareWithInvestment
				var marketShareWithInvestment = oInvestmentModeloData[placeInArrayMarketShareWithInvestment][mandatoryProperties[j]];
				if (marketShareWithInvestment !== null && !marketShareWithInvestment.includes(" %") && marketShareWithInvestment !== "null") {
					oInvestmentModeloData[placeInArrayMarketShareWithInvestment][mandatoryProperties[j]] = String(marketShareWithInvestment + " %");
				}
			}
		},
		/** 
		 * All Int32 and Decimal types that are “” needs to be converted into null
		 * This method gets called before posting to HANA
		 */
		convertEmptyStringIntoNullForBackend: function () {
			var propertiesHasToBeNullCARModel = [
				"FinancingTypeId", "SubCategoryId", "OperationsAttachmentId", "CARAmountLC", "LeaseAmountLC", "TotalAmountLC", "CARAmountLFLEUR",
				"LeaseAmountLFLEUR", "TotalAmountLFLEUR", "CARAmountHISTEUR", "LeaseAmountHISTEUR", "TotalAmountHISTEUR",
				"CARFinancialAnalysisAttachmentId", "BusinessCaseAttachmentId", "BudgetExtension", "CARReferenceID", "InternalOrderRef",
				"CategoryId"
			];

			var propertiesHasToBeNullCARKPIModel = ["ROICBefore", "ROICAfter", "NPVLC",
				"Payback", "IRR", "FinancialCost", "YearsOfContract", "InterestRate", "Debt", "PlantOUOEBefore", "PlantOUOEAfter",
				"AdditionalCapacity", "NegotiatedOffer",
				"PackAndFormulaFlex"
			];

			var propertiesHasToBeNullCAROnePlanetModel = ["CurrentYearProd", "CurrentEnergyConsumption", "ProjectEnergyConsumption",
				"SiteProjectEnergyConsumption",
				"BeforeGreenEnergy", "AfterGreenEnergy",
				"GreenEnergyTypeId", "SitePlasticRecyclable", "SitePET", "ProjectPlasticRecyclable", "ProjectPET",
				"AfterProjectPlasticRecyclable", "AfterProjectPET", "SiteCO2",
				"ProjectCO2", "SiteProjectInclCO2", "WWBUAverageCO2", "SiteWater", "ProjectWater", "SiteProjectInclWater",
				"WBUAverageWater", "SiteComplianceWater", "ProjectComplianceWater", "SiteProjectInclComplianceWater",
				"GreenPaybackMonths", "AdditionalVolumeY3", "ProjectVolume", "SiteY1CO2", "SiteVolumeEffectCO2", "SiteAfterProjectY1CO2",
				"SiteGreenCO2", "SiteTotalVarCO2", "WWBUAvgEnergyConsumption"
			];

			for (var i = 0; i < propertiesHasToBeNullCARModel.length; i++) {
				if (this.getView().getModel("CARModel").getProperty("/" + propertiesHasToBeNullCARModel[i]) === "") {
					this.getView().getModel("CARModel").setProperty("/" + propertiesHasToBeNullCARModel[i], null);
				}
			}

			for (var i = 0; i < propertiesHasToBeNullCARKPIModel.length; i++) {
				if (this.getView().getModel("CARKPIModel").getProperty("/" + propertiesHasToBeNullCARKPIModel[i]) === "") {
					this.getView().getModel("CARKPIModel").setProperty("/" + propertiesHasToBeNullCARKPIModel[i], null);
				}
			}

			for (var i = 0; i < propertiesHasToBeNullCAROnePlanetModel.length; i++) {
				if (this.getView().getModel("CAROnePlanetModel").getProperty("/" + propertiesHasToBeNullCAROnePlanetModel[i]) === "") {
					this.getView().getModel("CAROnePlanetModel").setProperty("/" + propertiesHasToBeNullCAROnePlanetModel[i], null);
				}
			}
		},
		/** 
		 * Certain properties are integer values but needs to be converted to String values
		 * This method gets called before posting to the HANA
		 */
		_convertIntegerAndDecimalsIntoStringForBackend: function () {
			var that = this;
			var propertiesHasToBeStringsCARModel = ["CARAmountHISTEUR", "CARAmountLC", "CARAmountLFLEUR",
				"LeaseAmountHISTEUR", "LeaseAmountLC", "LeaseAmountLFLEUR",
				"SNAmountEUR", "TotalAmountHISTEUR", "TotalAmountLC", "TotalAmountLFLEUR"
			];
			var propertiesHasToBeStringsTopLineModel = ["MarketShareWithoutInvestment", "MarketShareWithInvestment"];
			var value;

			for (var i = 0; i < propertiesHasToBeStringsCARModel.length; i++) {
				value = that.getView().getModel("CARModel").getProperty("/" + propertiesHasToBeStringsCARModel[i]);
				if (value !== null)
					that.getView().getModel("CARModel").setProperty("/" + propertiesHasToBeStringsCARModel[i], String(value));
			}
		},
		/** 
		 * This method executes all promises that have been made to post the data to HANA and Docii
		 */
		saveToBackend: function (request) {
			var that = this;
			var oCARModel = this.getView().getModel("CARModel");
			oCARModel.setProperty("/Status", "Draft");
			that.saveCAR(request).then(function (success) {
				that.fromODataToJSON();
				that.saveCARKPI(request);
				that.saveCAROnePlanet(request);
				that.saveCARFinancial(request);
				that.saveCARAttachmentsToDocii(request);

				if (oCARModel.getProperty("/SubCategoryId") === 7 && that.checkIfCompleteTopLine()) { //Save Top Line
					if (that.bTopLinePosted)
						that.saveTopLine("PUT");
					else {
						that.saveTopLine("POST");
						that.bTopLinePosted = true;
					}

				} else if (oCARModel.getProperty("/SubCategoryId") === 8 && that.checkIfCompleteInvestment()) { //Save Investment
					if (that.bInvestmentPosted)
						that.saveInvestment("PUT");
					else {
						that.saveInvestment("POST");
						that.bInvestmentPosted = true;
					}

				}
				Promise.all(that.promisesSaveForDocii)
					.then(function (result) { //After the attachments are posted to Docii, we do the other posts (Financial, One Planet, KPI, Attachment, Investment and Top Line)
						Promise.all(that.promisesAttachments)
							.then(function (resultData) {
								Promise.all(that.promisesSave)
									.then(function (resultData) {
										that.convertDecimalIntoStringPercentageCARKPI();
										sap.m.MessageToast.show("CAR is successfully saved");
										that.getView().setBusy(false);
									})
									.catch(function (oErrorOther) { // Post of KPI, One Planet, Financial failed
										that.convertDecimalIntoStringPercentageCARKPI();
										that.getView().setBusy(false);
										that.showErrorMessageFromBackend(
											"Failed to save the CAR.\nPlease contact the IT department with following error:", oErrorOther);
									});
							})
							.catch(function (oErrorAttach) { // Post of attachments failed 
								that.getView().setBusy(false);
								that.showErrorMessageFromBackend(
									"Failed to save the attachments of the CAR, please try again.\n Or contact the IT department with following error:",
									oErrorAttach);
							});
					})
					.catch(function (oErrorDocii) { // Post to Docii failed
						that.getView().setBusy(false);
						that.showErrorMessageFromBackend(
							"Failed to save the attachments of the CAR to Docii, please try again. \nOr contact the IT department with following error:",
							oErrorDocii);
					});
			}).catch(function (oErrorCAR) { // Entity CAR failed posting
				that.fromODataToJSON();
				that.getView().setBusy(false);
				that.showErrorMessageFromBackend(
					"Failed to save the CAR.\n contact the IT department with following error:", oErrorCAR);
			});
		},
		/** 
		 * Because we have many entities that needs to be posted to HANA, like CAR, KPI, Financial (7 times), OnePlanet, Investment (7 times), … 
		 * it is tricky that there is no data loss. To avoid the situation where you have a Car entity, but no KPI, Financials, OnePlanet, … 
		 * We decided to post the entities in a JSON format to a script, called ‘CreateCARAndRelated.xsjs’.
		 * Once the post is succeeded, the attachments are posted to Docii and after that they are posted into HANA
		 */
		_saveToBackendViaJSONModel: function () {
			var that = this;
			var oCARModel = this.getView().getModel("CARModel");
			oCARModel.setProperty("/Status", "Draft");
			var jsonModel = this._changeTheOdataModeltoJSONModel();
			var sUrl = "/HANA/ZCORFI10245/SCRIPTS/CreateCARAndRelated.xsjs";
			this.ajaxPatchForFirstPostWithJSONModel(sUrl, "POST", JSON.stringify(jsonModel))
				.then(function (result) {
					that._readCARDataFromBackend(result)
						.then(function (dataResp) {
							that.getView().getModel("CARModel").setProperty("/CreatedOn", that._convertJavascriptDateToDateWithDashes(dataResp.CreatedOn));
							that.getView().getModel("CARModel").setProperty("/CreatedBy", dataResp.CreatedBy);
							that.getView().getModel("CARModel").setProperty("/ChangedOn", that._convertJavascriptDateToDateWithDashes(dataResp.ChangedOn));
							that.getView().getModel("CARModel").setProperty("/ChangedBy", dataResp.ChangedBy);
							that.getView().getModel("CARModel").setProperty("/Id", dataResp.Id);

							that.saveCARAttachmentsToDocii("POST"); //We need the CARId for posting to Docii
							Promise.all(that.promisesSaveForDocii)
								.then(function (result) { //After the attachments are posted to Docii, we do the other posts (Financial, One Planet, KPI, Attachment, Investment and Top Line)
									Promise.all(that.promisesAttachments)
										.then(function (resultData) {
											that.getView().setBusy(false);
											sap.m.MessageToast.show("CAR is successfully saved");
										})
										.catch(function (oError) {
											that.getView().setBusy(false);
											that.showErrorMessageFromBackend(
												"Failed to save the attachments of the CAR, please try again.\n Or contact the IT department with following error:",
												oError);
										});
								})
								.catch(function (failure) {
									that.getView().setBusy(false);
									that.showErrorMessageFromBackend(
										"Failed to save the attachments of the CAR, please try again.\n Or contact the IT department with following error:",
										failure);
								});
						})
						.catch(function (dataResp) {
							that.getView().setBusy(false);
							that.showErrorMessageFromBackend("Failed to fetch the CAR, please contact the IT department with following error:", dataResp);
						});
				})
				.catch(function (result) {
					that.getView().setBusy(false);
					that.showErrorMessageFromBackend("Failed to save the CAR, please contact the IT department with following error:", result);
				});
		},
		/** 
		 * Fetches the CAR with a certain Id from HANA
		 * @param CARId
		 */
		_readCARDataFromBackend: function (CARId) {
			var sURLForCAR = "/CAR(" + CARId + ")";
			var that = this;

			return new Promise(function (resolve, reject) {
				that.getView().getModel().read(sURLForCAR, {
					success: function (result) {
						resolve(result);
					},
					error: function (dataResp) {
						reject(dataResp);
					}
				});
			});
		},
		/** 
		 * This converts the data in the models into JSON format to send it to the backend for the first time.
		 * It converts the data for the entities: CAR, CARKPI, CAROnePlanet, CARFinancial, TopLine and Investment
		 * @returns Object
		 */
		_changeTheOdataModeltoJSONModel: function () {
			var that = this;
			var KPI = {};
			var OnePlanet = {};

			var oCARModel = this.getView().getModel("CARModel");
			// CAR
			var jsonObj = {};
			jsonObj.CAR = oCARModel.getData();
			for (var key of Object.keys(jsonObj.CAR)) {
				if (!Number.isNaN(parseFloat(jsonObj.CAR[key])) && !key.includes("Id") && !key.includes("Date") && !key.includes("Since") && !key
					.includes("BusinessObj")) {

					if (key === "ForWBS" || key === "InRadar" || key === "Name" || key === "Leader" || key === "BusinessObj" || key ===
						"InternalOrderRef" || key === "InStrategicPlan" || key === "InRollingForecast" || key === "Status" || key === "CreatedBy" || key ===
						"ChangedBy" || key === "Comment" || key === "SiteId" || key === "SN" || key === "CountryId" || key === "SNDemandNumber" || key ===
						"SNDemandURL" || key === "WWBUId" || key === "RegionId" || key === "ZoneId" || key === "ClusterId" || key === "CBUId" || key ===
						"XCBU" || key ===
						"XCBUOneId" || key === "XCBUTwoId" || key === "XCBUThreeId" || key ===
						"GroupId" || key === "CurrencyId" || key === "Quarter") { //This are the Strings in CAR Entity, so not allowed to be null
						if (jsonObj.CAR[key] === null)
							jsonObj.CAR[key] = "";
					} else { //These are Integer or Decimal values
						if (jsonObj.CAR[key] === "") { //No "" allowed for Integer or Decimal values
							jsonObj.CAR[key] = null;
						} else {
							if (String(jsonObj.CAR[key]).includes(",")) { //When we do a parseFloat on an "4,86" for example, it cuts the ",86". That is why we replace the "," for a ".""
								jsonObj.CAR[key] = String(jsonObj.CAR[key]).replace(",", ".");
							}
							jsonObj.CAR[key] = parseFloat(jsonObj.CAR[key]);
						}
					}
				}
			}

			// CAR KPI
			for (var key of Object.keys(this.getView().getModel("CARKPIModel").getData())) {
				var KPIData = this.getView().getModel("CARKPIModel").getData()[key];
				if (key === "CARId")
					continue;

				if (key === "PackAndFormulaFlex" || key === "Debt") {
					if (KPIData === null) // PackAndFormulaFlex and Debt are not allowed to be null
						KPIData = "";
				} else {
					if (KPIData === "")
						KPIData = null; // Everything else is or an Integer or a Decimal, so no "" allowed
				}

				if (!Number.isNaN(parseFloat(KPIData)) && key !== "PackAndFormulaFlex" && key !== "Debt") {
					if (String(KPIData).includes(",")) { //When we do a parseFloat on an "4,86" for example, it cuts the ",86". That is why we replace the "," for a ".""
						KPIData = String(KPIData).replace(",", ".");
					}
					KPI[key] = parseFloat(KPIData);
				} else {
					KPI[key] = KPIData
				}
			}
			jsonObj.KPI = KPI;

			// CAR One Planet
			for (var key of Object.keys(this.getView().getModel("CAROnePlanetModel").getData())) {
				var OnePlanetData = this.getView().getModel("CAROnePlanetModel").getData()[key];
				if (key === "CARId")
					continue;

				if (key === "Other") {
					if (OnePlanetData === null) //Other are not allowed to be null
						OnePlanetData = "";
				} else {
					if (OnePlanetData === "") //Everything else is or an Integer or a Decimal, so no "" allowed
						OnePlanetData = null;
				}

				if (!Number.isNaN(parseFloat(OnePlanetData)) && key !== "Other") {
					if (String(OnePlanet[key]).includes(",")) { //When we do a parseFloat on an "4,86" for example, it cuts the ",86". That is why we replace the "," for a ".""
						OnePlanet[key] = String(OnePlanet[key]).replace(",", ".");
					}
					OnePlanet[key] = parseFloat(OnePlanetData);
				} else {
					OnePlanet[key] = OnePlanetData
				}
			}
			jsonObj.OnePlanet = OnePlanet

			// CAR Financial
			jsonObj.Financial = this._getFinancialJSONModel();
			for (var i = 0; i < jsonObj.Financial.length; i++) {
				for (var key of Object.keys(jsonObj.Financial[i])) {
					if (!Number.isNaN(parseInt(jsonObj.Financial[i][key]))) { //We are sure the data is a number
						if (String(jsonObj.Financial[i][key]).includes(",")) {
							jsonObj.Financial[i][key] = String(jsonObj.Financial[i][key]).replace(",", ".");
						}
						jsonObj.Financial[i][key] = parseFloat(jsonObj.Financial[i][key]);
					}
				}
			}

			// CAR Top Line
			if (oCARModel.getProperty("/SubCategoryId") === 7 && that.checkIfCompleteTopLine()) {
				var oTopLineModel = sap.ui.getCore().getModel("TopLineGraphData");

				for (var i = 0; i < oTopLineModel.getData().length; i++) {
					oTopLineModel.getData()[i].Year = i + 1;

					for (var key of Object.keys(oTopLineModel.getData()[i])) {
						if (!Number.isNaN(parseInt(oTopLineModel.getData()[i][key]))) //We are sure the data is a number
							oTopLineModel.getData()[i][key] = parseInt(oTopLineModel.getData()[i][key]);
					}
				}
				jsonObj.TopLine = oTopLineModel.getData();
				that.bTopLinePosted = true;
			}

			// CAR Investment
			if (oCARModel.getProperty("/SubCategoryId") === 8 && that.checkIfCompleteInvestment()) {
				var oInvestmentModel = sap.ui.getCore().getModel("InvestmentGraphData");

				for (var i = 0; i < oInvestmentModel.getData().length; i++) {
					oInvestmentModel.getData()[i].Year = i + 1;
					for (var key of Object.keys(oInvestmentModel.getData()[i])) {
						if (!Number.isNaN(parseInt(oInvestmentModel.getData()[i][key]))) { //We are sure the data is a number 
							if (String(oInvestmentModel.getData()[i][key]).includes(",")) {
								oInvestmentModel.getData()[i][key] = String(oInvestmentModel.getData()[i][key]).replace(",", ".");
							}
							oInvestmentModel.getData()[i][key] = String(oInvestmentModel.getData()[i][key]);
						}
					}
				}
				jsonObj.Investment = oInvestmentModel.getData();
				that.bInvestmentPosted = true;
			}

			return jsonObj;
		},
		/** 
		 * This method returns the ajax call to save the CARModel data to the CAR entity in HANA
		 * @param request
		 * @returns Promise
		 */
		saveCAR: function (request) {
			var sUrl = "";
			var oCARModel = this.getView().getModel("CARModel");
			// oCARModel.setProperty("/RegionId", "");
			var sCARModel = JSON.stringify(oCARModel["oData"]);
			if (request === "POST") {
				sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAR";
			} else {
				sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAR(" + String(oCARModel.getProperty("/Id")) + ")";
			}

			return this.ajaxPatch(sUrl, request, sCARModel);
		},
		/** 
		 * Adds the 7 Promises for each year into the promisesSave variable to post the incrementalBusinessJSONModel into the entity CARFinancial
		 * @param request
		 */
		saveCARFinancial: function (request) {
			var that = this;
			this.promisesFinancialTable = [];
			var oIncrementalBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");
			var oCARModel = this.getView().getModel("CARModel");
			var sCARFinancialModel;
			var sUrl = "";

			var years = this._getFinancialJSONModel();

			for (var j = 0; j < years.length; j++) {
				years.CARId = oCARModel.getData().Id;
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARFinancial(CARId=" + parseFloat(oCARModel.getProperty("/Id")) +
					",Year=" + years[j].Year + ")";
				sCARFinancialModel = JSON.stringify(years[j]);
				that.promisesSave.push(this.ajaxPatch(sUrl, request, sCARFinancialModel));
			}

			this.convertDecimalIntoStringPercentageCARFinancial();

		},
		/** 
		 * Converts the incrementalBusinessJSONModel into 7 JSON models for each year and returns those 7 JSON models as an array
		 * @returns Array of Objects
		 */
		_getFinancialJSONModel: function () {
			var oIncrementalBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");
			var oCARModel = this.getView().getModel("CARModel");
			var oFinancialJSONModel = [];
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation"); // Used to load the models that are predefined in the application

			var years = [];
			var Y1 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y2 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y3 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y4 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y5 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y6 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y7 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			years.push(Y1, Y2, Y3, Y4, Y5, Y6, Y7);

			var i, j;

			for (j = 0; j < years.length; j++) {
				for (i = 0; i < oIncrementalBusinessModel["oData"].length; i++) {
					// years[j]["oData"].CARId = oCARModel["oData"].Id;
					years[j]["oData"].Year = (j + 1);

					var row = oIncrementalBusinessModel["oData"][i];

					var yearString = String("Y" + (j + 1));
					var propName = oIncrementalBusinessModel["oData"][i]["NameInHANA"];
					years[j]["oData"][propName] = row[yearString];
				}
				if (years[j]["oData"].FCFLC === "") {
					years[j]["oData"].FCFLC = null;
				}
				if (years[j]["oData"].ROSLC === "") {
					years[j]["oData"].ROSLC = null;
				}
				if (years[j]["oData"].CARCashOut === "") {
					years[j]["oData"].CARCashOut = null;
				}
				if (years[j]["oData"].LeaseCashOut === "") {
					years[j]["oData"].LeaseCashOut = null;
				}
				if (years[j]["oData"].Volume === "") {
					years[j]["oData"].Volume = null;
				}
				if (years[j]["oData"].NetSalesLC === "") {
					years[j]["oData"].NetSalesLC = null;
				}
				if (years[j]["oData"].CO === "") {
					years[j]["oData"].CO = null;
				}
				if (years[j]["oData"].ROPLC === "") {
					years[j]["oData"].ROPLC = null;
				}

				oFinancialJSONModel.push(years[j].getData());
			}

			return oFinancialJSONModel;
		},
		/** 
		 * Pushes the Promise into the promisesSave variable to post the CARKPIModel into the entity CARKPI in the backend
		 * @param request
		 */
		saveCARKPI: function (request) {
			var oCARKPIModel = this.getView().getModel("CARKPIModel");
			oCARKPIModel.setProperty("/CARId", this.getView().getModel("CARModel").getProperty("/Id"));
			var sCARKPIModel = JSON.stringify(oCARKPIModel["oData"]);
			if (request === "POST") {
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARKPI";
			} else {
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARKPI(" + String(oCARKPIModel.getProperty("/CARId")) + ")";
			}

			this.promisesSave.push(this.ajaxPatch(sUrl, request, sCARKPIModel));
		},
		/** 
		 * Pushes a new Promise into the promisesSave variable to post the data in CAROnePlanetModel into the CAROnePlanet entity
		 * @param request
		 */
		saveCAROnePlanet: function (request) {
			var sUrl = "";
			var oCAROnePlanetModel = this.getView().getModel("CAROnePlanetModel");
			oCAROnePlanetModel.setProperty("/CARId", this.getView().getModel("CARModel").getProperty("/Id"));
			var sCAROnePlanetModel = JSON.stringify(oCAROnePlanetModel["oData"]);
			if (request === "POST") {
				sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAROnePlanet";
			} else {
				sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAROnePlanet(" + String(oCAROnePlanetModel.getProperty("/CARId")) + ")";
			}

			this.promisesSave.push(this.ajaxPatch(sUrl, request, sCAROnePlanetModel));
		},
		/** 
		 * Pushes the Promise into the promisesSave variable to post the data from the TopLineGraphData model in the TopLine entity
		 * @param request
		 */
		saveTopLine: function (request) {
			var sUrl = "";
			var oTopLineModel = sap.ui.getCore().getModel("TopLineGraphData");
			var iCARId = this.getView().getModel("CARModel").getProperty("/Id");

			for (var i = 0; i < oTopLineModel.getData().length; i++) {
				oTopLineModel.getData()[i].CARId = iCARId;
				oTopLineModel.getData()[i].Year = i + 1;

				var sTopLineModel = JSON.stringify(oTopLineModel.getData()[i]);
				var iYear = i + 1;
				if (request === "POST") {
					sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/TopLine";
				} else {
					sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/TopLine(CARId=" + iCARId + ",Year=" + iYear + ")";
				}
				this.promisesSave.push(this.ajaxPatch(sUrl, request, sTopLineModel));
			}
		},
		/** 
		 * Pushes a new Promise into the promisesSave variable to post the data from the InvestmentGraph model in the Investment entity in HANA
		 * @param request
		 */
		saveInvestment: function (request) {
			var sUrl = "";
			var oInvestmentModel = sap.ui.getCore().getModel("InvestmentGraphData");
			var iCARId = this.getView().getModel("CARModel").getProperty("/Id");

			for (var i = 0; i < oInvestmentModel.getData().length; i++) {
				for (var key of Object.keys(oInvestmentModel.getData()[i])) {
					if (!Number.isNaN(parseInt(oInvestmentModel.getData()[i][key]))) { //We are sure the data is a number 
						oInvestmentModel.getData()[i][key] = String(oInvestmentModel.getData()[i][key]);
					}
				}
				oInvestmentModel.getData()[i].CARId = iCARId;
				oInvestmentModel.getData()[i].Year = i + 1;

				var sInvestmentModel = JSON.stringify(oInvestmentModel.getData()[i]);
				var iYear = i + 1;
				if (request === "POST") {
					sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/Investment";
				} else {
					sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/Investment(CARId=" + iCARId + ",Year=" + iYear + ")";
				}
				this.promisesSave.push(this.ajaxPatch(sUrl, request, sInvestmentModel));
			}
		},
		/** 
		 * Checks if the attachments are changed and calls the methods to post them to Docii if they have changed
		 * @param request
		 */
		saveCARAttachmentsToDocii: function (request) {
			var CARAttachmentsJSONModel = this.getView().getModel("CARAttachmentsJSONModel");
			if (CARAttachmentsJSONModel.getProperty("/CARPictureChanged")) {
				this._writeCARAttachmentToDocii("POST", "CARPicture"); //Docii allows only POST requests
				CARAttachmentsJSONModel.setProperty("/CARPictureChanged", false);
			}
			if (CARAttachmentsJSONModel.getProperty("/CAROperationsChanged")) {
				this._writeCARAttachmentToDocii("POST", "CAROperations"); //Docii allows only POST requests
				CARAttachmentsJSONModel.setProperty("/CAROperationsChanged", false);
			}
			if (CARAttachmentsJSONModel.getProperty("/CARFinancialAnalysisChanged")) {
				this._writeCARAttachmentToDocii("POST", "CARFinancialAnalysis"); //Docii allows only POST requests
				CARAttachmentsJSONModel.setProperty("/CARFinancialAnalysisChanged", false);
			}
			if (CARAttachmentsJSONModel.getProperty("/CARBusinessCaseChanged")) {
				this._writeCARAttachmentToDocii("POST", "CARBusinessCase"); //Docii allows only POST requests
				CARAttachmentsJSONModel.setProperty("/CARBusinessCaseChanged", false);
			}

			var oOptionalAttachments = this.getView().getModel("dociiOptionalAttachmentModel").getData();
			for (var i = 0; i < oOptionalAttachments.length; i++) {
				if (CARAttachmentsJSONModel.getProperty("/CAROptionalAttachment" + i + "Changed")) {
					this.getView().setModel(new sap.ui.model.json.JSONModel({}), String("CAROptionalAttachment" + i + "JSONModel"));
					this._writeCARAttachmentToDocii("POST", "CAROptionalAttachment" + i); //Docii allows only POST requests
					CARAttachmentsJSONModel.setProperty("/CAROptionalAttachment" + i + "Changed", false);
				}
			}
		},
		/** 
		 * This method stores the post of an attachment to Docii into the promisesSaveForDocii variable 
		 * and gets back an objectId that is stored in HANA once the post is succeeded
		 * @param request
		 * @param modelName
		 */
		_writeCARAttachmentToDocii: function (request, modelName) {
			var that = this;
			var CARModel = this.getView().getModel("CARModel");
			var sURLDocii = "/api_docii/file/multipart/cap/" + CARModel.getProperty("/Id");
			var CARAttachmentsJSONModel = this.getView().getModel("CARAttachmentsJSONModel");

			var fileNameBeforeExtension = CARAttachmentsJSONModel.getProperty("/FileName" + modelName).split(".")[0];
			var fileNameAfterExtension = CARAttachmentsJSONModel.getProperty("/FileName" + modelName).split(".")[1];
			var fileNameWithVersion;

			var AttachmentJSONModel = this.getView().getModel(modelName + "JSONModel"); //CARPictureJSONModel for example
			if (AttachmentJSONModel.getData() === undefined)
				AttachmentJSONModel.setData({});
			var CARAttachmentFormData = new FormData();
			if (modelName.includes("Optional")) {
				if (this.attachmentVersions.CAROptionalVersion[CARAttachmentsJSONModel.getProperty("/FileName" + modelName)] === undefined)
					this.attachmentVersions.CAROptionalVersion[CARAttachmentsJSONModel.getProperty("/FileName" + modelName)] = 1;

				fileNameWithVersion = fileNameBeforeExtension + " - Version" + this.attachmentVersions.CAROptionalVersion[CARAttachmentsJSONModel
					.getProperty(
						"/FileName" + modelName)]++ + "." + fileNameAfterExtension;
			} else {
				if (modelName.includes("Picture"))
					fileNameWithVersion = fileNameBeforeExtension + "." + fileNameAfterExtension;
				else
					fileNameWithVersion = fileNameBeforeExtension + " - Version" + this.attachmentVersions[
						modelName + "Version"]++ + "." + fileNameAfterExtension;

			}

			// CARAttachmentFormData.append("file", fileNameWithVersion);
			CARAttachmentFormData.append("app", "cap");
			CARAttachmentFormData.append("description", CARAttachmentsJSONModel.getProperty("/Description" + modelName));
			CARAttachmentFormData.append("businessobject", CARModel.getProperty("/Id"));
			// CARAttachmentFormData.append("file", CARAttachmentsJSONModel.getProperty("/" + modelName + "Base64"));
			CARAttachmentFormData.append("file", CARAttachmentsJSONModel.getProperty("/" + modelName + "File"));
			CARAttachmentFormData.append("filename", fileNameWithVersion);

			// For testing reasons, this method is used to calculate the sice of the encoded base 64
			// this.calculateFileSizeFromEncodedBase64(CARAttachmentsJSONModel.getProperty("/" + modelName + "Base64"));

			this.promisesSaveForDocii.push(
				this.xhrRequestPostToDocii(sURLDocii, request, CARAttachmentFormData).then(function (success) {
					that.getView().getModel(modelName + "JSONModel").setProperty("/CARId", CARModel.getProperty("/Id"));
					that.getView().getModel(modelName + "JSONModel").setProperty("/FileName", fileNameWithVersion);
					that.getView().getModel(modelName + "JSONModel").setProperty("/MimeType", CARAttachmentsJSONModel.getProperty("/MimeType" +
						modelName));
					that.getView().getModel(modelName + "JSONModel").setProperty("/Description", CARAttachmentsJSONModel.getProperty("/Description" +
						modelName));
					that.getView().getModel(modelName + "JSONModel").setProperty("/ObjectId", JSON.parse(success).objectId);

					//that.attachmentVersions[modelName + "Version"]++;
					that._writeAttachmentsToBackend(request, modelName);
				}).catch(function (failure) {
					that.showErrorMessageFromBackend(
						"Not able to post an attachment, please contact the IT department with following error:", failure);
					// sap.m.MessageBox.error("Not able to post an attachment, please contact the IT department with following error:", {
					// 	styleClass: "sapUiSizeCompact",
					// 	details: failure
					// });
				})
			);
		},
		/** 
		 * Once the post to Docii is successful, this method calls the _writeCARAttachmentToBackend method to post the attachment to HANA
		 * @param request
		 * @param modelName
		 */
		_writeAttachmentsToBackend: function (request, modelName) {
			this._writeCARAttachmentToBackend(modelName + "JSONModel", "POST"); //There is always a POST to HANA, because you can't change the filename (that's a key)
		},
		/** 
		 * This method pushes the Promise, retrieved from the method ajaxPatch, 
		 * into the promisesAttachments variable to post the data from the attachment model into the CARAttachment entity in HANA
		 * @param modelName
		 * @param request
		 */
		_writeCARAttachmentToBackend: function (modelName, request) {
			var oCARAttachmentJSONModel = this.getView().getModel(modelName);
			var sCARAttachmentJSONModel = JSON.stringify(oCARAttachmentJSONModel.getData());
			if (request === "POST") {
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARAttachment";
			} else {
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARAttachment(CARId=" + String(oCARAttachmentJSONModel.getProperty("/CARId")) +
					",FileName='" + String(oCARAttachmentJSONModel.getProperty("/FileName")) + "')";
			}

			this.promisesAttachments.push(this.ajaxPatch(sUrl, request, sCARAttachmentJSONModel));
		},
		/** 
		 * This method returns the ajax call to launch the CARModel data to the CAR entity in HANA
		 * @returns Promise
		 */
		launchCAR: function () {
			var oCARModel = this.getView().getModel("CARModel");
			oCARModel.setProperty("/Status", "Launched");
			// oCARModel.setProperty("/RegionId", "");
			var sCARModel = JSON.stringify(oCARModel["oData"]);
			var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAR(" + String(oCARModel.getProperty("/Id")) + ")";
			return this.ajaxPatch(sUrl, "Put", sCARModel);
		},
		/** 
		 * Adds the 7 Promises for each year into the promisesLaunch variable to post the incrementalBusinessJSONModel into the entity CARFinancial
		 */
		launchCARFinancial: function () {
			var oIncrementalBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");
			var oCARModel = this.getView().getModel("CARModel");
			var sCARFinancialModel;
			var sUrl;
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation"); // Used to load the models that are predefined in the application

			var years = [];
			var Y1 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y2 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y3 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y4 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y5 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y6 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			var Y7 = new sap.ui.model.json.JSONModel([sRootPath, "model/CARFinancialModel.json"].join("/"));
			years.push(Y1, Y2, Y3, Y4, Y5, Y6, Y7);

			var properties = ["CashOut", "Volume", "NetSalesLC", "CO", "ROPLC", "ROSLC", "FCFLC"];
			var i, j;

			for (j = 0; j < years.length; j++) {
				for (i = 0; i < oIncrementalBusinessModel["oData"].length; i++) {
					years[j]["oData"].CARId = oCARModel["oData"].Id;
					years[j]["oData"].Year = (j + 1);

					var row = oIncrementalBusinessModel["oData"][i];

					var yearString = String("Y" + (j + 1));
					var propName = oIncrementalBusinessModel["oData"][i]["NameInHANA"];
					years[j]["oData"][propName] = row[yearString];

				}
				if (years[j]["oData"].ROSLC === "") {
					years[j]["oData"].ROSLC = null;
				}
				sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARFinancial(CARId=" + parseFloat(oCARModel.getProperty("/Id")) + ",Year=" +
					years[j]["oData"].Year + ")";
				sCARFinancialModel = JSON.stringify(years[j]["oData"]);
				this.promisesLaunch.push(this.ajaxPatch(sUrl, "PUT", sCARFinancialModel));
			}

			this.convertDecimalIntoStringPercentageCARFinancial();
		},
		/** 
		 * Pushes the Promise into the promisesLaunch variable to post the CARKPIModel into the entity CARKPI in the backend
		 */
		launchCARKPI: function () {
			var oCARKPIModel = this.getView().getModel("CARKPIModel");
			oCARKPIModel.setProperty("/CARId", this.getView().getModel("CARModel").getProperty("/Id"));
			var sCARKPIModel = JSON.stringify(oCARKPIModel["oData"]);
			var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARKPI(" + String(oCARKPIModel.getProperty("/CARId")) + ")";
			this.promisesLaunch.push(this.ajaxPatch(sUrl, "PUT", sCARKPIModel));
			this.convertDecimalIntoStringPercentageCARKPI();
		},
		/** 
		 * Pushes a new Promise into the promisesLaunch variable to post the data in CAROnePlanetModel into the CAROnePlanet entity
		 */
		launchCAROnePlanet: function () {
			var oCAROnePlanetModel = this.getView().getModel("CAROnePlanetModel");
			oCAROnePlanetModel.setProperty("/CARId", this.getView().getModel("CARModel").getProperty("/Id"));
			var sCAROnePlanetModel = JSON.stringify(oCAROnePlanetModel["oData"]);
			var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAROnePlanet(" + String(oCAROnePlanetModel.getProperty("/CARId")) + ")";
			this.promisesLaunch.push(this.ajaxPatch(sUrl, "PUT", sCAROnePlanetModel));
		},
		/** 
		 * Clears the values in the view for certain radioButtons and inputs
		 */
		_clearValuesInView: function () {
			this.byId("inputWwbuNameId").setValue();
			this.byId("inputXWwbuOneNameId").setValue();
			this.byId("inputXWwbuTwoNameId").setValue();
			this.byId("inputXWwbuThreeNameId").setValue();
			var radioButtonIds = ["radioVisibleInRadarId", "radioForWBSId", "radioXCBUId", "radioInclStratPlanId",
				"radioInclInLastRollingForecastId",
				"radioSiteComplianceWaterId", "radioProjectComplianceWaterId", "radioSiteProjectInclComplianceWaterId"
			];

			for (var i = 0; i < radioButtonIds.length; i++) {
				this.byId(radioButtonIds[i]).setSelectedIndex(-1);
			}

			var percentageInputs = ["inputAfterProjectPlasticRecyclableId", "inputProjectPlasticRecyclableId", "inputSitePlasticRecyclableId",
				"inputAfterGreenEnergyId", "inputBeforeGreenEnergyId"
			];

			for (var i = 0; i < percentageInputs.length; i++) {
				this.byId(percentageInputs[i]).setValue();
			}
		},
		/** 
		 * Returns the Filename where the ‘ – Version X’ is removed
		 * @param fileName
		 * @returns String
		 */
		removeVersionInFileName: function (fileName) {
			var fileNameWithoutVersion = fileName;
			if (fileName.includes("- Version")) {
				var piecesWithDotInName = fileName.split(".");
				var tempExt = "." + piecesWithDotInName.pop(); //.pdf, .xlsx for example
				var tempBeforeVersion = fileName.split(" - Version")[0];
				fileNameWithoutVersion = tempBeforeVersion + tempExt;
			}

			return fileNameWithoutVersion;
		},
		/* =========================================================== */
		/* End of General methods */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for General Information */
		/* =========================================================== */
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		handleValueChangeCARPicture: function (oEvent) {
			LiveChangeController.handleValueChangeCARPicture(this);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioWBSSelected: function (oEvent) {
			LiveChangeController.radioWBSSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioXCBUSelected: function (oEvent) {
			LiveChangeController.radioXCBUSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioVisibleInRadarSelected: function (oEvent) {
			LiveChangeController.radioVisibleInRadarSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioInclStratPlanSelected: function (oEvent) {
			LiveChangeController.radioInclStratPlanSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onChangeSelectFinancingType: function (oEvent) {
			LiveChangeController.onChangeSelectFinancingType(this, oEvent);
			this._checkMandatoryFieldsWaterMonetizer();
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onCARCategoryChanged: function (oEvent) {
			LiveChangeController.onCARCategoryChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioIncludedInLastRollingForecastSelected: function (oEvent) {
			LiveChangeController.radioIncludedInLastRollingForecastSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioExtensionFlagSelected: function (oEvent) {
			LiveChangeController.radioExtensionFlagSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		changeSubCategory: function (oEvent) {
			LiveChangeController.changeSubCategory(this, oEvent);
		},
		/** 
		 * Checks the CategoryId that is selected and changes the picture according to the selected category
		 */
		_checkCategoryForCARPicture: function () {
			var iCategoryId = parseFloat(this.getView().getModel("CARModel").getProperty("/CategoryId"));
			var pictureFromUser = this.getView().getModel("RandomModel").getProperty("/pictureFromUser");
			var path = $.sap.getModulePath("com.danone.capcarcreation", "/img/C" + iCategoryId + ".png");
			this.getView().getModel("RandomModel").setProperty("/picture", path);
		},
		/** 
		 * Changes the amounts according to the selected FinancingType
		 */
		changeAmountWhenFinancingTypeChanges: function () {
			var iFinancingTypeId = this.getView().getModel("CARModel").getProperty("/FinancingTypeId");

			if (iFinancingTypeId === 1) {
				this.getView().getModel("CARModel").setProperty("/LeaseAmountLC", null);
				this.getView().getModel("CARModel").setProperty("/LeaseAmountLFLEUR", null);
				this.getView().getModel("CARModel").setProperty("/LeaseAmountHISTEUR", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountLC", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountLFLEUR", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountHISTEUR", null);
			}
			if (iFinancingTypeId === 2) {
				this.getView().getModel("CARModel").setProperty("/CARAmountLC", null);
				this.getView().getModel("CARModel").setProperty("/CARAmountLFLEUR", null);
				this.getView().getModel("CARModel").setProperty("/CARAmountHISTEUR", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountLC", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountLFLEUR", null);
				this.getView().getModel("CARModel").setProperty("/TotalAmountHISTEUR", null);
			}
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onCBUChanged: function (oEvent) {
			LiveChangeController.onCBUChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onSiteChanged: function (oEvent) {
			LiveChangeController.onSiteChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onXCBUOneChanged: function (oEvent) {
			LiveChangeController.onXCBUOneChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onXCBUTwoChanged: function (oEvent) {
			LiveChangeController.onXCBUTwoChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onXCBUThreeChanged: function (oEvent) {
			LiveChangeController.onXCBUThreeChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		expValidationDateChanged: function (oEvent) {
			LiveChangeController.expValidationDateChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		expGoLiveDateChanged: function (oEvent) {
			LiveChangeController.expGoLiveDateChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		sinceDateChanged: function (oEvent) {
			LiveChangeController.sinceDateChanged(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputCARAmountReq: function (oEvent) {
			LiveChangeController.onLiveChangeInputCARAmountReq(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputLeaseAmountReq: function (oEvent) {
			LiveChangeController.onLiveChangeInputLeaseAmountReq(this, oEvent);
		},
		/** 
		 * Calculates the WACC, Like for Like and Hist Rate value for the CAR amount after fetching the currency rate for the selected SiteId.
		 * It also calculates the Total amounts for WACC, LFL and Hist
		 */
		changeAmountCAR: function () {
			var iValue = parseFloat(this.getView().getModel("CARModel").getProperty("/CARAmountLC"));
			var that = this;
			var sURLCurrencyRate;
			var iLeaseAmountLC = parseFloat(this.getView().getModel("CARModel").getProperty("/LeaseAmountLC"));
			var iFinancingTypeId = this.getView().getModel("CARModel").getProperty("/FinancingTypeId");
			var sCountryId = String(this.getView().getModel("CARModel").getProperty("/CountryId"));

			this._checkMandatoryFieldsWaterMonetizer();

			//Calculate total KLC
			if (iFinancingTypeId === 3 && iLeaseAmountLC)
				that.getView().getModel("CARModel").setProperty("/TotalAmountLC", formatter.roundToTwoDecimals((iValue + iLeaseAmountLC)));
			else
				that.getView().getModel("CARModel").setProperty("/TotalAmountLC", formatter.roundToTwoDecimals((iValue)));

			//Calculate WACC, LFL and Hist
			if (this.getView().getModel("CARModel").getProperty("/CountryId")) {
				sURLCurrencyRate = "/CurrencyRate?$filter=CountryId= '" + sCountryId + "'";
				new Promise(function (resolve, reject) {
					that.getView().getModel().read(sURLCurrencyRate, {
						success: function (oData) {
							var currencyRateHist = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'Historic Rate';
							})[0];
							var currencyRateLFL = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'Like for Like';
							})[0];
							var currencyRateWACC = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'WACC';
							})[0];

							if (currencyRateHist) {
								var calcHist = parseFloat(currencyRateHist.Value) * iValue;
								that.getView().getModel("CARModel").setProperty("/CARAmountHISTEUR", formatter.roundToTwoDecimals(calcHist));
								if (iFinancingTypeId === 3 && iLeaseAmountLC)
									that.getView().getModel("CARModel").setProperty("/TotalAmountHISTEUR", formatter.roundToTwoDecimals((calcHist +
										(iLeaseAmountLC * parseFloat(currencyRateHist.Value)))));

							}
							if (currencyRateLFL) {
								var calcLFL = parseFloat(currencyRateLFL.Value) * iValue;
								that.getView().getModel("CARModel").setProperty("/CARAmountLFLEUR", formatter.roundToTwoDecimals(calcLFL));
								that._checkMandatoryFieldsWaterMonetizer();
								if (iFinancingTypeId === 3 && iLeaseAmountLC)
									that.getView().getModel("CARModel").setProperty("/TotalAmountLFLEUR", formatter.roundToTwoDecimals((calcLFL +
										(iLeaseAmountLC * parseFloat(currencyRateLFL.Value)))));
							}
							if (currencyRateWACC) {
								var calc = parseFloat(currencyRateWACC.Value);
								that.byId("idInputWacc").setValue(formatter.roundToTwoDecimals(calc) + " %");
							}

							resolve();
						},
						error: function (dataResp) {
							that.showErrorMessageFromBackend(
								"Failed to fetch the CurrencyRate, please contact the IT department with following error:", dataResp);
							reject();
						}
					});
				});
			}
		},
		/** 
		 * Calculates the WACC, Like for Like and Hist Rate value for the Lease amount after fetching the currency rate for the selected SiteId.
		 * It also calculates the Total amounts for WACC, LFL and Hist
		 */
		changeAmountLease: function () {
			var iValue = parseFloat(this.getView().getModel("CARModel").getProperty("/LeaseAmountLC"));
			var that = this;
			var sURLCurrencyRate;
			var iCARAmountLC = parseFloat(this.getView().getModel("CARModel").getProperty("/CARAmountLC"));
			var iFinancingTypeId = this.getView().getModel("CARModel").getProperty("/FinancingTypeId");
			var sCountryId = String(this.getView().getModel("CARModel").getProperty("/CountryId"));

			//Calculate total
			if (iFinancingTypeId === 3 && iCARAmountLC)
				that.getView().getModel("CARModel").setProperty("/TotalAmountLC", formatter.roundToTwoDecimals((iValue + iCARAmountLC)));
			else
				that.getView().getModel("CARModel").setProperty("/TotalAmountLC", formatter.roundToTwoDecimals((iValue)));
			//Calculate WACC, LFL and Hist
			if (this.getView().getModel("CARModel").getProperty("/CountryId")) {
				sURLCurrencyRate = "/CurrencyRate?$filter=CountryId= '" + sCountryId + "'";
				new Promise(function (resolve, reject) {
					that.getView().getModel().read(sURLCurrencyRate, {
						success: function (oData) {
							var currencyRateHist = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'Historic Rate';
							})[0];
							var currencyRateLFL = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'Like for Like';
							})[0];
							var currencyRateWACC = oData.results.filter(function (el) {
								return el.CountryId === sCountryId && el.RateType === 'WACC';
							})[0];

							if (currencyRateHist) {
								var calcHist = parseFloat(currencyRateHist.Value) * iValue;
								that.getView().getModel("CARModel").setProperty("/LeaseAmountHISTEUR", formatter.roundToTwoDecimals(calcHist));
								if (iFinancingTypeId === 3 && iCARAmountLC)
									that.getView().getModel("CARModel").setProperty("/TotalAmountHISTEUR", formatter.roundToTwoDecimals((calcHist +
										(iCARAmountLC * parseFloat(currencyRateHist.Value)))));
							}
							if (currencyRateLFL) {
								var calcLFL = parseFloat(currencyRateLFL.Value) * iValue;
								that.getView().getModel("CARModel").setProperty("/LeaseAmountLFLEUR", formatter.roundToTwoDecimals(calcLFL));
								if (iFinancingTypeId === 3 && iCARAmountLC)
									that.getView().getModel("CARModel").setProperty("/TotalAmountLFLEUR", formatter.roundToTwoDecimals((calcLFL +
										(iCARAmountLC * parseFloat(currencyRateLFL.Value)))));
							}
							if (currencyRateWACC) {
								var calc = parseFloat(currencyRateWACC.Value);
								that.byId("idInputWacc").setValue(formatter.roundToTwoDecimals(calc) + " %");
							}

							resolve();
						},
						error: function (dataResp) {
							that.showErrorMessageFromBackend(
								"Failed to fetch the CurrencyRate, please contact the IT department with following error:", dataResp);
							reject();
						}
					});
				});
			}
		},
		/* =========================================================== */
		/* End of methods for General Information */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Financial & Operational */
		/* =========================================================== */
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputFinancialTable: function (oEvent) {
			LiveChangeController.onLiveChangeInputFinancialTable(this, oEvent);
			if (this.giveCARId() !== 0) {
				this.convertDecimalIntoStringPercentageCARFinancial();
			}
		},
		/** 
		 * When ROP or NetSales changes, this method gets calles to calculate the value for ROS according to the next formula: (ROPPerYear/NetSalesPerYear)*100
		 * @param NetSalesPerYear
		 * @param ROPPerYear
		 * @param yearName
		 */
		validateROS: function (NetSalesPerYear, ROPPerYear, yearName) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			var placeInArrayROS = this.checkIndexOfNameInHANAForIncrementalBusinessModel("ROSLC");
			if (placeInArrayROS === -1)
				sap.m.MessageBox.error(
					"Failed to find ROS, please contact the IT department", {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);
			if (NetSalesPerYear && ROPPerYear) {
				if (NetSalesPerYear === 0 || ROPPerYear === 0) {
					this.getView().getModel("incrementalBusinessJSONModel").getData()[placeInArrayROS][yearName] = "0 %";
				} else {
					this.getView().getModel("incrementalBusinessJSONModel").getData()[placeInArrayROS][yearName] = String(formatter.roundToOneDecimal(
						(ROPPerYear / NetSalesPerYear) * 100) + " %");
				}
			} else {
				this.getView().getModel("incrementalBusinessJSONModel").getData()[placeInArrayROS][yearName] = "0 %";
			}
		},
		/** 
		 * When a new FinancingType is selected, the table needs to be checked if it is correct
		 */
		changeFinancialTableWhenFinancingTypeChanges: function () {
			var iFinancingTypeId = this.getView().getModel("CARModel").getProperty("/FinancingTypeId");
			var incrBusinessModel = this.getView().getModel("incrementalBusinessJSONModel");

			var jsonFromModel = JSON.parse(incrBusinessModel.getJSON());
			if (iFinancingTypeId === 1) {
				if (jsonFromModel[0].NameInHANA === "LeaseCashOut" && jsonFromModel[1].NameInHANA !== "LeaseCashOut") {
					jsonFromModel[0].Name = "Capex Cash-Out (k-LC)";
					jsonFromModel[0].NameInHANA = "CARCashOut";
				} else {
					if (jsonFromModel[0].NameInHANA === "CARCashOut" && jsonFromModel[1].NameInHANA !== "LeaseCashOut")
						return;
					else
						jsonFromModel.splice(1, 1);
				}
			} else {
				if (iFinancingTypeId === 2) {
					if (jsonFromModel[0].NameInHANA === "CARCashOut" && jsonFromModel[1].NameInHANA !== "LeaseCashOut") {
						jsonFromModel[0].Name = "Lease Cash-Out (k-LC)";
						jsonFromModel[0].NameInHANA = "LeaseCashOut";
					} else {
						jsonFromModel[0] = jsonFromModel[1];
						jsonFromModel.splice(1, 1);
					}

				} else {
					if (iFinancingTypeId === 3) {
						if (jsonFromModel[0].NameInHANA === "CARCashOut") {
							jsonFromModel.splice(1, 0, {
								"Name": "Lease Cash-Out (k-LC)",
								"Y1": "0",
								"Y2": "0",
								"Y3": "0",
								"Y4": "0",
								"Y5": "0",
								"Y6": "0",
								"Y7": "0",
								"NameInHANA": "LeaseCashOut",
								"required": true,
								"type": "Number"
							});
						} else {
							jsonFromModel.splice(0, 0, {
								"Name": "Capex Cash-Out (k-LC)",
								"Y1": "0",
								"Y2": "0",
								"Y3": "0",
								"Y4": "0",
								"Y5": "0",
								"Y6": "0",
								"Y7": "0",
								"NameInHANA": "CARCashOut",
								"required": true,
								"type": "Number"
							});
						}
					}
				}
			}

			incrBusinessModel.setJSON(JSON.stringify(jsonFromModel));
		},
		/** 
		 * Clears the data in the KPI Model when the financing type changes from Lease to CAPEX
		 * @param iPreviousFinancingTypeId
		 * @param iCurrentFinancingTypeId
		 */
		clearDataInKPI: function (iPreviousFinancingTypeId, iCurrentFinancingTypeId) {
			var oCARKPIModel = this.getView().getModel("CARKPIModel");
			if (iPreviousFinancingTypeId === 2 && iCurrentFinancingTypeId === 1) { // The FinancingType has changed from Lease to CAPEX
				oCARKPIModel.setProperty("/FinancialCost", null);
				oCARKPIModel.setProperty("/YearsOfContract", null);
				oCARKPIModel.setProperty("/InterestRate", null);
				oCARKPIModel.setProperty("/Debt", "");
			}
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputROICBefore: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "ROICBefore", -100, 999, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputROICAfter: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "ROICAfter", -100, 999, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputIRR: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "IRR", -100, 999, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputPlantOEAfter: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "PlantOEAfter", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputPlantOUAfter: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "PlantOUAfter", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputNegotiatedOffer: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "NegotiatedOffer", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputPlantOEBefore: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "PlantOEBefore", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputPlantOUBefore: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "PlantOUBefore", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputInterestRate: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CARKPIModel", "InterestRate", 0, 100, true, true); // true, true => Decimal & negative values in percentage
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputFinancialCost: function (oEvent) {
			LiveChangeController.onLiveChangeInputFinancialCost(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputYearsOfContract: function (oEvent) {
			LiveChangeController.onLiveChangeInputYearsOfContract(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputPayback: function (oEvent) {
			LiveChangeController.onLiveChangeInputPayback(this, oEvent);
		},
		/* =========================================================== */
		/* End of methods for Financial & Operational */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for One Planet */
		/* =========================================================== */
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputSiteCO2: function (oEvent) {
			LiveChangeController.onLiveChangeInputSiteCO2(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputSiteProjectInclCO2: function (oEvent) {
			LiveChangeController.onLiveChangeInputSiteProjectInclCO2(this, oEvent);
		},
		/** 
		 * Calculates the SiteAfterProjectY1CO2
		 * @param iCurrentYearProd
		 * @param iSiteProjectInclCO2
		 */
		calculateSiteAfterProjectY1CO2: function (iCurrentYearProd, iSiteProjectInclCO2) { //We get the value because we work with liveChange event and the value is not yet in the model when the onLiveChange happens
			var value;
			var oRandomModel = this.getView().getModel("RandomModel");
			var iVolY3 = oRandomModel.getProperty("/VolumeY3") === undefined || oRandomModel.getProperty("/VolumeY3") === null ? 0 :
				parseFloat(oRandomModel.getProperty("/VolumeY3"));
			var iVolProj = iVolY3 + parseFloat(iCurrentYearProd);
			value = iVolProj * parseFloat(iSiteProjectInclCO2).toFixed(3);

			oRandomModel.setProperty("/SiteAfterProjectY1CO2", value);
		},
		/** 
		 * Calculates the SiteY1CO2
		 * @param iCurrentYearProd
		 * @param iSiteCO2
		 */
		calculateSiteY1CO2: function (iCurrentYearProd, iSiteCO2) {
			var value;
			var oRandomModel = this.getView().getModel("RandomModel");

			value = parseFloat(iCurrentYearProd * iSiteCO2).toFixed(3);

			oRandomModel.setProperty("/SiteY1CO2", value);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputCurrentYearProd: function (oEvent) {
			LiveChangeController.onLiveChangeInputCurrentYearProd(this, oEvent);
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputBeforeGreenEnergy: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "BeforeGreenEnergy", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputAfterGreenEnergy: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "AfterGreenEnergy", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputSitePlasticRecyclable: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "SitePlasticRecyclable", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputProjectPlasticRecyclable: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "ProjectPlasticRecyclable", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputAfterProjectPlasticRecyclable: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "AfterProjectPlasticRecyclable", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputSitePET: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "SitePET", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputProjectPET: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "ProjectPET", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Handles the live change event
		 * @param oEvent
		 */
		onLiveChangeInputAfterProjectPET: function (oEvent) {
			this.changePercentageInModelsAndView(oEvent, "CAROnePlanetModel", "AfterProjectPET", 0, 100, true, false); //Decimals and no negative value in percentage
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioSiteComplianceWaterSelected: function (oEvent) {
			LiveChangeController.radioSiteComplianceWaterSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioProjectComplianceWaterSelected: function (oEvent) {
			LiveChangeController.radioProjectComplianceWaterSelected(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		radioSiteProjectInclComplianceWaterSelected: function (oEvent) {
			LiveChangeController.radioSiteProjectInclComplianceWaterSelected(this, oEvent);
		},
		/* =========================================================== */
		/* End of methods for One Planet */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Buttons */
		/* =========================================================== */
		/** 
		 * Posts the CAR with status Draft
		 * @param oEvent
		 */
		onSavePress: function (oEvent) {
			this.getView().setBusy(true);

			this.convertStringPercentageIntoDecimalCARKPI();
			this.convertStringPercentageIntoDecimalCARFinancial();

			var bValidatedForSave = validatorSave.validateFieldsForSave(this);
			if (!bValidatedForSave) {
				this.getView().setBusy(false);

				this.convertDecimalIntoStringPercentageCARKPI();
				this.convertDecimalIntoStringPercentageCARFinancial();

				sap.m.MessageBox.error(
					"Please fill in all the mandatory fields or solve all errors"
				);

				return;
			}

			this.promisesSave = [];
			this.promisesLaunch = [];
			this.promisesSaveForDocii = [];
			this.promisesAttachments = [];
			var oCARModel = this.getView().getModel("CARModel");
			var that = this;

			if (oCARModel.getProperty("/Id") === 0 || oCARModel.getProperty("/Id") === undefined)
				that._saveToBackendViaJSONModel();
			else {
				that.convertEmptyStringIntoNullForBackend();
				that._convertIntegerAndDecimalsIntoStringForBackend();
				that.fromJSONToOData();
				that.saveToBackend("PUT");
			}
		},
		/** 
		 * Posts the CAR with status Launched
		 * @param oEvent
		 */
		onLaunchPress: function (oEvent) {
			var that = this;
			this.promisesLaunch = [];
			this.promisesSave = [];

			this.convertStringPercentageIntoDecimalCARKPI();
			this.convertStringPercentageIntoDecimalCARFinancial();
			this.convertEmptyStringIntoNullForBackend();
			this._convertIntegerAndDecimalsIntoStringForBackend();

			var bValidated = validatorLaunch.validateFieldsForLaunch(this);
			if (!bValidated) {

				this.getView().setBusy(false);

				this.convertDecimalIntoStringPercentageCARKPI();
				this.convertDecimalIntoStringPercentageCARFinancial();

				var errorMessage = "Please fill in all the mandatory fields or solve all errors";

				if (this.getView().getModel("errorModel").getProperty("/notAllRequiredAttachmentsErrorMessage") !== undefined) {
					errorMessage += this.getView().getModel("errorModel").getProperty("/notAllRequiredAttachmentsErrorMessage");
					this.getView().getModel("errorModel").setProperty("/notAllRequiredAttachmentsErrorMessage",
						undefined);
				}
				if (this.getView().getModel("errorModel").getProperty("/notAllRequiredAttachmentsC1C2C3C4C6C7ErrorMessage") !== undefined) {
					errorMessage += this.getView().getModel("errorModel").getProperty("/notAllRequiredAttachmentsC1C2C3C4C6C7ErrorMessage");
					this.getView().getModel("errorModel").setProperty("/notAllRequiredAttachmentsC1C2C3C4C6C7ErrorMessage",
						undefined);
				}
				sap.m.MessageBox.error(
					errorMessage
				);

				return;
			}

			if (this.getView().getModel("CARModel").getProperty("/Id") === 0) {
				this.getView().setBusy(false);

				this.convertDecimalIntoStringPercentageCARKPI();
				this.convertDecimalIntoStringPercentageCARFinancial();

				var errorMessage = "Please save the CAR before launching.";

				sap.m.MessageBox.error(
					errorMessage
				);

				return;
			}

			if (this.getView().getModel("CARModel").getProperty("/XCBUOneId") !== "" || this.getView().getModel("CARModel").getProperty(
					"/XCBUTwoId") !== "" || this.getView().getModel("CARModel").getProperty("/XCBUThreeId") !== "") {
				this.CARHasBusinessRulesForXCBUs().then(function (bRulesForXCBUs) {
						if (!bRulesForXCBUs) { // There are no rules for the X-CBUs
							sap.m.MessageBox.warning(
								"Are you sure you want to launch the CAR even when there are no validators for the X-CBU's? ", {
									actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
									onClose: function (sAction) {
										if (sAction == "CANCEL") {
											that.getView().setBusy(false);
											that.convertDecimalIntoStringPercentageCARKPI();
											that.convertDecimalIntoStringPercentageCARFinancial();
											return;
										}
										if (sAction == "OK") {
											that.launchCAREntirely();
										}
									}
								}
							);
						} else { // There are rules for the X-CBUs
							that.launchCAREntirely();
						}
					})
					.catch(function (oError) {
						that.getView().setBusy(false);
						that.showErrorMessageFromBackend(
							"Failed to get the BusinessRules for this CAR, please contact the IT department with following error:", oError);
					});
			} else { // The CAR has no X-CBUs
				this.launchCAREntirely();
			}

		},
		/** 
		 * Deletes the CAR
		 * @param oEvent
		 */
		onDeletePress: function (oEvent) {
			var that = this;
			this.getView().setBusy(true);
			var oCARModel = this.getView().getModel("CARModel");

			if (oCARModel.getProperty("/Id") === 0) {
				sap.m.MessageBox.warning(
					"Are you sure you want to reload the page and delete all filled data?", {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: function (sAction) {
							if (sAction == "OK") {
								that.onInit();
								that.onAfterRendering();
								that._clearValuesInView();
								that.getView().setBusy(false);
							} else {
								that.getView().setBusy(false);
								return;
							}
						}
					}
				);
				return;
			}

			if (oCARModel.getProperty("/Status") === "Launched") {
				sap.m.MessageBox.show("CAR is Launched, so it can not be deleted");
				that.getView().setBusy(false);
				return;
			}

			sap.m.MessageBox.warning(
				"Are you sure you want to delete the CAR?", {
					actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
					onClose: function (sAction) {
						if (sAction == "OK") {
							var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CAR(" + String(oCARModel.getProperty("/Id")) + ")";
							that.ajaxPatchDelete(sUrl, "DELETE")
								.then(function (result) {
									sap.m.MessageToast.show("CAR is deleted");
									that.onInit();
									that.onAfterRendering();
									that._clearValuesInView();
									that.getView().setBusy(false);
								})
								.catch(function (failure) {
									that.getView().setBusy(false);
									that.showErrorMessageFromBackend(
										"Failed to delete the CAR, please contact the IT department with following error:", failure);
								});
						} else {
							that.getView().setBusy(false);
							return;
						}
					}
				}
			);
		},
		CARHasBusinessRulesForXCBUs: function () {
			var that = this;
			var CARHasBusinessRulesForXCBUs = true;
			var oCARModelData = this.getView().getModel("CARModel").getData();
			return new Promise(function (resolve, reject) {
				var sURLCBU = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CBU?$filter=Id eq '" + oCARModelData.XCBUOneId + "'" +
					(oCARModelData.XCBUTwoId !== "" ? " or Id eq '" + oCARModelData.XCBUTwoId + "'" : "") +
					(oCARModelData.XCBUThreeId !== "" ? " or Id eq '" + oCARModelData.XCBUThreeId + "'" : "") +
					" &$select=ZoneId";
				that.ajaxPatch(sURLCBU, "GET", {})
					.then(function (oData) {
						var sURL = "/HANA/ZCORFI10245/SERVICES/service.xsodata/BusinessRules?$format=json&$filter=FinancingTypeId eq " +
							oCARModelData.FinancingTypeId +
							" and CategoryId eq " + oCARModelData.CategoryId + " and  (OrganizationalId eq '" + oCARModelData.XCBUOneId +
							"'  or OrganizationalId eq '" + oData.d.results[0].ZoneId +
							(oCARModelData.XCBUTwoId !== "" ? "' or OrganizationalId eq '" + oCARModelData.XCBUTwoId + "' or OrganizationalId eq '" +
								oData.d.results[1].ZoneId : "") +
							(oCARModelData.XCBUThreeId !== "" ? "'  or OrganizationalId eq '" + oCARModelData.XCBUThreeId +
								"'  or OrganizationalId eq '" + oData.d.results[2].ZoneId :
								"") +
							"') and " + oCARModelData.TotalAmountLC + " gt RangeFrom and " + oCARModelData.TotalAmountLC +
							" le RangeTo and Action eq 'validate'";
						that.ajaxPatch(sURL, "GET", {})
							.then(function (aBusinessRules) {
								if (aBusinessRules.d.results.length <= 0) {
									CARHasBusinessRulesForXCBUs = false;
								}
								resolve(CARHasBusinessRulesForXCBUs);
							}).catch(function (oError) {
								reject(oError);
							});
					}).catch(function (oError) {
						reject(oError);
					});
			});
		},
		launchCAREntirely: function () {
			var that = this;
			this.getView().setBusy(true);
			this.fromJSONToOData();

			this.saveCARAttachmentsToDocii("PUT");

			Promise.all(this.promisesSaveForDocii)
				.then(function (result) { //After the attachments are posted to Docii, we do the other posts (Financial, One Planet, KPI, Attachment, Investment and Top Line)
					Promise.all(that.promisesAttachments)
						.then(function (resultData) {
							that.launchCAR().then(function (success) {
								var oCARModel = that.getView().getModel("CARModel");
								that.fromODataToJSON();
								that.launchCARKPI();
								that.launchCAROnePlanet();
								that.launchCARFinancial();
								if (oCARModel.getProperty("/SubCategoryId") === 7 && that.checkIfCompleteTopLine()) { //Save Top Line
									if (that.bTopLinePosted)
										that.saveTopLine("PUT");
									else
										that.saveTopLine("POST");
								} else if (oCARModel.getProperty("/SubCategoryId") === 8 && that.checkIfCompleteInvestment()) { //Save Investment
									if (that.bInvestmentPosted)
										that.saveInvestment("PUT");
									else
										that.saveInvestment("POST");
								}

								Promise.all(that.promisesLaunch)
									.then(function (result) {
										that.getView().getModel("CARModel").setProperty("/Status", "Launched");
										var dateJS = new Date();
										var LaunchedDate = dateJS.getDate() + "-" + (dateJS.getUTCMonth() + 1) + "-" + dateJS.getUTCFullYear();
										that.getView().getModel("CARModel").setProperty("/LaunchedDate", LaunchedDate);
										sap.m.MessageToast.show("CAR is successfully launched");
										that.getView().setBusy(false);
									})
									.catch(function (failure) {
										that.getView().setBusy(false);
										if (failure.status !== 400 && that.getView().getModel("CARModel").getProperty("/Status") === "Launched") { // We know the CAR is Launched, but something went wrong in the then statement above
											that.getView().getModel("CARModel").setProperty("/Status", "Draft");
											that.showErrorMessageFromBackend(
												"Failed to launch the CAR, your data might be incomplete. Please check the data and try to launch the CAR again.\n\n If this does not work: search the CAR in My CARs Launched, open it, fill in the correct data and try again please. \n\nOr contact the IT department with following error:",
												failure);
										} else {
											sap.m.MessageToast.show("CAR is successfully launched");
										}
									});
							}).catch(function (failure) {
								that.fromODataToJSON();
								that.getView().setBusy(false);
								that.getView().getModel("CARModel").setProperty("/Status", "Draft");
								that.showErrorMessageFromBackend(
									"Failed to launch the CAR. \nPlease contact the IT department with following error:", failure);
							});
						})
						.catch(function (oError) {
							that.getView().setBusy(false);
							that.fromODataToJSON();
							that.getView().getModel("CARModel").setProperty("/Status", "Draft");
							that.showErrorMessageFromBackend(
								"Failed to launch the attachments of the CAR, your data might be incomplete. Please check the data and try to launch the CAR again.\n\n If this does not work: search the CAR in My CARs Draft, open it, fill in the correct data and try again please. \n\nOr contact the IT department with following error:",
								oError);
						});
				})
				.catch(function (failure) {
					that.getView().setBusy(false);
					that.fromODataToJSON();
					that.showErrorMessageFromBackend(
						"Failed to save the attachments of the CAR to Docii, please try again.\n Or contact the IT department with following error:",
						failure);
				});
		},
		/* =========================================================== */
		/* End of methods for Buttons */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Topline & Investment */
		/* =========================================================== */
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputTopLineTable: function (oEvent) {
			LiveChangeController.onLiveChangeInputTopLineTable(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onLiveChangeInputInvestmentTable: function (oEvent) {
			LiveChangeController.onLiveChangeInputInvestmentTable(this, oEvent);
			this.convertDecimalIntoStringPercentageCARInvestment();
		},
		/** 
		 * Checks if the TopLine table is completed
		 * @returns boolean
		 */
		checkIfCompleteTopLine: function () {
			if (sap.ui.getCore().getModel("TopLineJSONModel") === undefined)
				return false;

			var oModelData = sap.ui.getCore().getModel("TopLineJSONModel").getData();
			var aKeys = Object.keys(oModelData[0]);
			var bComplete = true;
			for (var i = 0; i < oModelData.length; i++) {
				for (var j = 1; j < aKeys.length - 1; j++) {
					if (i === 2 && j === 1) {

					} else {
						if (oModelData[i][aKeys[j]] === "null" || oModelData[i][aKeys[j]] === null || oModelData[i][aKeys[j]] === "" || isNaN(
								oModelData[
									i][aKeys[j]])) {
							bComplete = false;
						}
					}

				}
			}
			return bComplete;
		},
		/** 
		 * Checks if the Investment table is completed
		 * @returns boolean
		 */
		checkIfCompleteInvestment: function () {
			if (sap.ui.getCore().getModel("InvestmentJSONModel") === undefined)
				return false;

			var oModelData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();
			var aKeys = Object.keys(oModelData[0]);
			var bComplete = true;
			for (var i = 0; i < oModelData.length; i++) {
				for (var j = 1; j < aKeys.length - 1; j++) {
					if (oModelData[i][aKeys[j]] === "null" || oModelData[i][aKeys[j]] === null || oModelData[i][aKeys[j]] === "" || sap.ui.getCore()
						.getModel(
							"errorModelInvestment").getProperty("error") === true)
						bComplete = false;
				}
			}

			return bComplete;
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		openDialogGraph: function (oEvent) {
			LiveChangeController.openDialogGraph(this, oEvent);
		},
		/** 
		 * Converts the data in the TopLineJSONModel into the TopLineGraphData model
		 * @param that
		 */
		generateModelGraphTopLine: function (that) {
			var oModelData = sap.ui.getCore().getModel("TopLineJSONModel").getData();
			var oGraphModel = new JSONModel();

			var aData = [];

			var aKeys = Object.keys(oModelData[0]);

			for (var i = 1; i < aKeys.length - 1; i++) {
				aData.push({
					Year: "Y" + i
				});
				for (var j = 0; j < oModelData.length; j++) {
					aData[i - 1][oModelData[j].NameInHANA] = oModelData[j][aKeys[i]];
				}
			}
			oGraphModel.setJSON(JSON.stringify(aData));
			sap.ui.getCore().setModel(oGraphModel, "TopLineGraphData");
			this.getView().setModel(oGraphModel, "TopLineGraphData");
		},
		/** 
		 * Converts the data in the InvestmentJSONModel into the InvestmentGraphData model
		 * @param that
		 */
		generateModelGraphInvestment: function (that) {
			this.convertStringPercentageIntoDecimalCARInvestment();
			var oModelData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();
			var oGraphModel = new JSONModel();

			var aData = [];

			var aKeys = Object.keys(oModelData[0]);

			for (var i = 1; i < aKeys.length - 2; i++) {
				aData.push({
					Year: "Y" + i
				});
				for (var j = 0; j < oModelData.length; j++) {
					aData[i - 1][oModelData[j].NameInHANA] = oModelData[j][aKeys[i]];
				}
			}
			oGraphModel.setJSON(JSON.stringify(aData));
			sap.ui.getCore().setModel(oGraphModel, "InvestmentGraphData");
			this.getView().setModel(oGraphModel, "InvestmentGraphData");
			this.convertDecimalIntoStringPercentageCARInvestment();
		},
		/** 
		 * Opens a dialog with the TopLineGraph fragment as content
		 * @param that
		 */
		openDialogGraphTopLine: function (that) {
			var dialog = new sap.m.Dialog({
				title: "Top Line",
				type: "Message",
				contentWidth: "80%",
				content: [
					sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.TopLineGraph", that)
				],
				beginButton: new sap.m.Button({
					text: "Edit Data",
					press: function () {
						dialog.close();
						dialog.destroy();
						that.openDialogGraph();
					}
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						dialog.close();
						dialog.destroy();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		/** 
		 * Opens a dialog with the InvestmentGraph fragment as content
		 * @param that
		 */
		openDialogGraphInvestment: function (that) {
			var dialog = new sap.m.Dialog({
				title: "Project",
				type: "Message",
				contentWidth: "80%",
				content: [
					sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.InvestmentGraph", that)
				],
				beginButton: new sap.m.Button({
					text: "Edit Data",
					press: function () {
						dialog.close();
						dialog.destroy();
						that.openDialogGraph();
					}
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						dialog.close();
						dialog.destroy();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.open();
		},
		/** 
		 * Clears data in the TopLine model after changing the category or subcategory
		 */
		clearDataInTopLineModel: function () {
			var that = this;
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation");
			var oTableModel = new sap.ui.model.json.JSONModel([sRootPath, "model/TopLineModel.json"].join("/"));
			oTableModel.attachRequestCompleted(function () {
				var data = oTableModel.getData().TopLineTable;
				var oModel = new sap.ui.model.json.JSONModel(data);
				sap.ui.getCore().setModel(oModel, "TopLineJSONModel");
				that.generateModelGraphTopLine(that);
				// that.bTopLineFlagInitialized = true;
			});
		},
		/** 
		 * Clears data in the Investment model after changing the category or subcategory
		 */
		clearDataInInvestmentModel: function () {
			var that = this;
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation");
			var oTableModel = new sap.ui.model.json.JSONModel([sRootPath, "model/InvestmentModel.json"].join("/"));
			oTableModel.attachRequestCompleted(function () {
				var data = oTableModel.getData().InvestmentTable;
				var oModel = new sap.ui.model.json.JSONModel(data);
				sap.ui.getCore().setModel(oModel, "InvestmentJSONModel");
				that.generateModelGraphInvestment(that);
				// that.bInvestmentFlagInitialized = true;
			});
		},
		/* =========================================================== */
		/* End of methods for Topline & Investment */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Attachments */
		/* =========================================================== */
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onChangeAttachment: function (oEvent) {
			LiveChangeController.onChangeAttachment(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onChangeOptionalAttachments: function (oEvent) {
			LiveChangeController.onChangeOptionalAttachments(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onDownloadUploadedAttachmentPress: function (oEvent) {
			LiveChangeController.onDownloadUploadedAttachmentPress(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onDownloadDociiListFilePress: function (oEvent) {
			LiveChangeController.onDownloadDociiListFilePress(this, oEvent);
		},
		/** 
		 * Calls methods in LiveChangeController
		 * @param oEvent
		 */
		onFileDeleted: function (oEvent) {
			LiveChangeController.onFileDeleted(this, oEvent);
		},
		/** 
		 * Deletes the data on the models of the deleted attachment and calls the methods that deletes the attachment in Docii and HANA.
		 * If the attachment is already saved to Docii and HANA, it gets added to the Previous Attachments section
		 * @param attachmentName
		 * @param oUploadCollection
		 */
		_deleteFileInDociiAndHANA: function (attachmentName, oUploadCollection) {
			this.getView().setBusy(true);
			var that = this;
			var oAttachmentJSONModel = this.getView().getModel("CAR" + attachmentName + "JSONModel");

			var oDociiModel = this.getView().getModel(oUploadCollection.getBindingInfo("items").model);
			var deletedFile = oDociiModel.getData().splice(oUploadCollection.getItems()[0].getParent()
				._oItemForDelete._iLineNumber, 1);

			oDociiModel.setData(oDociiModel.getData());
			if (oAttachmentJSONModel !== undefined) { //CAROptionalAttachment is not defined in onInit, that's why it's undefined
				if (oAttachmentJSONModel.getProperty("/ObjectId") !== undefined) { //Posted to Docii before

					that._copyCARAttachmentJSONModelToPreviousVersions(attachmentName, deletedFile[0])
						.then(function (dataResp) {
							var oPreviousVersionsModel = that.getView().getModel("dociiPreviousVersionsModel");
							oPreviousVersionsModel.setData(oPreviousVersionsModel.getData().concat(deletedFile[0]));

							if (attachmentName.includes("Optional")) {
								that._changeNumbersOfOptionalAttachmentsInCARAttachmentsJSONModel(attachmentName);
								that._changeOptionalJSONModelToPreviousNumber(attachmentName);
							} else {
								that._deleteDataOnCARAttachmentsJSONModel(attachmentName);
								oAttachmentJSONModel.setData();
							}
							that.getView().setBusy(false);
						}).catch(function (failure) { //tes
							that.getView().setBusy(false);
							that.showErrorMessageFromBackend(
								"Failed to delete the attachment, please contact the IT department with following error:", failure);
							// sap.m.MessageBox.error("Failed to delete the attachment, please contact the IT department with following error:", {
							// 	styleClass: "sapUiSizeCompact",
							// 	details: failure
							// });
						});
				} else {
					if (attachmentName.includes("Optional"))
						that._changeNumbersOfOptionalAttachmentsInCARAttachmentsJSONModel(attachmentName);
					else
						that._deleteDataOnCARAttachmentsJSONModel(attachmentName);

					that.getView().setBusy(false);
				}
			} else {
				if (attachmentName.includes("Optional"))
					that._changeNumbersOfOptionalAttachmentsInCARAttachmentsJSONModel(attachmentName);
				else
					that._deleteDataOnCARAttachmentsJSONModel(attachmentName);

				that.getView().setBusy(false);
			}
		},
		/** 
		 * Deletes some the values of the attachment in CARAttachmentsJSONModel model
		 * @param attachmentName
		 */
		_deleteDataOnCARAttachmentsJSONModel: function (attachmentName) {
			var CARAttachmentsJSONModel = this.getView().getModel("CARAttachmentsJSONModel");
			var attachmentNameForDelete = "CAR" + attachmentName;

			CARAttachmentsJSONModel.setProperty("/" + attachmentNameForDelete + "Base64", undefined);
			CARAttachmentsJSONModel.setProperty("/FileName" + attachmentNameForDelete, undefined);
			CARAttachmentsJSONModel.setProperty("/MimeType" + attachmentNameForDelete, undefined);
			CARAttachmentsJSONModel.setProperty("/Description" + attachmentNameForDelete, undefined);
			CARAttachmentsJSONModel.setProperty("/" + attachmentNameForDelete + "Changed", false);
		},
		/** 
		 * If an attachment in the Optional Section is deleted, the number of optional needs to be subtracted by 1 in the CARAttachmentsJSONModel
		 * @param attachmentName
		 */
		_changeNumbersOfOptionalAttachmentsInCARAttachmentsJSONModel: function (attachmentName) {
			var deletedNumber = parseInt(attachmentName.charAt(attachmentName.length - 1));
			var attachmentNameWithoutNumber = "CAR" + attachmentName.substring(0, attachmentName.length - 1);
			var CARAttachmentsJSONModel = this.getView().getModel("CARAttachmentsJSONModel");
			var CARAttachmentsJSONModelData = CARAttachmentsJSONModel.getData();
			var attachmentNameForDelete = "CAR" + attachmentName;
			var stop = false;
			var numberOptionalAttachments = this._getNumberOfOptionalAttachments() + 1;
			for (var i = deletedNumber; i <= numberOptionalAttachments; i++) {
				if (stop)
					return;
				if (CARAttachmentsJSONModelData[attachmentNameWithoutNumber + i + "Base64"] !== undefined) {
					CARAttachmentsJSONModelData[attachmentNameWithoutNumber + i + "Base64"] = CARAttachmentsJSONModelData[
						attachmentNameWithoutNumber +
						(i + 1) + "Base64"];
					CARAttachmentsJSONModelData["FileName" + attachmentNameWithoutNumber + i] = CARAttachmentsJSONModelData[
						"FileName" + attachmentNameWithoutNumber + (i + 1)];
					CARAttachmentsJSONModelData["MimeType" + attachmentNameWithoutNumber + i] = CARAttachmentsJSONModelData[
						"MimeType" + attachmentNameWithoutNumber + (i + 1)];
					CARAttachmentsJSONModelData["Description" + attachmentNameWithoutNumber + i] = CARAttachmentsJSONModelData[
						"Description" + attachmentNameWithoutNumber + (i + 1)];
					CARAttachmentsJSONModelData[attachmentNameWithoutNumber + i + "Changed"] = CARAttachmentsJSONModelData[
						attachmentNameWithoutNumber + (i + 1) + "Changed"];
				} else {
					stop = true;
					delete CARAttachmentsJSONModelData[attachmentNameWithoutNumber + (i + 1) + "Base64"];
					delete CARAttachmentsJSONModelData["FileName" + attachmentNameWithoutNumber + (i + 1)];
					delete CARAttachmentsJSONModelData["MimeType" + attachmentNameWithoutNumber + (i + 1)];
					delete CARAttachmentsJSONModelData["Description" + attachmentNameWithoutNumber + (i + 1)];
					CARAttachmentsJSONModelData[attachmentNameWithoutNumber + (i + 1) + "Changed"] = false;
					return;
				}
			}

			CARAttachmentsJSONModel.setData(CARAttachmentsJSONModelData);
		},
		/** 
		 * If an attachment in the Optional Section is deleted, the number of OptionalJSONModels needs to be subtracted by 1.
		 * So, the data from the OptionalJSONModels after the deleted item is copied in the previous one
		 * @param attachmentName
		 */
		_changeOptionalJSONModelToPreviousNumber: function (attachmentName) {
			var that = this;
			var attachmentNameWithoutNumber = attachmentName.slice(0, -1);
			var oAttachmentJSONModel = this.getView().getModel("CAR" + attachmentName + "JSONModel");
			var deletedNumber = parseInt(attachmentName.charAt(attachmentName.length - 1));
			var numberOfOptionalAttachments = this._getNumberOfOptionalAttachments() + 1;
			for (var i = deletedNumber; i < numberOfOptionalAttachments; i++) {
				var currentOptionalAttachmentModel = that.getView().getModel("CAR" + attachmentNameWithoutNumber + i + "JSONModel");
				var nextOptionalAttachmentModel = that.getView().getModel("CAR" + attachmentNameWithoutNumber + (i + 1) + "JSONModel");
				if (nextOptionalAttachmentModel === undefined) {
					currentOptionalAttachmentModel.setData();
				} else {
					currentOptionalAttachmentModel.setData(nextOptionalAttachmentModel.getData());
				}
			}
		},
		/** 
		 * The attachment that is deleted gets a new Description in HANA: ‘Previous’. Here is the ajax call made to do it in HANA
		 * @param attachmentName
		 * @param deletedFile
		 * @returns Promise
		 */
		_copyCARAttachmentJSONModelToPreviousVersions: function (attachmentName, deletedFile) {
			var that = this;
			var CARPreviousVersionsJSONModelData = this.getView().getModel("CARPreviousVersionsJSONModel").getData();
			var CARAttachmentsJSONModel = this.getView().getModel("CARAttachmentsJSONModel");
			var attachmentNameForDelete = "CAR" + attachmentName;

			var sBase64 = attachmentNameForDelete + "Base64";
			var sFileName = "FileName" + attachmentNameForDelete;
			var sMimeType = "MimeType" + attachmentNameForDelete;
			var sDescription = "Description" + attachmentNameForDelete;

			var jsonData = {
				sBase64: CARAttachmentsJSONModel.getProperty("/" + attachmentNameForDelete + "Base64"),
				sFileName: CARAttachmentsJSONModel.getProperty("/FileName" + attachmentNameForDelete),
				sMimeType: CARAttachmentsJSONModel.getProperty("/MimeType" + attachmentNameForDelete),
				sDescription: "Previous"
			};

			return new Promise(function (resolve, reject) {
				var oAttachmentJSONModelData = that.getView().getModel(attachmentNameForDelete + "JSONModel").getData();

				oAttachmentJSONModelData.Description = "Previous";
				oAttachmentJSONModelData.CreatedBy = deletedFile.CreatedBy;
				oAttachmentJSONModelData.CreatedOn = that._convertDateTimeIntoEpoch(deletedFile.CreatedOn);
				that.getView().getModel(attachmentNameForDelete + "JSONModel").setData(oAttachmentJSONModelData);
				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARAttachment(CARId=" + String(that.getView().getModel("CARModel").getProperty(
						"/Id")) +
					",FileName='" + String(oAttachmentJSONModelData.FileName) + "')";

				that.ajaxPatch(sUrl, "PUT", JSON.stringify(oAttachmentJSONModelData))
					.then(function (result) {
						CARPreviousVersionsJSONModelData[CARPreviousVersionsJSONModelData.length] = jsonData;
						resolve();
					}).catch(function (dataResp) {
						reject(dataResp);
					});
			});
		},
		/** 
		 * Show an Error message when the user uploads a file that has reached the max size.
		 * Currently, we post a multipart to Docii, so the size limit is determined in Docii itself
		 * @param oEvent
		 */
		fileSizeExceededForDocii: function (oEvent) {
			sap.m.MessageToast.show("The maximum file size is reached, \nplease upload a smaller file.");
			return;
		},
		/** 
		 * Shows an error message when the user uploads an attachment of the wrong file type
		 * @param oEvent
		 */
		typeMismatchAttachments: function (oEvent) {
			sap.m.MessageToast.show(
				"It's only possible to upload certain file types for the Attachments: \n\nPicture: png, jpeg & jpg\n\nOperations: pdf, xls & xlsx\nFinancial Analysis: xls & xlsx\nBusiness Case: ppt & pptx"
			);
			return;
		},
		/** 
		 * Checks if the name of the file that is uploaded is used before. Because it is, together with the CARId, a key value in HANA
		 * @param name
		 * @returns boolean
		 */
		_checkNameOfAttachmentIsUsed: function (name) {
			var nameIsUsed = false;

			var attachmentJSONModelData = this.getView().getModel("CARAttachmentsJSONModel").getData();
			if (attachmentJSONModelData.FileNameCAROperations === name || attachmentJSONModelData.FileNameCARFinancialAnalysis === name ||
				attachmentJSONModelData.FileNameCARBusinessCase === name)
				nameIsUsed = true;

			for (var i = 0; i < this._getNumberOfOptionalAttachments(); i++) {
				if (attachmentJSONModelData["FileNameCAROptionalAttachment" + i] === name)
					nameIsUsed = true;
			}

			return nameIsUsed;
		},
		/** 
		 * Returns the number of optional attachments uploaded by the user
		 * @returns Integer
		 */
		_getNumberOfOptionalAttachments: function () {
			return this.getView().getModel("dociiOptionalAttachmentModel").getData().length;
		},
		/** 
		 * This is a function for testing purposes. It calculates the size of the base64 string that gets posted to Docii
		 * @param sBase64
		 */
		calculateFileSizeFromEncodedBase64: function (sBase64) { //This is a function made for testing reasons
			var lengte = sBase64.length;
			var grootte = 4 * Math.ceil(parseFloat(lengte) / 3);
			var twoEqualSigns = String(sBase64).endsWith("==");
			twoEqualSigns ? grootte = grootte - 2 : grootte = grootte - 1;
			sap.m.MessageBox.show("De size van de attachment is: " + grootte);
		},
		/*End of methods for Attachments*/
	});
});