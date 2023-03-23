/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateRevisionMasterItemForNonLot",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Create Product Revision Master Stock For Non Lot Product",
  "description" : "Creates Product Revision and Masterstocks for Non lot Product",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib) {
var bKit=false;
if (node.getObjectType().getID()=="Product_Kit")
	bKit=true;

var nProduct =node.getValue("PRODUCTNO").getSimpleValue();
//STEP-5957
var pRevision =Lib.getLatestApprovedRevision(node);
var nRevision=1;
if(pRevision){
	nRevision = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue())+1;
}


//#1 create REV
pRevision=null;
if (bKit) {
	pRevision = node.createProduct(null, "Kit_Revision");
	//set Product # and Revision #
	pRevision.getValue("KITITEMNO").setSimpleValue(nProduct);
} else {
	pRevision = node.createProduct(null, "Product_Revision");
	//set Product # and Revision #
	pRevision.getValue("PRODUCTNO").setSimpleValue(nProduct);
}
pRevision.getValue("REVISIONNO").setSimpleValue(nRevision);
pRevision.setName(nProduct + "_rev" + nRevision);
//
// "Product_To_Revision" support Webui 
//
node.createReference(pRevision, "Product_To_Revision");
log.info("pRevision " + pRevision)

//#2 create Master Stock
var pMasterStock = node.createProduct(null, "MasterStock");
pMasterStock.getValue("PRODUCTNO").setSimpleValue(nProduct);
log.info("pMasterStock " + pMasterStock)
//set Master Stock #
//pMasterStock.getValue("MasterStock_SKU").setSimpleValue(nMasterStock);
//var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
//pMasterStock.setName(nMasterStock);

var refType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
var refs = pRevision.getProductReferences().get(refType);
if (refs.size() == 0)
	pRevision.createReference(pMasterStock, "ProductRevision_To_MasterStock");
//
// "Product_To_MasterStock" support Webui 
//
node.createReference(pMasterStock, "Product_To_MasterStock");
}