/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Clear_China_Future_Attributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Clear_China_Future_Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
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
exports.operation0 = function (node,BA_Approve) {
var approvalStatus = node.getApprovalStatus();

node.getValue("China_Future_CLP").setSimpleValue(null);
node.getValue("China_Future_CLP_Date").setSimpleValue(null);
node.getValue("China_Future_CLP_History").setSimpleValue(null);
node.getValue("China_Future_CLP_Rationale").setSimpleValue(null);

if(approvalStatus == "Completely Approved") {
    BA_Approve.execute(node);
}
}