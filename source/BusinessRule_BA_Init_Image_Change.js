/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_Image_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Init_Image_Change",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baInitSourFolder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Initiate_Source_Folder",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,lookUp,baInitSourFolder,BL_MaintenanceWorkflows) {
var maintenanceWFNo = "15";
var ret = BL_MaintenanceWorkflows.initiateMaintenanceWF(manager, node, maintenanceWFNo, lookUp,"U");

if(ret[0] == "OK") {
	var newWipRevision = ret[1];
	//Add Product Folder to PAG Review Workflow
	baInitSourFolder.execute(newWipRevision);
	newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
}
else {
	throw ret[2];
}
}