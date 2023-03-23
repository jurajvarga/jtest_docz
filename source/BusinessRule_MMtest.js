/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MMtest",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "MMtest",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
exports.operation0 = function (manager,node) {
/*    var refs = node.getProductReferences();    
    var p2curRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
    var p2curRefs = refs.get(p2curRefType);    
    if (p2curRefs.size() == 1) {
        var p2curRef = p2curRefs.get(0);
        var targetRevision = p2curRef.getTarget();
        var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
        var p2wipRefs = refs.get(p2wipRefType);
        node.createReference(targetRevision, p2wipRefType.getID());
        p2curRef.delete();
    }*/

    log.info(" caption "+node.getValue("Figure_Caption").getSimpleValue())
}