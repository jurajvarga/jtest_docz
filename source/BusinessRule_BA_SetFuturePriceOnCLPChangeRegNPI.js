/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetFuturePriceOnCLPChangeRegNPI",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA Set Future Price On CLP Change Reg NPI",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_PricingUtil) {
var wfInstance = node.getWorkflowInstanceByID("WF5_Regional_Workflow")

var tempRegionalPrices = String(wfInstance.getSimpleVariable("tempRegionalPrices"));
log.info("tempRegionalPrices: " + tempRegionalPrices);


var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
var msRef = node.queryReferences(revToMS) //STEP-6396
msRef.forEach(function(ref) {//STEP-6396

    var skus = ref.getTarget().getChildren() //STEP-6396
    for (var i = 0; i < skus.size(); i++) {
        var sku = skus.get(i)

        var skuName = sku.getName();

        if (node.isInState("WF5_Regional_Workflow", "China_Pricing_Review")) {
            // China
            var region = "CN";
            var attID = "China_CLP";
            var currentRegCLP = sku.getValue(attID).getSimpleValue();
            currentRegCLP = (currentRegCLP == null) ? "" : currentRegCLP;
            var oldRegCLP = getStoredSKURegPrice(tempRegionalPrices, skuName, attID);
            oldRegCLP = (oldRegCLP == "null") ? "" : oldRegCLP;

            if (currentRegCLP != oldRegCLP) {
                BL_PricingUtil.copyCurrentToFuturePriceForRegion(sku, "CN");
            }
            log.info("SKU " + skuName + " : oldRegCLP=" + oldRegCLP + ", currentRegCLP=" + currentRegCLP + ", futureRegCLP=" + sku.getValue("China_Future_CLP").getSimpleValue());

        } else if (node.isInState("WF5_Regional_Workflow", "Japan_Pricing_Review")) {
            // Japan
            var region = "JP"
            var attID = "Japan_CLP";
            var currentRegCLP = sku.getValue(attID).getSimpleValue();
            currentRegCLP = (currentRegCLP == null) ? "" : currentRegCLP;
            var oldRegCLP = getStoredSKURegPrice(tempRegionalPrices, skuName, attID);
            oldRegCLP = (oldRegCLP == "null") ? "" : oldRegCLP;

            if (currentRegCLP != oldRegCLP) {
                BL_PricingUtil.copyCurrentToFuturePriceForRegion(sku, "JP");
            }
            log.info("SKU " + skuName + " : oldRegCLP=" + oldRegCLP + ", currentRegCLP=" + currentRegCLP + ", futureRegCLP=" + sku.getValue("Japan_Future_CLP").getSimpleValue());

        } else if (node.isInState("WF5_Regional_Workflow", "EU_Pricing_Review")) {
            // EU
            var listRegionCodes = ["DE","EU","UK"];

            for (var j = 0; j < listRegionCodes.length; j++) {
                var region = listRegionCodes[j];
                //log.info("region: " + region);
                var attID = region + "_CLP";
                var currentRegCLP = sku.getValue(attID).getSimpleValue();
                currentRegCLP = (currentRegCLP == null) ? "" : currentRegCLP;
                var oldRegCLP = getStoredSKURegPrice(tempRegionalPrices, skuName, attID);
                oldRegCLP = (oldRegCLP == "null") ? "" : oldRegCLP;

                if (currentRegCLP != oldRegCLP) {
                    BL_PricingUtil.copyCurrentToFuturePriceForRegion(sku, region);
                }
                log.info("region " + region + " SKU " + skuName + " : oldRegCLP=" + oldRegCLP + ", currentRegCLP=" + currentRegCLP + ", futureRegCLP=" + sku.getValue(region + "_Future_CLP").getSimpleValue());    
            }
        } else {
            throw("BR was not called from valid state.")
        }
    }
    return true; //STEP-6396
});

function getStoredSKURegPrice(str, skuName, attrID) {

    var skuList = str.split("<skusep/>");
    for (var i = 0; i < skuList; i++) {
        var row = skuList[i];
        var storedSkuName = row.split(":")[0]
        if (skuName == storedSkuName) {
            skuAttrs = row.split("<attributesep/>");
            for (var j = 0; j < skuAttrs.length; j++) {
                var storedAttrID = skuAttrs[j].split("=")[0];
                if (storedAttrID == attrID) {
                    return skuAttrs[j].split("=")[1];
                }
            }
        }
    }

    return "";
}
}