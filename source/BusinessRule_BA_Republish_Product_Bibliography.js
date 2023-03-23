/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Republish_Product_Bibliography",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Republish_Product_Bibliography",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Bibliography_Citation", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "contract" : "EventQueueBinding",
    "alias" : "biblioQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=BIBILIOGRAPHY_PRODUCT_JSON_EP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "ProductBibliographyChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "ProductBibliographyChanges",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_ApproveProductBibliographyFolder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ApproveProductBibliographyFolder",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,biblioQueue,ProductBibliographyChanges,BA_ApproveProductBibliographyFolder,BL_Library) {
var product;

if (node.getObjectType().getID().equals("Product") || node.getObjectType().getID().equals("Product_Kit") || node.getObjectType().getID().equals("Equipment")) {
    product = node;
}
else if (node.getValue("Is_Last_Citation").getSimpleValue() && node.getValue("Is_Last_Citation").getSimpleValue() == "1") {
    var biblioFolder = node.getParent();
    product = biblioFolder.getParent();
}

if (product) {
    //var status = product.getValue("Product_Status").getSimpleValue();

    //if (status == "Pre-released" || status == "Released" || status == "Commercialization") {
    
    //STEP-6295
    BL_Library.setAttribute_Product_References(product);
    //end STEP-6295

    BA_ApproveProductBibliographyFolder.execute(product);
    biblioQueue.queueDerivedEvent(ProductBibliographyChanges, product);
    //}
}
}