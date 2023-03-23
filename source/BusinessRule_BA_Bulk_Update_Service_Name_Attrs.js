/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Update_Service_Name_Attrs",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Bulk_Update_Service_Name_Attrs",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
exports.operation0 = function (node,BA_Approve,lib) {
var productName = node.getName();
var productApproval = node.getApprovalStatus();

if (node.getValue("PRODUCTNAME").getSimpleValue() == null) {
	node.getValue("PRODUCTNAME").setSimpleValue(productName);
}
if (node.getValue("PRODUCTSHORTNAME").getSimpleValue() == null) {
	node.getValue("PRODUCTSHORTNAME").setSimpleValue(productName);
}

serviceRevs = lib.getProductChildren(node, "Service_Revision");
for (var i = 0; i < serviceRevs.length; i++) {
	var revisionApproval = serviceRevs[i].getApprovalStatus();

	if (serviceRevs[i].getValue("PRODUCTNAME").getSimpleValue() == null) {
		serviceRevs[i].getValue("PRODUCTNAME").setSimpleValue(productName);
	}

	if (serviceRevs[i].getValue("PRODUCTSHORTNAME").getSimpleValue() == null) {
		serviceRevs[i].getValue("PRODUCTSHORTNAME").setSimpleValue(productName);
	}

	if (revisionApproval == "Completely Approved") {
		BA_Approve.execute(serviceRevs[i]);
	}
}

if (productApproval == "Completely Approved") {
	BA_Approve.execute(node);
}

}