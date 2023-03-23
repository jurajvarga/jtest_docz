/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_skipForCustomAndComponent",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_skipForCustomAndComponent",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondCustomProd",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isCustomProduct",
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondComponentWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_isComponentWF",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busCondCustomProd,busCondComponentWF) {
var condCustomProdResult = busCondCustomProd.evaluate(node);
var isCustomProduct = condCustomProdResult.isAccepted();

var condComponentWFResult = busCondComponentWF.evaluate(node);
var isComponentWF = condComponentWFResult.isAccepted();

var wfInst = node.getWorkflowInstanceByID("Production_Workflow");

if (wfInst != null)	{
	wfInst.delete("Removed from WF for custom product or component WF");
}
	
if (isCustomProduct) {
	node.startWorkflowByID("Marketing_Review_Workflow", "Initialzie WF for custom procut");
}
else if (isComponentWF) {
	node.startWorkflowByID("SDS-DG Workflow", "Initialzie WF for component");
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_isCustomProductOrComponentWF"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
