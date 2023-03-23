/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CorrectSDSLinks",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_CorrectSDSLinks",
  "description" : "to correct SDS name and attributes for SDS key",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
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
exports.operation0 = function (node,manager,BA_Approve) {
var parent = node.getParent();

var productNo = parent.getValue("PRODUCTNO").getSimpleValue();
var revNo = parent.getValue("REVISIONNO").getSimpleValue();

try {
    var newSDSName = productNo + "_Rev" + revNo + "_" +
        node.getValue("SDS_Subformat").getSimpleValue() + "_" + node.getValue("SDS_Language").getSimpleValue() + "_" +
        node.getValue("Doc_Revision_No").getSimpleValue() + "_" + node.getValue("SDS_Format").getSimpleValue() + "_" +
        node.getValue("Plant").getSimpleValue();

    node.setName(newSDSName);
    node.getValue("PRODUCTNO").setSimpleValue(productNo + "_rev" + revNo);
    node.getValue("REVISIONNO").setSimpleValue("Rev" + revNo);

    BA_Approve.execute(node);
} catch (e) {}
}