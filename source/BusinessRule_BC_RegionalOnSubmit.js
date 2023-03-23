/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_RegionalOnSubmit",
  "type" : "BusinessCondition",
  "setupGroups" : [ "NewCondition" ],
  "name" : "BC_RegionalOnSubmit",
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
var workflowType = node.getValue("Workflow_Type").getSimpleValue()
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue()

var countryCodeList=[]
var CLPName = ""
var futureName = ""
var rationaleName = ""
var fRationaleName = ""

setCountryVariables()

var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"))
if (workflowType == "M"  ) {
	var violations = ""
	for (var j=0;j<countryCodeList.length;j++){		
		var countryCode=countryCodeList[j]
		if (countryCode == "EU"||countryCode == "DE"||countryCode == "UK"){
			CLPName = countryCode + "_CLP";
           	futureName = countryCode + "_Future_CLP";
          	rationaleName = countryCode + "_CLP_Rationale";
            	fRationaleName = countryCode + "_Future_CLP_Rationale";
		}
		
		var msRef = node.queryReferences(revToMS) //STEP-6396
		var msRefExist = false; //STEP-6396
		msRef.forEach(function(ref) {	//STEP-6396
			var skus = ref.getTarget().getChildren() //STEP-6396
			msRefExist = true; //STEP-6396
			for (var i = 0; i < skus.size(); i++) {
				var sku = skus.get(i)
				var CLP = sku.getValue(CLPName).getSimpleValue() ? sku.getValue(CLPName).getSimpleValue() : ""
			 	var future = sku.getValue(futureName).getSimpleValue() ? sku.getValue(futureName).getSimpleValue() : ""
			 	var rationale = sku.getValue(rationaleName).getSimpleValue() ? sku.getValue(rationaleName).getSimpleValue() : ""
				var fRationale = sku.getValue(fRationaleName).getSimpleValue() ? sku.getValue(fRationaleName).getSimpleValue() : ""

			 	//OLD prices
			 	var priceOld = getValueFromString(pricesTmp, sku.getName()+"-"+countryCode)
				var oldCLPPrice = priceOld[0]
				var oldCLPFutPrice = priceOld[1]

				if (oldCLPPrice != CLP) {							
					if (!rationale) {
						violations = violations + CLPName +" "+ oldCLPPrice + " --> " + CLP + " at sku = "+sku.getName() +" sku no:" + i + "\n";
					}
				}
				if (oldCLPFutPrice != future) {
					if (!fRationale) {
						violations = violations + futureName +" " + oldCLPFutPrice + " --> " + future + " at sku = "+sku.getName() +" sku no:" + i + "\n";
					}
				}
			}
			return true; //STEP-6396
		});
		//STEP-6396
		if (!msRefExist) {
			log.info("[RETURN] SKUS empty")
			return true;
		}
		//STEP-6396			
	}
	if (violations.length == 0) {
		log.info("[RETURN] No violations")
		return true;
	} else {
		log.info("[RETURN] violations exists")
		return "\n" + "Prices were changed without corresponding rationales : " + violations;
	}
} else {
	log.info("[RETURN] non maintenance")
	return false;
}

function getValueFromString(String, id) {
	var result = null
	var parse1 = pricesTmp.slice(1,pricesTmp.length-1)
	var parse2 = parse1.split(",")
	for (p in parse2) {
		var row = parse2[p].split("=")
		if (row[0].trim() == id.trim()) {
			var rowTrim = row[1].trim()
			result = rowTrim.split(";")
			result[0] = (result[0]=="null") ? "" : result[0]
			result[1] = (result[1]=="null") ? "" : result[1]
		}
	}
	return result
}

function setCountryVariables() {
	if (LibMaintenance.isChinaMaintenanceWokflow(wfInitiatedNo)) {
		wfInstance = node.getWorkflowInstanceByID("WF16_China_Maintenance_Workflow")
		CLPName ="China_CLP";
		futureName = "China_Future_CLP";
		rationaleName = "China_CLP_Rationale";
		fRationaleName = "China_Future_CLP_Rationale";
		countryCodeList.push("CN")
	
	} else if (LibMaintenance.isJapanMaintenanceWokflow(wfInitiatedNo)) {
		wfInstance = node.getWorkflowInstanceByID("WF16_Japan_Maintenance_Workflow")
		CLPName ="Japan_CLP";
		futureName = "Japan_Future_CLP";
		rationaleName = "Japan_CLP_Rationale";
		fRationaleName = "Japan_Future_CLP_Rationale";
		countryCodeList.push("JP")
	
	} else if (LibMaintenance.isEUMaintenanceWokflow(wfInitiatedNo)) {
		wfInstance = node.getWorkflowInstanceByID("WF16_EU_Maintenance_Workflow")
		countryCodeList.push("EU");
		countryCodeList.push("DE");
		countryCodeList.push("UK");
	}
}
}