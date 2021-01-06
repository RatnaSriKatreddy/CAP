/*eslint-disable no-console, no-alert */
sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";

	var bNoErrors = true;
	return {
		validateFieldsForLaunch: function (controller) {
			bNoErrors = true;

			//CAR
			this.validateRequiredFieldsCARModel(controller);
			this.validateAfterExpValidationDateAndAfterTodayProperties(controller);
			this.validateCARAmountLC(controller);
			this.validateLeaseAmount(controller);
			this.validateNotMoreThan4000CharsProperties(controller);
			this.validatePropertiesAfterToday(controller);
			this.validateRequiredFielsCARForCat1(controller);
			this.validateRequiredFielsCARForCat5(controller);
			this.validateRequiredFielsCARForCat5And4(controller);
			this.validatePropertiesWhenExtensionFlagIsYes(controller);
			this.validateSinceWhenRollingForecastIsYes(controller);
			this.validateOnlyIntegerValuesCARModel(controller);
			this.validateTopLineGraphValues(controller);

			//CAR Financial
			this.validateCapexCashOutAmount(controller);
			this.validateLeaseCashOutAmount(controller);
			this.validateNetSales(controller);
			this.validateROP(controller);
			this.validateVolume(controller);
			this.validateMandatoryFinancialProperties(controller);

			//CAR KPI
			this.validateRequiredFieldsCARKPI(controller);
			this.validateRequiredFieldsForCAT1And2CARKPI(controller);
			this.validatePercentageFieldsCARKPI(controller);
			this.validate4CharFieldsCARKPI(controller);
			this.validateRequiredFielsCARKPIForCat1And2(controller);
			this.validateRequiredFielsCARKPIForFinancialType2And3(controller);
			this.validateRequiredFielsCARKPIForFinancialType2And3AndNegative(controller);
			this.validateRequiredFielsCARKPIForCat1(controller);

			//CAR One Planet
			this.validateMax30BeforeCommaAnd3AfterCAROnePlanetModel(controller);
			this.validateMax30BeforeCommaAnd3AfterAndNonNegativeCAROnePlanetModel(controller);
			this.validateRequiredFielsCAROnePlanetForCat1And2And3(controller);
			this.validateRequiredFielsCAROnePlanetForCat1And2And3AndWWBUIdIs202(controller);
			this.validatePercentageFieldsCAROnePlanet(controller);
			this.validateRequiredFielsCAROnePlanetForCat1And2And3AndDecimalCheck(controller);
			this.validateRequiredFielsCAROnePlanetForCat1And2And3AndDecimalCheckAndNonNegative(controller);
			this.validateRequiredFielsCAROnePlanetForCat1And2And3AndIntegerValue(controller);
			this.validateRequiredFielsCAROnePlanetForWater(controller);

			//CAR Attachments
			this.validateRequiredAttachments(controller);
			this.validateRequiredAttachmentsForC1C2C3C4C6C7(controller);

			// CAR Top Line
			// this.validateMandatoryTopLineProperties(controller);

			// CAR Investment
			// this.validateMandatoryInvestmentProperties(controller);

			return bNoErrors;
		},
		countDecimalValues: function (value) {
			value = String(value).replace(" %", "");
			if (Math.floor(value) === value || !value || value === "" || value === null || value === "null") return 0;
			if (!value.toString().includes(".") && !value.toString().includes(",")) return 0;
			if (value.toString().includes("."))
				return value.toString().split(".")[1].length || 0;
			else
				return value.toString().split(",")[1].length || 0;
		},
		countValuesBeforeDecimal: function (value) {
			value = String(value).replace(" %", "");
			if (value === "" || !value || value === null || value === "null") return 0;
			if (!value.toString().includes(".") && !value.toString().includes(",")) return value.toString().length;
			if (value.toString().includes("."))
				return value.toString().split(".")[0].length || 0;
			else
				return value.toString().split(",")[0].length || 0;
		},
		//CAR
		validateRequiredFieldsCARModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;

			var requiredProperties = ["FinancingTypeId", "InRadar", "Leader", "CategoryId", "SubCategoryId",
				"Name", "ExpValidationDate", "ExpGoLiveDate", "InStrategicPlan", "InRollingForecast", "CBUId",
				"SiteId"
			];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (value) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}

		},
		validateRequiredFielsCARForCat5And4: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;

			var requiredProperties = ["ForWBS"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 5)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}
			}
		},
		validateRequiredFielsCARForCat1: function (controller) {
			var oCARModel = controller.getView().getModel("CARModel").getData();
			var oRadioXCBU = controller.getView().byId("radioXCBUId");

			if (oCARModel.CategoryId !== 1) {
				return;
			}

			if (!oCARModel.XCBU && oCARModel.CategoryId === 1) {
				oRadioXCBU.setValueState("Error");

				controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
				bNoErrors = false;
			} else {
				oRadioXCBU.setValueState("None");
				controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				this.validateMandatoryXCBUOneWhenXCBUIsSelected(controller);
			}
		},
		validateRequiredFielsCARForCat5: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;

			var requiredProperties = ["SNDemandNumber", "SNDemandURL"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && oCARModel.CategoryId === 5) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}
			}
		},
		validatePropertiesWhenExtensionFlagIsYes: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredPropertyWhenExtensionFlagIsYes = ["CARReferenceID"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var k = 0; k < requiredPropertyWhenExtensionFlagIsYes.length; k++) {
				value = oCARModel[requiredPropertyWhenExtensionFlagIsYes[k]];
				valueStateProperty = requiredPropertyWhenExtensionFlagIsYes[k] + "ValueState";
				valueStateTextProperty = requiredPropertyWhenExtensionFlagIsYes[k] + "ValueStateText";
				if (!value && controller.sExtensionFlag === 'Yes') {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 9) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should not have decimal values and not more than 9 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}

				}
			}
		},
		validateOnlyIntegerValuesCARModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var IntegerProperties = ["InternalOrderRef"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < IntegerProperties.length; i++) {
				value = oCARModel[IntegerProperties[i]];
				valueStateProperty = IntegerProperties[i] + "ValueState";
				valueStateTextProperty = IntegerProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 9) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should not have decimal values and not more than 9 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validatePropertiesAfterToday: function (controller) {
			var valueStateProperty, valueStateTextProperty, createdOn;
			if (controller.getView().getModel("CARModel").getProperty("/CreatedOn") === "") {
				createdOn = new Date(new Date().toDateString());
			} else {
				createdOn = this.convertDateToJavaScriptDateObject(controller, "CreatedOn");
			}
			var afterTodayProperties = ["ExpValidationDate"];

			for (var l = 0; l < afterTodayProperties.length; l++) {
				valueStateProperty = afterTodayProperties[l] + "ValueState";
				valueStateTextProperty = afterTodayProperties[l] + "ValueStateText";
				if (this.convertDateToJavaScriptDateObject(controller, afterTodayProperties[l]) === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Final validation date is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
					return;
				}
				if (this.convertDateToJavaScriptDateObject(controller, afterTodayProperties[l]) <= createdOn) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Final validation date has to be after creation date");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					sap.m.MessageBox.error("Final validation date has to be after creation date");
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}

			}
		},
		validatePropertiesBeforeToday: function (controller) {
			var valueStateProperty, valueStateTextProperty, createdOn;
			if (controller.getView().getModel("CARModel").getProperty("/CreatedOn") === "") {
				createdOn = new Date(new Date().toDateString());
			} else {
				createdOn = this.convertDateToJavaScriptDateObject(controller, "CreatedOn");
			}
			var beforeTodayProperties = ["ExpValidationDate"];

			for (var l = 0; l < beforeTodayProperties.length; l++) {
				valueStateProperty = beforeTodayProperties[l] + "ValueState";
				valueStateTextProperty = beforeTodayProperties[l] + "ValueStateText";
				if (this.convertDateToJavaScriptDateObject(controller, beforeTodayProperties[l]) === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Final validation date is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
					return;
				}
				if (this.convertDateToJavaScriptDateObject(controller, beforeTodayProperties[l]) <= createdOn) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Final validation date has to be after creation date");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					sap.m.MessageBox.error("Final validation date has to be after creation date");
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}

			}
		},
		convertDateToJavaScriptDateObject: function (controller, propName) {
			var date = controller.getView().getModel("CARModel").getProperty("/" + propName);
			if (date && date !== "") {
				var day = date.split("-")[0];
				var month = (parseInt(date.split("-")[1].split("-")[0], 10) - 1);
				var year = date.slice(-4);
				return new Date(year, month, day);
			}

			return "";
		},
		validateAfterExpValidationDateAndAfterTodayProperties: function (controller) {
			var valueStateProperty, valueStateTextProperty, createdOn;
			if (controller.getView().getModel("CARModel").getProperty("/CreatedOn") === "") {
				createdOn = new Date(new Date().toDateString());
			} else {
				createdOn = this.convertDateToJavaScriptDateObject(controller, "CreatedOn");
			}
			var afterExpValidationDateAndAfterTodayProperties = ["ExpGoLiveDate"];
			var afterTodayProperties = ["ExpValidationDate"];

			for (var l = 0; l < afterExpValidationDateAndAfterTodayProperties.length; l++) {
				valueStateProperty = afterExpValidationDateAndAfterTodayProperties[l] + "ValueState";
				valueStateTextProperty = afterExpValidationDateAndAfterTodayProperties[l] + "ValueStateText";
				if (this.convertDateToJavaScriptDateObject(controller, afterExpValidationDateAndAfterTodayProperties[l]) === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Final Go Live date is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
					return;
				}
				if (this.convertDateToJavaScriptDateObject(controller, afterExpValidationDateAndAfterTodayProperties[l]) <= createdOn || this.convertDateToJavaScriptDateObject(
						controller,
						afterExpValidationDateAndAfterTodayProperties[l]) <= this.convertDateToJavaScriptDateObject(controller, afterTodayProperties[l])) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Go Live expected date has to be after creation date and final validation date");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					sap.m.MessageBox.error("Go Live expected date has to be after creation date and final validation date");
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}

			}
		},
		validateCARAmountLC: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;

			var biggerThanZeroProperties = ["CARAmountLC"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var l = 0; l < biggerThanZeroProperties.length; l++) {
				value = oCARModel[biggerThanZeroProperties[l]];
				valueStateProperty = biggerThanZeroProperties[l] + "ValueState";
				valueStateTextProperty = biggerThanZeroProperties[l] + "ValueStateText";
				if (!value && oCARModel.FinancingTypeId !== 2) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if ((that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) && (oCARModel.FinancingTypeId === 1 ||
							oCARModel.FinancingTypeId === 3)) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if ((value > 0) && (oCARModel.FinancingTypeId === 1 || oCARModel.FinancingTypeId === 3)) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "CAR Amount should be < 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}

				}

			}
		},
		validateLeaseAmount: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;

			var biggerThanZeroProperties = ["LeaseAmountLC"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var l = 0; l < biggerThanZeroProperties.length; l++) {
				value = oCARModel[biggerThanZeroProperties[l]];
				valueStateProperty = biggerThanZeroProperties[l] + "ValueState";
				valueStateTextProperty = biggerThanZeroProperties[l] + "ValueStateText";
				if (!value && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if ((that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) && (oCARModel.FinancingTypeId === 2 ||
							oCARModel.FinancingTypeId === 3)) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if ((value > 0) && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "Lease Amount should be < 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}

				}

			}
		},
		validateNotMoreThan4000CharsProperties: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;

			var notMoreThan4000CharsProperties = ["BusinessObj"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < notMoreThan4000CharsProperties.length; i++) {
				value = oCARModel[notMoreThan4000CharsProperties[i]];
				valueStateProperty = notMoreThan4000CharsProperties[i] + "ValueState";
				valueStateTextProperty = notMoreThan4000CharsProperties[i] + "ValueStateText";
				if (!value) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (value.length > 4000) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"Business Objective should have a lenght of 4000 characters max");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}
				}

			}
		},
		validateSinceWhenRollingForecastIsYes: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;

			var requiredWhenRollingForecastIsYesProperties = ["Since"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredWhenRollingForecastIsYesProperties.length; i++) {
				valueStateProperty = requiredWhenRollingForecastIsYesProperties[i] + "ValueState";
				valueStateTextProperty = requiredWhenRollingForecastIsYesProperties[i] + "ValueStateText";
				if (this.convertDateToJavaScriptDateObject(controller, requiredWhenRollingForecastIsYesProperties[i]) === "" && oCARModel[
						"InRollingForecast"] === 'Yes') {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Since date is mandatory when In Rolling Forecast is Yes");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
					return;
				}
				if (this.convertDateToJavaScriptDateObject(controller, requiredWhenRollingForecastIsYesProperties[i]) !== "" &&
					new Date(this.convertDateToJavaScriptDateObject(controller, requiredWhenRollingForecastIsYesProperties[i]).toDateString()) >= new Date(
						new Date().toDateString())
				) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"Since date should not be in the future");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					sap.m.MessageBox.error("Since date should not be in the future");
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}
			}
		},
		validateTopLineGraphValues: function (controller) {
			var topLineGraphModel;
			var subCatId = controller.getView().byId("idSelectSubcategory").getSelectedKey();
			if (subCatId === "7") {
				topLineGraphModel = sap.ui.getCore().getModel("TopLineJSONModel");
			} else if (subCatId === "8") {
				topLineGraphModel = sap.ui.getCore().getModel("InvestmentJSONModel");
			} else {
				controller.getView().byId("topLineGraphButton").removeStyleClass("errorValueStateButton");
				return;
			}
			var errorState = true;
			if (topLineGraphModel) {
				var graphData = topLineGraphModel.getData();
				$.each(graphData, function (ind, val) {
					if (val === undefined) {
						errorState = false;
					} else {
						if (val === null) {
							errorState = false;
						} else {
							Object.keys(val).forEach(function (index) {
								if (index !== "Name" && index !== "NameInHANA") {
									if (val[index] === null) {
										errorState = false;
									}
								}
							});
						}
					}
					if (errorState === false) {
						return false;
					}
				});
			} else {
				errorState = false;
			}
			if (errorState === false) {
				bNoErrors = false;
				controller.getView().byId("topLineGraphButton").addStyleClass("errorValueStateButton");
			} else {
				controller.getView().byId("topLineGraphButton").removeStyleClass("errorValueStateButton");
			}
		},
		validateMandatoryXCBUOneWhenXCBUIsSelected: function (controller) {
			var oCARModel = controller.getView().getModel("CARModel").getData();
			var oRadioXCBU = controller.getView().byId("radioXCBUId");
			var bRadioXCBUIsSelected = oRadioXCBU.getButtons()[oRadioXCBU.getSelectedIndex()].getText() === "Yes";

			if (bRadioXCBUIsSelected && (oCARModel.XCBUOneId === null || oCARModel.XCBUOneId === undefined || oCARModel.XCBUOneId === "")) {
				controller.getView().getModel("errorModel").setProperty("/XCBUOneIdValueState", "Error");
				controller.getView().getModel("errorModel").setProperty("/XCBUOneIdValueStateText",
					"At least 1 X-CBU should be choses when the selection for X-CBU is 'Yes'");

				controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
				bNoErrors = false;
			} else {
				controller.getView().getModel("errorModel").setProperty("/XCBUOneIdValueState", "None");
				controller.getView().getModel("errorModel").setProperty("/XCBUOneIdValueStateText", "");
				controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
			}
		},

		//CAR Financial
		checkIndexOfNameInHANAForIncrementalBusinessModel: function (controller, nameInHANA) {
			var oIncrementalBusinessModeloData = controller.getView().getModel("incrementalBusinessJSONModel")["oData"];
			var returnValue = -1;
			for (var i = 0; i < oIncrementalBusinessModeloData.length; i++) {
				if (oIncrementalBusinessModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		calculateTotalCapexCashOut: function (controller) {
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var iTotalCapexCashOut = 0;

			var placeInArray = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "CARCashOut");
			if (placeInArray === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				iTotalCapexCashOut += parseFloat(oIncrementalBusinessModel["oData"][placeInArray][aboveZeroProperties[i]]);
			}

			return iTotalCapexCashOut;
		},
		calculateTotalLeaseCashOut: function (controller) {
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var iTotalLeaseCashOut = 0;

			var placeInArray = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "LeaseCashOut");
			if (placeInArray === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				iTotalLeaseCashOut += parseFloat(oIncrementalBusinessModel["oData"][placeInArray][aboveZeroProperties[i]]);
			}

			return iTotalLeaseCashOut;
		},
		validateCapexCashOutAmount: function (controller) {
			if (controller.getView().getModel("CARModel").getProperty("/FinancingTypeId") === 2)
				return;

			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var iTotalCapexCashOut = this.calculateTotalCapexCashOut(controller);
			var totalIsBiggerThanCARAmount = false;

			var placeInArray = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "CARCashOut");
			if (placeInArray === -1)
				return;

			if (iTotalCapexCashOut !== parseFloat(controller.getView().getModel("CARModel").getProperty("/CARAmountLC")))
				totalIsBiggerThanCARAmount = true;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				value = oIncrementalBusinessModel["oData"][placeInArray][aboveZeroProperties[i]];
				valueStateProperty = "/CARCashOut" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "/CARCashOut" + aboveZeroProperties[i] + "ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, String("This field is mandatory for Year " +
						(i + 1)));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
						controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty(valueStateTextProperty,
							"This field should have maximum 2 decimal values and 10 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (parseFloat(value) > 0) {
							controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, "Cash-Out amount should be negative or 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							if (totalIsBiggerThanCARAmount) {
								controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
								controller.getView().getModel("errorModel").setProperty(valueStateTextProperty,
									"The sum of the total CAPEX Cash-out should be equal to CAR amount");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
								bNoErrors = false;
							} else {
								controller.getView().getModel("errorModel").setProperty(valueStateProperty, "None");
								controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, "");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
							}

						}
					}

				}
			}

		},
		validateLeaseCashOutAmount: function (controller) {
			if (controller.getView().getModel("CARModel").getProperty("/FinancingTypeId") === 1)
				return;

			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArray = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "LeaseCashOut");
			if (placeInArray === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				value = oIncrementalBusinessModel["oData"][placeInArray][aboveZeroProperties[i]];
				valueStateProperty = "/LeaseCashOut" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "/LeaseCashOut" + aboveZeroProperties[i] + "ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, String("This field is mandatory for Year " +
						(i + 1)));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
						controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty(valueStateTextProperty,
							"This field should have maximum 2 decimal values and 10 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (parseFloat(value) > 0) {
							controller.getView().getModel("errorModel").setProperty(valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, "Lease amount should be negative or 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty(valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty(valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}
				}
			}
		},
		validateVolume: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArray = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "Volume");
			if (placeInArray === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArray][aboveZeroProperties[i]];
				valueStateProperty = "Volume" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "Volume" + aboveZeroProperties[i] + "ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory for Year " +
						(i + 1)));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 10 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (parseFloat(value) < 0) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Warning");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"Volume value should not be negative, except for some very specific cases.");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}

				}
			}

		},
		validateNetSales: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayNetSales = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "NetSalesLC");
			if (placeInArrayNetSales === -1)
				return;

			var placeInArrayROS = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "ROSLC");
			if (placeInArrayROS === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayNetSales][aboveZeroProperties[i]];
				var valueROS = oIncrementalBusinessModel["oData"][placeInArrayROS][aboveZeroProperties[i]];
				valueStateProperty = "NetSalesLC" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "NetSalesLC" + aboveZeroProperties[i] + "ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory for Year " +
						(i + 1)));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (valueROS < -100 || valueROS > 999) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"ROS Percentage needs to be between -100 and 999");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}

					}

				}
			}

		},
		validateROP: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

			var placeInArrayROP = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "ROPLC");
			if (placeInArrayROP === -1)
				return;

			var placeInArrayROS = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "ROSLC");
			if (placeInArrayROS === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayROP][aboveZeroProperties[i]];
				var valueROS = oIncrementalBusinessModel["oData"][placeInArrayROS][aboveZeroProperties[i]];
				valueStateProperty = oIncrementalBusinessModel["oData"][4]["NameInHANA"] + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = oIncrementalBusinessModel["oData"][4]["NameInHANA"] + aboveZeroProperties[i] + "ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory for Year " +
						(i + 1)));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (valueROS < -100 || valueROS > 999) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"ROS Percentage needs to be between -100 and 999");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}
				}
			}

		},
		validateMandatoryFinancialProperties: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var mandatoryProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var placeInArrayI, placeInArrayFCF;

			//We start at 3 because CashOut, Volume, NetSales are checked above
			for (var i = 3; i < 4; i++) {
				placeInArrayI = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, oIncrementalBusinessModel["oData"][i][
					"NameInHANA"
				]);
				if (placeInArrayI === -1)
					return;

				for (var j = 0; j < mandatoryProperties.length; j++) {
					value = oIncrementalBusinessModel["oData"][placeInArrayI][mandatoryProperties[j]];
					valueStateProperty = oIncrementalBusinessModel["oData"][placeInArrayI]["NameInHANA"] + mandatoryProperties[j] + "ValueState";
					valueStateTextProperty = oIncrementalBusinessModel["oData"][placeInArrayI]["NameInHANA"] + mandatoryProperties[j] +
						"ValueStateText";
					if (!value || value === "") {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "Please check value is filled in");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						//CO
						if ((i === 3) && (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 3)) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should have maximum 2 decimal values and 3 integer values");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							if ((i === 3) && (value < -100 || value > 999)) {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
									"Percentage needs to be between -100 and 999");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
								bNoErrors = false;
							} else {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
							}
						}
					}
				}
			}

			placeInArrayFCF = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "FCFLC");
			if (placeInArrayFCF === -1)
				return;
			for (var j = 0; j < mandatoryProperties.length; j++) {
				value = oIncrementalBusinessModel["oData"][placeInArrayFCF][mandatoryProperties[j]];
				valueStateProperty = oIncrementalBusinessModel["oData"][placeInArrayFCF]["NameInHANA"] + mandatoryProperties[j] + "ValueState";
				valueStateTextProperty = oIncrementalBusinessModel["oData"][placeInArrayFCF]["NameInHANA"] + mandatoryProperties[j] +
					"ValueStateText";
				if (!value || value === "") {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}

				}
			}
		},

		//CAR KPI
		validateRequiredFieldsCARKPI: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["ROICBefore", "ROICAfter"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (value === null || value === undefined || isNaN(value)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 4) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 4 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value < -100 || value > 999) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should be between -100 and 999");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}

				}
			}
		},
		validateRequiredFieldsForCAT1And2CARKPI: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["IRR"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();
			// var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				// if ((value === null || value === undefined || isNaN(value)) && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 ||
				// 		oCARModel.CategoryId ===
				// 		3)) {
				// 	controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
				// 	controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "This field is mandatory");
				// 	controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
				// 	bNoErrors = false;
				// } else {
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 3) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 3 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (value < -100 || value > 999) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should be between -100 and 999");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}
				}

				// }
			}

		},
		validatePercentageFieldsCARKPI: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["InterestRate", "NegotiatedOffer"];
			var oCARModel = controller.getView().getModel("CARModel").getData();
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (i === 0 && !value && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 3) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 3 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value < 0 || value > 100) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should not be more than 100 or less than 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}
				}

			}
		},
		validate4CharFieldsCARKPI: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["YearsOfContract", "Payback"];
			var oCARModel = controller.getView().getModel("CARModel").getData();
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";

				//YearsOfContract
				if (i === 0 && !value && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for the chosen Financing Type"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					//Payback
					if (i === 1 && !value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2)) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
							"This field is mandatory for category " + oCARModel.CategoryId));
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						//Both
						if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 9) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should not have decimal values and not more than 9 integer values");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							if (value >= 0 || value <= 999) {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
							} else {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
									"This field should be between 0 and 999");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
								bNoErrors = false;
							}
						}
					}
				}
			}
		},
		validateRequiredFielsCARKPIForCat1And2: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["NPVLC"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 20 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}
				}
			}
		},
		validateRequiredFielsCARKPIForCat1: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["PlantOUBefore", "PlantOUAfter", "PlantOEBefore", "PlantOEAfter", "AdditionalCapacity"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && oCARModel.CategoryId === 1) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 9) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should not have decimal values and not more than 9 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}
				}
			}
		},
		validateRequiredFielsCARKPIForFinancialType2And3AndNegative: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["FinancialCost"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					//FinancialCost
					if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 2 decimal values and 10 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value >= 0 && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should be < 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}
				}
			}
		},
		validateRequiredFielsCARKPIForFinancialType2And3: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["Debt"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCARKPIModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if ((!value || value === "") && (oCARModel.FinancingTypeId === 2 || oCARModel.FinancingTypeId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}
			}
		},

		//CAR One Planet
		validateMax30BeforeCommaAnd3AfterCAROnePlanetModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max30BeforeCommaAnd3AfterProperties = ["WBUAverageWater"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();

			for (var i = 0; i < Max30BeforeCommaAnd3AfterProperties.length; i++) {
				value = oCAROnePlanetModel[Max30BeforeCommaAnd3AfterProperties[i]];
				valueStateProperty = Max30BeforeCommaAnd3AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max30BeforeCommaAnd3AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 4 || that.countValuesBeforeDecimal(value) > 30) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 4 decimal values and 30 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateMax30BeforeCommaAnd3AfterAndNonNegativeCAROnePlanetModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max30BeforeCommaAnd3AfterProperties = ["WWBUAvgEnergyConsumption", "WWBUAverageCO2"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();

			for (var i = 0; i < Max30BeforeCommaAnd3AfterProperties.length; i++) {
				value = oCAROnePlanetModel[Max30BeforeCommaAnd3AfterProperties[i]];
				valueStateProperty = Max30BeforeCommaAnd3AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max30BeforeCommaAnd3AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 4 || that.countValuesBeforeDecimal(value) > 30) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 4 decimal values and 30 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (value < 0) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should be > 0");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					}
				}
			}
		},
		validateRequiredFielsCAROnePlanetForCat1And2And3AndDecimalCheck: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["CurrentYearProd"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 4 || that.countValuesBeforeDecimal(value) > 30) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 4 decimal values and 30 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}

				}
			}
		},
		validateRequiredFielsCAROnePlanetForWater: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = [
				"SiteWater", "ProjectWater", "SiteProjectInclWater", "SiteComplianceWater", "ProjectComplianceWater",
				"SiteProjectInclComplianceWater"
			];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && ((oCARModel.FinancingTypeId === 1 && oCARModel.CARAmountLFLEUR < -5000) || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 4 || that.countValuesBeforeDecimal(value) > 30) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 4 decimal values and 30 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}

				}
			}
		},
		validateRequiredFielsCAROnePlanetForCat1And2And3AndDecimalCheckAndNonNegative: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["CurrentEnergyConsumption", "ProjectEnergyConsumption", "SiteProjectEnergyConsumption",
				"SiteCO2", "ProjectCO2", "SiteProjectInclCO2"
			];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 4 || that.countValuesBeforeDecimal(value) > 30) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 4 decimal values and 30 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value < 0) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should be > 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}

					}

				}
			}
		},
		validateRequiredFielsCAROnePlanetForCat1And2And3: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var requiredProperties = ["GreenEnergyTypeId"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
				}
			}
		},
		validateRequiredFielsCAROnePlanetForCat1And2And3AndIntegerValue: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["GreenPaybackMonths"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 9) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should not have decimal values and not more than 9 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
					}

				}
			}
		},
		validateRequiredFielsCAROnePlanetForCat1And2And3AndWWBUIdIs202: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["SitePET", "ProjectPET", "AfterProjectPET"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();
			var sWBUWatersID = controller.getView().getModel("RandomModel").getData().WBUWatersID;

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3) && oCARModel.WWBUId ===
					sWBUWatersID) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId + " and WWBU Waters"));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 1 || that.countValuesBeforeDecimal(value) > 3) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 1 decimal values and 3 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value < 0 || value > 100) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should not be more than 100 or less than 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}
				}
			}
		},
		validatePercentageFieldsCAROnePlanet: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var requiredProperties = ["BeforeGreenEnergy", "AfterGreenEnergy", "ProjectPlasticRecyclable", "SitePlasticRecyclable",
				"AfterProjectPlasticRecyclable"
			];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredProperties.length; i++) {
				value = oCAROnePlanetModel[requiredProperties[i]];
				valueStateProperty = requiredProperties[i] + "ValueState";
				valueStateTextProperty = requiredProperties[i] + "ValueStateText";
				if (!value && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3)) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String(
						"This field is mandatory for category " + oCARModel.CategoryId));
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				} else {
					if (that.countDecimalValues(value) > 1 || that.countValuesBeforeDecimal(value) > 3) {
						controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
						controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
							"This field should have maximum 1 decimal values and 3 integer values");
						controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
						bNoErrors = false;
					} else {
						if (value < 0 || value > 100) {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
								"This field should not be more than 100 or less than 0");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);
						}
					}

				}
			}

		},
		// CAR Attachments
		validateRequiredAttachments: function (controller) {
			var value;
			var requiredModels = ["FinancialAnalysis", "BusinessCase"];
			var oCARAttachmentsJSONModel = controller.getView().getModel("CARAttachmentsJSONModel");

			for (var i = 0; i < requiredModels.length; i++) {
				value = oCARAttachmentsJSONModel.getProperty("/FileNameCAR" + requiredModels[i]); //Test for me!!!
				if (value === undefined) {
					controller.getView().getModel("errorModel").setProperty("/notAllRequiredAttachmentsErrorMessage",
						"\n\n Also, please upload all required attachments: Financial Analysis & Business Case");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}

			}
		},
		validateRequiredAttachmentsForC1C2C3C4C6C7: function (controller) {
			var value;
			var requiredModels = ["Operations"];
			var oCARAttachmentsJSONModel = controller.getView().getModel("CARAttachmentsJSONModel");
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < requiredModels.length; i++) {
				value = oCARAttachmentsJSONModel.getProperty("/FileNameCAR" + requiredModels[i]);
				if (value === undefined && (oCARModel.CategoryId === 1 || oCARModel.CategoryId === 2 || oCARModel.CategoryId === 3 || oCARModel.CategoryId ===
						4 || oCARModel.CategoryId === 6 || oCARModel.CategoryId === 7)) {
					controller.getView().getModel("errorModel").setProperty("/notAllRequiredAttachmentsC1C2C3C4C6C7ErrorMessage",
						"\n\n For Category 1, 2, 3, 4, 6 & 7: please upload Operations Attachments as well");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}

			}
		},
		// CAR Top Line
		checkIndexOfNameInHANAForTopLineModel: function (controller, nameInHANA) {
			var oTopLineModeloData = controller.getView().getModel("TopLineJSONModel")["oData"];
			var returnValue = -1;
			for (var i = 0; i < oTopLineModeloData.length; i++) {
				if (oTopLineModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		validateMandatoryTopLineProperties: function (controller) {
			if (controller.getView().getModel("CARModel").getProperty("/SubCategoryId") === 7) {
				var value, valueStateProperty, valueStateTextProperty, placeInArrayI;
				var that = this;
				var oTopLineModel = controller.getView().getModel("TopLineJSONModel");
				var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

				for (var i = 0; i < oTopLineModel["oData"].length; i++) {
					placeInArrayI = this.checkIndexOfNameInHANAForTopLineModel(controller, oTopLineModel["oData"][i][
						"NameInHANA"
					]);
					if (placeInArrayI === -1)
						return;

					for (var j = 0; j < aboveZeroProperties.length; j++) {
						value = oTopLineModel["oData"][placeInArrayI][aboveZeroProperties[i]];
						valueStateProperty = oTopLineModel["oData"][placeInArrayI]["NameInHANA"] + aboveZeroProperties[i] + "ValueState";
						valueStateTextProperty = oTopLineModel["oData"][placeInArrayI]["NameInHANA"] + aboveZeroProperties[i] +
							"ValueStateText";
						if (!value || value === "") {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory for Year " +
								(j + 1)));
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 20) {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
									"This field should have maximum 0 decimal values and 20 integer values");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
								bNoErrors = false;
							} else {

								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);

							}
						}
					}
				}

			}
		},
		// CAR Investment
		checkIndexOfNameInHANAForInvestmentModel: function (controller, nameInHANA) {
			var oInvestmentModeloData = controller.getView().getModel("InvestentJSONModel")["oData"];
			var returnValue = -1;
			for (var i = 0; i < oInvestmentModeloData.length; i++) {
				if (oInvestmentModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		validateMandatoryInvestmentProperties: function (controller) {
			if (controller.getView().getModel("CARModel").getProperty("/SubCategoryId") === 8) {
				var value, valueStateProperty, valueStateTextProperty, placeInArrayI;
				var that = this;
				var oInvestmentModel = controller.getView().getModel("InvestmentJSONModel");
				var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];

				for (var i = 0; i < oInvestmentModel["oData"].length; i++) {
					placeInArrayI = this.checkIndexOfNameInHANAForInvestmentModel(controller, oInvestmentModel["oData"][i]["NameInHANA"]);
					if (placeInArrayI === -1)
						return;

					for (var j = 0; j < aboveZeroProperties.length; j++) {
						value = oInvestmentModel["oData"][placeInArrayI][aboveZeroProperties[i]];
						valueStateProperty = oInvestmentModel["oData"][placeInArrayI]["NameInHANA"] + aboveZeroProperties[i] + "ValueState";
						valueStateTextProperty = oInvestmentModel["oData"][placeInArrayI]["NameInHANA"] + aboveZeroProperties[i] +
							"ValueStateText";
						if (!value || value === "") {
							controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
							controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, String("This field is mandatory for Year " +
								(j + 1)));
							controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
							bNoErrors = false;
						} else {
							if (that.countDecimalValues(value) > 0 || that.countValuesBeforeDecimal(value) > 20) {
								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
									"This field should have maximum 0 decimal values and 20 integer values");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
								bNoErrors = false;
							} else {

								controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "None");
								controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty, "");
								controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 0);

							}
						}
					}
				}
			}
		}
	};
});