/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Init_OTS_Conversion",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Global_Init_OTS_Conversion",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  } ]
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,lookupTableHome,BL_Library) {
var workflow = manager.getWorkflowHome().getWorkflowByID("Product_Maintenance_Upload");
var instance = node.getWorkflowInstance(workflow);
		
if (instance != null && node.isInState("Product_Maintenance_Upload", "UserSystem_Initiated_Maintenance")) {
    node.getValue("Workflow_Name_Initiated").setSimpleValue("OTS Conversion");
    BL_Library.Trigger(instance, "UserSystem_Initiated_Maintenance", "Submit_OTS_Conversion", "Transition to OTS Conversion");
    webui.navigate("homepage", null);
}
}