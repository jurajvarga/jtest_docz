/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetFigureFolderStatus",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_SetFigureFolderStatus",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "ProductImage", "Product_DataSheet" ],
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
if (node.getValue("FigureDatasheetNotes").getSimpleValue() != null){

	var parentList=node.getClassifications().toArray();
	var ff = parentList[0];
	if (ff.getValue("Figure_Status").getSimpleValue() == "Change Needed"){
			web.showAlert("ACKNOWLEDGMENT", "Figure Folder Status", "Status of the Figure Folder " + ff.getName()+ " remains Change Needed. ");		
		
	}else {
			ff.getValue("Figure_Status").setSimpleValue("Change Needed");
			log.info(ff.getName()+" Figure Folder Status changed to Status - Change Needed. ");
			web.showAlert("ACKNOWLEDGMENT", "Figure Folder Status changed.", "Status of the Figure Folder " + ff.getName()+ " was changed to Change Needed. ");		
	}
}
}