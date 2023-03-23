/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isAllowed_OTSConversion",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isAllowed_OTSConversion",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
exports.operation0 = function (node,BL_Library) {
var checkServiceConjugates = false;
if(node.getValue("PUBLISHED_YN").getSimpleValue() == "N" && node.getValue("OTS_Conversion_Release_Date").getSimpleValue() == null && node.getValue("Workflow_Name_Initiated").getSimpleValue() != "OTS Conversion" && BL_Library.isProductType(node, checkServiceConjugates)) {
    return true;
}
else {
    return false;
}
}