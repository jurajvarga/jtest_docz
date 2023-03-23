/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsStatusChangeRevision",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC Is Status Change Revision",
  "description" : "To identify if the revision was for a status change by using status reason attribute",
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
exports.operation0 = function (node) {
var l_StatusChangeReason=node.getValue("Product_Status_Change_Reason").getSimpleValue();
logger.info("l_StatusChangeReason "+l_StatusChangeReason);

if (l_StatusChangeReason == null || l_StatusChangeReason =='' ){
	return false;	
}
else {
	return true;
}
}