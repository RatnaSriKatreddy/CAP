sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/format/DateFormat"
], function (NumberFormat, DateFormat) {
	"use strict";

	return {
		roundToTwoDecimals: function (value) {
			var oNumberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				decimalSeparator: ".",
				groupingEnabled: false
			});

			return oNumberFormat.format(value);
		},
		roundToOneDecimal: function (value) {
			var oNumberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 1,
				decimalSeparator: ".",
				groupingEnabled: false
			});

			return oNumberFormat.format(value);
		},
		totalAmountMEuro: function (e) {
			return Math.round(e) / 1e3;
		},
		totalAmountUnit: function (e) {
			if (e.indexOf("LC") !== -1) {
				return "LC";
			} else {
				return "EUR";
			}
		},
		ROSCal: function (e) {
			return (e * 100).toFixed(1);
		},
		planetChartValues: function (siteProjIncl) {
			if (siteProjIncl) {
				return parseFloat(siteProjIncl);
			}
			return siteProjIncl;
		},

		planetChartColorValues: function (siteProjIncl) {
			if (parseFloat(siteProjIncl) > 0) {
				return "Error";
			} else if (parseFloat(siteProjIncl) < 0) {
				return "Good";
			}
			return "Neutral";
		},
		planetValues: function (siteEnergy, curEnergy) {
			if (siteEnergy && curEnergy) {
				var dividend = (parseFloat(siteEnergy) - parseFloat(curEnergy)) * 100;
				var divisor = parseFloat((parseFloat(curEnergy)).toFixed(3));
				return Number.isNaN(dividend / divisor) ? 0 : dividend / divisor;
			}
			return 0;
		},
		planetValuesColor: function (siteEnergy, curEnergy) {
			if (siteEnergy && curEnergy) {
				var dividend = (parseFloat(siteEnergy) - parseFloat(curEnergy)) * 100;
				var divisor = parseFloat((parseFloat(curEnergy)).toFixed(3));
				var val = Number.isNaN(dividend / divisor) ? 0 : dividend / divisor;
				if (val > 0) {
					return "Error";
				} else if (val < 0) {
					return "Good";
				} else {
					return "Neutral";
				}
			} else {
				return "Neutral";
			}
		},

		planetValuesIndicator: function (siteEnergy, curEnergy) {
			if (siteEnergy && curEnergy) {
				var dividend = (parseFloat(siteEnergy) - parseFloat(curEnergy)) * 100;
				var divisor = parseFloat((parseFloat(curEnergy)).toFixed(3));
				var val = Number.isNaN(dividend / divisor) ? 0 : dividend / divisor;
				if (val > 0) {
					return "Up";
				} else if (val < 0) {
					return "Down";
				} else {
					return "None";
				}
			} else {
				return "None";
			}
		},
		formatDate: function (sValue) {
			var oDateFormatter = DateFormat.getDateInstance({
				style: 'medium'
			});
			if (sValue) {
				var oDate = new Date(sValue);
				return oDateFormatter.format(oDate);
			} else {
				return null;
			}
		},

		convertDateString: function (val) {
			if (typeof val === "object") {
				return (val.getDate() < 9 ? "0" + val.getDate() : val.getDate()) + " - " +
					((val.getMonth() + 1) < 9 ? "0" + (val.getMonth() + 1) : (val.getMonth() + 1)) + " - " + val.getFullYear();
			}

		}

	};
});