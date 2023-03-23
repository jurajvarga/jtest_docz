/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetKitComponent_COMPONENTORDER",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_SetKitComponent_COMPONENTORDER",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Component" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,bl_library) {
//STEP-6759
if (!node.getValue("COMPONENTORDER").getSimpleValue()) {
   node.getValue("COMPONENTORDER").setSimpleValue(node.getValue("COMPONENTINDEX").getSimpleValue())
}


}