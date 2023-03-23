/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_AllowSDSWorkflow",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Condition" ],
  "name" : "BC_AllowSDSWorkflow",
  "description" : "To Allow Marketing from anywhere",
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "isCustomWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProduct",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isNewWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isMaintenanceWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsMaintenaceWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (isCustomWF,node,isNewWF,isMaintenanceWF,isComponentWF) {
var isNewWFResult = isNewWF.evaluate(node);
var isCustomWFResult = isCustomWF.evaluate(node);

//Redirect to SDS Workflow for NPI except custom product


if (isNewWFResult.isAccepted() && isCustomWFResult.isRejected()) {
	return true;
}else {
	return false;
}
}