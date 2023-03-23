/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Product_Status_Change_Date",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA Set Product Status Change Date",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  }, {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BL_ServerAPI,bl_library) {
logger.info("===========Start of BA_Set_Product_Status_Change_Date =================");

var prodStatusFrom = node.getValue("Product_Status").getSimpleValue();
var prodStatusNew = null;
var parent = node.getParent();

if (prodStatusFrom.equals("Abandoned")) {
    prodStatusNew = node.getValue("PSC_Abandoned").getSimpleValue();
} else if (prodStatusFrom.equals("Discontinued")) {
    prodStatusNew = node.getValue("PSC_Discontinued").getSimpleValue();
//    updateDate(prodStatusNew);
} else if (prodStatusFrom.equals("Internal Use Only")) {
    prodStatusNew = node.getValue("PSC_InternalUseOnly").getSimpleValue();
} else if (prodStatusFrom.equals("Pending")) {
    prodStatusNew = node.getValue("PSC_Pending").getSimpleValue();
} else if (prodStatusFrom.equals("Pre-discontinued")) {
    prodStatusNew = node.getValue("PSC_Pre-discontinued").getSimpleValue();
} else if (prodStatusFrom.equals("Released")) {
    prodStatusNew = node.getValue("PSC_Released").getSimpleValue();
} else if (prodStatusFrom.equals("Released - On Hold")) {
    prodStatusNew = node.getValue("PSC_ReleasedOnHold").getSimpleValue();
}

bl_library.updateHistoryAttribute(parent, prodStatusFrom, prodStatusNew);

if (prodStatusNew == "Pending" || prodStatusNew == "Pre-discontinued" || prodStatusNew == "Discontinued") {	
	parent.getValue("PLANNEDDISCONTINUATIONDATE").setSimpleValue(node.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue());
}
}