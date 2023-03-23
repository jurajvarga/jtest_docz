/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_EvaluateRevisionTechTransfer",
  "type" : "BusinessAction",
  "setupGroups" : [ "LotManagedTechTransfer" ],
  "name" : ".Step1TTWF-BA_EvaluateRevisionTechTransfer",
  "description" : "Identifies if a new Product Revision is needed, based on new Tech Transfer object.",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "lib_tt"
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
    "alias" : "baTTCompEval",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_TechTransferComponentEval",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,baTTCompEval,Lib,lib_tt) {
baTTCompEval.execute(node);
}