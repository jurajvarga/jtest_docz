/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyAlternateProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_CopyAlternateProduct",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
exports.operation0 = function (node,manager,BL_CopyRevision,BL_Library) {
//rewritten as part of STEP-6224 Edit alternative products outside of a product status change WF
//used in PSC Wf and BA_Auto_Change_to_Discontinued only
//copy ALTERNATE_PRODUCT to product
//copy ALTERNATE_PRODUCT to all product's revisions in Revision_Release_Workflow queue

var product = node.getParent();

BL_CopyRevision.copyReferenceOfType(node, product, "ALTERNATE_PRODUCT", true);

var revsInRevReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Revision_Release_Workflow");

for (var i = 0; i < revsInRevReleaseWF.length; i++) {
     var rev = revsInRevReleaseWF[i];
     BL_CopyRevision.copyReferenceOfType(node, rev, "ALTERNATE_PRODUCT", true);
}
}