/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "SetKitRevisionName",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "SetKitRevisionName",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision" ],
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
    "value" : "concatenate(value('KITITEMNO'),'_rev',value('REVISIONNO'))"
  }, {
    "id" : "Value",
    "type" : "java.lang.String",
    "value" : ""
  } ],
  "pluginType" : "Operation"
}
*/
