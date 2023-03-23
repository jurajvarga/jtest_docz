/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test MJA",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "Test MJA",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateInitiateMultipleItemsInWorkflow",
  "parameters" : [ {
    "id" : "processNote",
    "type" : "java.lang.String",
    "value" : "Workflow Initiated For Additional SKU"
  }, {
    "id" : "stateFlowID",
    "type" : "java.lang.String",
    "value" : "Product_Creation_For_Pricing"
  } ],
  "pluginType" : "Operation"
}
*/
