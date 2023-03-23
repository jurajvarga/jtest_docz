/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Price_Change_China",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Price_Change_China",
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
    "alias" : "China_Future_CLP",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">China_Future_CLP</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Future CLP</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
    "alias" : "China_Future_CLP_Date",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">China_Future_CLP_Date</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Future CLP Date</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "China_Future_CLP_Rationale",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">China_Future_CLP_Rationale</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">3. Future CLP Rationale</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (China_Future_CLP,node,step,China_Future_CLP_Date,China_Future_CLP_Rationale,Lib) {
if (node.isInWorkflow("China_Price_Change_Workflow")== false){
	
	var user = step.getCurrentUser().getName();
	var trigger =  "Price Change to ["+China_Future_CLP+"] by " + user;
	var instance = node.startWorkflowByID("China_Price_Change_Workflow", trigger);

	node.getValue("China_Future_CLP").setSimpleValue(China_Future_CLP);
	node.getValue("China_Future_CLP_Date").setSimpleValue(China_Future_CLP_Date);
	node.getValue("China_Future_CLP_Rationale").setSimpleValue(China_Future_CLP_Rationale);
	


	}
}