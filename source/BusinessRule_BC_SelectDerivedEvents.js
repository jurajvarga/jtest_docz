/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SelectDerivedEvents",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_SelectDerivedEvents",
  "description" : "To select only derived events and filter out create events",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
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
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentEventType,node) {
if (node.getApprovalStatus() != "Not in Approved workspace" && (currentEventType.getID() == "ProductReleased" || //STEP-6363 approvalStatus
    currentEventType.getID() == "CurrentRevisionUpdated" ||
    currentEventType.getID() == "CurrentRevisionProductStatusUpdated" ||
    currentEventType.getID() == "WebDataRepublished" )){
	return true;	
}

return false;
}