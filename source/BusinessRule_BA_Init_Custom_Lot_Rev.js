/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_Custom_Lot_Rev",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Init_Custom_Lot_Rev",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
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
var maintenanceWFNo = "18";

var ret = BL_MaintenanceWorkflows.initiateMaintenanceWFRev(manager, node, maintenanceWFNo, lookUp,"U")

if(ret[0] == "OK") {
	var newWipRevision = ret[1];
	
    // Set CustomLotRev_YN to Y on the new wip revision for the Custom Lot Maintenance
    newWipRevision.getValue("CustomLotRev_YN").setSimpleValue("Y");

	newWipRevision.startWorkflowByID("Product_Maintenance_Workflow_Parent", "Initiated from " + newWipRevision.getValue("Workflow_Name_Initiated").getSimpleValue());
     
}else {
	throw ret[2];
}
}