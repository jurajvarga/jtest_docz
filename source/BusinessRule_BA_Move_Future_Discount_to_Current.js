/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Move_Future_Discount_to_Current",
  "type" : "BusinessAction",
  "setupGroups" : [ "Year_End_Pricing_Rules" ],
  "name" : "BA Move Future Discount to Current",
  "description" : "Moves the Future Discount %age for customer into Current",
  "scope" : "Global",
  "validObjectTypes" : [ "CatalogCustomer" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,bl_library) {
/**
script purpose: Moved future discount percentage attribute to current
valid object type: Customer
bindings: currentObject, logger
**/

var CustomerID = "Customer STEP ID: " + node.getID();
var CustomerName = "Customer: " + node.getName();
var businessRule = "BA_Move_Future_Discount_to_Current";

logger.info( bl_library.logRecord( [ businessRule, CustomerID, CustomerName ] ) )

var scurrentDiscount = node.getValue("Pricing Summary").getSimpleValue();
var sfutureDiscount = node.getValue("CustomerFuturePrice").getSimpleValue();
log.info("scurrentDiscount " + scurrentDiscount + " sfutureDiscount " + sfutureDiscount);

if (sfutureDiscount != null) {
	if (scurrentDiscount != sfutureDiscount ) {
       	logger.info( bl_library.logRecord( [ businessRule, CustomerName, 'Updating Current Discount ...' ] ) )	
		node.getValue("Pricing Summary").setSimpleValue(sfutureDiscount);
	} else {
        	logger.info( bl_library.logRecord( [ businessRule, CustomerName, ' Future Discount is same as current Discount. Clearing Future Discount ...' ] ) )	
	}
	node.getValue("CustomerFuturePrice").deleteCurrent();
	node.getValue("CustomerFuturePriceDate").deleteCurrent();
} else {
       	logger.info( bl_library.logRecord( [ businessRule, CustomerName, ' Future Discount is NULL. Nothing to do ...' ] ) )	
}

node.approve();
}