/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SelectModifyEvent",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_SelectModifyEvent",
  "description" : "To select only modify events and filter out other events.",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  } ]
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
exports.operation0 = function (currentEventType,node,BL_Library) {
var checkServiceRevision = true;

if(node.getValue("REVISIONSTATUS").getSimpleValue() == "Canceled" && BL_Library.isRevisionType(node, checkServiceRevision)) {
    logger.info("BC_SelectModifyEvent: node " + node.getID() + " is canceled.");
    return false;
}

if (node.getApprovalStatus() != "Not in Approved workspace" && (currentEventType.getID() == "Modify" || currentEventType.getID() == "WebPassthroughChanges")){ //STEP-6363 approvalStatus
	return true;	
}

return false;
}