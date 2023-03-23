/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC Show Edit ViewImages Tab",
  "type" : "BusinessCondition",
  "setupGroups" : [ "FiguresReview" ],
  "name" : "BC_Show_Edit_ViewImages_Tab",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "blMaintenanceWorkflows"
  } ]
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
exports.operation0 = function (node,blMaintenanceWorkflows) {
var isInWf19 = !blMaintenanceWorkflows.isFF2ContentOnlyRev(node);
return isInWf19;
//return !(blMaintenanceWorkflows.isFF2ContentOnlyRev(node));
}