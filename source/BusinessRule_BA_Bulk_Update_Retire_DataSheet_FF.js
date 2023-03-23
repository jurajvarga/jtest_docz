/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Bulk_Update_Retire_DataSheet_FF",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Bulk_Update_Retire_DataSheet_FF",
  "description" : "Retire datasheet figure folders for Monoclonal and Polyclonal Antibodies",
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Approve) {
var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
var refs = node.queryReferences(refType);

refs.forEach(function(ref) {
	var productFolder = ref.getTarget();

	if(productFolder){
		var figureFolders = productFolder.queryChildren();
		figureFolders.forEach(function(figureFolder) {
			if(figureFolder){
				var assets = figureFolder.getAssets();
				var assetsItr = assets.iterator();

				while (assetsItr.hasNext()) {
					var asset = assetsItr.next();
					
					if(asset){
						var objectType = asset.getObjectType().getID();
						if(objectType == "Product_DataSheet"){
							asset.getValue("Image_Status").setSimpleValue("Inactive");
							figureFolder.getValue("Figure_Status").setSimpleValue("Inactive");

							BA_Approve.execute(asset);
							BA_Approve.execute(figureFolder);
						}
					}
				}
			}
			return true;
		});
	}
	return true;
});
}