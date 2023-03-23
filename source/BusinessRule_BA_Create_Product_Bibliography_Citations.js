/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Create_Product_Bibliography_Citations",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Create_Product_Bibliography_Citations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Bl_Lib"
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
exports.operation0 = function (node,BA_Approve,Bl_Lib) {
var folder = Bl_Lib.getProductChildren(node, "Product_Bibliography_Folder");

if (folder.length == 0){
	var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
	var bibProduct = node.getManager().getEntityHome().getEntityByID(nProduct);

	var productBibFolder = node.createProduct(null, "Product_Bibliography_Folder");
	productBibFolder.setName(nProduct + "_Bibliography");

	if (bibProduct && bibProduct.getObjectType().getID().equals("Bibliography_Products")) {
  		var bpChildren = bibProduct.getChildren();

          for (var ix = 0; ix < bpChildren.size(); ix++) {
      		var bpChild = bpChildren.get(ix);
      		
      		if (bpChild.getObjectType().getID().equals("Bibliography_Citation")) {
          		var pubmed = bpChild.getValue("PUBLICATION_PUBMEDID").getSimpleValue();
          		var type = bpChild.getValue("PUBLICATION_ASSOCIATION_TYPE").getSimpleValue();
          		var citation = bpChild.getValue("PUBLICATION_CITATION").getSimpleValue();
          		var formatted = bpChild.getValue("PUBLICATION_FORMATTEDSTR").getSimpleValue();
          		var index = bpChild.getValue("PUBLICATION_LISTINDEX").getSimpleValue();
          		var title = bpChild.getValue("PUBLICATION_TITLE").getSimpleValue();
          		var year = bpChild.getValue("PUBLICATION_YEAR").getSimpleValue();
          		var apps = bpChild.getValue("PUBLICATION_APPLICATIONS_STR").getSimpleValue();      

          		var productBibCit = productBibFolder.createProduct(null, "Product_Bibliography_Citation");
          		productBibCit.setName(title);
          		productBibCit.getValue("PUBLICATION_PUBMEDID").setSimpleValue(pubmed);
          		productBibCit.getValue("PUBLICATION_ASSOCIATION_TYPE").setSimpleValue(type);
          		productBibCit.getValue("PUBLICATION_CITATION").setSimpleValue(citation);
          		productBibCit.getValue("PUBLICATION_FORMATTEDSTR").setSimpleValue(formatted);
          		productBibCit.getValue("PUBLICATION_LISTINDEX").setSimpleValue(index);
          		productBibCit.getValue("PUBLICATION_TITLE").setSimpleValue(title);
          		productBibCit.getValue("PUBLICATION_YEAR").setSimpleValue(year);
          		productBibCit.getValue("PUBLICATION_APPLICATIONS_STR").setSimpleValue(apps);
          		productBibCit.getValue("Citation_Status").setSimpleValue("Active");
      		}
  		}
	}

	BA_Approve.execute(productBibFolder);
}

Bl_Lib.setAttribute_Product_References(node);
}