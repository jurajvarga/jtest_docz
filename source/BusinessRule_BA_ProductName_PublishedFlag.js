/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProductName_PublishedFlag",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_ProductName_PublishedFlag",
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondNewWF",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
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
exports.operation0 = function (busCondNewWF,node) {
var product = node.getParent();
var isNewWorkflow = busCondNewWF.evaluate(node).isAccepted();

if(isNewWorkflow){
	product.getValue("PUBLISHED_YN").setSimpleValue(node.getValue("PUBLISHED_YN").getSimpleValue());
	product.getValue("PRODUCTNAME").setSimpleValue(node.getValue("PRODUCTNAME").getSimpleValue());
	product.setName(node.getValue("PRODUCTNAME").getSimpleValue());
}
}