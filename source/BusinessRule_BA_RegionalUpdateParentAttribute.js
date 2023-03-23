/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalUpdateParentAttribute",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_RegionalUpdateParentAttribute",
  "description" : "Copies DG values from Revision to it's parent",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintain"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCond",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baApproveProductObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductObjects",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveRevisionObjects",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveRevisionObjects",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busCond,baApproveProductObjects,logger,BA_ApproveRevisionObjects,LibMaintain,bl_library) {
var businessRule = "Business Rule: BA_RegionalUpdateParentAttribute ";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var product = node.getParent();
var wfInitiatedNo=node.getValue("Workflow_No_Initiated").getSimpleValue();
log.info(" wfInitiatedNo "+wfInitiatedNo);

var condResult=busCond.evaluate(node);
var isNewWorkflow=condResult.isAccepted();
log.info(" isNewWorkflow "+ isNewWorkflow);

if (LibMaintain.isChinaMaintenanceWokflow(wfInitiatedNo)){
	var varSellInChina = node.getValue("Sell_in_China_?").getSimpleValue();
/*
	var varTranspMode = node.getValue("Transportation_Mode").getSimpleValue();
	var varHazardsChemStorage = node.getValue("Hazards_Chemical_Storage").getSimpleValue();
	var varHazardsChemPermission = node.getValue("Hazards_Chemical_Permisssion").getSimpleValue();
	product.getValue("Hazards_Chemical_Storage").setSimpleValue(varHazardsChemStorage);
	product.getValue("Hazards_Chemical_Permisssion").setSimpleValue(varHazardsChemPermission);
	product.getValue("Transportation_Mode").setSimpleValue(varTranspMode);
*/
	product.getValue("Sell_in_China_?").setSimpleValue(varSellInChina);
	log.info('Values are' + varSellInChina  );
//	log.info('Values are' + varTranspMode + '-|-' + varHazardsChemStorage + '-|-' + varHazardsChemPermission + '-|-' + varSellInChina  );
}else if (LibMaintain.isJapanMaintenanceWokflow(wfInitiatedNo)){
	
	var varSellInJapan = node.getValue("Sell_in_Japan_?").getSimpleValue();
	product.getValue("Sell_in_Japan_?").setSimpleValue(varSellInJapan);
	log.info('Values are ' + varSellInJapan );

}else if (isNewWorkflow){
	var varSellInChina = node.getValue("Sell_in_China_?").getSimpleValue();
	var varSellInJapan = node.getValue("Sell_in_Japan_?").getSimpleValue();
	product.getValue("Sell_in_China_?").setSimpleValue(varSellInChina);
     product.getValue("Sell_in_Japan_?").setSimpleValue(varSellInJapan);
//	log.info('Values are' + varTranspMode + '-|-' + varSellInChina + '-|-' + varSellInJapan );
	log.info('Values are' + varSellInChina + '-|-' + varSellInJapan );
	
}

try	{
		//STEP-6465 Starts
          //baApproveProductObjects.execute(product);
          BA_ApproveRevisionObjects.execute(node);
		//STEP-6465 Ends
		
	 }
	 catch (e) {
	     if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
	         logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
	
	     } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
	         logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
	
	     } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
	         logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
	
	     } else {
	         logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
	         throw (e);
	     }
	 }
}