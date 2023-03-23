/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckSentToEbs",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_CheckSentToEbs",
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
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,revisionMasterStock) {
//STEP-6608
var skuData;
var instance;
if (node.isInWorkflow("WF3B_Supply-Chain")) {
    instance = node.getWorkflowInstanceByID("WF3B_Supply-Chain")
} else if (node.isInWorkflow("Production_Workflow")) {
    instance = node.getWorkflowInstanceByID("Production_Workflow")
}

skuData = instance.getSimpleVariable("skuData")
//log.info(" skuData "+skuData)
var passed = true;
var warnings = [];

if (skuData) {
    var skusData = skuData.split(",")
    var oldData = {}
    var newData = {}

    for (var i = 0; i < skusData.length; i++) {
        if (skusData[i].split(";")[1].split(":")[1] == "Y") {
            oldData[skusData[i].split(";")[0].split(":")[1]] = skusData[i].split(";")[2].split(":")[1]
        }
    }
    //log.info(" oldData "+oldData)
    /*for (key in oldData) {
    log.info(key +" = "+oldData[key]);
    }*/
    //STEP-6396	
    var masterStockReferences = node.queryReferences(revisionMasterStock)
    masterStockReferences.forEach(function (ref) {
        var masterStock = ref.getTarget();
        //STEP-6396		
        if (masterStock) {
            var usedSkus = masterStock.getChildren()
            for (var i = 0; i < usedSkus.size(); i++) {
                if (usedSkus.get(i).getValue("ITEM_SENT_TO_EBS").getSimpleValue() == "Y") {
                    newData[usedSkus.get(i).getValue("ItemCode").getSimpleValue()] = usedSkus.get(i).getValue("UOM_BASE").getSimpleValue()
                }
            }
            //log.info(" newData " + newData)
            for (key in newData) {
               // log.info(key + " = " + newData[key]);
                if (newData[key] != oldData[key]) {
                    warnings.push(key);
                }
            }           
            if (warnings.length > 0) {                
                return false;
            }
        }
        return true; //STEP-6396 
    });

}

//log.info(" warnings.length " + warnings.length)
if (warnings.length > 0) {    
    passed = false;
}
return passed;
}