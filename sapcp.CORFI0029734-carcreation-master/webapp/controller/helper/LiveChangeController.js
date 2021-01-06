sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/danone/capcarcreation/util/formatter"
], function (JSONModel, MessageToast, formatter) {
	"use strict";

	return {
		/* =========================================================== */
		/* Begin of General methods */
		/* =========================================================== */
		/** 
		 * Gets triggers by the liveChange event of the control and sets the valueState to ‘None’ in the control itself but also in the errorModel
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInput: function (controller, oEvent) {
			var propertyName = oEvent.getSource()["mBindingInfos"].value.binding.getPath();
			if (propertyName.includes("/")) {
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "None");
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"), "");
			} else {
				oEvent.getSource().setValueState("None");
			}
		},
		/** 
		 * Calls the onLiveChangeInput and converts the value of the Event into a decimal with '.' as a seperator
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputDecimal: function (controller, oEvent) {
			this.onLiveChangeInput(controller, oEvent);

			var sValue = oEvent.getSource().getValue(); //This value is a String, so it can be anything
			sValue = sValue.replace(",", "."); // We replace the ',' seperator by '.' because oData can't handle the ','
			sValue = controller.makeNewValueWithDecimalsAndNegative(sValue); // We want to get rid of the not number chars like letters or something else

			oEvent.getSource().setValue(sValue);
		},
		/** 
		 * Sets the valuestate to ‘None’ in the control itself
		 * @param controller
		 * @param oEvent
		 */
		onChangeSelect: function (controller, oEvent) {
			oEvent.getSource().setValueState("None");
		},
		/** 
		 * Sets the valuestate to ‘None’ in the control itself
		 * @param controller
		 * @param oEvent
		 */
		onSelectRadio: function (controller, oEvent) {
			oEvent.getSource().setValueState("None");
		},
		/** 
		 * Gets triggers by the liveChange event of the control and checks if the value is negative or positive.
		 * It sets the valuestate to ‘Error’ if it is negative and ‘None’ if positive
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputNonNegativeValue: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);

			var sPath = oEvent.getSource()["mBindingInfos"].value.binding.getPath();

			if (parseFloat(oEvent.getSource().getValue()) < 0) {
				controller.getView().getModel("errorModel").setProperty(sPath + "ValueState", "Error");
				controller.getView().getModel("errorModel").setProperty(sPath + "ValueStateText", "This field should be > 0");
			} else {
				controller.getView().getModel("errorModel").setProperty(sPath + "ValueState", "None");
				controller.getView().getModel("errorModel").setProperty(sPath + "ValueStateText", "");
			}
		},
		/* =========================================================== */
		/* End of General methods */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for General Information */
		/* =========================================================== */
		/** 
		 * Handles the select event of the RadioButton control for WBS
		 * @param controller
		 * @param oEvent
		 */
		radioWBSSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var CARModel = controller.getView().getModel("CARModel");
			CARModel.setProperty("/ForWBS", sSelected);

		},
		radioXCBUSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);

			var oCARModel = controller.getView().getModel("CARModel");
			var oRandomModel = controller.getView().getModel("RandomModel");
			var oRadioXCBU = controller.getView().byId("radioXCBUId");
			var sSelectedValue = oRadioXCBU.getButtons()[oRadioXCBU.getSelectedIndex()].getText();

			oCARModel.setProperty("/XCBU", sSelectedValue);
			if (sSelectedValue === "Yes") {
				controller.getView().byId("oplId").scrollToSection(controller.byId("opssOrganization").getId());
			} else {
				oCARModel.setProperty("/XCBUOneId", "");
				oCARModel.setProperty("/XCBUTwoId", "");
				oCARModel.setProperty("/XCBUThreeId", "");

				controller.getView().byId("inputXWwbuOneNameId").setValue("");
				oRandomModel.setProperty("/XWWBUOneName", "");
				oCARModel.setProperty("/XWWBUOneId", "");

				controller.getView().byId("inputXWwbuTwoNameId").setValue("");
				oRandomModel.setProperty("/XWWBUTwoName", "");
				oCARModel.setProperty("/XWWBUTwoId", "");

				controller.getView().byId("inputXWwbuThreeNameId").setValue("");
				oRandomModel.setProperty("/XWWBUThreeName", "");
				oCARModel.setProperty("/XWWBUThreeId", "");
			}
		},
		/** 
		 * Handles the select event of the RadioButton control for InRadar
		 * @param controller
		 * @param oEvent
		 */
		radioVisibleInRadarSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var CARModel = controller.getView().getModel("CARModel");
			CARModel.setProperty("/InRadar", sSelected);
		},
		/** 
		 * Handles the select event of the RadioButton control for InStrategicPlan
		 * @param controller
		 * @param oEvent
		 */
		radioInclStratPlanSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var CARModel = controller.getView().getModel("CARModel");
			CARModel.setProperty("/InStrategicPlan", sSelected);
		},
		/** 
		 * Handles the select event of the RadioButton control for InRollingForecast
		 * @param controller
		 * @param oEvent
		 */
		radioIncludedInLastRollingForecastSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var CARModel = controller.getView().getModel("CARModel");
			CARModel.setProperty("/InRollingForecast", sSelected);
		},
		/** 
		 * Handles the select event of the RadioButton control for FinancingTypeId
		 * @param controller
		 * @param oEvent
		 */
		onChangeSelectFinancingType: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var oRandomModel = controller.getView().getModel("RandomModel");
			var iFinancingTypeId = parseInt(oEvent.getParameter("selectedItem").getKey(), 10);
			controller.getView().getModel("CARModel").setProperty("/FinancingTypeId", iFinancingTypeId);
			controller.getView().getModel("RandomModel").setProperty("/FinancingTypeName", oEvent.getParameters().selectedItem.getText());

			controller.changeAmountWhenFinancingTypeChanges();
			controller.changeFinancialTableWhenFinancingTypeChanges();
			if (oRandomModel.getProperty("/iPreviousFinancingTypeId") !== undefined) {
				controller.clearDataInKPI(oRandomModel.getProperty("/iPreviousFinancingTypeId"), iFinancingTypeId);
			}

			oRandomModel.setProperty("/iPreviousFinancingTypeId", iFinancingTypeId);
		},
		/** 
		 * Reads the picture uploaded by the user and saves it in CARAttachmentsJSONModel
		 * @param controller
		 */
		handleValueChangeCARPicture: function (controller) {
			var that = controller;
			var oFileUploader = controller.byId("fileUploaderCARPicture");
			var base64 = "";
			var mimeType = "";
			var filename = oFileUploader.getValue();

			if (!oFileUploader.getValue()) {
				sap.m.MessageToast.show("Choose a file first");
				return;
			}

			var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			// var BASE64_MARKER = 'data:' + file.type + ';base64,';
			var reader = new FileReader();

			reader.onload = (function (theFile) {
				return function (evt) {
					mimeType = evt.target.result.split("data:")[1].split(";base64")[0];
					// var base64Index = evt.target.result.indexOf('data:' + mimeType + ';base64,') + BASE64_MARKER.length;
					base64 = evt.target.result.split(";base64,")[1];

					that.getView().getModel("RandomModel").setProperty("/picture", URL.createObjectURL(file));
					that.getView().getModel("RandomModel").setProperty("/onePagerPicture", URL.createObjectURL(file));
					that.getView().getModel("RandomModel").setProperty("/pictureFromUser", true);

					// that.CARPictureChanged = true;
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARPictureChanged", true);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARPictureBase64", base64);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/CARPictureFile", file);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/FileNameCARPicture", filename);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/DescriptionCARPicture", "CARPicture");
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/MimeTypeCARPicture", mimeType);
				};
			})(file);

			reader.readAsDataURL(file);
		},
		/** 
		 * Handles the change event of the Select control when a Category is changed
		 * @param controller
		 * @param oEvent
		 */
		onCARCategoryChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var oSelect = controller.byId("idSelectSubcategory");
			var oCARModel = controller.getView().getModel("CARModel");
			var oRandomModel = controller.getView().getModel("RandomModel");
			var iPreviousCategory = controller.sCARcategoryId;
			controller.sCARcategoryId = parseInt(oEvent.getParameter("selectedItem").getKey(), 10);
			oCARModel.setProperty("/CategoryId", parseInt(oEvent.getParameter("selectedItem").getKey(), 10));
			oCARModel.setProperty("/SubCategoryId", null);
			oRandomModel.setProperty("/CategoryName", oEvent.getParameters().selectedItem.getText());

			var oFilter = new sap.ui.model.Filter("CategoryId", sap.ui.model.FilterOperator.EQ, controller.sCARcategoryId);
			var oBinding = oSelect.getBinding("items");
			oBinding.filter(oFilter);

			if (!oRandomModel.getProperty("/pictureFromUser"))
				controller._checkCategoryForCARPicture();
			controller._checkCategory();
			controller._checkMandatoryFieldsWaterMonetizer();

			if (iPreviousCategory !== undefined)
				controller.clearDataInModelsAfterChangingCategory(iPreviousCategory, controller.sCARcategoryId);
		},
		/** 
		 * Handles the change event of the Select control when the CBU is changed. It reads also the CBU from the backend to get the WBU
		 * @param controller
		 * @param oEvent
		 */
		onCBUChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var oSelect = controller.byId("selectSiteId");
			var sCBUId = oEvent.getParameter("selectedItem").getKey();
			var that = controller;
			var oFilter = new sap.ui.model.Filter("CBUId", sap.ui.model.FilterOperator.EQ, sCBUId);
			var oBinding = oSelect.getBinding("items");
			oBinding.filter(oFilter);
			that.getView().getModel("CARModel").setProperty("/CBUId", sCBUId);

			var sURLForCBU = "/CBU('" + sCBUId + "')";
			var sUrlForWWBU;
			controller.getView().getModel("RandomModel").setProperty("/CBUName", oEvent.getParameters().selectedItem.getText().split(" - ")[0]);

			new Promise(function (resolve, reject) {
				that.getView().getModel().read(sURLForCBU, {
					success: function (oData) {
						that.getView().getModel("CARModel").setProperty("/WWBUId", oData.WWBUId);
						sUrlForWWBU = String("/WWBU('" + that.getView().getModel("CARModel").getProperty("/WWBUId") + "')");

						resolve();
					},
					error: function (dataResp) {
						that.showErrorMessageFromBackend(
							"Failed to fetch the CBUs, please contact the IT department with following error:", dataResp);
						// sap.m.MessageBox.error("Failed to fetch the CBUs, please contact the IT department with following error:", {
						// 	styleClass: "sapUiSizeCompact",
						// 	details: dataResp
						// });
					}
				});
			}).then(function (result) {
				that.getView().getModel().read(sUrlForWWBU, {
					success: function (oData) {
						that.byId("inputWwbuNameId").setValue(String(oData.Name + " - " + oData.Id));
						that.getView().getModel("RandomModel").setProperty("/WWBUName", String(oData.Name));
					}
				});
			});

			controller.byId("selectSiteId").setSelectedKey();

		},
		/** 
		 * Handles the change event of the Select control when the Site is changed.
		 * It reads also the Country from the backend to get the Currency Rate and calculate the CAR, Lease and Total amount.
		 * @param controller
		 * @param oEvent
		 */
		onSiteChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var sUrlForSite = "/Site('" + oEvent.getParameter("selectedItem").getKey() + "')";
			var that = controller;

			new Promise(function (resolve, reject) {
				that.getView().getModel().read(sUrlForSite, {
					success: function (oData) {
						that.getView().getModel("CARModel").setProperty("/CountryId", oData.CountryId);
						that.changeAmountCAR();
						that.changeAmountLease();
						resolve();
					},
					error: function (dataResp) {
						that.showErrorMessageFromBackend(
							"Failed to fetch the Sites, please contact the IT department with following error:", dataResp);
						// sap.m.MessageBox.error("Failed to fetch the Sites, please contact the IT department with following error:", {
						// 	styleClass: "sapUiSizeCompact",
						// 	details: dataResp
						// });
					}
				});
			});
		},
		/** 
		 * Handles the change event of the Select control when the X-CBU One is changed. It reads also the CBU from the backend to get the WBU
		 * @param controller
		 * @param oEvent
		 */
		onXCBUOneChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var sXCBUOneId = oEvent.getParameter("selectedItem").getKey();
			var that = controller;
			// that.getView().getModel("CARModel").setProperty("/CBUId", sXCBUOneId);

			var sURLForXCBUOne = "/CBU('" + sXCBUOneId + "')";
			var sUrlForXWWBUOne;
			// controller.getView().getModel("RandomModel").setProperty("/XCBUOneName", oEvent.getParameters().selectedItem.getText().split(" - ")[0]);

			new Promise(function (resolve, reject) {
				that.getView().getModel().read(sURLForXCBUOne, {
					success: function (oData) {
						// that.getView().getModel("CARModel").setProperty("/XWWBUOneId", oData.WWBUId);
						sUrlForXWWBUOne = String("/WWBU('" + oData.WWBUId + "')");

						resolve();
					},
					error: function (dataResp) {
						that.showErrorMessageFromBackend(
							"Failed to fetch the CBUs, please contact the IT department with following error:", dataResp);
					}
				});
			}).then(function (result) {
				that.getView().getModel().read(sUrlForXWWBUOne, {
					success: function (oData) {
						that.byId("inputXWwbuOneNameId").setValue(String(oData.Name + " - " + oData.Id));
						// that.getView().getModel("RandomModel").setProperty("/XWWBUOneName", String(oData.Name));
					}
				});
			});
		},
		onXCBUTwoChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var sXCBUTwoId = oEvent.getParameter("selectedItem").getKey();
			var that = controller;
			// that.getView().getModel("CARModel").setProperty("/CBUId", sXCBUTwoId);

			var sURLForXCBUTwo = "/CBU('" + sXCBUTwoId + "')";
			var sUrlForXWWBUTwo;
			// controller.getView().getModel("RandomModel").setProperty("/XCBUTwoName", oEvent.getParameters().selectedItem.getText().split(" - ")[0]);

			new Promise(function (resolve, reject) {
				that.getView().getModel().read(sURLForXCBUTwo, {
					success: function (oData) {
						// that.getView().getModel("CARModel").setProperty("/XWWBUTwoId", oData.WWBUId);
						sUrlForXWWBUTwo = String("/WWBU('" + oData.WWBUId + "')");

						resolve();
					},
					error: function (dataResp) {
						that.showErrorMessageFromBackend(
							"Failed to fetch the CBUs, please contact the IT department with following error:", dataResp);
					}
				});
			}).then(function (result) {
				that.getView().getModel().read(sUrlForXWWBUTwo, {
					success: function (oData) {
						that.byId("inputXWwbuTwoNameId").setValue(String(oData.Name + " - " + oData.Id));
						// that.getView().getModel("RandomModel").setProperty("/XWWBUTwoName", String(oData.Name));
					}
				});
			});
		},
		onXCBUThreeChanged: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var sXCBUThreeId = oEvent.getParameter("selectedItem").getKey();
			var that = controller;
			// that.getView().getModel("CARModel").setProperty("/CBUId", sXCBUThreeId);

			var sURLForXCBUThree = "/CBU('" + sXCBUThreeId + "')";
			var sUrlForXWWBUThree;
			// controller.getView().getModel("RandomModel").setProperty("/XCBUThreeName", oEvent.getParameters().selectedItem.getText().split(" - ")[0]);

			new Promise(function (resolve, reject) {
				that.getView().getModel().read(sURLForXCBUThree, {
					success: function (oData) {
						// that.getView().getModel("CARModel").setProperty("/XWWBUThreeId", oData.WWBUId);
						sUrlForXWWBUThree = String("/WWBU('" + oData.WWBUId + "')");

						resolve();
					},
					error: function (dataResp) {
						that.showErrorMessageFromBackend(
							"Failed to fetch the CBUs, please contact the IT department with following error:", dataResp);
					}
				});
			}).then(function (result) {
				that.getView().getModel().read(sUrlForXWWBUThree, {
					success: function (oData) {
						that.byId("inputXWwbuThreeNameId").setValue(String(oData.Name + " - " + oData.Id));
						// that.getView().getModel("RandomModel").setProperty("/XWWBUThreeName", String(oData.Name));
					}
				});
			});
		},
		/** 
		 * Handles the change event of the DatePicker control to check if the selected date is not before the current date
		 * @param controller
		 * @param oEvent
		 */
		expValidationDateChanged: function (controller, oEvent) {
			this.onLiveChangeInput(controller, oEvent);
			var createdOn;
			var id = oEvent.getParameter("id");
			if(id.indexOf("ExpValidationDateId") !== -1) {
				oEvent.getSource().setDisplayFormat("MM/yyyy");
			}
			var oErrorModel = controller.getView().getModel("errorModel");
			if (controller.getView().getModel("CARModel").getProperty("/CreatedOn") === "") {
				createdOn = new Date(new Date().toDateString());
			} else {
				createdOn = controller.convertDateToJavaScriptDateObject("CreatedOn");
			}

			if (controller.convertDateToJavaScriptDateObject("ExpValidationDate") <= createdOn) {
				oErrorModel.setProperty("/ExpValidationDateValueState", "Error");
				oErrorModel.setProperty("/ExpValidationDateValueStateText",
					"Final validation date has to be after creation date");
				sap.m.MessageBox.error("Final validation date has to be after creation date");
				return;
			}
			oErrorModel.setProperty("/ExpValidationDateValueState", "None");
			oErrorModel.setProperty("/ExpValidationDateValueStateText", "");
		},
		/** 
		 * Handles the change event of the DatePicker control to check if the selected date is not before the current date and not before the ExpValidationDate
		 * @param controller
		 * @param oEvent
		 */
		expGoLiveDateChanged: function (controller, oEvent) {
			this.onLiveChangeInput(controller, oEvent);
			var createdOn;
			var id = oEvent.getParameter("id");
			if(id.indexOf("ExpGoLiveDateId") !== -1) {
				oEvent.getSource().setDisplayFormat("MM/yyyy");
			}
			var oErrorModel = controller.getView().getModel("errorModel");
			if (controller.getView().getModel("CARModel").getProperty("/CreatedOn") === "") {
				createdOn = new Date(new Date().toDateString());
			} else {
				createdOn = controller.convertDateToJavaScriptDateObject("CreatedOn");
			}
			var expValidationDate = controller.convertDateToJavaScriptDateObject("ExpValidationDate");
			var expGoLiveDate = controller.convertDateToJavaScriptDateObject("ExpGoLiveDate");
			if (expGoLiveDate <= createdOn || expGoLiveDate <=
				expValidationDate) {
				oErrorModel.setProperty("/ExpGoLiveDateValueState", "Error");
				oErrorModel.setProperty("/ExpGoLiveDateValueStateText",
					"Go Live expected date has to be after creation date and final validation date");
				sap.m.MessageBox.error("Go Live expected date has to be after creation date and final validation date");

				return;
			}
			oErrorModel.setProperty("/ExpGoLiveDateValueState", "None");
			oErrorModel.setProperty("/ExpGoLiveDateValueStateText", "");
		},
		/** 
		 * Handles the change event of the DatePicker control to check if the selected date is not beyond the current date
		 * @param controller
		 * @param oEvent
		 */
		sinceDateChanged: function (controller, oEvent) {
			this.onLiveChangeInput(controller, oEvent);
			var id = oEvent.getParameter("id");
			if(id.indexOf("SinceId") !== -1) {
				oEvent.getSource().setDisplayFormat("MM/yyyy");
			}
			var oErrorModel = controller.getView().getModel("errorModel");
			if (new Date(controller.convertDateToJavaScriptDateObject("Since").toDateString()) >= new Date(new Date().toDateString())) {
				oErrorModel.setProperty("/SinceValueState", "Error");
				oErrorModel.setProperty("/SinceValueStateText", "Since date should not be in the future");
				sap.m.MessageBox.error("Since date should not be in the future");
				return;
			}
			oErrorModel.setProperty("/SinceValueState", "None");
			oErrorModel.setProperty("/SinceValueStateText", "");
		},
		/** 
		 * Handles the liveChange event of the CARAmountLC
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputCARAmountReq: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			controller.getView().getModel("CARModel").setProperty("/CARAmountLC", oEvent.getSource().getValue());
			controller.changeAmountCAR();
		},
		/** 
		 * Handles the liveChange event of the LeaseAmountLC
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputLeaseAmountReq: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			controller.getView().getModel("CARModel").setProperty("/LeaseAmountLC", oEvent.getSource().getValue());
			controller.changeAmountLease();
		},
		/** 
		 * Handles the select event of the BudgetExtension
		 * @param controller
		 * @param oEvent
		 */
		radioExtensionFlagSelected: function (controller, oEvent) {
			controller.sExtensionFlag = oEvent.getSource().getButtons()[oEvent.getParameter("selectedIndex")].getText();
			var that = controller;
			controller.getView().getModel("CARModel").setProperty("/BudgetExtension", controller.sExtensionFlag);
			if (controller.sExtensionFlag === "Yes") {
				that.byId("lblReferenceCARId").setRequired(true);
				that.byId("inputReferenceCARId").setEditable(true);
				that.byId("inputReferenceCARId").setRequired(true);
			} else {
				that.byId("lblReferenceCARId").setRequired(false);
				that.byId("inputReferenceCARId").setEditable(false);
				that.byId("inputReferenceCARId").setRequired(false);
			}
		},
		/** 
		 * Handles the change event of the SubCategoryId
		 * @param controller
		 * @param oEvent
		 */
		changeSubCategory: function (controller, oEvent) {
			this.onChangeSelect(controller, oEvent);
			var CARModel = controller.getView().getModel("CARModel");
			var oRandomModel = controller.getView().getModel("RandomModel");
			var iPreviousSubcategory = oRandomModel.getProperty("/iPreviousSubcategory");
			var iSubCatId = parseInt(oEvent.getParameter("selectedItem").getKey(), 10);
			oRandomModel.setProperty("/iPreviousSubcategory", iSubCatId);
			CARModel.setProperty("/SubCategoryId", iSubCatId);
			if (iPreviousSubcategory !== undefined) {
				if (iPreviousSubcategory === 7 && iSubCatId === 8) { // The user changed from subcategory 7 to 8
					controller.clearDataInTopLineModel();
				}
				if (iPreviousSubcategory === 8 && iSubCatId === 7) { // The user changed from subcategory 7 to 8
					controller.clearDataInInvestmentModel();
				}
			}
		},
		/* =========================================================== */
		/* End of methods for General Information */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Financial & Operational */
		/* =========================================================== */
		/** 
		 * Handles the liveChange event of all inputs in the Financial table. Do a lot of checks and adds the value of the input in the model
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputFinancialTable: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			var incremData = controller.getView().getModel("incrementalBusinessJSONModel")["oData"];
			var bCompact = !!controller.getView().$().closest(".sapUiSizeCompact").length;
			var NetSalesPerYear, ROPPerYear, propertyName;
			var valueROS = 0;
			var NameLabel = oEvent.getSource()["mBindingInfos"].valueState.binding.getValue()[0];
			var yearName = oEvent.getSource()["mBindingInfos"].value.binding.getPath();

			if (NameLabel.includes("Capex")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "CARCashOut");
			}
			if (NameLabel.includes("Capex") && parseFloat(oEvent.getSource().getValue()) > 0) {
				propertyName = "/CARCashOut" + yearName;
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
					"Cash-Out amount should be negative");
			}

			if (NameLabel.includes("Lease")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "LeaseCashOut");
			}
			if (NameLabel.includes("Lease") && parseFloat(oEvent.getSource().getValue()) > 0) {
				propertyName = "/LeaseCashOut" + yearName;
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
				controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
					"Cash-Out amount should be negative");
			}

			if (NameLabel.includes("FCF")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "FCFLC");
			}

			if (NameLabel.includes("sales")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "NetSalesLC");
				propertyName = "/NetSalesLC" + yearName;

				var placeInArrayROP = controller.checkIndexOfNameInHANAForIncrementalBusinessModel("ROPLC");
				if (placeInArrayROP === -1)
					sap.m.MessageBox.error(
						"Failed to find the value of ROP, please contact the IT department", {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						}
					);

				NetSalesPerYear = parseFloat(oEvent.getSource().getValue());
				ROPPerYear = parseFloat(incremData[placeInArrayROP][yearName]);
				if (NetSalesPerYear !== 0 && ROPPerYear !== 0) {
					valueROS = formatter.roundToTwoDecimals(ROPPerYear / NetSalesPerYear) * 100;
					if (valueROS < -100 || valueROS > 999) {
						controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
						controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
							"ROS Percentage needs to be between -100 and 999");
					}
				}

				controller.validateROS(NetSalesPerYear, ROPPerYear, yearName);
			}
			if (NameLabel.includes("ROP")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "ROPLC");
				propertyName = "/ROPLC" + yearName;

				var placeInArrayNetSales = controller.checkIndexOfNameInHANAForIncrementalBusinessModel("NetSalesLC");
				if (placeInArrayNetSales === -1)
					sap.m.MessageBox.error(
						"Failed to find the value of Net Sales, please contact the IT department", {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						}
					);

				ROPPerYear = parseFloat(oEvent.getSource().getValue());
				NetSalesPerYear = parseFloat(incremData[placeInArrayNetSales][yearName]);

				if (NetSalesPerYear !== 0 && ROPPerYear !== 0) {
					valueROS = formatter.roundToTwoDecimals(ROPPerYear / NetSalesPerYear) * 100;
					if (valueROS < -100 || valueROS > 999) {
						controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
						controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
							"ROS Percentage needs to be between -100 and 999");
					}
				}

				controller.validateROS(NetSalesPerYear, ROPPerYear, yearName);
			}
			if (NameLabel.includes("Volume")) {
				this.addDataFromTheLiveChangeToTheModel(controller, oEvent, "Volume");
				propertyName = "/Volume" + yearName;

				if (yearName.includes("3")) {
					controller.getView().getModel("RandomModel").setProperty("/VolumeY3", parseFloat(oEvent.getSource().getValue()));
					var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
					var iCurrentYearProd = (oCAROnePlanetModel.getProperty("/CurrentYearProd") === null || oCAROnePlanetModel.getProperty(
						"/CurrentYearProd") === "") ? 0 : parseFloat(oCAROnePlanetModel.getProperty("/CurrentYearProd"));
					var iSiteProjectInclCO2 = (oCAROnePlanetModel.getProperty("/SiteProjectInclCO2") === null || oCAROnePlanetModel.getProperty(
						"/SiteProjectInclCO2") === "") ? 0 : parseFloat(oCAROnePlanetModel.getProperty("/SiteProjectInclCO2"));
					controller.calculateSiteAfterProjectY1CO2(iCurrentYearProd, iSiteProjectInclCO2);
				}
				if (oEvent.getSource().getValue() < 0) {
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Warning");
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
						"Volume value should not be negative, except for some very specific cases.");
				}
			}
			if (NameLabel.includes("CO")) {
				propertyName = "/CO" + yearName;
				var newValue = controller.makeNewValueWithDecimalsAndNegative(oEvent.getSource().getValue()).replace(",", ".");

				var placeInArrayCO = controller.checkIndexOfNameInHANAForIncrementalBusinessModel("CO");
				if (placeInArrayCO === -1)
					sap.m.MessageBox.error(
						"Failed to find the value of CO, please contact the IT department", {
							styleClass: bCompact ? "sapUiSizeCompact" : ""
						}
					);

				if (newValue === "") {
					oEvent.getSource().setValue("");
					controller.getView().getModel("incrementalBusinessJSONModel").getData()[placeInArrayCO][yearName] = null;
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"), "Please check value is filled in");
					return;
				}

				var iNewValue = parseFloat(newValue);
				controller.getView().getModel("incrementalBusinessJSONModel").getData()[placeInArrayCO][yearName] = String(formatter.roundToTwoDecimals(
					iNewValue));
				oEvent.getSource().setValue(newValue + " %");

				if (iNewValue < -100 || iNewValue > 999) {
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "Error");
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"),
						"Percentage needs to be between -100 and 999");
				} else {
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueState"), "None");
					controller.getView().getModel("errorModel").setProperty(String(propertyName + "ValueStateText"), "");
				}
			}
		},
		addDataFromTheLiveChangeToTheModel: function (controller, oEvent, sNameOfPropertyInHANA) {
			var bCompact = !!controller.getView().$().closest(".sapUiSizeCompact").length;
			var aIncrData = controller.getView().getModel("incrementalBusinessJSONModel").getData();
			var yearName = oEvent.getSource()["mBindingInfos"].value.binding.getPath();
			var iPlaceInArrayProperty = controller.checkIndexOfNameInHANAForIncrementalBusinessModel(sNameOfPropertyInHANA);
			if (iPlaceInArrayProperty === -1)
				sap.m.MessageBox.error(
					String("Failed to find the value of " + sNameOfPropertyInHANA + ", please contact the IT department"), {
						styleClass: bCompact ? "sapUiSizeCompact" : ""
					}
				);

			aIncrData[iPlaceInArrayProperty][yearName] = oEvent.getSource().getValue();

			var sPropertyNameInErrorModel = "/" + sNameOfPropertyInHANA + yearName;
			controller.getView().getModel("errorModel").setProperty(String(sPropertyNameInErrorModel + "ValueState"), "None");
			controller.getView().getModel("errorModel").setProperty(String(sPropertyNameInErrorModel + "ValueStateText"), "");

			if (!oEvent.getSource().getValue()) {
				controller.getView().getModel("errorModel").setProperty(String(sPropertyNameInErrorModel + "ValueState"), "Error");
				controller.getView().getModel("errorModel").setProperty(String(sPropertyNameInErrorModel + "ValueStateText"),
					"Please check value is filled in");
			}
		},
		/** 
		 * Checks if the FinancialCost is not >= 0
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputFinancialCost: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);

			if (oEvent.getSource().getValue() >= 0) {
				controller.getView().getModel("errorModel").setProperty("/FinancialCostValueState", "Error");
				controller.getView().getModel("errorModel").setProperty("/FinancialCostValueStateText",
					"This field should be < 0");
			} else {
				controller.getView().getModel("errorModel").setProperty("/FinancialCostValueState", "None");
				controller.getView().getModel("errorModel").setProperty("/FinancialCostValueStateText", "");
			}
		},
		/** 
		 * Checks if the YearsOfContract is between 0 and 999
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputYearsOfContract: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			var iValue = parseFloat(oEvent.getSource().getValue());

			if (iValue < 0 || iValue > 999) {
				controller.getView().getModel("errorModel").setProperty("/YearsOfContractValueState", "Error");
				controller.getView().getModel("errorModel").setProperty("/YearsOfContractValueStateText",
					"This field should be between 0 and 999");
			} else {
				controller.getView().getModel("errorModel").setProperty("/YearsOfContractValueState", "None");
				controller.getView().getModel("errorModel").setProperty("/YearsOfContractValueStateText", "");
			}
		},
		/** 
		 * Checks if the Payback is between 0 and 999
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputPayback: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			var iValue = parseFloat(oEvent.getSource().getValue());

			if (iValue < 0 || iValue > 999) {
				controller.getView().getModel("errorModel").setProperty("/PaybackValueState", "Error");
				controller.getView().getModel("errorModel").setProperty("/PaybackValueStateText", "This field should be between 0 and 999");
			} else {
				controller.getView().getModel("errorModel").setProperty("/PaybackValueState", "None");
				controller.getView().getModel("errorModel").setProperty("/PaybackValueStateText", "");
			}
		},
		/* =========================================================== */
		/* End of methods for Financial & Operational */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for One Planet */
		/* =========================================================== */
		/** 
		 * Handles the liveChange event of the Input control to calculate the SiteY1CO2
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputSiteCO2: function (controller, oEvent) {
			this.onLiveChangeInputNonNegativeValue(controller, oEvent);
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			var iCurrentYearProd = oCAROnePlanetModel.getProperty("/CurrentYearProd") === null ? 0 : parseFloat(oCAROnePlanetModel.getProperty(
				"/CurrentYearProd"));
			controller.calculateSiteY1CO2(iCurrentYearProd, parseFloat(oEvent.getSource().getValue()));
		},
		/** 
		 * Handles the liveChange event of the Input control to calculate the SiteAfterProjectY1CO2
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputSiteProjectInclCO2: function (controller, oEvent) {
			this.onLiveChangeInputNonNegativeValue(controller, oEvent);
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			var iCurrentYearProd = oCAROnePlanetModel.getProperty("/CurrentYearProd") === null ? 0 : parseFloat(oCAROnePlanetModel.getProperty(
				"/CurrentYearProd"));
			controller.calculateSiteAfterProjectY1CO2(iCurrentYearProd, parseFloat(oEvent.getSource().getValue()));
		},
		/** 
		 * Handles the liveChange event of the Input control to calculate the SiteAfterProjectY1CO2 and the SiteY1CO2
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputCurrentYearProd: function (controller, oEvent) {
			this.onLiveChangeInputDecimal(controller, oEvent);
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			var iSiteProjectInclCO2 = oCAROnePlanetModel.getProperty("/SiteProjectInclCO2") === null ? 0 : parseFloat(oCAROnePlanetModel.getProperty(
				"/SiteProjectInclCO2"));
			var iSiteCO2 = oCAROnePlanetModel.getProperty("/SiteCO2") === null ? 0 : parseFloat(oCAROnePlanetModel.getProperty("/SiteCO2"));
			controller.calculateSiteY1CO2(parseFloat(oEvent.getSource().getValue()), iSiteCO2);
			controller.calculateSiteAfterProjectY1CO2(parseFloat(oEvent.getSource().getValue()), iSiteProjectInclCO2);
		},
		/** 
		 * Stores the value coming from the RadioButton in the CAROnePlanetModel
		 * @param controller
		 * @param oEvent
		 */
		radioSiteComplianceWaterSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = String(oEvent.getSource().getSelectedIndex());
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			oCAROnePlanetModel.setProperty("/SiteComplianceWater", sSelected);
		},
		/** 
		 * Stores the value coming from the RadioButton in the CAROnePlanetModel
		 * @param controller
		 * @param oEvent
		 */
		radioProjectComplianceWaterSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = String(oEvent.getSource().getSelectedIndex());
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			oCAROnePlanetModel.setProperty("/ProjectComplianceWater", sSelected);
		},
		/** 
		 * Stores the value coming from the RadioButton in the CAROnePlanetModel
		 * @param controller
		 * @param oEvent
		 */
		radioSiteProjectInclComplianceWaterSelected: function (controller, oEvent) {
			this.onSelectRadio(controller, oEvent);
			var sSelected = String(oEvent.getSource().getSelectedIndex());
			var oCAROnePlanetModel = controller.getView().getModel("CAROnePlanetModel");
			oCAROnePlanetModel.setProperty("/SiteProjectInclComplianceWater", sSelected);
		},
		/* =========================================================== */
		/* End of methods for One Planet */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Attachments */
		/* =========================================================== */
		/** 
		 * Reads the attachment the user has uploaded and stores it in the different models
		 * @param controller
		 * @param oEvent
		 */
		onChangeAttachment: function (controller, oEvent) {
			if (controller.getView().getModel("CARModel").getProperty("/Status") === "Launched") {
				sap.m.MessageBox.error(
					"It's not possible to upload an attachment when a CAR is launched."
				);
				return;
			}
			var that = controller;
			var name = oEvent.getSource().getId().split("uploadCollection")[1].split("Id")[0]; //Operations, FinancialAnalysis, BusinessCase for example
			var attachmentName = "CAR" + name; //CAROperations, CARFinancialAnalysis, CARBusinessCase for example
			var attachmentNameWithVersion = attachmentName + String(controller.attachmentVersions[attachmentName + "Version"]);

			var oUploadCollectionOperationsAttachment = controller.byId(oEvent.getSource().getId().split("--")[1]);
			var oFileUploader = oUploadCollectionOperationsAttachment._getFileUploader();
			var base64 = "";
			var mimeType = "";
			var filename = oFileUploader.getValue();
			var filenameWithoutExtension = filename.substr(0, filename.lastIndexOf('.'));

			if (filename.toLowerCase().includes(" - version")) { //We push the fileName + " - Version" to Docii and HANA, so the user may not upload a file with " - Version" in it
				sap.m.MessageBox.error(
					"Please change the name of the attachment, you are not allowed to give ' - Version' in the name of the file"
				);
				return;
			}

			if (filenameWithoutExtension.toLowerCase().includes(".")) { //user may not upload a file with "." in it
				sap.m.MessageBox.error(
					"Please change the name of the attachment, you are not allowed to give 'dot (.)' in the name of the file"
				);
				return;
			}

			if (controller._checkNameOfAttachmentIsUsed(filename)) {
				sap.m.MessageBox.error(
					"Please change the name of the attachment, because there is already an attachment with the same name."
				);
				return;
			}

			if (!oFileUploader.getValue()) {
				sap.m.MessageToast.show("Choose a file first");
				return;
			}

			if (controller.getView().getModel("CARAttachmentsJSONModel").getProperty("/" + attachmentName + "Base64")) {
				sap.m.MessageBox.error(
					"If you want to replace the attachment: \nPlease delete the attachment first."
				);
				return;
			}

			var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			// var BASE64_MARKER = 'data:' + file.type + ';base64,';
			var reader = new FileReader();

			reader.onload = (function (theFile) {
				return function (evt) {
					mimeType = evt.target.result.split("data:")[1].split(";base64")[0];
					// var base64Index = evt.target.result.indexOf('data:' + mimeType + ';base64,') + BASE64_MARKER.length;
					base64 = evt.target.result.split(";base64,")[1];

					// that.CAROperationsChanged = true;
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + "Base64", base64); // No need of base 64 anymore, because we are sending the file directly to Docii
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + "File", file);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/FileName" + attachmentName, filename);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/MimeType" + attachmentName, mimeType);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/Description" + attachmentName, attachmentName.substring(3));
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + "Changed", true);

					//For displaying the file in the UploadCollection
					that.getView().getModel("docii" + attachmentName.substring(3) + "Model").setData([{
						name: filename,
						documentType: mimeType
					}]);
				};
			})(file);

			reader.readAsDataURL(file);
		},
		/** 
		 * Reads the optional attachment the user has uploaded and stores it in the different models
		 * @param controller
		 * @param oEvent
		 */
		onChangeOptionalAttachments: function (controller, oEvent) {
			if (controller.getView().getModel("CARModel").getProperty("/Status") === "Launched") {
				sap.m.MessageBox.error(
					"It's not possible to upload an attachment when a CAR is launched."
				);
				return;
			}
			if (controller._getNumberOfOptionalAttachments() >= 10) {
				sap.m.MessageBox.error(
					"It's not possible to upload more than 10 optional attachments."
				);
				return;
			}

			var that = controller;
			var attachmentName = "CAR" + oEvent.getSource().getId().split("uploadCollection")[1].split("Id")[0]; //CAROperations, CARFinancialAnalysis for example
			var oUploadCollectionOperationsAttachment = controller.byId(oEvent.getSource().getId().split("--")[1]);
			var oFileUploader = oUploadCollectionOperationsAttachment._getFileUploader();
			var base64 = "";
			var mimeType = "";
			var filename = oFileUploader.getValue();

			if (filename.toLowerCase().includes(" - version")) { //We push the fileName + " - Version" to Docii and HANA, so the user may not upload a file with " - Version" in it
				sap.m.MessageBox.error(
					"Please change the name of the attachment, you are not allowed to give ' - Version' in the name of the file"
				);
				return;
			}

			if (controller._checkNameOfAttachmentIsUsed(filename)) {
				sap.m.MessageBox.error(
					"Please change the name of the attachment, because there is already an attachment with the same name."
				);
				return;
			}

			if (!oFileUploader.getValue()) {
				sap.m.MessageToast.show("Choose a file first");
				return;
			}

			var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
			var reader = new FileReader();

			reader.onload = (function (theFile) {
				return function (evt) {
					mimeType = evt.target.result.split("data:")[1].split(";base64")[0];
					base64 = evt.target.result.split(";base64,")[1];

					var dataFromModel = that.getView().getModel("docii" + attachmentName.substring(3) + "Model").getData();

					if (dataFromModel === undefined)
						dataFromModel = [];

					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + dataFromModel.length + "Base64", base64); //No need of base64 anymore, because we are sending the file directly to Docii
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + dataFromModel.length + "File", file);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/FileName" + attachmentName + dataFromModel.length, filename);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/MimeType" + attachmentName + dataFromModel.length, mimeType);
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/Description" + attachmentName + dataFromModel.length,
						attachmentName.substring(3));
					that.getView().getModel("CARAttachmentsJSONModel").setProperty("/" + attachmentName + dataFromModel.length + "Changed", true);

					//For displaying the file in the UploadCollection

					dataFromModel.push({
						name: filename,
						documentType: mimeType
					});
					that.getView().getModel("docii" + attachmentName.substring(3) + "Model").setData(dataFromModel);
				};
			})(file);

			reader.readAsDataURL(file);
		},
		/** 
		 * Checks if the attachment is an Optional, Previous or another one. Then downloads it from Docii
		 * @param controller
		 * @param oEvent
		 */
		onDownloadUploadedAttachmentPress: function (controller, oEvent) {
			var attachmentName = oEvent.getSource().getId().split("--")[1].split("Btn")[0];
			var oUploadCollection = controller.byId("uploadCollection" + attachmentName + "Id");
			var oAttachment = null;
			var that = controller;

			if (attachmentName.includes("OptionalAttachment")) {
				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					oAttachment = oUploadCollection.getItems()[i];
					attachmentName = oEvent.getSource().getId().split("--")[1].split("Btn")[0] + i;
					that.downloadAttachmentFromView(oAttachment["mProperties"].fileName,
						controller.getView().getModel("CARAttachmentsJSONModel").getProperty("/CAR" + attachmentName + "Base64"),
						oAttachment["mProperties"].mimeType);
				}

			} else {
				if (attachmentName.includes("PreviousVersion")) {
					oUploadCollection = controller.byId("uploadCollectionPreviousVersionsId");
					for (var i = 0; i < oUploadCollection.getItems().length; i++) {
						oAttachment = oUploadCollection.getItems()[i];
						attachmentName = "PreviousVersions";
						that.downloadAttachmentFromView(oAttachment["mProperties"].fileName,
							controller.getView().getModel("CARPreviousVersionsJSONModel").getData()[i].sBase64,
							oAttachment["mProperties"].mimeType);
					}
				} else {
					oAttachment = oUploadCollection.getItems().pop();
					that.downloadAttachmentFromView(oAttachment["mProperties"].fileName,
						controller.getView().getModel("CARAttachmentsJSONModel").getProperty("/CAR" + attachmentName + "Base64"),
						oAttachment["mProperties"].mimeType);
				}
			}
		},
		/** 
		 * Downloads the template from Docii
		 * @param controller
		 * @param oEvent
		 */
		onDownloadDociiListFilePress: function (controller, oEvent) {
			var oUploadCollection = controller.byId("uploadCollection" + oEvent.getSource().getId().split("--")[1] + "Id");
			var oAttachment = oUploadCollection.getItems().pop();

			controller.xhrRequestDownloadDocii("/api_docii/file/byFileId/cap/" + oAttachment["mProperties"].documentId, "GET", "arraybuffer",
				oAttachment["mProperties"].mimeType, oAttachment["mProperties"].fileName);
		},
		/** 
		 * Handles the deletion of the requested file
		 * @param controller
		 * @param oEvent
		 * @returns
		 */
		onFileDeleted: function (controller, oEvent) {
			sap.m.MessageBox.show(
				"If you delete the file when the file is saved, it will be available in Previous Versions. \n\nIn this case you can update the Operations, Financial Analysis and Business Case."
			);
			var that = controller;
			var oUploadCollection = controller.byId(oEvent.getSource().getId().split("--")[1].split("-")[0]);
			var attachmentName = oUploadCollection.getBindingInfo("items").model.substring(5).split("Model")[0];

			if (attachmentName === "OptionalAttachment") {
				// for (var i = 0; i < oUploadCollection.getItems().length; i++) {
				attachmentName = oUploadCollection.getBindingInfo("items").model.substring(5).split("Model")[0] + oUploadCollection.getItems()[0].getParent()
					._oItemForDelete._iLineNumber;
				controller._deleteFileInDociiAndHANA(attachmentName, oUploadCollection);
				// }
			} else
				controller._deleteFileInDociiAndHANA(attachmentName, oUploadCollection);
		},
		/* =========================================================== */
		/* End of methods for Attachments */
		/* =========================================================== */
		/* =========================================================== */
		/* Begin of methods for Topline & Investment */
		/* =========================================================== */
		/** 
		 * Checks which Subcategory is selected to see which fragment should be opened. For SubCategoryId 7: open TopLine fragment or TopLineGraph fragment.
		 * For SubCategory 8: open Investment fragment or InvestmentGraph fragment.
		 * @param controller
		 * @param oEvent
		 */
		openDialogGraph: function (controller, oEvent) {
			var that = controller;
			var oCARModel = controller.getView().getModel("CARModel");
			var iSubCategoryId = oCARModel.getProperty("/SubCategoryId");
			var sTitle = "C1 - Capacity";
			var oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.TopLine", controller);
			var sRootPath = jQuery.sap.getModulePath("com.danone.capcarcreation");
			var oBeginButton = new sap.m.Button({
				text: "Generate Graph",
				press: function () {
					dialog.close();
					if (sTitle === "C1 - Capacity") {
						that.generateModelGraphTopLine(that);
						that.openDialogGraphTopLine(that);
					} else {
						that.generateModelGraphInvestment(that);
						that.openDialogGraphInvestment(that);
					}
					if (oButton !== undefined) {
						oButton.setText("View Graph");
					}
				},
				enabled: false
			});
			var oEndButton = new sap.m.Button({
				text: "Close",
				press: function () {
					if (sTitle === "C1 - Capacity") {
						that.generateModelGraphTopLine(that);
					} else {
						that.generateModelGraphInvestment(that);
					}
					dialog.close();
				}
			});

			if (oEvent !== undefined) {
				var oButton = oEvent.getSource();
				if (iSubCategoryId === 7) {
					if (!controller.bTopLineFlagInitialized || sap.ui.getCore().getModel("TopLineJSONModel") === undefined) {
						var oTableModel = new sap.ui.model.json.JSONModel([sRootPath, "model/TopLineModel.json"].join("/"));
						oTableModel.attachRequestCompleted(function () {
							var data = oTableModel.getData().TopLineTable;
							var oModel = new sap.ui.model.json.JSONModel(data);
							sap.ui.getCore().setModel(oModel, "TopLineJSONModel");
						});
						controller.bTopLineFlagInitialized = true;
					} else {
						oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.TopLineGraph", controller);
						oBeginButton = new sap.m.Button({
							text: "Edit Data",
							press: function () {
								dialog.close();
								dialog.destroy();
								that.openDialogGraph();
							}
						});
						oEndButton = new sap.m.Button({
							text: "Close",
							press: function () {
								dialog.close();
								dialog.destroy();
							}
						});
					}
				} else if (iSubCategoryId === 8) {
					sTitle = "C1 - innovation";
					oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.Investment", controller);

					if (!controller.bInvestmentFlagInitialized || sap.ui.getCore().getModel("InvestmentJSONModel") === undefined) {
						oTableModel = new sap.ui.model.json.JSONModel([sRootPath, "model/InvestmentModel.json"].join("/"));
						oTableModel.attachRequestCompleted(function () {
							var data = oTableModel.getData().InvestmentTable;
							var oModel = new sap.ui.model.json.JSONModel(data);
							sap.ui.getCore().setModel(oModel, "InvestmentJSONModel");
						});
						controller.bInvestmentFlagInitialized = true;
					} else {
						oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.InvestmentGraph", controller);
						oBeginButton = new sap.m.Button({
							text: "Edit Data",
							press: function () {
								dialog.close();
								dialog.destroy();
								that.openDialogGraph();
							}
						});
						oEndButton = new sap.m.Button({
							text: "Close",
							press: function () {
								dialog.close();
								dialog.destroy();
							}
						});
					}
				} else {
					sap.m.MessageBox.error("Category or Subcategory not correct to open dialog.");
				}
			} else {
				if (iSubCategoryId === 7) {
					oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.TopLine", controller);
				} else if (iSubCategoryId === 8) {
					sTitle = "C1 - Innovation";
					oFragment = sap.ui.xmlfragment("com.danone.capcarcreation.view.fragment.Investment", controller);
					controller.convertDecimalIntoStringPercentageCARInvestment();
				}
			}

			var dialog = new sap.m.Dialog({
				// title: sTitle,
				type: "Message",
				contentWidth: "80%",
				content: [
					oFragment
				],
				beginButton: oBeginButton,
				endButton: oEndButton,
				afterClose: function () {
					dialog.destroy();
				}
			});
			sap.ui.getCore().beginButtonGraphDialog = dialog.getBeginButton();
			dialog.open();
		},
		/** 
		 * Handles the liveChange event for the TopLine table and checks if the table is completed to show the button for displaying the graph
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputTopLineTable: function (controller, oEvent) {
			var oNewData = {};
			var sValue = controller.makeNewValueWithNegative(oEvent.getSource().getValue().replace(",", "."));
			var iIndex = parseInt(oEvent.getSource()["mBindingInfos"].value.binding.oContext.getPath().replace("/", ""), 10);
			var sYear = oEvent.getSource()["mBindingInfos"].value.binding.getPath();

			var oModelData = sap.ui.getCore().getModel("TopLineJSONModel").getData();
			oEvent.getSource().setValue(sValue);
			oModelData[iIndex][sYear] = sValue;
			var aActualCapacityValues = Object.values(oModelData[0]);
			var aAdditionCapacityValues = Object.values(oModelData[1]);
			var aNewCapacityValues = Object.values(oModelData[2]);
			var aKeys = Object.keys(oModelData[2]);
			for (var i = 1; i < aNewCapacityValues.length - 1; i++) {
				if (aActualCapacityValues[i] !== null && aAdditionCapacityValues[i] !== null)
					aNewCapacityValues[i] = parseInt(aActualCapacityValues[i], 10) + parseInt(aAdditionCapacityValues[i], 10);
			}
			for (i = 0; i < aKeys.length; i++) {
				oNewData[aKeys[i]] = aNewCapacityValues[i];
			}

			oModelData[2] = oNewData;
			sap.ui.getCore().getModel("TopLineJSONModel").setData(oModelData);
			if (controller.checkIfCompleteTopLine()) {
				sap.ui.getCore().beginButtonGraphDialog.setEnabled(true);
			} else {
				sap.ui.getCore().beginButtonGraphDialog.setEnabled(false);
			}
		},
		/** 
		 * Handles the liveChange event for the Investment table and checks if the table is completed to show the button for displaying the graph
		 * @param controller
		 * @param oEvent
		 */
		onLiveChangeInputInvestmentTable: function (controller, oEvent) {
				// var NameLabel = oEvent.getSource()["mBindingInfos"].valueState.binding.getValue()[0];

				var iIndex = parseInt(oEvent.getSource()["mBindingInfos"].value.binding.oContext.getPath().replace("/", ""), 10);
				var sYear = oEvent.getSource()["mBindingInfos"].value.binding.getPath();

				var oModelData = sap.ui.getCore().getModel("InvestmentJSONModel").getData();

				// sap.ui.getCore().getModel("errorModelInvestment").setProperty("error", false);

				if (iIndex === 1) {
					var propertyName = "/MarketShareWithoutInvestment" + sYear;

					var newValue = controller.makeNewValueWithOneDecimalAndNegative(oEvent.getSource().getValue()).replace(",", ".");

					if (newValue === "") {
						oEvent.getSource().setValue("");
						oModelData[iIndex][sYear] = null;
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "Error");
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"),
							"Please check value is filled in");
						sap.ui.getCore().getModel("errorModelInvestment").setProperty("error", true);
						return;
					}

					var iNewValue = parseFloat(newValue);
					oModelData[iIndex][sYear] = String(formatter.roundToOneDecimal(iNewValue));
					oEvent.getSource().setValue(newValue + " %");

					if (iNewValue < 0 || iNewValue > 100) {
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "Error");
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"),
							"Percentage needs to be between 0 and 100");
						sap.ui.getCore().getModel("errorModelInvestment").setProperty("error", true);
					} else {
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "None");
						sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"), "");

					}
				} else {
					if (iIndex === 3) {
						var propertyName = "/MarketShareWithInvestment" + sYear;
						var newValue = controller.makeNewValueWithOneDecimalAndNegative(oEvent.getSource().getValue()).replace(",", ".");

						if (newValue === "") {
							oEvent.getSource().setValue("");
							oModelData[iIndex][sYear] = null;
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "Error");
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"),
								"Please check value is filled in");
							sap.ui.getCore().getModel("errorModelInvestment").setProperty("error", true);
							return;
						}

						var iNewValue = parseFloat(newValue);
						oModelData[iIndex][sYear] = String(formatter.roundToOneDecimal(iNewValue));
						oEvent.getSource().setValue(newValue + " %");

						if (iNewValue < 0 || iNewValue > 100) {
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "Error");
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"),
								"Percentage needs to be between 0 and 100");
							sap.ui.getCore().getModel("errorModelInvestment").setProperty("error", true);
						} else {
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueState"), "None");
							sap.ui.getCore().getModel("errorModelInvestment").setProperty(String(propertyName + "ValueStateText"), "");
						}
					} else { // iIndex = Sales with/without project
						var sValue = controller.makeNewValueWithOneDecimalAndNegative(oEvent.getSource().getValue().replace(",", ".")); // We want to get rid of the not number chars like letters or something else
						oEvent.getSource().setValue(sValue);
						oModelData[iIndex][sYear] = String(sValue);
					}
				}

				if (controller.checkIfCompleteInvestment()) {
					sap.ui.getCore().beginButtonGraphDialog.setEnabled(true);
				} else {
					sap.ui.getCore().beginButtonGraphDialog.setEnabled(false);
				}
			}
			/* =========================================================== */
			/* End of methods for Topline & Investment */
			/* =========================================================== */
	};
});