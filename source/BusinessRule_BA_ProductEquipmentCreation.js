/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProductEquipmentCreation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Product Equipment Creation * needs completed",
  "description" : "Place holder for the pull productno from PDP on Equipment Creation",
  "scope" : "Global",
  "validObjectTypes" : [ "Sub_Category" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
//using gateway to call Bommi and retrieve Product #
var nProduct="99999";
var pProduct= node.createProduct(null, "Product"); 
//Matt, I am not sure you are going to use Product or "Equipment Product" so just chanage the Object ID


pProduct.setName(nProduct+"S");
pProduct.getValue("PRODUCTNO").setSimpleValue(nProduct);


//default SKU
var pSku = pProduct.createProduct(null, "SKU");  //SKU lives under Product for Equipment.
pSku.setName(nProduct+"S");
pSku.getValue("ItemCode").setSimpleValue("S");
pSku.getValue("Item_SKU").setSimpleValue(nProduct+"S");
						
//revision
var pRevision = pProduct.createProduct(null, "Product_Revision");  
//Product Revision for Equipment
//once again, I am not sure you will use same Revision or not.


pRevision.getValue("REVISIONNO").setSimpleValue("1");
pRevision.setName(nProduct+"_rev1");

//create revision to MasterStock
//***Matt, either we create a seprate P2P reference or we add SKU to ProductRevision_To_MasterStock
//pRevision.createReference(pSku, "ProductRevision_To_MasterStock");
}