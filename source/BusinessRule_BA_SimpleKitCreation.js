/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SimpleKitCreation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Simple Kit Creation * needs completed",
  "description" : "Place holder to get productno from PDP on creation of a simple kit",
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
var nProduct="88888";
var pProduct= node.createProduct(null, "Product_Kit");
pProduct.setName(nProduct+"S");
pProduct.getValue("PRODUCTNO").setSimpleValue(nProduct);

//master stock 
var pMasterStock = pProduct.createProduct(null, "MasterStock");
pMasterStock.getValue("MasterStock_SKU").setSimpleValue(nProduct+"M");
pMasterStock.setName(nProduct+"M");


//default SKU
var pSku = pMasterStock.createProduct(null, "SKU"); //SKU will live under MasterStock Item for Simple Kit
pSku.setName(nProduct+"S");
pSku.getValue("ItemCode").setSimpleValue("S");
pSku.getValue("Item_SKU").setSimpleValue(nProduct+"S");
						
//revision
var pRevision = pProduct.createProduct(null, "Kit_Revision");  


pRevision.getValue("REVISIONNO").setSimpleValue("1");
pRevision.setName(nProduct+"_rev1");

//create revision to MasterStock
pRevision.createReference(pMasterStock, "ProductRevision_To_MasterStock");
}