/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_MarketingPricingOnSubmit",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Maintenance" ],
  "name" : "BC_MarketingPricingOnSubmit",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,revToMS,manager) {
var workflowType = node.getValue("Workflow_Type").getSimpleValue()
if (workflowType == "M") {
    var wfInstance = node.getWorkflowInstanceByID("Marketing_Review_Workflow")
	//STEP-6396
    var msRef = node.queryReferences(revToMS)
    var msRefExist = false;
    var skus
    msRef.forEach(function(ref) {
        msRefExist = true;
        skus = ref.getTarget().getChildren()
        return false;
    });
	if (msRefExist) {
		var violations = "";
		var pricesTmp = String(wfInstance.getSimpleVariable("MaintenancePricesTmp"))
		var rationalesTmp = String(wfInstance.getSimpleVariable("MaintenanceRationalesTmp"))

        var priceChanged = false
		for (var i = 0; i < skus.size(); i++) {
			var sku = skus.get(i)
			var skuName = sku.getName();
			var price = String(sku.getValue("PRICE").getSimpleValue())
			var rationale = sku.getValue("Global_Base_Price_Rationale").getSimpleValue()
			var priceOld = getValueFromString(pricesTmp, skuName)
			priceOld = (priceOld == "null") ? "" : priceOld 
			price = (price == "null") ? "" : price 
			log.info(priceOld +" - "+ price +" - "+skuName)
			log.info(rationale)
			if (priceOld != price) {
                priceChanged = true
			    if (!rationale) {
			        violations = violations + priceOld + " --> " + price + " at sku " + skuName + "\n"
			    }
                //Set Global_Base_Price_History
                if (violations.length == 0 && priceChanged == true){
                    var d = new Date()
                    var parsedDate = d.getMonth()+1 + "-" + d.getDate() + "-" + d.getFullYear() + "#" + d.getHours() + ":" + d.getMinutes()    
                    var priceValues = "GBP: "+priceOld+" - " + price;
                    var history = parsedDate + "; " + manager.getCurrentUser().getID() + "; " + priceValues + "; " + rationale
                                    
                    var oldHistory = sku.getValue("Global_Base_Price_History").getSimpleValue();
                    if(oldHistory){
                        var historyResult = history ? history + "\n" + oldHistory : oldHistory
                    }else {
                        var historyResult = history;
                    }					
                                    
                    log.info(" historyResult \n" + historyResult)
                    if (historyResult.length > 1023) {
                        var strTmp = historyResult.split("\n")
                        strTmp.splice(-2,2)
                        historyResult = strTmp.join("\n")
                    }
                    sku.getValue("Global_Base_Price_History").setSimpleValue(historyResult);
                }	 		
            }
        }
        /*STEP-5820
	    if (violations.length == 0 && priceChanged == true){
	        //set send email to N
	        node.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");
        }*/
		if (violations.length == 0) {
			return true
		} else {
			return "\n" + "Prices were changed without corresponding rationales : " + violations
		}

 

	} else {
	    return true
	}
     //STEP-6396  
} else {
    return true
}

// STEP-6326 fixing for loop
function getValueFromString(pricesTmp, id) {
    //log.info("pricesTmp: " + pricesTmp);
    var result = null
    var parse1 = pricesTmp.slice(1, pricesTmp.length - 1)
    //log.info("parse1: " + parse1)
    var parse2 = parse1.split(",")
    //log.info("parse2: " + parse2)
    for (var j = 0; j < parse2.length; j++) {
        var row = parse2[j].split("=")
        //log.info("row: " + row);
        if (row[0].trim() == id.trim()) {
            result = row[1].trim()
        }
    }
    return result
}
}