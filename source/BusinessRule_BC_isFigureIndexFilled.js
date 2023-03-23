/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_isFigureIndexFilled",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Conditions" ],
  "name" : "BC_isFigureIndexFilled",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
var pubProdImagesRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");

if (pubProdImagesRefType != null) {
     
     //STEP-6396
     var pubImgLinks = node.queryReferences(pubProdImagesRefType);
     pubImgLinks.forEach(function(ref) {
     
          var aImageTarget = ref.getTarget();
          if (!aImageTarget.getValue("Figure_Display_Index").getSimpleValue()) {
          	return "Please, fill in missing figure indexes."
          }
          return true;
     });
     //STEP-6396
}

return true;
}