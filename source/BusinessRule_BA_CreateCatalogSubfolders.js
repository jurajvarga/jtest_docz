/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateCatalogSubfolders",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_CreateCatalogSubfolders",
  "description" : "When creating new catalog folder, subfolders get automatically create.  ",
  "scope" : "Global",
  "validObjectTypes" : [ "CatalogCustomer", "CatalogDistributorHub" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "gateway",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "CustomCatalogAttributesEndPoint",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,gateway) {
var sID = node.getID()+"_Products";
var cProducts = step.getClassificationHome().getClassificationByID(sID);
if (!cProducts){
	cProducts = node.createClassification(node.getID()+"_Products", "CatalogProducts");
	 cProducts.setName(node.getName() + " Products");
//	 cProducts.approve();
}

/*
sID = node.getID()+"_Assets";
var cAssets  = step.getClassificationHome().getClassificationByID(sID);
if (!cAssets){
	cAssets= node.createClassification(node.getID()+"_Assets", "CatalogAssets");
	cAssets.setName(node.getName() + " Assets");
	//cAssets.approve();
}
*/

//create custom attributes
// Note: This needs a gateway integration endpoint bind with parameter CustomCatalogAttributesEndpoint
//var att = step.getAttributeHome().getAttributeByID(node.getID() + "_DiscountPrice");
//if (att==null){
//	try{
//		var httpPost= gateway.post();
//		httpPost.pathElements();
//		httpPost.pathQuery({context: "Context1"});
//		httpPost.body("<STEP-ProductInformation AutoApprove='Y' ContextID='Context1' WorkspaceID='Main'><AttributeList><Attribute ID='" + node.getID() + "_DiscountPrice' MultiValued='false' ProductMode='Normal' FullTextIndexed='false' ExternallyMaintained='false' Derived='false' Selected='true' Referenced='true'><Name>" + node.getName()+ " Discount Price</Name><Validation BaseType='number' MinValue='' MaxValue='' MaxLength='' InputMask=''/><AttributeGroupLink AttributeGroupID='Customer_Catalog_Discount_Price'/><UserTypeLink UserTypeID='SKU'/></Attribute><Attribute ID='" + node.getID() + "_FutureDiscountPrice' MultiValued='false' ProductMode='Normal' FullTextIndexed='false' ExternallyMaintained='false' Derived='false' Selected='true' Referenced='true'><Name>" + node.getName()+ " Future Discount Price</Name><Validation BaseType='number' MinValue='' MaxValue='' MaxLength='' InputMask=''/><AttributeGroupLink AttributeGroupID='Customer_Catalog_Future_Discount_Price'/><UserTypeLink UserTypeID='SKU'/></Attribute></AttributeList><Products><Product ID='Products_Root_Hierarchy' ParentID='Product hierarchy root' UserTypeID='Products_Root'><Name>Products Root Hierarchy</Name><AttributeLink AttributeID='"+node.getID()+"_DiscountPrice'/><AttributeLink AttributeID='"+node.getID()+"_FutureDiscountPrice'/></Product></Products></STEP-ProductInformation>");
//		httpPost.invoke();
//	}catch(err) {
//		log.info(err.toString());
//	}
//}
}