/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetFuturePriceOnCurrentPriceChangeReg",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA Set Future Price On Current Price Change Reg Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_PricingUtil",
    "libraryAlias" : "BL_PricingUtil"
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
exports.operation0 = function (node,manager,BA_Approve,BL_MaintenanceWorkflows,BL_PricingUtil) {
var wfInstance = null
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue()
var wfType = node.getValue("Workflow_Type").getSimpleValue();

var countryCodeList = [];

wfInstance = setCountryVariables(node)[0];
countryCodeList = setCountryVariables(node)[1];

var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"));

for (var j = 0; j < countryCodeList.length; j++) {
    var countryCode = countryCodeList[j]

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
    var msRef = node.queryReferences(revToMS); //STEP-6396
    msRef.forEach(function(ref) {    //STEP-6396
        var skus = ref.getTarget().getChildren() //STEP-6396
        for (var i = 0; i < skus.size(); i++) {
            var sku = skus.get(i)

            //OLD prices
            var priceOld = getValueFromString(pricesTmp, sku.getName() + "-" + countryCode)
            var oldCLPPrice;
            if (priceOld !=null){
            	oldCLPPrice=priceOld[0]
            }

            var countryAttrPrefix = countryCode;

            if (countryCode == "CN") {
                countryAttrPrefix = "China";
            } else if (countryCode == "JP") {
                countryAttrPrefix = "Japan";
            }

            var newCLPPrice = sku.getValue(countryAttrPrefix + "_CLP").getSimpleValue();
            newCLPPrice = (newCLPPrice == null) ? "" : newCLPPrice;

            //var oldCLPFutPrice = priceOld[1]

            if (oldCLPPrice != newCLPPrice) {
                BL_PricingUtil.copyCurrentToFuturePriceForRegion(sku, countryCode);

                // STEP-5869 to include in daily email for Japan/China/EU, leave this logic when will be removing logic for copy current CLP to future CLP
                if (wfType == "M") {
				// STEP-6280 Rename SKU email flags for regional emails
                    sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                    sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                    sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
                }
                // STEP-5869 ends
            }

            var futureCLPPrice = sku.getValue(countryAttrPrefix + "_Future_CLP").getSimpleValue();
            log.info("sku: " + sku.getName() + ", countryCode: " + countryCode + ", oldCLPPrice: " + oldCLPPrice + ", currentPrice: " + newCLPPrice + ", future price: " + futureCLPPrice);
        }
        return true; //STEP-6396
    });
}


function getValueFromString(str, id) {
    var result = null;
    var parse1 = str.slice(1, str.length - 1);
    var parse2 = parse1.split(", ");

    for(var p=0;p<parse2.length;p++){ //STEP-6591
    	  if (parse2[p]!=''){  //STEP-6591
          var row = parse2[p].split("=");
          if (row[0].trim() == id.trim()) {
             var rowTrim = row[1].trim();
             result = rowTrim.split(";");
             result[0] = (result[0] == "null" ) ? "" : result[0];
             result[1] = (result[1] == "null" ) ? "" : result[1];
          }
    	  }
    
    }
    return result;
}

function setCountryVariables(node) {
    var countryCodeList = [];
    var wfInstance;

    if (BL_MaintenanceWorkflows.isChinaMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_China_Maintenance_Workflow");

        countryCodeList.push("CN");

    } else if (BL_MaintenanceWorkflows.isJapanMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_Japan_Maintenance_Workflow");

        countryCodeList.push("JP");

    } else if (BL_MaintenanceWorkflows.isEUMaintenanceWokflow(wfInitiatedNo)) {
        wfInstance = node.getWorkflowInstanceByID("WF16_EU_Maintenance_Workflow");
        countryCodeList.push("EU");
        countryCodeList.push("DE");
        countryCodeList.push("UK");
    }

    return [wfInstance, countryCodeList];
}
}