/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Save_Figure_Info",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Save_Figure_Info",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "bl_AssetUpdatesUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "lib"
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ProductKitRevisionApprovalAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_ProductKitRevisionApprovalAction,bl_AssetUpdatesUtil,lib) {
bl_AssetUpdatesUtil.updateFigureProtocolName(node, manager)
//STEP-6526 starts
if (node.getObjectType().getID() == "Figure_Folder") {
    var productFolder = node.getParent();

    // There should be only one WIP revision
    var prodWIPRevs = lib.getProductWIPRevision(manager, productFolder);
    var prodWIPRev = prodWIPRevs[0];

    //Send wip revision to BA_ProductKitRevisionApprovalAction
    BA_ProductKitRevisionApprovalAction.execute(prodWIPRev);
}
//STEP-6526 ends
}