/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetSkuForEmailOnActivePublishChange",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_SetSkuForEmailOnActivePublishChange",
  "description" : null,
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
var wfType = node.getValue("Workflow_Type").getSimpleValue();

// Only for maintenance
if (wfType == "M") {
    var wfInstance = node.getWorkflowInstanceByID("Production_Workflow");

    if (!wfInstance) {
        wfInstance = node.getWorkflowInstanceByID("WF3B_Supply-Chain");
    }

    var tempSKUAttributes = String(wfInstance.getSimpleVariable("tempSKUAttributes"));
    log.info("tempSKUAttributes: " + tempSKUAttributes);


    var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");

    //STEP-6396
    var msRef = node.queryReferences(revToMS)
    msRef.forEach(function(ref) {

        var skus = ref.getTarget().getChildren()
        for (var i = 0; i < skus.size(); i++) {
            var sku = skus.get(i)

            var skuName = sku.getName();

            var checkedAttributes = ["ITEMACTIVE_YN", "PUBLISH_YN"]

            for (var j = 0; j < checkedAttributes.length; j++) {
                var attID = checkedAttributes[j];
                var attVal = sku.getValue(attID).getSimpleValue();
                attVal = (attVal == null) ? "" : attVal;
                var oldAttVal = getStoredSKUAttributeValue(tempSKUAttributes, skuName, attID);
                oldAttVal = (oldAttVal == "null") ? "" : oldAttVal;

                if (attVal != oldAttVal) {
				// STEP-6280 Rename SKU email flags for regional emails
                    sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                    sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                    sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
                }

                log.info("SKU " + skuName + " : old " + attID + "=" + oldAttVal + ", current " + attID + "=" + attVal + ", change=" + (attVal != oldAttVal));
            }

		  // STEP-6280 Rename SKU email flags for regional emails
            var cnMail = sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue();
            var jpMail = sku.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue();
            var euMail = sku.getValue("US_to_EU_Email_Sent_YN").getSimpleValue();

            log.info("SKU " + skuName + " : US_to_China_Email_Sent_YN = " + cnMail + ", US_to_Japan_Email_Sent_YN = " + jpMail + ", US_to_EU_Email_Sent_YN = " + euMail);
        }
        return true;
    });
    //STEP-6396
}

//function getStoredSKURegPrice(str, skuName, attrID) {
function getStoredSKUAttributeValue(str, skuName, attrID) {

    var skuList = str.split("<skusep/>");
    for (var i = 0; i < skuList.length; i++) {
        var row = skuList[i];
        //log.info(i + "-th row: " + row);
        var storedSkuName = row.split(":")[0]
        var storedSkuAttributes = row.split(":")[1]
        if (skuName == storedSkuName) {
            skuAttrs = storedSkuAttributes.split("<attributesep/>");
            for (var j = 0; j < skuAttrs.length; j++) {
                var storedAttrID = skuAttrs[j].split("=")[0];
                //log.info(j + "-th attribute id and val: " + skuAttrs[j]);
                if (storedAttrID == attrID) {
                    return skuAttrs[j].split("=")[1];
                }
            }
        }
    }

    return "";
}
}