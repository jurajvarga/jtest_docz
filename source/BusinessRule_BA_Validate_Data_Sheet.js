/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Validate_Data_Sheet",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Validate_Data_Sheet",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui) {
var ot = node.getObjectType().getID();
if (ot.equals("Figure_Folder")){
	var kids = node.getAssets();
	var kidsItr = kids.iterator();

	while (kidsItr.hasNext()){
		var kid = kidsItr.next();
		var kot = kid.getObjectType().getID();
		log.info(kid.getName());
		if (kot.equals("ProductImage") && kid.getValue("Image_Status").getSimpleValue() == "Active"){
		 webui.showAlert("ERROR", "PAG_Review_Workflow", "Can not exit PAG workflow, if there is an active image for a datasheet folder.");	
		}
	}		
}
}