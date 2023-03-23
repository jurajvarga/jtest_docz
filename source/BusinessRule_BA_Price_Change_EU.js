/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Price_Change_EU",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Price_Change_EU",
  "description" : "Webui Bulk update rule to initiate product into Price Change Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
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
    "alias" : "EU_Future_CLP",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">EU_Future_CLP</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Future CLP</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
    "alias" : "EU_Future_CLP_Date",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">EU_Future_CLP_Date</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Future CLP Date</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "EU_Future_CLP_Rationale",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">EU_Future_CLP_Rationale</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">3. Future CLP Rationale</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (EU_Future_CLP,node,step,EU_Future_CLP_Date,EU_Future_CLP_Rationale,Lib) {
if (node.isInWorkflow("EU_Price_Change_Workflow")== false){
	
	var user = step.getCurrentUser().getName();
	var trigger =  "Price Change to ["+EU_Future_CLP+"] by " + user;
	var instance = node.startWorkflowByID("EU_Price_Change_Workflow", trigger);

	node.getValue("EU_Future_CLP").setSimpleValue(EU_Future_CLP);
	node.getValue("EU_Future_CLP_Date").setSimpleValue(EU_Future_CLP_Date);
	node.getValue("EU_Future_CLP_Rationale").setSimpleValue(EU_Future_CLP_Rationale);
	


	}
}