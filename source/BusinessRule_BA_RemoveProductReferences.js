/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RemoveProductReferences",
  "type" : "BusinessAction",
  "setupGroups" : [ "Migration Business Actions" ],
  "name" : "BA_RemoveProductReferences",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
/*
//DeleteEntityReference
var lstProduct = node.getEntityProductLinks();
log.info(lstProduct.size());
for (var i = 0; i < lstProduct.size(); i++) {
	lstProduct.get(i).delete();
	log.info(lstProduct.get(i));
}


//DeleteApplicationReference
var lstProduct = node.getClassificationProductLinks();
log.info(lstProduct.size());
for (var i = 0; i < lstProduct.size(); i++) {
	log.info(lstProduct.get(i));
	lstProduct.get(i).delete();
	log.info(lstProduct.get(i));
}


//ProductReferences
	var refs = node.getProductReferences()
	var p2wipRefType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision")
	var p2wipRefs = refs.get(p2wipRefType)
	
	// remove reference to wip revision
	if (p2wipRefs)  {
		if (p2wipRefs.size() == 1) {
			var p2wipRef = p2wipRefs.get(0)
			log.info("second"+p2wipRef);
			p2wipRef.delete();
		}
	}
 * 
 */
	///
	var refLists = node.getLocalReferences();
	var iterator = refLists.asSet().iterator();
	while (iterator.hasNext()){
		var ref = iterator.next();
		var refType = ref.getReferenceType();
		log.info(refType);
		ref.delete();
	}
}