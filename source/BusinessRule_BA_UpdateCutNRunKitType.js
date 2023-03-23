/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_UpdateCutNRunKitType",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_UpdateCutNRunKitType",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Digital_Asset_Metadata", "Equipment", "Equipment_Revision", "Figure_Folder", "Kit_Revision", "Lot", "NonLot", "Product", "Product_Kit", "Product_Rev_Folder", "Product_Revision", "Service_Conjugates", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var objectType = node.getObjectType().getID();
var approvalStatus = node.getApprovalStatus();
//log.info(approvalStatus);

// get attribute ID for Product Type corresponding to current object type
var attributeID;

if (objectType == 'Figure_Folder' || objectType == 'Product_Rev_Folder') {
    attributeID = 'Figure_Folder_Product_Type';
} else {
    attributeID = 'PRODUCTTYPE'
}

// check and update Product Type (and approve object)
var productType = node.getValue(attributeID).getSimpleValue();
//log.info(attributeID + " before: " + productType);

if (productType == "CUT&RUN KIT") {
    node.getValue(attributeID).setSimpleValue("CUT&RUN Kit");

    if (approvalStatus == "Completely Approved") {
        node.approve();
    }
}

//log.info(attributeID + " after: " + node.getValue(attributeID).getSimpleValue());
}