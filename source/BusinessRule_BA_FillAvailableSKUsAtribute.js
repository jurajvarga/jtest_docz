/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_FillAvailableSKUsAtribute",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_FillAvailableSKUsAtribute",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "MasterStock" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node) {
var skusArr = [];
var children = node.getChildren().iterator();

while (children.hasNext()) {
    var child = children.next();
    skusArr.push(child.getValue("ItemCode").getSimpleValue());
}
    
node.getValue("MasterStock_Available_SKUs").setSimpleValue(skusArr.sort().join(", "));
}