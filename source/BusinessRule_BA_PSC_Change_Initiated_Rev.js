/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PSC_Change_Initiated_Rev",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_PSC_Change_Initiated_Rev",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (webui) {
var size = webui.getSelection().size();
if(size > 1) {
	webui.showAlert("ERROR", "Please select only one revision");
	return;
}

var selection = webui.getSelection().iterator();
while (selection.hasNext()) {
	var node = selection.next();
	node.getParent().getValue("Main_Initiated_REVISIONNO").setSimpleValue(node.getName());
}
}