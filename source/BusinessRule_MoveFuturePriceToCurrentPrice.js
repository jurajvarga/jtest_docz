/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MoveFuturePriceToCurrentPrice",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "Move Future Price To Current Price",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_PricingUtil",
    "libraryAlias" : "BL_PricingUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "sku",
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
exports.operation0 = function (sku,manager,BL_PricingUtil,bl_library) {
/**
script purpose: Moved future price values to current price attribute.
valid object type: SKU
bindings: currentObject, price attributes
dependencies: BL_Library
**/


function UpdateUSPriceAttribues(sku, businessRule, GetUserId, sPrice, sPriceHistory, sFuturePrice, parsedDate, sFuturePriceRationale) {
	var skuID = "STEP ID: " + sku.getID();
	var skuName = "SKU: " + sku.getName();
    var sfuturePriceValue = Number(sku.getValue(sFuturePrice).getSimpleValue()).toFixed(2);
    var scurrentPriceValue = sku.getValue(sPrice).getSimpleValue();
    // STEP-5989 using new history format
    log.info(bl_library.logRecord([businessRule, "US", sFuturePrice]))
    if (sfuturePriceValue > 0) {
        if (scurrentPriceValue != sfuturePriceValue) {

            var priceValues = "GBP: " + scurrentPriceValue + " - " + sfuturePriceValue;
            var history = parsedDate + "; " + GetUserId + "; " + priceValues + "; " + sFuturePriceRationale

            var oldHistory = sku.getValue(sPriceHistory).getSimpleValue();
            if (oldHistory) {
                var historyResult = history ? history + "\n" + oldHistory : oldHistory
            } else {
                var historyResult = history;
            }

            //log.info(" historyResult \n" + historyResult)
            if (historyResult.length > 1023) {
                var strTmp = historyResult.split("\n")
                strTmp.splice(-2, 2)
                historyResult = strTmp.join("\n")
            }
            sku.getValue(sPriceHistory).setSimpleValue(historyResult);

            sku.getValue(sPrice).setSimpleValue(sfuturePriceValue);
            // STEP 5989 ends

            log.info(bl_library.logRecord([businessRule, skuName, 'US Future price: Replaced current price of ' + scurrentPriceValue + " with " + sfuturePriceValue]))
        } else {
            log.info(bl_library.logRecord([businessRule, skuName, 'US Future price is same as current price. Clearing Future Price ...']))
        }
        sku.getValue(sFuturePrice).deleteCurrent();
    } else {
        log.info(bl_library.logRecord([businessRule, skuName, 'US Future price is NULL. Nothing to do ...']))
    }
}


function UpdatePriceAttribues(sku, businessRule, GetUserId, sRegion, sPrice, sPriceHistory, sFuturePrice, parsedDate, sFuturePriceRationale) {
	var skuID = "STEP ID: " + sku.getID();
	var skuName = "SKU: " + sku.getName();
    var sfuturePriceValue = Number(sku.getValue(sFuturePrice).getSimpleValue()).toFixed(2);
    var scurrentPriceValue = sku.getValue(sPrice).getSimpleValue();
    log.info(bl_library.logRecord([businessRule, sRegion, sFuturePrice]))
    if (sfuturePriceValue > 0) {
        if (scurrentPriceValue != sfuturePriceValue) {
            sku.getValue(sPrice).setSimpleValue(sfuturePriceValue);

            var history = parsedDate + "; " + GetUserId + "; " + sFuturePrice + "; -  Rationale: " + sFuturePriceRationale;
            var oldHistory = sku.getValue(sPriceHistory).getSimpleValue();
            if (oldHistory) {
                var historyResult = history ? history + "\n" + oldHistory : oldHistory
            } else {
                var historyResult = history;
            }
            if (historyResult.length > 1023) {
                var strTmp = historyResult.split("\n")
                strTmp.splice(-2, 2)
                historyResult = strTmp.join("\n")
            }
            sku.getValue(sPriceHistory).setSimpleValue(historyResult);
            log.info(bl_library.logRecord([businessRule, skuName, sRegion + ' Future price: Replaced current price of ' + scurrentPriceValue + " with " + sfuturePriceValue]))
        } else {
            log.info(bl_library.logRecord([businessRule, skuName, sRegion + ' Future price is same as current price. Clearing Future Price ...']))
        }
        sku.getValue(sFuturePrice).deleteCurrent();
    } else {
        log.info(bl_library.logRecord([businessRule, skuName, sRegion + ' Future price is NULL. Nothing to do ...']))
    }
}



// variables for logging
var businessRule = "MoveFuturePriceToCurrentPrice";
var skuID = "STEP ID: " + sku.getID();
var skuName = "SKU: " + sku.getName();
var GetUserId = manager.getCurrentUser().getID();
var d = new Date()
var parsedDate = d.getMonth() + 1 + "-" + d.getDate() + "-" + d.getFullYear() + "#" + d.getHours() + ":" + d.getMinutes()

log.info(bl_library.logRecord([businessRule, skuID, skuName]))
UpdateUSPriceAttribues(sku, businessRule, GetUserId, "PRICE", "Global_Base_Price_History", "Future_Global_Base_Price", parsedDate, "8. Annual Price Change");

UpdatePriceAttribues(sku, businessRule, GetUserId, "Germany", "DE_CLP", "DE_CLP_History", "DE_Future_CLP", parsedDate, "8. Annual Price Change");
UpdatePriceAttribues(sku, businessRule, GetUserId, "EU", "EU_CLP", "EU_CLP_History", "EU_Future_CLP", parsedDate, "8. Annual Price Change");
UpdatePriceAttribues(sku, businessRule, GetUserId, "UK", "UK_CLP", "UK_CLP_History", "UK_Future_CLP", parsedDate, "8. Annual Price Change");

UpdatePriceAttribues(sku, businessRule, GetUserId, "China", "China_CLP", "China_CLP_History", "China_Future_CLP", parsedDate, "8. Annual Price Change");

UpdatePriceAttribues(sku, businessRule, GetUserId, "Japan", "Japan_CLP", "Japan_CLP_History", "Japan_Future_CLP", parsedDate, "8. Annual Price Change");

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