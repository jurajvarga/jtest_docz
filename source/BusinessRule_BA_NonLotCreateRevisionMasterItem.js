/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_NonLotCreateRevisionMasterItem",
  "type" : "BusinessAction",
  "setupGroups" : [ "NonLotManagedTechTransferActions" ],
  "name" : ".Step2TTNLWF-Create Product Revision Master Stock From Tech Transfer",
  "description" : "Creates Product,Product Revision and Masterstock for Non-lot Managed",
  "scope" : "Global",
  "validObjectTypes" : [ "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "lib_tt"
  }, {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "libsku"
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
    "alias" : "baTTCreateProdRevAct",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_TechTransferCreateProdRevAction",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,baTTCreateProdRevAct,Lib,lib_tt,libsku) {
baTTCreateProdRevAct.execute(node);
}