/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "test_mj",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "test_mj",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Approve,BL_MaintenanceWorkflows) {
var previousPriceDE = getPreviousPrice(node, "DE");

/**
 * To get previous price from price history
 * @param sku STEP SKU object 
 * @param region String (valid option: "US", "China", "Japan", "DE", "UK", "EU") 
 * @returns String with previous price retrieved from price history, retrieving "0" if history has only one row
 */
 function getPreviousPrice(sku, region) {

    var currPrice;
    var hist;

    if (region == "US") {
        currPrice = sku.getValue("PRICE").getSimpleValue() != null ? Number(sku.getValue("PRICE").getSimpleValue()) : 0;
        hist = sku.getValue("Global_Base_Price_History").getSimpleValue();
    } else {
        currPrice = sku.getValue(region + "_CLP").getSimpleValue() != null ? Number(sku.getValue(region + "_CLP").getSimpleValue()) : 0;
        hist = sku.getValue(region + "_CLP_History").getSimpleValue();
    }

    if (hist) {

        var arr = hist.split("\n");

        // first history row is first SKU price setting
        if (arr.length == 1) {
            return "0";
        }

        for (var i = 0; i < arr.length; i++) {

            var row = arr[i];
            var glpChange = row.split(";")[2];
            var prices = glpChange.split(":")[1].trim();
            var histCurrPrice;
            
            // if user previously changed price to null
            if (prices.split("-").length == 1) {
                histCurrPrice = 0;
            } else {
                
                histCurrPrice = prices.split("-")[1].trim();
                if (histCurrPrice == null || histCurrPrice == "") {
                    histCurrPrice = 0;
                } else {
                    histCurrPrice = Number(histCurrPrice);
                }
            }

            if (histCurrPrice == currPrice) {
                var previousPrice = prices.split("-")[0].trim();
                previousPrice = previousPrice != "" ? previousPrice : "0";
                return previousPrice;
            }
        }
    }
    return "";
}
}