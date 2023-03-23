/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_Bulk_Approve",
  "description" : null,
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baAppMgrPcReviewOnExit",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_App_Mgr_PC_Review_OnExit",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetMaintenanceRoute",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetMaintenanceRoute",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,baAppMgrPcReviewOnExit,baSetMaintenanceRoute) {
var figureAMAssign = node.getValue("Figure_AM_Assign").getSimpleValue();
log.info('figureAMAssigne: '+figureAMAssign);
if (figureAMAssign != '' && figureAMAssign != null ){
 baAppMgrPcReviewOnExit.execute(node);
 baSetMaintenanceRoute.execute(node);	
}
}