/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Init_PAG",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Global_Init_PAG",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Global_Init_Product_Maintenance",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Global_Init_Product_Maintenance",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,web,BA_Global_Init_Product_Maintenance) {
//STEP-6396
var prodMainDocs = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");
var links = node.queryReferences(prodMainDocs);
var linksExist = false;

links.forEach(function(ref) {
	linksExist = true;
	return false;
});

if(!linksExist){
	web.showAlert("ERROR", "Validation error", "Please upload Maintenance Document to proceed to PAG.");
}
else{
	node.getValue("FigureChanged_YN").setSimpleValue("Y");
	BA_Global_Init_Product_Maintenance.execute(node);
}
//STEP-6396
}