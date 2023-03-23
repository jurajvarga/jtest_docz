/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PrepareSKUsForRegEmail",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_PrepareSKUsForRegEmail",
  "description" : "run for existing WIP revisions to update SKUs for regional emails",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_Library) {
// use this BR only for WIP revisions and Regional Revisions in progress
var wfType = node.getValue("Workflow_Type").getSimpleValue();
var objType = node.getObjectType().getID();

if (wfType == "M") {
    var sellInChina = node.getValue("Sell_in_China_?").getSimpleValue();
    var sellInJapan = node.getValue("Sell_in_Japan_?").getSimpleValue();

    if (objType == "Regional_Revision") {
        // Regional Revision
        var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
        var msRef = node.getReferences(revToMS);

        if (msRef && msRef.size() > 0) {

            var skus = msRef.get(0).getTarget().getChildren();
            for (var i = 0; i < skus.size(); i++) {

                var sku = skus.get(i);
                var approvedSku = BL_Library.getApprovedNode(manager, sku);

                if (!approvedSku) {
                    // new sku

                    if (!sellInChina || sellInChina == "Y") {
				    // STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                    }
                    if (!sellInJapan || sellInJapan == "Y") {
				    // STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                    }
				    // STEP-6280 Rename SKU email flags for regional emails
                    sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
                } else {
                    // existing sku

                    // china
                    var chinaCLP = sku.getValue("China_CLP").getSimpleValue();
                    var apprChinaCLP = approvedSku.getValue("China_CLP").getSimpleValue();

                    if (chinaCLP != apprChinaCLP && (!sellInChina || sellInChina == "Y")) {
				    // STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                    }

                    //japan
                    var japanCLP = sku.getValue("Japan_CLP").getSimpleValue();
                    var apprJapanCLP = approvedSku.getValue("Japan_CLP").getSimpleValue();

                    if (japanCLP != apprJapanCLP && (!sellInJapan || sellInJapan == "Y")) {
					// STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                    }

                    //eu
                    var euRegions = ["UK", "DE", "EU"];

                    for (var j = 0; j < euRegions.length; j++) {
                        var region = euRegions[j];
                        var euPrice = sku.getValue(region + "_CLP").getSimpleValue();
                        var apprEUPrice = approvedSku.getValue(region + "_CLP").getSimpleValue();

                        if (euPrice != apprEUPrice) {
					   // STEP-6280 Rename SKU email flags for regional emails
                            sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
                            break;
                        }
                    }
                }
                /*
				// STEP-6280 Rename SKU email flags for regional emails
                log.info(sku.getName() + " email flags : CN - " + sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue() +
                    ", JP - " + sku.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue() + ", EU - " +
                    sku.getValue("US_to_EU_Email_Sent_YN").getSimpleValue());
                    */
            }
        }

    } else {
        // Product/Kit/Equipment Revision
        var revToMS = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
        var msRef = node.getReferences(revToMS);

        if (msRef && msRef.size() > 0) {

            var skus = msRef.get(0).getTarget().getChildren();
            for (var i = 0; i < skus.size(); i++) {
                var sku = skus.get(i);
                var approvedSku = BL_Library.getApprovedNode(manager, sku);

                if (!approvedSku) {
                    // new sku

                    if (!sellInChina || sellInChina == "Y") {
					// STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                    }
                    if (!sellInJapan || sellInJapan == "Y") {
					// STEP-6280 Rename SKU email flags for regional emails
                        sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                    }
				// STEP-6280 Rename SKU email flags for regional emails
                    sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");
                } else {
                    // existing sku
                    var comparedAttributes = ["ITEMACTIVE_YN", "PUBLISH_YN", "PRICE"];

                    for (var j = 0; j < comparedAttributes.length; j++) {
                        var attr = comparedAttributes[j];

                        var attVal = sku.getValue(attr).getSimpleValue();
                        var approvedAttVal = approvedSku.getValue(attr).getSimpleValue();

                        if (attVal != approvedAttVal) {
                            if (!sellInChina || sellInChina == "Y") {
						// STEP-6280 Rename SKU email flags for regional emails
                                sku.getValue("US_to_China_Email_Sent_YN").setSimpleValue("N");
                            }
                            if (!sellInJapan || sellInJapan == "Y") {
						// STEP-6280 Rename SKU email flags for regional emails
                                sku.getValue("US_to_Japan_Email_Sent_YN").setSimpleValue("N");
                            }
						// STEP-6280 Rename SKU email flags for regional emails
                            sku.getValue("US_to_EU_Email_Sent_YN").setSimpleValue("N");

                            break;
                        }
                    }
                }
                /*
			 // STEP-6280 Rename SKU email flags for regional emails
                log.info(sku.getName() + " email flags : CN - " + sku.getValue("US_to_China_Email_Sent_YN").getSimpleValue() +
                    ", JP - " + sku.getValue("US_to_Japan_Email_Sent_YN").getSimpleValue() + ", EU - " +
                    sku.getValue("US_to_EU_Email_Sent_YN").getSimpleValue());
                    */
            }
        }
    }
}
}