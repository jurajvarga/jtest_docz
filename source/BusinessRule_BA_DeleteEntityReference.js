/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteEntityReference",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_DeleteEntityReference",
  "description" : "Removes Classification Product Link via bulk update.",
  "scope" : "Global",
  "validObjectTypes" : [ "Application" ],
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
var lstProduct = node.getEntityProductLinks();
log.info(lstProduct.size());
for (var i = 0; i < lstProduct.size(); i++) {
	lstProduct.get(i).delete();
}
}