/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Primary_Image_URL",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_Set_Primary_Image_URL",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
var prodRev2FigFolderRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");

if (prodRev2FigFolderRefType != null) {
	var pubFigFolderLinks = node.queryReferences(prodRev2FigFolderRefType);  //STEP-6396	

     pubFigFolderLinks.forEach(function(ref) { //STEP-6396
     	var target = ref.getTarget();	 //STEP-6396	

     	if (target.getValue("Figure_Status").getSimpleValue() == "Approved"){

	          if (target.getValue("Figure_Display_Index").getSimpleValue() == 1) {
	          	//node.getParent().getValue("Primary_Image_URL").setSimpleValue("https://media.cellsignal.com/product/image/" + target.getName());
	           	
	           	var asss = target.getAssets();
				var asssItr = asss.iterator();
			
				while (asssItr.hasNext()) {
					var ass = asssItr.next();
					var aot = ass.getObjectType().getID();
	
					if (aot.equals("ProductImage")) {
						var is = ass.getValue("Image_Status").getSimpleValue();
	
						if (is != null && is.equals("Active")) {
							node.getParent().getValue("Primary_Image_URL").setSimpleValue("https://media.cellsignal.com/product/image/" + ass.getValue("Approved_Figure_Name").getSimpleValue());
							break;
						}
					}
				}
	          }
     	}
		return true;
	}); //STEP-6396
}
}