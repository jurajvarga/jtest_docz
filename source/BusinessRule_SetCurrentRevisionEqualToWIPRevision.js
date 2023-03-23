/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "SetCurrentRevisionEqualToWIPRevision",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Set Current Revision Equal To WIP Revision",
  "description" : "Replace the Product to WIP Revision reference with the Product to Current Revision",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
// SetCurrentRevisionEqualToWIPRevision
// Replace the Product to WIP Revision reference with the Product to Current Revision
// node: Current Object
// logger: Logger
// Validity: Product, Product_Kit

var refs = node.getProductReferences();
var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var p2wipRefs = refs.get(p2wipRefType);

if (p2wipRefs.size() == 1) {
   var p2wipRef = p2wipRefs.get(0);
   var targetRevision = p2wipRef.getTarget();
   var p2curRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
   var p2curRefs = refs.get(p2curRefType);
   var currentRevision = null;
   if (p2curRefs.size() == 1) {
      var p2curRef = p2curRefs.get(0);
      currentRevision = p2curRef.getTarget();
      if (!currentRevision.equals(targetRevision)) {
         // If such a reference already exists for a different target revision we will replace it.
         p2curRef.delete();
         logger.info("SetCurrentRevisionEqualToWIPRevision "+node.getID()+": Removed "+p2curRefType.getID()+" ref from "+targetRevision.getID());
         currentRevision = null;
      }
   }
   if (currentRevision == null) {
      node.createReference(targetRevision,p2curRefType.getID());
      logger.info("SetCurrentRevisionEqualToWIPRevision "+node.getID()+": Created "+p2curRefType.getID()+" ref to "+targetRevision.getID());
   }
   // Remove reference from the existing Current Product Revision:
   p2wipRef.delete();
   // This is only valid for Product_Revision so we have to check:
   if (targetRevision.getObjectType().getID().equals("Product_Revision")) {
      targetRevision.getValue("REVISIONSTATUS").setSimpleValue("Approved");
   }
}
}