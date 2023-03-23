/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Regional_Price_History_Update",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_Regional_Price_History_Update",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revToMS",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "RegionalRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,revToMS,Lib,LibMaintenance) {
var wfInstance = null
var workflowType = node.getValue("Workflow_Type").getSimpleValue()
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue()

var CLPName = "";
var futureName = "";
var rationaleName = "";
var fRationaleName = "";
var clpHistName = "";
var countryCodeList = [];

setCountryVariables()

var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"))

if (workflowType == "M") {
    var sell = false
    for (var j = 0; j < countryCodeList.length; j++) {
        var countryCode = countryCodeList[j];
        if (countryCode == "EU" || countryCode == "DE" || countryCode == "UK") {
            CLPName = countryCode + "_CLP";
            futureName = countryCode + "_Future_CLP";
            rationaleName = countryCode + "_CLP_Rationale";
            fRationaleName = countryCode + "_Future_CLP_Rationale";
            clpHistName = countryCode + "_CLP_History"
        }
        var msRef = node.queryReferences(revToMS) //STEP-6396
        msRef.forEach(function(ref) {    //STEP-6396
            var violations = "";
            var skus = ref.getTarget().getChildren() //STEP-6396
            for (var i = 0; i < skus.size(); i++) {
                var pricechange = false
                var sku = skus.get(i)
                var CLP = sku.getValue(CLPName).getSimpleValue() ? sku.getValue(CLPName).getSimpleValue() : ""
                var future = sku.getValue(futureName).getSimpleValue() ? sku.getValue(futureName).getSimpleValue() : ""
                var rationale = sku.getValue(rationaleName).getSimpleValue() ? sku.getValue(rationaleName).getSimpleValue() : ""
                var fRationale = sku.getValue(fRationaleName).getSimpleValue() ? sku.getValue(fRationaleName).getSimpleValue() : ""
                var priceOld = getValueFromString(pricesTmp, sku.getName() + "-" + countryCode)
                // STEP-5960 begins
                var oldCLPPrice = ""
                var oldCLPFutPrice = ""
                if (priceOld) {
                    oldCLPPrice = priceOld[0]
                    oldCLPFutPrice = priceOld[1]
                }
                // STEP-5960 ends
                var d = new Date()
                var parsedDate = d.getMonth() + 1 + "-" + d.getDate() + "-" + d.getFullYear() + "#" + d.getHours() + ":" + d.getMinutes()

                var priceValues = [];
                var rationaleValues = [];
                if (oldCLPPrice != CLP) {
                    priceValues.push("CLP:" + oldCLPPrice + " - " + CLP);
                    rationaleValues.push(rationale);
                    pricechange = true;
                }
                if (oldCLPFutPrice != future) {
                    priceValues.push("Future CLP:" + oldCLPFutPrice + " - " + future);
                    rationaleValues.push(fRationale);
                    pricechange = true;
                }
                if (pricechange) {
                    log.info(clpHistName);
                    sell = true
                    var history = parsedDate + "; " + manager.getCurrentUser().getID() + "; " + priceValues.toString() + "; " + rationaleValues.toString()

                    var oldHistory = sku.getValue(clpHistName).getSimpleValue();
                    if (oldHistory) {
                        var historyResult = history ? history + "\n" + oldHistory : oldHistory
                    } else {
                        var historyResult = history;
                    }

                    log.info(" historyResult \n" + historyResult)
                    if (historyResult.length > 1023) {
                        var strTmp = historyResult.split("\n")
                        strTmp.splice(-2, 2)
                        historyResult = strTmp.join("\n")
                    }
                    sku.getValue(clpHistName).setSimpleValue(historyResult);
                }
            }
            return true; //STEP-6396
        });
    }
    if (sell) {
        wfInstance.setSimpleVariable("Sell_Flag_Regional_Tmp", "Y");
    } else {
        wfInstance.setSimpleVariable("Sell_Flag_Regional_Tmp", "N");
    }
}

// STEP-6326 fixing for loop
function getValueFromString(pricesTmp, id) {
    var result = null
    var parse1 = pricesTmp.slice(1, pricesTmp.length - 1)
    var parse2 = parse1.split(",")
    for (var j = 0; j < parse2.length; j++) {
        var row = parse2[j].split("=")
        if (row[0].trim() == id.trim()) {
            var rowTrim = row[1].trim()
            result = rowTrim.split(";")
            result[0] = (result[0] == "null") ? "" : result[0]
            result[1] = (result[1] == "null") ? "" : result[1]
        }
    }
    return result
}

function setCountryVariables() {
    if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_China_Maintenance_Workflow")
        CLPName = "China_CLP";
        futureName = "China_Future_CLP";
        rationaleName = "China_CLP_Rationale";
        fRationaleName = "China_Future_CLP_Rationale";
        clpHistName = "China_CLP_History"
        countryCodeList.push("CN")
    } else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_Japan_Maintenance_Workflow")
        CLPName = "Japan_CLP";
        futureName = "Japan_Future_CLP";
        rationaleName = "Japan_CLP_Rationale";
        fRationaleName = "Japan_Future_CLP_Rationale";
        clpHistName = "Japan_CLP_History"
        countryCodeList.push("JP")

    } else if (LibMaintenance.isEUMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_EU_Maintenance_Workflow")
        countryCodeList.push("EU");
        countryCodeList.push("DE");
        countryCodeList.push("UK");
    }
}
}