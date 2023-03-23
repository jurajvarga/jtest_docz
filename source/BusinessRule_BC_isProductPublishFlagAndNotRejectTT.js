/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isProductPublishFlagAndNotRejectTT",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isProductPublishFlagAndNotRejectTT",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isProductRejectTTVisibled",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isProductRejectTTVisibled",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "isProductPublishFlagEditable",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isProductPublishFlagEditable",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,isProductRejectTTVisibled,isProductPublishFlagEditable,BL_Library) {
var isRejectTTVisibled = isProductRejectTTVisibled.evaluate(node);
var isPublishFlagEditable = isProductPublishFlagEditable.evaluate(node);
var wfNo = node.getValue("Workflow_No_Initiated").getSimpleValue();

return (!isRejectTTVisibled.isAccepted() && isPublishFlagEditable.isAccepted()) || (wfNo == "2" && node.isInWorkflow("Production_Workflow")); // STEP-5841 added OR
}