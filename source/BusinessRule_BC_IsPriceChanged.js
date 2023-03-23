/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_IsPriceChanged",
  "type" : "BusinessCondition",
  "setupGroups" : [ "NewCondition" ],
  "name" : "BC_IsPriceChanged",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "ProdToSku",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "Product_To_SKU",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wf,ProdToSku,logger,LibMaintenance) {
var wfInstance = node.getWorkflowInstance(wf);
var workflowType=node.getValue("Workflow_Type").getSimpleValue();

var wfInitiatedNo=node.getValue("Workflow_No_Initiated").getSimpleValue();

logger.info(" ===> isPriceChanged")

var pricesMap=new java.util.HashMap();
var rationalesMap=new java.util.HashMap();

countryCodeList = []

var CLPName = "";
var futureName = "";

var pricesMap=new java.util.HashMap();
var rationalesMap=new java.util.HashMap();

if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)){
	CLPName ="China_CLP";
	futureName = "China_Future_CLP";
	countryCodeList.push("CN")

}else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)){
	CLPName ="Japan_CLP";
	futureName = "Japan_Future_CLP";
	countryCodeList.push("JP")	

}else if (LibMaintenance.isEUMaintenanceWokflow(wfInitiatedNo)){
	CLPName ="_CLP";
	futureName = "_Future_CLP";
	countryCodeList.push("EU");
	countryCodeList.push("DE");
	countryCodeList.push("UK");
}
	
log.info("countryCodeList "+countryCodeList);
logger.info(" ===> isPriceChanged")

if (workflowType == "M"  ) {
	for (var j=0;j<countryCodeList.length;j++){
		var countryCode=countryCodeList[j];		
		if (countryCode == "EU"||countryCode == "DE"||countryCode == "UK"){
			CLPName ="_CLP";
			futureName = "_Future_CLP";	
			CLPName =countryCode+CLPName;
			futureName =countryCode+ futureName;
		}
		var parent = node.getParent();
		//STEP-6396
		var skuRef = parent.queryReferences(ProdToSku);
		skuRef.forEach(function(ref) {
			var sku = ref.getTarget();
			var skuName =sku.getName(); 
			var CLP = sku.getValue(CLPName).getSimpleValue();
		 	var future = sku.getValue(futureName).getSimpleValue();
		 	var pricekey=skuName+"-"+countryCode;
		 	var result = CLP +";"+ future;
			log.info(" result "+result);			
			pricesMap.put(pricekey,result);
			return true;
		});
		//STEP-6396
	}
	logger.info(" ===> "+String(pricesMap) != wfInstance.getSimpleVariable("MaintenancePricesTmp"))
	if (String(pricesMap) != wfInstance.getSimpleVariable("MaintenancePricesTmp")) {
		return true;	
	} else {
		return false;	
	}
	
}
else {
	return false;
}
}