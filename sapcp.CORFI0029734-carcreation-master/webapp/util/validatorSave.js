/*eslint-disable no-console, no-alert */
sap.ui.define([
	"sap/m/MessageBox"
], function (MessageBox) {
	"use strict";

	var bNoErrors = true;
	return {
		validateFieldsForSave: function (controller) {
			bNoErrors = true;

			//Deze mag geen else statement bevatten waar de valueStates op "None" worden gezet. Deze checks moeten ook voor de validator voor de launch gebeuren,
			// anders zullen deze checks teniet gedaan worden door de validatorForLaunch.

			//CAR
			this.validateMax22BeforeCommaAnd2AfterCARModel(controller);
			this.validateOnlyIntegerValuesCARModel(controller);

			//CARFinancial
			this.validateCARCashOut(controller);
			this.validateLeaseCashOut(controller);
			this.validateVolume(controller);
			this.validateNetSales(controller);
			this.validateCO(controller);
			this.validateROPLC(controller);
			this.validateFCFLC(controller);

			//CARKPI
			this.validateMax10BeforeCommaAnd2AfterCARKPIModel(controller);
			this.validateMax20BeforeCommaAnd2AfterCARKPIModel(controller);
			this.validateMax3BeforeCommaAnd2AfterCARKPIModel(controller);
			this.validateMax4BeforeCommaAnd2AfterCARKPIModel(controller);
			this.validateOnlyIntegerValuesCARKPIModel(controller);

			//CAROnePlanet
			this.validateMax30BeforeCommaAnd3AfterCAROnePlanetModel(controller);
			this.validateMax3BeforeCommaAnd1AfterCAROnePlanetModel(controller);
			this.validateOnlyIntegerValuesCAROnePlanetModel(controller);

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
		checkIndexOfNameInHANAForIncrementalBusinessModel: function (controller, nameInHANA) {
			var oIncrementalBusinessModeloData = controller.getView().getModel("incrementalBusinessJSONModel")["oData"];
			var returnValue = -1;
			for (var i = 0; i < oIncrementalBusinessModeloData.length; i++) {
				if (oIncrementalBusinessModeloData[i].NameInHANA === nameInHANA)
					returnValue = i;
			}

			return returnValue;
		},
		validateMax22BeforeCommaAnd2AfterCARModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max22BeforeCommaAnd2AfterProperties = ["CARAmountLC", "LeaseAmountLC"];
			var oCARModel = controller.getView().getModel("CARModel").getData();

			for (var i = 0; i < Max22BeforeCommaAnd2AfterProperties.length; i++) {
				value = oCARModel[Max22BeforeCommaAnd2AfterProperties[i]];
				valueStateProperty = Max22BeforeCommaAnd2AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max22BeforeCommaAnd2AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 20 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateOnlyIntegerValuesCARModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var IntegerProperties = ["InternalOrderRef", "CARReferenceID"];
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

		//CAR Finanial
		validateCARCashOut: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayCARCashOut = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "CARCashOut");
			if (placeInArrayCARCashOut === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel.getData()[placeInArrayCARCashOut][aboveZeroProperties[i]];
				valueStateProperty = "CARCashOut" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "CARCashOut" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 10 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateLeaseCashOut: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayCARCashOut = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "LeaseCashOut");
			if (placeInArrayCARCashOut === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayCARCashOut][aboveZeroProperties[i]];
				valueStateProperty = "LeaseCashOut" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "LeaseCashOut" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 10 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateVolume: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayVolume = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "Volume");
			if (placeInArrayVolume === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayVolume][aboveZeroProperties[i]];
				valueStateProperty = "Volume" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "Volume" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 10 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}

		},
		validateNetSales: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayNetSalesLC = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "NetSalesLC");
			if (placeInArrayNetSalesLC === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayNetSalesLC][aboveZeroProperties[i]];
				valueStateProperty = "NetSalesLC" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "NetSalesLC" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 20 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateCO: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayCO = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "CO");
			if (placeInArrayCO === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = String(oIncrementalBusinessModel.getData()[placeInArrayCO][aboveZeroProperties[i]]).replace(" %", "");
				valueStateProperty = "CO" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "CO" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 3) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 3 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateROPLC: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayROPLC = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "ROPLC");
			if (placeInArrayROPLC === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayROPLC][aboveZeroProperties[i]];
				valueStateProperty = "ROPLC" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "ROPLC" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 20 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateFCFLC: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var oIncrementalBusinessModel = controller.getView().getModel("incrementalBusinessJSONModel");
			var aboveZeroProperties = ["Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7"];
			var that = this;

			var placeInArrayFCFLC = this.checkIndexOfNameInHANAForIncrementalBusinessModel(controller, "FCFLC");
			if (placeInArrayFCFLC === -1)
				return;

			for (var i = 0; i < aboveZeroProperties.length; i++) {
				//The one is standing for the Volume property in the oData
				value = oIncrementalBusinessModel["oData"][placeInArrayFCFLC][aboveZeroProperties[i]];
				valueStateProperty = "FCFLC" + aboveZeroProperties[i] + "ValueState";
				valueStateTextProperty = "FCFLC" + aboveZeroProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 20 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},

		//CAR KPI
		validateMax3BeforeCommaAnd2AfterCARKPIModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max3BeforeCommaAnd2AfterProperties = ["IRR", "InterestRate", "NegotiatedOffer"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < Max3BeforeCommaAnd2AfterProperties.length; i++) {
				value = oCARKPIModel[Max3BeforeCommaAnd2AfterProperties[i]];
				valueStateProperty = Max3BeforeCommaAnd2AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max3BeforeCommaAnd2AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 3) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 3 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateMax4BeforeCommaAnd2AfterCARKPIModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max4BeforeCommaAnd2AfterProperties = ["ROICBefore", "ROICAfter"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < Max4BeforeCommaAnd2AfterProperties.length; i++) {
				value = oCARKPIModel[Max4BeforeCommaAnd2AfterProperties[i]];
				valueStateProperty = Max4BeforeCommaAnd2AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max4BeforeCommaAnd2AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 4) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 4 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateMax20BeforeCommaAnd2AfterCARKPIModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max20BeforeCommaAnd2AfterProperties = ["NPVLC"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < Max20BeforeCommaAnd2AfterProperties.length; i++) {
				value = oCARKPIModel[Max20BeforeCommaAnd2AfterProperties[i]];
				valueStateProperty = Max20BeforeCommaAnd2AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max20BeforeCommaAnd2AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 20) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 20 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateOnlyIntegerValuesCARKPIModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var IntegerProperties = ["Payback", "YearsOfContract", "PlantOUBefore", "PlantOUAfter", "PlantOEBefore", "PlantOEAfter",
				"AdditionalCapacity"
			];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < IntegerProperties.length; i++) {
				value = oCARKPIModel[IntegerProperties[i]];
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
		validateMax10BeforeCommaAnd2AfterCARKPIModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max10BeforeCommaAnd2AfterProperties = ["FinancialCost"];
			var oCARKPIModel = controller.getView().getModel("CARKPIModel").getData();

			for (var i = 0; i < Max10BeforeCommaAnd2AfterProperties.length; i++) {
				value = oCARKPIModel[Max10BeforeCommaAnd2AfterProperties[i]];
				valueStateProperty = Max10BeforeCommaAnd2AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max10BeforeCommaAnd2AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 2 || that.countValuesBeforeDecimal(value) > 10) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 2 decimal values and 10 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},

		//CAR One Planet
		validateMax30BeforeCommaAnd3AfterCAROnePlanetModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max30BeforeCommaAnd3AfterProperties = ["CurrentYearProd", "CurrentEnergyConsumption", "ProjectEnergyConsumption",
				"SiteProjectEnergyConsumption", "SiteCO2", "ProjectCO2", "SiteProjectInclCO2", "WWBUAverageCO2", "SiteWater", "ProjectWater",
				"SiteProjectInclWater", "WBUAverageWater", "SiteComplianceWater", "ProjectComplianceWater", "SiteProjectInclComplianceWater",
				"WWBUAvgEnergyConsumption"
			];
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
		validateMax3BeforeCommaAnd1AfterCAROnePlanetModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var Max3BeforeCommaAnd1AfterProperties = ["BeforeGreenEnergy", "AfterGreenEnergy", "SitePlasticRecyclable",
				"SitePET", "ProjectPlasticRecyclable", "ProjectPET", "AfterProjectPlasticRecyclable", "AfterProjectPET"
			];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();

			for (var i = 0; i < Max3BeforeCommaAnd1AfterProperties.length; i++) {
				value = oCAROnePlanetModel[Max3BeforeCommaAnd1AfterProperties[i]];
				valueStateProperty = Max3BeforeCommaAnd1AfterProperties[i] + "ValueState";
				valueStateTextProperty = Max3BeforeCommaAnd1AfterProperties[i] + "ValueStateText";
				if (that.countDecimalValues(value) > 1 || that.countValuesBeforeDecimal(value) > 3) {
					controller.getView().getModel("errorModel").setProperty("/" + valueStateProperty, "Error");
					controller.getView().getModel("errorModel").setProperty("/" + valueStateTextProperty,
						"This field should have maximum 1 decimal values and 3 integer values");
					controller.getView().getModel("errorModel").setProperty("/errorInCARCreation", 1);
					bNoErrors = false;
				}
			}
		},
		validateOnlyIntegerValuesCAROnePlanetModel: function (controller) {
			var value, valueStateProperty, valueStateTextProperty;
			var that = this;
			var IntegerProperties = ["GreenPaybackMonths"];
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel").getData();

			for (var i = 0; i < IntegerProperties.length; i++) {
				value = oCAROnePlanetModel[IntegerProperties[i]];
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
	};
});