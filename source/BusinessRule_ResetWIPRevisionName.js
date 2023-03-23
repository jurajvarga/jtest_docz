/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "ResetWIPRevisionName",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Reset WIP Revision Name",
  "description" : "Edits WIP Revision Name for DataSheet creation. No longer needed.",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger) {
// ResetWIPRevisionName
// node: Current Object
// logger: Logger
// Validity: Product, Product_Kit

var refs = node.getProductReferences();
var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var p2wipRefs = refs.get(p2wipRefType);
if (p2wipRefs.size() == 1) {
   var p2wipRev = p2wipRefs.get(0).getTarget();
   var name = p2wipRev.getName();
   if (name.endsWith("_WIP")) {
      p2wipRev.setName(name.substring(0,name.length()-4));
   }
}
}