/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_UpdateAlternateProducts",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_UpdateAlternateProducts",
  "description" : "Webui Bulk Update rule for updating Alternate products",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BA_Approve,BL_CopyRevision,BL_Library,BL_MaintenanceWorkflows) {
var currentRev = BL_MaintenanceWorkflows.getCurrentRevision(node);
var wipRev = BL_MaintenanceWorkflows.getWIPRevision(node)

// wip revision not in PSC
if (wipRev && !wipRev.isInWorkflow("WF-7B-Product-Status-Change-Workflow"))
{
    BL_CopyRevision.copyReferenceOfType(node, wipRev, "ALTERNATE_PRODUCT", false);
}

// current revision
if (currentRev)
{
    BL_CopyRevision.copyReferenceOfType(node, currentRev, "ALTERNATE_PRODUCT", false);
    BA_Approve.execute(currentRev);
}

// Revision_Release_Workflow
var revsInRevReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(node, "Revision_Release_Workflow");
for (var i = 0; i < revsInRevReleaseWF.length; i++) {
     var rev = revsInRevReleaseWF[i];
     BL_CopyRevision.copyReferenceOfType(node, rev, "ALTERNATE_PRODUCT", false);
     BA_Approve.execute(rev);
}

// Product_Release_Workflow    
var revsInProdReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(node, "Product_Release_Workflow");
for (var i = 0; i < revsInProdReleaseWF.length; i++) {
     var rev = revsInProdReleaseWF[i];
     BL_CopyRevision.copyReferenceOfType(node, rev, "ALTERNATE_PRODUCT", false);
     BA_Approve.execute(rev);     
}
}