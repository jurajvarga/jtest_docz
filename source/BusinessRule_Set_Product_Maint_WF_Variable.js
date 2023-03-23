/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Set_Product_Maint_WF_Variable",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "Set Product Maint WF Variable",
  "description" : "Passes over Workflow variables to international wf",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib) {
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","China_Product_Maintenance","Current_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","EU_Product_Maintenance","Current_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","Japan_Product_Maintenance","Current_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","UK_Product_Maintenance","Current_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","DE_Product_Maintenance","Current_Value", log);

Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","China_Product_Maintenance","New_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","EU_Product_Maintenance","New_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","Japan_Product_Maintenance","New_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","UK_Product_Maintenance","New_Value", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","DE_Product_Maintenance","New_Value", log);

Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","China_Product_Maintenance","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","EU_Product_Maintenance","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","Japan_Product_Maintenance","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","UK_Product_Maintenance","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","DE_Product_Maintenance","Product_Change", log);

Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","China_Product_Maintenance","Workflow_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","EU_Product_Maintenance","Workflow_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","Japan_Product_Maintenance","Workflow_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","UK_Product_Maintenance","Workflow_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","DE_Product_Maintenance","Workflow_Notes", log);

Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","China_Product_Maintenance","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","EU_Product_Maintenance","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","Japan_Product_Maintenance","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","UK_Product_Maintenance","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Maintenance_Workflow","DE_Product_Maintenance","Current Product Status", log);
}