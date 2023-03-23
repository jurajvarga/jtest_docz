/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Update_Asset_Name_On_Import",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Update Asset Name On Import",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
// Figure/Datasheet Folder
var folder;

var parents = node.getClassifications().toArray();
if (parents.length > 0) {
	folder = parents[0];
}

var folderFigKey = folder.getValue("Figure_Key").getSimpleValue();
//log.info("folderFigKey: " + folderFigKey);

// Number of Figures/Datasheets
var assets = folder.getAssets();
log.info("Size of the fig folder with fig key " + folderFigKey + ": " + assets.size())

// Setting a name for a new Figure/Datasheet
var newAssetNo = assets.size();
var newAssetName = folderFigKey + "_" + newAssetNo;
node.setName(newAssetName);
log.info("New figure name: " + node.getName())

//STEP-6194
folder.getValue("Figure_Status").setSimpleValue("Change Needed");

//STEP-6258
var productFolder = folder.getParent();
productFolder.getValue("Figure_Status").setSimpleValue("Change Needed");
}