/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TC_EXIT",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TC_EXIT",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revToMS",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,manager,revToMS,bl_library) {
/*var workflowType=node.getValue("Workflow_Type").getSimpleValue()
if (workflowType == "M") {
	      var wfInstance = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
	      var msRef = node.getReferences(revToMS)
	      if (msRef && msRef.size()>0) {
		          var violations = "";
		          var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"))
		          var rationalesTmp = String(wfInstance.getSimpleVariable("MaintenanceRationalesTmp"))
		          var MSTmp = String(wfInstance.getSimpleVariable("MaintenanceMasterStock"))
		          var skus = msRef.get(0).getTarget().getChildren()
		          for (var i = 0; i < skus.size(); i++) {
			              var sku = skus.get(i)
			              var skuName = sku.getName();
//			              getKeyValuePairs(MSTmp, skuName)
			              var price = String(sku.getValue("PRICE").getSimpleValue())
			              var rationale = sku.getValue("Global_Base_Price_Rationale").getSimpleValue()
			              var priceOld = getValueFromString(pricesTmp, skuName)
			              log.info(priceOld +" - "+ price +" - "+skuName)
			              log.info(rationale)
			              if (priceOld != price) {
			                  if (!rationale) {
			                      violations = violations + priceOld + " --> " + price + " at sku " + skuName + "\n"
			                  }
			              }
		        	}
			     if (violations.length == 0) {
//			         return true
			      } else {
//			          return "\n" + "Prices were changed without corresponding rationales : " + violations
			      }
	      } else {
//	          return true
	      }
} else {
//      return true
}

function getValueFromString(String, id) {
	var result = null
	var parse1 = pricesTmp.slice(1,pricesTmp.length-1)
	var parse2 = parse1.split(",")
	for (p in parse2) {
		var row = parse2[p].split("=")
		if (row[0].trim() == id.trim()) {
			result = row[1].trim()
		}
	}
	return result
}

function getKeyValuePairs(MSTmp, skuName) {
	for (var i = 0; i < MSTmp.length; i++) {
		log.info(MSTmp[i])
	}
}*/

//var emailto="ProdTeam04@cellsignal.com;gkasof@cellsignal.com";

var emailto="ProdTeam04@cellsignal.com;";
if (emailto){
var strlen=emailto.length
var lastidxlen=emailto.lastIndexOf(";")

log.info(strlen);
log.info(lastidxlen);

var delim=""

if ((strlen-1) == (lastidxlen)){
	delim=""
	}else{
		delim=";"
		}

		emailto = emailto+delim+"pmlt.cellsignal.com"

		log.info(emailto)
}

}