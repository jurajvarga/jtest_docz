/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_UpdateFigureFolderName",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_UpdateFigureFolderName",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "assetLib"
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
exports.operation0 = function (node,manager,assetLib) {
var imageStatus = getNumImageStatus(node);
assetLib.updateFigureFolderName(node, imageStatus.objs[0], manager)

function getNumImageStatus(node) {
    var assets = node.getAssets();
    var assetsItr = assets.iterator();
    var cnt = 0;
    var objs = [];

    while (assetsItr.hasNext()) {
        var asset = assetsItr.next();
        var assetObjType = asset.getObjectType().getID();

        if (assetObjType.equals("ProductImage") || assetObjType.equals("Product_DataSheet")) {
            var imageStatus = asset.getValue("Image_Status").getSimpleValue();
            if (imageStatus != null && imageStatus.equals("Active")) {
                cnt++;
                objs.push(asset);
            }
        }
    }

    return { cnt: cnt, objs: objs };
}
}