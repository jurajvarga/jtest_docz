/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_Price_Size_Name_Changes_SKUs_Rev",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Init_Price_Size_Name_Changes_New_SKUs_Rev",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,lookUp,BL_MaintenanceWorkflows) {
var maintenanceWFNo = "13"

var ret = BL_MaintenanceWorkflows.initiateMaintenanceWFRev(manager, node, maintenanceWFNo, lookUp,"U")

if(ret[0] == "OK") {
	var newWipRevision = ret[1];
	newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
}
else {
	throw ret[2];
}
}