/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Price_Change",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Price_Change",
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
    "alias" : "Future_Global_Base_Price",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Future_Global_Base_Price</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Future Global Base Price</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
    "alias" : "Future_Global_Base_Price_Date",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Future_Global_Base_Price_Date</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Future Global Base Price Date</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Future_Global_Base_Price_Rationale",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Future_Global_Base_Price_Rationale</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">3. Future Global Base Price Rationale</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (Future_Global_Base_Price,node,step,Future_Global_Base_Price_Date,Future_Global_Base_Price_Rationale,Lib) {
if (node.isInWorkflow("Price_Change_Workflow_MVP2")== false){
	
	var user = step.getCurrentUser().getName();
	var trigger =  "Price Change to ["+Future_Global_Base_Price+"] by " + user;
	var instance = node.startWorkflowByID("Price_Change_Workflow_MVP2", trigger);

	node.getValue("Future_Global_Base_Price").setSimpleValue(Future_Global_Base_Price);
	node.getValue("Future_Global_Base_Price_Date").setSimpleValue(Future_Global_Base_Price_Date);
	node.getValue("Future_Global_Base_Price_Rationale").setSimpleValue(Future_Global_Base_Price_Rationale);
}

// remove MVP2 later
//Price_Change_Workflow_MVP2

 //if 	(node.isInWorkflow("Price_Change_Workflow")== false){
 //	var user = step.getCurrentUser().getName();
	//var trigger =  "Price Change to ["+Future_Global_Base_Price+"] by " + user;
	//var instance = node.startWorkflowByID("Price_Change_Workflow", trigger);

	//node.getValue("Future_Global_Base_Price").setSimpleValue(Future_Global_Base_Price);
	//node.getValue("Future_Global_Base_Price_Date").setSimpleValue(Future_Global_Base_Price_Date);
	//node.getValue("Future_Global_Base_Price_Rationale").setSimpleValue(Future_Global_Base_Price_Rationale); 
//	}
}