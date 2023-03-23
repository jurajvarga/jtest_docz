/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_StoreSKUsActiveFlagAndPublishItem",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_StoreSKUsActiveFlagAndPublishItem",
  "description" : "to store wf variable tempSKUAttributes",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
var wfInstance = node.getWorkflowInstanceByID("Production_Workflow");
var wfInstanceSupplyChain = node.getWorkflowInstanceByID("WF3B_Supply-Chain");

// there is a momment when the revision is in the both workflows
if (!wfInstance || (wfInstance && wfInstanceSupplyChain)) {
    wfInstance = wfInstanceSupplyChain;
}

var wfType = node.getValue("Workflow_Type").getSimpleValue();

if (wfType == "M") {
    var tempSKUAttributes = "";

    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var msRef = node.queryReferences(revToMS); //STEP-6396

    msRef.forEach(function(ref) {//STEP-6396

        var skus = ref.getTarget().getChildren();  //STEP-6396
        for (var i = 0; i < skus.size(); i++) {
            var sku = skus.get(i);
            var skuName = sku.getName();

            tempSKUAttributes += skuName + ":";

            var storedAttributes = ["ITEMACTIVE_YN", "PUBLISH_YN"]

            for (var j = 0; j < storedAttributes.length; j++) {
                var attrID = storedAttributes[j];
                //log.info("attrID: " + attrID);

                var attrVal = sku.getValue(attrID).getSimpleValue();
                tempSKUAttributes += attrID + "=" + attrVal;
                if (j != storedAttributes.length - 1) {
                    tempSKUAttributes += "<attributesep/>";
                }
            }

            if (i != skus.size() - 1) {
                tempSKUAttributes += "<skusep/>";
            }
        }
        return false; //STEP-6396
    });

    log.info("==> tempSKUAttributes " + tempSKUAttributes);
    wfInstance.setSimpleVariable("tempSKUAttributes", tempSKUAttributes);
}
}