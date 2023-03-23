/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Content_Review_Store_WF_Variables",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_Content_Review_Store_WF_Variables",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
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
// Store attribute IDs and Values from an attribute group to a String
var wfInstance = node.getWorkflowInstanceByID("WF6_Content_Review_Workflow");

var attGroup = manager.getAttributeGroupHome().getAttributeGroupByID("WebUI_Content_Review");
var tempWebUIContentReview = "";

if (attGroup) {
    var attributes = attGroup.getAttributes().iterator();

    while (attributes.hasNext()) {
        
        var attribute = attributes.next();

        var attID = attribute.getID();
        //log.info("attID: " + attID);
        var attVal;
        if (attribute.isMultiValued()) {
            attVal = BL_Library.storeMultiValueInString(node.getValue(attID))
        } else {
            attVal = node.getValue(attID).getSimpleValue()
        }
        if (!attVal) {
            attVal = "NULL"
        }
        //log.info("attVal: " + attVal);

        tempWebUIContentReview += attID + "=" + attVal

        if (attributes.hasNext()) {
            tempWebUIContentReview += "<attributesep/>"
        }
    }
}

//log.info(tempWebUIContentReview);

wfInstance.setSimpleVariable("tempWebUIContentReview", tempWebUIContentReview);
log.info("Workflow variable 'tempWebUIContentReview' has been stored. Value is:" + "\n" + String(wfInstance.getSimpleVariable("tempWebUIContentReview")));
}