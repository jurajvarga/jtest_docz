/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Store_Current_Regional_CLP",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA Store Current Regional CLP",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
var wfInstance = node.getWorkflowInstanceByID("WF5_Regional_Workflow")

var tempRegionalPrices = "";

var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
var msRef = node.queryReferences(revToMS) //STEP-6396
msRef.forEach(function(ref) {//STEP-6396

    var skus = ref.getTarget().getChildren() //STEP-6396
    for (var i = 0; i < skus.size(); i++) {
        var sku = skus.get(i)

        var skuName = sku.getName();

        tempRegionalPrices += skuName + ":"

        var listCLPs = ["DE_CLP", "UK_CLP", "EU_CLP", "Japan_CLP", "China_CLP"]

        for (var j = 0; j < listCLPs.length; j++) {
            var clpAttrID = listCLPs[j];
            //log.info("clpAttrID: " + clpAttrID);

            var clpVal = sku.getValue(clpAttrID).getSimpleValue();
            tempRegionalPrices += clpAttrID + "=" + clpVal;
            if (j != listCLPs.length - 1) {
                tempRegionalPrices += "<attributesep/>";
            }
        }

        if (i != skus.size() - 1) {
            tempRegionalPrices += "<skusep/>";
        }
    }
    return true; //STEP-6396
});

//log.info("==> tempRegionalPrices " + tempRegionalPrices);
wfInstance.setSimpleVariable("tempRegionalPrices", tempRegionalPrices);
}