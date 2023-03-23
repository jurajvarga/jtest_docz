/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsSellFlagChanged",
  "type" : "BusinessCondition",
  "setupGroups" : [ "NewCondition" ],
  "name" : "BC_IsSellFlagChanged",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
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
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wf,LibMaintenance) {
var wfInstance = node.getWorkflowInstance(wf);
var workflowType=node.getValue("Workflow_Type").getSimpleValue();
log.info(" workflowType "+workflowType);

var wfInitiatedNo=node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo "+wfInitiatedNo);

var sellFlag="";
if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)){
    sellFlag = node.getValue("Sell_in_China_?").getSimpleValue();
}else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)){
    sellFlag = node.getValue("Sell_in_Japan_?").getSimpleValue();
}
var sellFlagRegTmp=wfInstance.getSimpleVariable("Sell_Flag_Regional_Tmp")

if (workflowType == "M"  ) {
	if (sellFlagRegTmp != sellFlag){
		return true;
	}else{
		return false;
	}
} else {
	return false
}
}