/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "SAM_Test",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "SAM_Test",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,Lib) {
/*var val = new java.lang.String("SamSer123<sub>Val</sub>Ser456");
val = val.replaceAll('<sub>', '');
val = val.replaceAll('</sub>', '');
logger.info(val);*/

//var collection=manager.getAssetHome().getAssetByID("1869585");

/*var childrenQuery = collection.queryChildren();
childrenQuery.forEach(function(child) {
 logger.info(child.getTitle());
 return false; // break the "forEach" on the query
});*/


var product=node.getParent();


var skulist=Lib.getProductSKUs(product);

logger.info(" TEst Rule"+skulist.size());
for (var i=0;i<skulist.size();i++){
	var sku=skulist.get(i);
	logger.info(" sku "+sku.getID()+" sku name "+sku.getName());
}
}