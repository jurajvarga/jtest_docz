/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_InitiateProductMaint",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_InitiateProductMaint",
  "description" : "Webui Bulk Update rule to enter a product into Product Maintenance Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Product_Maintenance_Change",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Product_Maintenance_Change</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Product_Maintenance_Change</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Current_Value",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Current_Value</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Current_Value</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "New_Value",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">New_Value</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">3. New_Value</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Workflow_Notes",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Workflow_Notes</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">4. Workflow_Notes</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (Product_Maintenance_Change,node,step,Current_Value,New_Value,Workflow_Notes,Lib) {
if (node.isInWorkflow("Product_Maintenance_Workflow")== false){
	//
	//node.getValue("Product_Maintenance_Change").setSimpleValue(Product_Maintenance_Change);
	//node.getValue("Current_Value").setSimpleValue(Current_Value);
	//node.getValue("New_Value").setSimpleValue(New_Value);
	//node.getValue("Workflow_Notes").setSimpleValue(Workflow_Notes);
	var user = step.getCurrentUser().getName();
	var trigger =  "Product Maintenance changes to ["+Product_Maintenance_Change+"] by " + user;
	var instance = node.startWorkflowByID("Product_Maintenance_Workflow", trigger);

	//Lib.Trigger(instance.setSimpleVariable("Product_Change", Product_Maintenance_Change))
	//instance.setSimpleVariable("Product_Change", Product_Maintenance_Change);
	//add more condiction to match the WF states
	/*
	if (Product_Maintenance_Change=="Size Change"){
		Lib.Trigger(instance,"PM","stibo.submit", trigger);
	}else if (Product_Maintenance_Change=="Ship Condition Change"){
		Lib.Trigger(instance,"PM","stibo.submit", trigger);
	}*/

	instance.setSimpleVariable("Product_Change", Product_Maintenance_Change);
	instance.setSimpleVariable("Current_Value", Current_Value);
	instance.setSimpleVariable("New_Value", New_Value);
	instance.setSimpleVariable("Workflow_Notes", Workflow_Notes);
}
}