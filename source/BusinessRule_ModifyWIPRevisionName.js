/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "ModifyWIPRevisionName",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Modify WIP Revision Name",
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
// ModifyWIPRevisionName
// node: Current Object
// logger: Logger
// Validity: Product, Product_Kit

var refs = node.getProductReferences();
var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var p2wipRefs = refs.get(p2wipRefType);
if (p2wipRefs.size() == 1) {
   var p2wipRev = p2wipRefs.get(0).getTarget();
   var p2curRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
   var p2curRefs = refs.get(p2curRefType);
   var p2curRev = null;
   if (p2curRefs.size() == 1) {
      p2curRev = p2curRefs.get(0).getTarget();
   }
   if (p2curRev == null || (!p2curRev.equals(p2wipRev))) {
      var name = p2wipRev.getName();
      if (!name.endsWith("_WIP")) {
         p2wipRev.setName(name+"_WIP");
      }
   }
}
}