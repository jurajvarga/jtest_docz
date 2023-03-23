/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetProductStatus",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_SetProductStatus",
  "description" : "WebUi Bulk Update rule to change product status",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "alias" : "Product_Status_Change_To",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Product_Status_Change_To</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Product_Status_Change_To</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
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
    "alias" : "Product_Status_Change_Reason",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Product_Status_Change_Reason</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Product_Status_Change_Reason</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Product_Change_Notes",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Product_Change_Notes</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">3. Product_Change_Notes</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Alternate_Product_No",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Alternate_Product_No</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">4. Alternate_Product_No</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "SFDC_Number",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">SFDC_Number</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">5. SFDC_Number</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (Product_Status_Change_To,node,step,Product_Status_Change_Reason,Product_Change_Notes,Alternate_Product_No,SFDC_Number,Lib) {
if (node.isInWorkflow("Product_Status_Change_Workflow")== false){
	//please change the attribute ID to PRODUCTSTATUS
	//node.getValue("Product_Status_Change_To").setSimpleValue(Product_Status_Change_To);
//	node.getValue("Product_Status_Change_Reason").setSimpleValue(Product_Status_Change_Reason);
//	node.getValue("Product_Change_Notes").setSimpleValue(Product_Change_Notes);
//	node.getValue("Alternate_Product_No").setSimpleValue(Alternate_Product_No);
//	node.getValue("SFDC_Number").setSimpleValue(SFDC_Number);	
	node.getValue("Product_Status").setSimpleValue(Product_Status_Change_To);	
	var Product_Status = Product_Status_Change_To;
	var user = step.getCurrentUser().getName();
	var trigger =  "Product status changed to ["+Product_Status+"] by " + user;
	var instance = node.startWorkflowByID("Product_Status_Change_Workflow", trigger);

	//add more condiction to match the WF states
	if (Product_Status=="Obsolete"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}else if (Product_Status=="Pre-discontinued"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.PreDiscontinuation", trigger);
	}else if (Product_Status=="Pending"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Pending", trigger);
	}else if (Product_Status=="Internal Use Only"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}else if (Product_Status=="Released"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Released", trigger);
	}else if (Product_Status=="Released - On Hold"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.ReleaseOnHold", trigger);
	}else if (Product_Status=="Abandonded"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}else if (Product_Status=="Commercialized"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}else if (Product_Status=="Development"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}else if (Product_Status=="Discontinued"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Pending", trigger);
	}else if (Product_Status=="Tech Transfer"){
		Lib.Trigger(instance,"Product_Status_Change","stibo.Other", trigger);
	}

	instance.setSimpleVariable("Product_Status_Change_Reason", Product_Status_Change_Reason);
	instance.setSimpleVariable("Product_Change_Notes", Product_Change_Notes);
	instance.setSimpleVariable("Alternate_Product_No", Alternate_Product_No);
	instance.setSimpleVariable("SFDC_Number", SFDC_Number);
}
}