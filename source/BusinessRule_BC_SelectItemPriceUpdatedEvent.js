/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SelectItemPriceUpdatedEvent",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_SelectItemPriceUpdatedEvent",
  "description" : "To select only ItemPriceUpdated event",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentEventTypeBinding",
    "alias" : "currentEventType",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentEventType) {
//STEP-6152
if (currentEventType.getID() == "ItemPriceUpdated"){
	return true;	
}

return false;
}