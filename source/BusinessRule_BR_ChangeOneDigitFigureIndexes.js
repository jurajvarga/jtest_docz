/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BR_ChangeOneDigitFigureIndexes",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BR_ChangeOneDigitFigureIndexes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
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
var index = String(node.getValue("Figure_Display_Index").getSimpleValue());
//log.info("index.length: " + index.length);

if(index && index.length == 1) {
	var approvalStatus = node.getApprovalStatus();
	//log.info(approvalStatus);
	var newIndex = "0" + index;
	node.getValue("Figure_Display_Index").setSimpleValue(newIndex);
	//log.info("new index: " + String(node.getValue("Figure_Display_Index").getSimpleValue()));
	if (approvalStatus == "Completely Approved") {
		BA_Approve.execute(node);
		//log.info("approved");
	}
}
}