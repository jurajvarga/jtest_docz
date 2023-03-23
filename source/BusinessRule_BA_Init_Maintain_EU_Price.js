/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_Maintain_EU_Price",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Init_Maintain_EU_Price",
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
//STEP-5817
var maintenanceWFNo = "16A1";
var region = "EU";
var ret = BL_MaintenanceWorkflows.createRegionalRevisionRequest(manager, node, maintenanceWFNo, region, lookUp);

if (ret[0] == "OK") {
    var newRegRevision = ret[1];
    newRegRevision.startWorkflowByID("Regional_Initiation_Workflow", "Initiated from " + newRegRevision.getValue("Workflow_Name_Initiated").getSimpleValue() + " for " + region + " region.");
}
else {
	throw ret[2];
}

/* old way of reg maintenance
var maintenanceWFNo = "16A1";
var region = "EU";
var ret = BL_MaintenanceWorkflows.initiateRegMaintenanceWF(manager, node, maintenanceWFNo, region, lookUp,"U");

if(ret[0] == "OK") {
	var newWipRevision = ret[1];
	newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
}
else {
	throw ret[2];
}
*/
}