/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Inactive_Items",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Inactive_Items",
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
log.info("starting BA_Inactive_Items ");
if ((node.getValue("PSC_Pre-discontinued").getSimpleValue() == "Discontinued") 
 || (node.getValue("PSC_InternalUseOnly").getSimpleValue() == "Discontinued")
 || (node.getValue("PSC_Pending").getSimpleValue() == "Discontinued") ) {
	var parent = node.getParent()
	var discontinuedRevisions = []
	//var kitskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock")
    // var kitskuReferences = parent.getReferences(kitskuReferenceType);
     var childrendOfProduct = parent.getChildren();
	for (var j = 0; j < childrendOfProduct.size(); j++) {
		var child = childrendOfProduct.get(j)
		if (child.getObjectType().getID() == 'MasterStock') {
			var childrenOfChild = child.getChildren()
		     for (var i = 0; i < childrenOfChild.size(); i++) {
               log.info(" BA_Inactive_Items"+childrenOfChild.get(i).getID()); 
                var sku = childrenOfChild.get(i);  
                log.info("sku BA_Inactive_Items "+sku.getValue("ITEMSTOCKTYPE").getSimpleValue());          
                 if ( sku.getValue("ITEMSTOCKTYPE").getSimpleValue() == 'OTS' ) {
				 sku.getValue("ITEMACTIVE_YN").setSimpleValue("N");
				 log.info("in "+ sku.getValue("ITEMACTIVE_YN").getSimpleValue());
                 } 	
		    }  
		} 	
	  }
	}
}