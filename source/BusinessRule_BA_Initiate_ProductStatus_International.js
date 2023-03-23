/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Initiate_ProductStatus_International",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Initiate_ProductStatus_International",
  "description" : "Initiate into the International product status workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
if (node.isInWorkflow("China_Product_Status_Change")== false){
node.startWorkflowByID("China_Product_Status_Change", "Initiated by US Workflow");
};
if (node.isInWorkflow("Japan_Product_Status_Change")== false){
node.startWorkflowByID("Japan_Product_Status_Change", "Initiated by US Workflow");
};
if (node.isInWorkflow("EU_Product_Status_Change")== false){
node.startWorkflowByID("EU_Product_Status_Change", "Initiated by US Workflow");
};
if (node.isInWorkflow("UK_Product_Status_Change")== false){
node.startWorkflowByID("UK_Product_Status_Change", "Initiated by US Workflow");
};
if (node.isInWorkflow("DE_Product_Status_Change")== false){
node.startWorkflowByID("DE_Product_Status_Change", "Initiated by US Workflow");
};
}