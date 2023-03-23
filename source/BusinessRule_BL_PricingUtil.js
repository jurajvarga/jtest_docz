/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_PricingUtil",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_PricingUtil",
  "description" : "API Related to Pricing Calculation",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function updateRegFuturePrice(sku, sRegion, sPrice, sFuturePrice) {

    var skuName = "SKU: " + sku.getName();
    var sfuturePriceValue = sku.getValue(sFuturePrice).getSimpleValue();
    if (sfuturePriceValue == null) sfuturePriceValue = 0;
    var scurrentPriceValue = sku.getValue(sPrice).getSimpleValue();

    if (scurrentPriceValue != null) {
        if (scurrentPriceValue != sfuturePriceValue) {
            sku.getValue(sFuturePrice).setSimpleValue(scurrentPriceValue);
            log.info(bl_library.logRecord([skuName, sRegion + ' Updated Future price to ' + scurrentPriceValue]));
        } else {
            log.info(bl_library.logRecord([skuName, sRegion + ' Current price is same as future price.']))
        }
    } else {
        log.info(bl_library.logRecord([skuName, sRegion + ' Current price is NULL. Nothing to move to future price.']))
    }
}

function updateFuturePriceUS(sku) {
    try {
        var sPrice = sku.getValue("PRICE").getSimpleValue();
        var sFuturePrice = sku.getValue("Future_Global_Base_Price").getSimpleValue();
        log.info(sku.getName() + " Price " + sPrice + " Future Price is " + sFuturePrice);
        if (sPrice) {
            if ((sPrice == 0) && ((sFuturePrice == 0) || sFuturePrice == null)) {
                log.info(sku.getName() + " Both current and future are 0, no need to update.");
            }
            else {
                sku.getValue("Future_Global_Base_Price").setSimpleValue(sPrice);
                log.info(sku.getName() + " Updated Future price to " + sPrice);
            }
        }
        else {
            log.info(sku.getName() + " Current price is blank ");
        }
    }
    catch (e) {
        log.info(sku.getName() + " Error setting Future Price to " + sPrice);
        throw (e);
    }

}




function copyCurrentToFuturePriceForRegion(sku, regioncode) {
    var businessRule = "Business Rule: BL_PricingUtil";
    var currentObjectID = "Node ID: " + sku.getID() + " Node Object ID: " + sku.getObjectType().getID();
    var currentDate = "Date: " + (new Date()).toLocaleString();

    var skuName = "SKU: " + sku.getName();

    var productNo = sku.getValue("PRODUCTNO").getSimpleValue();
    log.info(bl_library.logRecord([businessRule, productNo, skuName]));

    var sObjType = sku.getObjectType().getID();
    if (sObjType == "SKU") {
        if (regioncode == "US") {
            updateFuturePriceUS(sku);
        } else if (regioncode == "DE") {

            updateRegFuturePrice(sku, "Germany", "DE_CLP", "DE_Future_CLP");
        } else if (regioncode == "EU") {

            updateRegFuturePrice(sku, "EU", "EU_CLP", "EU_Future_CLP");
        } else if (regioncode == "UK") {
            
            updateRegFuturePrice(sku, "UK", "UK_CLP", "UK_Future_CLP");
        } else if (regioncode == "CN") {

            updateRegFuturePrice(sku, "China", "China_CLP", "China_Future_CLP");
        } else if (regioncode == "JP") {

            updateRegFuturePrice(sku, "Japan", "Japan_CLP", "Japan_Future_CLP");
        }

        try {
            sku.approve();
        } catch (e) {
            if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else {
                log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                throw (e);
            }
        }
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.updateRegFuturePrice = updateRegFuturePrice
exports.updateFuturePriceUS = updateFuturePriceUS
exports.copyCurrentToFuturePriceForRegion = copyCurrentToFuturePriceForRegion