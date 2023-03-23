/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Set_Product_Status_WF_Variable",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "Set Product Status WF Variable",
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
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,log,Lib) {
/*Product_Status_Change_Workflow, China_Product_Status_Change, Alternate_Product_No
Product_Status_Change_Workflow, EU_Product_Status_Change, Alternate_Product_No
Product_Status_Change_Workflow, Japan_Product_Status_Change, Alternate_Product_No

Product_Status_Change_Workflow, China_Product_Status_Change, Product_Change
Product_Status_Change_Workflow, EU_Product_Status_Change, Product_Change
Product_Status_Change_Workflow, Japan_Product_Status_Change, Product_Change

Product_Status_Change_Workflow, China_Product_Status_Change, Product_Change_Notes
Product_Status_Change_Workflow, EU_Product_Status_Change, Product_Change_Notes
Product_Status_Change_Workflow, Japan_Product_Status_Change, Product_Change_Notes

Product_Status_Change_Workflow, China_Product_Status_Change, Product_Status_Change_Reason
Product_Status_Change_Workflow, EU_Product_Status_Change, Product_Status_Change_Reason
Product_Status_Change_Workflow, Japan_Product_Status_Change, Product_Status_Change_Reason

Product_Status_Change_Workflow, China_Product_Status_Change, Current Product Status
Product_Status_Change_Workflow, EU_Product_Status_Change, Current Product Status
Product_Status_Change_Workflow, Japan_Product_Status_Change, Current Product Status

dev is erroring out, so I pasted fixed qa below.

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow", "China_Product_Status_Change","Alternate_Product_No", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Alternate_Product_No", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow"," Japan_Product_Status_Change","Alternate_Product_No", log);


Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Change", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Change", log);

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Change_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Change_Notes", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Change_Notes", log);

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Status_Change_Reason", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Status_Change_Reason", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Status_Change_Reason", log);

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Current Product Status", log);
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Current Product Status", log);

*/
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow", "China_Product_Status_Change","Alternate_Product_No");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Alternate_Product_No");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Alternate_Product_No");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","UK_Product_Status_Change","Alternate_Product_No");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","DE_Product_Status_Change","Alternate_Product_No");

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Change");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Change");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Change");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","UK_Product_Status_Change","Product_Change");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","DE_Product_Status_Change","Product_Change");

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Change_Notes");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Change_Notes");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Change_Notes");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","UK_Product_Status_Change","Product_Change_Notes");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","DE_Product_Status_Change","Product_Change_Notes");

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Product_Status_Change_Reason");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Product_Status_Change_Reason");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Product_Status_Change_Reason");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","UK_Product_Status_Change","Product_Status_Change_Reason");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","DE_Product_Status_Change","Product_Status_Change_Reason");

Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","China_Product_Status_Change","Current Product Status");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","EU_Product_Status_Change","Current Product Status");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","Japan_Product_Status_Change","Current Product Status");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","UK_Product_Status_Change","Current Product Status");
Lib.copyWorkflowVariable(step, node,"Product_Status_Change_Workflow","DE_Product_Status_Change","Current Product Status");
}