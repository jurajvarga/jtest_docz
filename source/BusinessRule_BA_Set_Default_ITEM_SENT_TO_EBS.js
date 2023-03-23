/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Default_ITEM_SENT_TO_EBS",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Set_Default_ITEM_SENT_TO_EBS",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,bl_library) {
// Sets an attribute ITEM_SENT_TO_EBS to "N" for all SKUs and MasterStock
// Applied to the Master Stock and its SKUs of the input node
var businessRule = "Business Rule: BA_Set_Default_ITEM_SENT_TO_EBS";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();
log.info(bl_library.logRecord([businessRule, currentObjectID, currentDate]));

// Get MasterStock
//STEP-6396
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
var msRefs = node.queryReferences(refType);

msRefs.forEach(function(msRef) {
    var masterStock = msRef.getTarget();

    masterStock.getValue("ITEM_SENT_TO_EBS").setSimpleValue("N");
    //log.info("ITEM_SENT_TO_EBS for MasterStock " + masterStock.getName() + ": " + masterStock.getValue("ITEM_SENT_TO_EBS").getSimpleValue());

    // Get SKUs
    var childIter = masterStock.getChildren().iterator();
    while (childIter.hasNext()) {

        var child = childIter.next();
        child.getValue("ITEM_SENT_TO_EBS").setSimpleValue("N");
        //log.info("ITEM_SENT_TO_EBS for SKU " + child.getName() + ": " + child.getValue("ITEM_SENT_TO_EBS").getSimpleValue());
    }
    return false;
});
//STEP-6396
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_IsNewWorkflow"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
