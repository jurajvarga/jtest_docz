/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "SetProductRevisionName",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "SetProductRevisionName",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateSetName",
  "parameters" : [ {
    "id" : "Formula",
    "type" : "java.lang.String",
    "value" : "concatenate(value('PRODUCTNO'),'_rev',value('REVISIONNO'))"
  }, {
    "id" : "Value",
    "type" : "java.lang.String",
    "value" : ""
  } ],
  "pluginType" : "Operation"
}
*/
