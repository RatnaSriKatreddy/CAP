sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("com.danone.capcarcreation.controller.BaseController", {
		/** 
		 * This method takes the attachments that are fetched from Docii and the name of the description of the wanted attachment.
		 * It filters and returns the attachments that is last modified in Docii
		 * @param attachments
		 * @param nameOfWantedTemplate
		 * @returns Object
		 */
		_filterLatestTemplatesFromDocii: function (attachments, nameOfWantedTemplate) {
			var that = this;
			var latestAttachment;
			if (attachments.length > 0) {
				latestAttachment = attachments.filter(function (att) {
					if (att.description !== null)
						return att.description.includes(nameOfWantedTemplate);
				})[0];
			}

			attachments.forEach(function (att) {

				if (att.description !== null) {
					if (att.description.includes(nameOfWantedTemplate) &&
						that._convertDayMonthYearIntoJavascriptDate(latestAttachment.lastModifiedAt) < that._convertDayMonthYearIntoJavascriptDate(att
							.lastModifiedAt)) { //We filter for the latest modification date and the wanted name for the attachment
						latestAttachment = att;
					}
				}
			});

			if (latestAttachment.name.includes("-Version")) {
				var nameBeforeExt = latestAttachment.name.split("-Version")[0];
				var pieces = latestAttachment.name.split("."); //Te
				var ext = "." + pieces[(pieces.length - 1)];
				latestAttachment.name = nameBeforeExt + ext;
			}

			return latestAttachment;
		},
		/** 
		 * Converts the dateTime with format: DD/MM/YYYY HH:MM/SS into a new Javascript Date object
		 * @param sDateTime
		 * @returns DateTime object
		 */
		_convertDayMonthYearIntoJavascriptDate: function (sDateTime) { // sDateTime has following format: DD/MM/YYYY HH:MM/SS
			if (sDateTime.includes("/")) {
				var aDate, aTime, iDay, iMonth, iYear, iHour, iMinute, iSecond;
				aDate = sDateTime.split(" ")[0].split("/");
				aTime = sDateTime.split(" ")[1].split(":");

				iDay = aDate[0];
				iMonth = aDate[1];
				iYear = aDate[2];

				iHour = aTime[0];
				iMinute = aTime[1];
				iSecond = aTime[2];

				return new Date(iYear, iMonth, iDay, iHour, iMinute, iSecond);
			} else {
				return new Date();
			}
		},
		/** 
		 * We attach the attachBeforeUploadStarts event delegate to the Upload Collection controls in the Attachment part.
		 * When the event is triggered, the view is set to busy so the user cannot do anything until the upload of the file is pending.
		 * We set the view to not busy once the upload is done in another method
		 */
		_attachEventHandlersForAttachments: function () {
			var that = this;
			this.byId("uploadCollectionOperationsId").attachBeforeUploadStarts(function () {
				that.getView().setBusy(true);
			});
			this.byId("uploadCollectionOperationsId").attachUploadComplete(function () {
				that.getView().setBusy(false);
			});
			this.byId("uploadCollectionFinancialAnalysisId").attachBeforeUploadStarts(function () {
				that.getView().setBusy(true);
			});
			this.byId("uploadCollectionFinancialAnalysisId").attachUploadComplete(function () {
				that.getView().setBusy(false);
			});
			this.byId("uploadCollectionBusinessCaseId").attachBeforeUploadStarts(function () {
				that.getView().setBusy(true);
			});
			this.byId("uploadCollectionBusinessCaseId").attachUploadComplete(function () {
				that.getView().setBusy(false);
			});
			this.byId("uploadCollectionOptionalAttachmentId").attachBeforeUploadStarts(function () {
				that.getView().setBusy(true);
			});
			this.byId("uploadCollectionOptionalAttachmentId").attachUploadComplete(function () {
				that.getView().setBusy(false);
			});
		},
		/** 
		 * This method requires data and a name to create a JSON model and bind it to the view
		 * @param data
		 * @param name
		 */
		createModelAndSetToView: function (data, name) {
			var that = this;
			var oModel = new sap.ui.model.json.JSONModel(data);
			oModel.attachRequestCompleted(function () {
				that.getView().setModel(oModel, name);
				if (name === "CARModel") {
					that.checkCategory();
				}
			});
		},
		/** 
		 * Returns the Resource Bundle from the Component
		 * @returns Resource Bundle
		 */
		getResourceBundle: function () {
			return this.getView().getModel("i18n").getResourceBundle();
		},
		/** 
		 * This method requires a name of a property to find it in the CARModel.
		 * This method converts a date with the format ‘dd-MM-YYYY’ into a Javascript Date Object
		 * @param propName
		 * @returns String
		 */
		convertDateToJavaScriptDateObject: function (propName) {
			var date = this.getView().getModel("CARModel").getProperty("/" + propName);
			if (date === undefined) {
				return "";
			}
			if (date === null) {
				return "";
			}

			if (this.isValidDate(date) || date.includes("/Date")) {
				return date;
			}

			if (date && date !== "") {
				var day = date.split("-")[0];
				var month = (parseInt(date.split("-")[1].split("-")[0], 10) - 1);
				var year = date.slice(-4);
				return new Date(year, month, day);
			}

			return "";
		},
		/** 
		 * Checks if a date is an instance of Date and different from NaN
		 * @param d
		 * @returns boolean
		 */
		isValidDate: function (d) {
			return d instanceof Date && !isNaN(d);
		},
		/** 
		 * Converts the Epoch date (the date coming from HANA) into the format ‘dd-MM-YYYY’ to display in the views
		 * @param dateEpoch
		 * @returns String
		 */
		convertEpochDateToDateWithDayDashMonthDashYear: function (dateEpoch) {
			var dateJS;
			var sDateJS = "";

			dateEpoch = dateEpoch.split('(')[1];
			dateEpoch = dateEpoch.split(')')[0];
			if (dateEpoch !== "0") {

				dateJS = new Date(parseInt(dateEpoch, 10));
				var signDateOffset = dateJS.getTimezoneOffset().toString();
				if (signDateOffset.startsWith("-")) {
					dateJS.setMinutes(parseInt(signDateOffset.split("-")[1], 10));
				}
				if (signDateOffset.startsWith("+")) {
					dateJS.setMinutes(-parseInt(signDateOffset.split("-")[1], 10));
				}

				sDateJS = dateJS.getDate() + "-" + (dateJS.getUTCMonth() + 1) + "-" +
					dateJS.getUTCFullYear();
			}
			return sDateJS;
		},
		/** 
		 * Converts the Epoch date (the data coming from HANA) into a Javascript Date object
		 * @param dateEpoch
		 * @returns Javascript Date Object
		 */
		convertEpochDateToJavaScriptDate: function (dateEpoch) {
			var dateJS;

			dateEpoch = dateEpoch.split('(')[1];
			dateEpoch = dateEpoch.split(')')[0];
			if (dateEpoch !== "0") {
				dateJS = new Date(parseInt(dateEpoch, 10)); // new Date() automatically converts the epoch date into local time
				// dateJS = new Date(parseInt(dateEpoch, 10));
				// var signDateOffset = dateJS.getTimezoneOffset().toString();
				// if (signDateOffset.startsWith("-")) {
				// 	dateJS.setMinutes(parseInt(signDateOffset.split("-")[1], 10));
				// }
				// if (signDateOffset.startsWith("+")) {
				// 	dateJS.setMinutes(-parseInt(signDateOffset.split("-")[1], 10));
				// }
			}
			return dateJS;
		},
		/** 
		 * Converts the Javascript Date Object into a Date with format ‘dd-MM-YYY’ to display in the front.
		 * @param date
		 * @returns String
		 */
		_convertJavascriptDateToDateWithDashes: function (date) {
			var sDate = "";
			var day,
				month,
				year;
			if (this.isValidDate(date)) {
				day = date.toISOString().split("T")[0].split("-")[2];
				month = date.toISOString().split("T")[0].split("-")[1];
				year = date.toISOString().split("T")[0].split("-")[0];
				sDate = day + "-" + month + "-" + year;
			}
			return sDate;
		},
		/** 
		 * Handles the onBackPressed and navigates back to the Fiori Launchpad home
		 * @param oEvent
		 */
		onBackPress: function (oEvent) {
			var that = this;
			sap.m.MessageBox.confirm("Are you sure you do not want to save the CAR?", {
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose: function (sAction) {
					if (sAction === "OK") {
						var url = window.location.href.split('#')[0];
						//Navigate to the home of Fiori Launchpad
						sap.m.URLHelper.redirect(url, false);
					} else {
						that.getView().setBusy(false);
						return;
					}
				}
			});
		},
		/** 
		 * Is the method that is used to make calls to the backend. It first fetches a x-csrf-token and adds it in the header for the call.
		 * This method uses the $.ajax call and returns a Promise.
		 * In the success function of the call, it checks if the call is made to post a CAR or attachments to add data coming from the backend in the models
		 * @param sUrl
		 * @param type
		 * @param jPatchData
		 * @returns Promise
		 */
		ajaxPatch: function (sUrl, type, jPatchData) {
			var that = this;
			return new Promise(function (resolve, reject) {
				$.when($.ajax({
					url: "/HANA/ZCORFI10245/SERVICES/service.xsodata/FinancingType?$top=1",
					type: "GET",
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					error: function (dataResp) {
						that.getView().setBusy(false); //Just to be sure
						reject(dataResp);
					}
				})).then(function (data, status, xhr) {
					$.ajax({
						url: sUrl,
						type: type,
						data: jPatchData,
						contentType: "application/json",
						dataType: "json",
						accept: "application/json",
						headers: {
							"X-CSRF-Token": xhr.getResponseHeader("x-csrf-token")
						},
						success: function (dataResp) {
							if (sUrl.endsWith("CAR")) {
								that.getView().getModel("CARModel").setProperty("/CreatedOn", dataResp.d.CreatedOn);
								that.getView().getModel("CARModel").setProperty("/CreatedBy", dataResp.d.CreatedBy);
								that.getView().getModel("CARModel").setProperty("/ChangedOn", dataResp.d.ChangedOn);
								that.getView().getModel("CARModel").setProperty("/ChangedBy", dataResp.d.ChangedBy);
								that.getView().getModel("CARModel").setProperty("/Id", dataResp.d.Id);
								that.getView().getModel("CARModel").setProperty("/LaunchedDate", dataResp.d.LaunchedDate);
								that.getView().getModel("CARModel").setProperty("/LaunchedDate", dataResp.d.LaunchedDate);
								that.getView().getModel("CARModel").setProperty("/LaunchedDate", dataResp.d.LaunchedDate);
							}
							if (sUrl.endsWith("Attachment") && !dataResp.d.Description.toLowerCase().includes("picture")) { //dociiModel does not include picture
								var dociiModel = that.getView().getModel("docii" + dataResp.d.Description + "Model");
								if (dataResp.d.Description.includes("Optional")) {
									dociiModel = that.getView().getModel("dociiOptionalAttachmentModel");
									var attInDociiModel = dociiModel.getData().filter(function (attInDocii) { //Get the right attachment in the DociiModel of Optional Attachments
										return attInDocii.name === that.removeVersionInFileName(dataResp.d.FileName);
									})[0];
									attInDociiModel.CreatedOn = that.convertEpochDateToJavaScriptDate(dataResp.d.CreatedOn);
									attInDociiModel.CreatedBy = dataResp.d.CreatedBy;
									attInDociiModel.ObjectId = dataResp.d.ObjectId;
								} else {
									dociiModel.getData()[0].CreatedOn = that.convertEpochDateToJavaScriptDate(dataResp.d.CreatedOn);
									dociiModel.getData()[0].CreatedBy = dataResp.d.CreatedBy;
									dociiModel.getData()[0].ObjectId = dataResp.d.ObjectId;
								}

								dociiModel.setData(dociiModel.getData()); //We have to re-set the data to show the new data
							}
							resolve(dataResp);
						},
						error: function (oError) {
							reject(oError);
						}
					});
				});
			});
		},
		/** 
		 * Is a more general method to make the ajax calls to the backend.
		 * This method is used when the first call to HANA is made to post the CAR and his entities.
		 * It uses the $.ajax call and returns a Promise
		 * @param sUrl
		 * @param type
		 * @param jPatchData
		 * @returns Promise
		 */
		ajaxPatchForFirstPostWithJSONModel: function (sUrl, type, jPatchData) {
			var that = this;
			return new Promise(function (resolve, reject) {
				$.when($.ajax({
					url: "/HANA/ZCORFI10245/SERVICES/service.xsodata/FinancingType?$top=1",
					type: "GET",
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					error: function (dataResp) {
						that.getView().setBusy(false); //Just to be sure
						reject(dataResp);
					}
				})).then(function (data, status, xhr) {
					$.ajax({
						url: sUrl,
						type: type,
						data: jPatchData,
						contentType: "application/json",
						dataType: "json",
						accept: "application/json",
						headers: {
							"X-CSRF-Token": xhr.getResponseHeader("x-csrf-token")
						},
						success: function (dataResp) {
							resolve(dataResp);
						},
						error: function (dataResp) {
							reject(dataResp);
						}
					});
				});
			});
		},
		/** 
		 * This method is used when the user want to delete a CAR in the backend and uses the $.ajax call and uses a Promise
		 * @param sUrl
		 * @param type
		 * @returns Promise
		 */
		ajaxPatchDelete: function (sUrl, type) {
			return new Promise(function (resolve, reject) {
				$.when($.ajax({
					url: "/HANA/ZCORFI10245/SERVICES/service.xsodata/FinancingType?$top=1",
					type: "GET",
					headers: {
						"X-CSRF-Token": "Fetch"
					},
					error: function (dataResp) {
						reject(dataResp);
					}
				})).then(function (data, status, xhr) {
					$.ajax({
						url: sUrl,
						type: type,
						contentType: "application/json",
						dataType: "json",
						accept: "application/json",
						headers: {
							"X-CSRF-Token": xhr.getResponseHeader("x-csrf-token")
						},
						success: function (dataResp) {
							resolve(dataResp);
						},
						error: function (dataResp) {
							reject(dataResp);
						}
					});
				});
			});
		},
		/** 
		 * This method is used to post the attachments to Docii, uses a XMLHttpRequest and returns a Promise
		 * @param sUrl
		 * @param type
		 * @param data
		 * @returns Promise
		 */
		xhrRequestPostToDocii: function (sUrl, type, data) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(type, sUrl, true);
				xhr.onload = function (e) {
					if (this.status == 200) {

						resolve(this.response);
					} else {
						if (this.status === 201)
							resolve(this.response);
						else
							reject(this.response);
					}
				};
				xhr.send(data);
			});

		},
		/** 
		 * This method is used to delete the attachments from Docii, uses a XMLHttpRequest and returns a Promise
		 * @param sUrl
		 * @param type
		 * @returns Promise
		 */
		xhrDeleteRequestDocii: function (sUrl, type) {
			var that = this;
			return new Promise(function (resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(type, sUrl, true);
				xhr.onload = function (e) {
					if (this.status == 200) {

						resolve(this.response);
					} else {
						if (this.status === 201)
							resolve(this.response);
						else
							reject(this.response);
					}
				};
				xhr.send();
			});

		},
		/** 
		 * This method is used to download the attachments from Docii and uses a XMLHttpRequest
		 * @param sUrl
		 * @param type
		 * @param responseType
		 * @param mimeTypeOfFile
		 * @param fileName
		 */
		xhrRequestDownloadDocii: function (sUrl, type, responseType, mimeTypeOfFile, fileName) {
			var xhr = new XMLHttpRequest();
			xhr.open(type, sUrl, true);
			xhr.responseType = responseType;
			xhr.onload = function (e) {
				if (this.status == 200) {
					var blob = new Blob([this.response], {
						type: mimeTypeOfFile
					});
					var link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					link.download = fileName;
					link.click();
				}
			};
			xhr.send();
		},
		/** 
		 * Handles the deletion of an attachment in Docii
		 * @constructor 
		 * @param sURLDocii
		 * @param oAttachmentJSONModel
		 * @param attachmentName
		 */
		_deleteFileInDocii: function (sURLDocii, oAttachmentJSONModel, attachmentName) {
			var that = this;

			this.xhrDeleteRequestDocii(sURLDocii, "DELETE").then(function (success) {

				var sUrl = "/HANA/ZCORFI10245/SERVICES/service.xsodata/CARAttachment(CARId=" + String(that.getView().getModel("CARModel").getProperty(
						"/Id")) +
					",FileName='" + String(oAttachmentJSONModel.getProperty("/FileName")) + "')";
				that._deleteFileInHANA(sUrl, oAttachmentJSONModel, attachmentName);
			}).catch(function (failure) {
				that.getView().setBusy(false);
				sap.m.MessageBox.error("Failed to delete the attachment, please contact the IT department with following error:", {
					styleClass: "sapUiSizeCompact",
					details: failure
				});
				// sap.m.MessageToast.show("Failed to delete the attachment, please contact the IT department.");
			});
		},
		/** 
		 * Handles the deletion of an attachment in HANA
		 * @constructor 
		 * @param sURLHANA
		 * @param oAttachmentJSONModel
		 * @param attachmentName
		 */
		_deleteFileInHANA: function (sURLHANA, oAttachmentJSONModel, attachmentName) {
			var that = this;
			that.ajaxPatchDelete(sURLHANA, "DELETE")
				.then(function (result) {
					sap.m.MessageToast.show("Attachment is deleted");
					oAttachmentJSONModel.setData();
					that._deleteDataOnCARAttachmentsJSONModel(attachmentName);
					that.getView().setBusy(false);
				})
				.catch(function (failure) {
					that.getView().setBusy(false);
					sap.m.MessageBox.error("Failed to delete the attachment, please contact the IT department with following error:", {
						styleClass: "sapUiSizeCompact",
						details: failure
					});
				});
		},
		/** 
		 * Returns the conversion of the DateTime object into epoch date
		 * @constructor 
		 * @param dateTime
		 * @returns String
		 */
		_convertDateTimeIntoEpoch: function (dateTime) {
			// var dateJS = new Date(dateTime.split("T")[0]);
			var dateJS = dateTime;
			if (dateJS && dateJS !== "") {
				var signDateOffset = dateJS.getTimezoneOffset().toString();
				if (signDateOffset.startsWith("-")) {
					dateJS.setMinutes(parseInt(signDateOffset.split("-")[1], 10));
				}
				if (signDateOffset.startsWith("+")) {
					dateJS.setMinutes(-parseInt(signDateOffset.split("-")[1], 10));
				}
			}

			return '\/Date(' + Date.parse(dateJS) + ')\/';
		},
		/** 
		 * Returns the Uint8Array buffer made from a Base64 String
		 * @constructor 
		 * @param base64
		 * @returns UIntArray Buffer Object
		 */
		_base64ToArrayBuffer: function (base64) {
			var binary_string = window.atob(base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
			}
			return bytes.buffer;
		},
		/** 
		 * This method is used to download the attachments when they are not yet stored in Docii and HANA
		 * @param sFileName
		 * @param sBase64
		 * @param sMimeType
		 */
		downloadAttachmentFromView: function (sFileName, sBase64, sMimeType) {
			var blob = new Blob([this._base64ToArrayBuffer(sBase64)], {
				type: sMimeType
			});
			var link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.download = sFileName;
			link.click();
		},
		/** 
		 * Displays a sap.m.MessageBox error with a given message and an error
		 * @param sFirstMessage
		 * @param oError
		 */
		showErrorMessageFromBackend: function (sFirstMessage, oError) {
			var sTitle = "There is an error in CAR Creation with CAR Id " + this.giveCARId();
			var oCompressedError = this.compressErrorObject(oError);
			var sErrorMessage = this.checkError(oError, sFirstMessage); // We check if the error is a 504 to display a custom message
			sap.m.MessageBox.error(sErrorMessage, {
				title: sTitle,
				styleClass: "sapUiSizeCompact",
				details: oCompressedError
			});
		},
		/** 
		 * Returns the CAR Id
		 * @returns Integer
		 */
		giveCARId: function () {
			return this.getView().getModel("CARModel").getProperty("/Id");
		},
		/** 
		 * Returns the modified Error object with the error message split into an array of lines
		 * @param oError
		 * @returns Error object
		 */
		compressErrorObject: function (oError) {
			if (oError.responseText !== undefined) {
				oError.responseText = this.makeNewLineAfterXChars(oError.responseText);
			}
			if (oError.responseJSON !== undefined) {
				if (oError.responseJSON.error.message.value !== undefined)
					oError.responseJSON.error.message.value = this.makeNewLineAfterXChars(oError.responseJSON.error.message.value);
			}

			return oError;
		},
		/** 
		 * Returns an array of lines (with X words)
		 * @param sString
		 * @returns Array
		 */
		makeNewLineAfterXChars: function (sString) {
			var aChunks = [];
			var aTemp = [];
			var aTempChunk = "";

			aTemp = sString.split(" ");

			for (var i = 0; i < aTemp.length; i++) {
				aTempChunk += aTemp[i] + " ";
				if (aTempChunk.length > 50 || (i === (aTemp.length - 1) && aTempChunk.length !== 0)) { //We make the lines 50 words long and check if the last aTempChunk is empty before we go out of the loop
					aChunks.push(aTempChunk);
					aTempChunk = "";
				}
			}
			return aChunks;
		},
		/** 
		 * Checks if the error is a 504 (error due to network connection) and modifies the error message in that case
		 * @param oError
		 * @param sMessage
		 * @returns Error Object
		 */
		checkError: function (oError, sMessage) {
			var oAddaptedErrorMessage = sMessage;

			if (oError.status !== undefined) {
				if (oError.status === 504)
					oAddaptedErrorMessage = "Network connection error. Your change is not registered. Please try check your connection and try again";
			} else {
				if (oError.statusCode !== undefined) {
					if (oError.statusCode.includes(504))
						oAddaptedErrorMessage =
						"Network connection error. Your change is not registered. Please try check your connection and try again";
				}
			}

			return oAddaptedErrorMessage;
		},
		/** 
		 * Fetches the environment where the app is opened
		 * @returns account Object
		 */
		getAccountName: function () {
			var account = document.URL.split(".").filter(function (element) {
					if (element.indexOf("danonedeveu") !== -1) return true;
					else return false;
				}).length > 0 ? "danonedeveu" :
				document.URL.split(".").filter(function (element) {
					if (element.indexOf("danonequaeu") !== -1) return true;
					else return false;
				}).length > 0 ? "danonequaeu" : "danoneprodeu";
			return account;
		}
	});

});