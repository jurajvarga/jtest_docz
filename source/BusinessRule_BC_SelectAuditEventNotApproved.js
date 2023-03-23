/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SelectAuditEventNotApproved",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_SelectAuditEventNotApproved",
  "description" : "To select only modify events and filter out other events.",
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
var approvalStatus=node.getApprovalStatus()
if (currentEventType.getID() == "AuditEventCreated" && approvalStatus != "Completely Approved" ){
	return true;	
}

return false;
}