/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalPriceAttrChange",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_RegionalPriceAttrChange",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintenance"
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revToMS",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "RegionalRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,revToMS,LibMaintenance) {
var wfInstance = null
var workflowType=node.getValue("Workflow_Type").getSimpleValue();
var wfInitiatedNo=node.getValue("Workflow_No_Initiated").getSimpleValue();

var countryCodeList = []
var CLPName = "";
var futureName = "";
var rationaleName = "";
var fRationaleName = "";

var pricesMap = new java.util.HashMap();
var rationalesMap = new java.util.HashMap();

setCountryVariables()

if (workflowType == "M"  ) {
	for (var j=0;j<countryCodeList.length;j++){
		var countryCode=countryCodeList[j]
		if (countryCode == "EU"||countryCode == "DE"||countryCode == "UK"){
			CLPName = countryCode + "_CLP"
           	futureName = countryCode + "_Future_CLP"
          	rationaleName = countryCode + "_CLP_Rationale"
            	fRationaleName = countryCode + "_Future_CLP_Rationale"
		}
		var msRef = node.queryReferences(revToMS) //STEP-6396
		msRef.forEach(function(ref) { //STEP-6396
				var violations = "";
				var skus = ref.getTarget().getChildren() //STEP-6396
				for (var i = 0; i < skus.size(); i++) {
						var sku = skus.get(i)
						sku.getValue(rationaleName).setSimpleValue("");
						sku.getValue(fRationaleName).setSimpleValue("");
						var CLP = sku.getValue(CLPName).getSimpleValue();
			 			var future = sku.getValue(futureName).getSimpleValue();
						pricesMap.put(sku.getName()+"-"+countryCode,CLP +";"+ future);
			}
			return true; //STEP-6396
		});
	}
	log.info("==> pricesMap " + pricesMap);
	wfInstance.setSimpleVariable("MaintenancePricesTmp",pricesMap);
}


function setCountryVariables() {
	if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)){
		wfInstance = node.getWorkflowInstanceByID("WF16_China_Maintenance_Workflow")
		CLPName ="China_CLP";
		futureName = "China_Future_CLP";
		rationaleName = "China_CLP_Rationale";
		fRationaleName = "China_Future_CLP_Rationale";
		countryCodeList.push("CN")
	} else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)){
		wfInstance = node.getWorkflowInstanceByID("WF16_Japan_Maintenance_Workflow")
		CLPName ="Japan_CLP";
		futureName = "Japan_Future_CLP";
		rationaleName = "Japan_CLP_Rationale";
		fRationaleName = "Japan_Future_CLP_Rationale";
		countryCodeList.push("JP")
	} else if (LibMaintenance.isEUMaintenanceWokflow(wfInitiatedNo)){
		wfInstance = node.getWorkflowInstanceByID("WF16_EU_Maintenance_Workflow")
		countryCodeList.push("EU");
		countryCodeList.push("DE");
		countryCodeList.push("UK");
	}
}
}