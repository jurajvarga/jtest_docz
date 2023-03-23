/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BackFeedDerivedEvents",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_BackFeedDerivedEvents",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentEventType) {
if (currentEventType.getID() == "TechTransferRevisionCreated" || 
    currentEventType.getID() == "NPIRevisionCreated" ||
    currentEventType.getID() == "RejectTechTransfer" ||
    currentEventType.getID() == "ShortNameChange" || 
    currentEventType.getID() == "RegionalRevisionCreated" ||
    currentEventType.getID() == "RegionalRevisionCompleted"||
    currentEventType.getID() == "MaintenanceWorkflowInitiated" ||
    currentEventType.getID() == "MaintenanceWorkflowCanceled" ||
    currentEventType.getID() == "MaintenanceWorkflowCompleted" ||
    currentEventType.getID() == "ProductCopyCompleted" ||
    currentEventType.getID() == "FreezerDateOTSUpdated"  
      ){
	return true;	
}

return false;
}