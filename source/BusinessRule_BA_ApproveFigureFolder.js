/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveFigureFolder",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_ApproveFigureFolder",
  "description" : "Used in webUI for the button \"Approve\" for change FF status from \"Changed needed\" to \"Approved\"",
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,web) {
var businessRule = "Business Rule: BA_ApproveFigureFolder";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

if (node.getValue("Figure_Status").getSimpleValue() == "Change Needed"){
    node.getValue("Figure_Status").setSimpleValue("Approved");
    log.info(node.getName()+" Figure Folder approved. ");
    web.showAlert("ACKNOWLEDGMENT", "Figure Folder approved.", "Status of the Figure Folder " + node.getName()+ " was changed to Approved. ");		
}
}