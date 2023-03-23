/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "MI_TEST",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "MI_TEST",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revToMS",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,manager,revToMS,bl_library) {
//var rev = node.getRevision().setMajor()
//var currRev = node.getRevision()
//log.info(currRev.getName())
// log.info(node.getValue("PRICE").getSimpleValue());

/* var revIter = node.getRevisions().iterator();
 var currRev = revIter.next();
 if (revIter.hasNext()) {
  var 	 prevRev = revIter.next();
  
 	 //   prevRev.setMajor();
    		node = revIter.next().getNode();
   	   	node.setMajor();
  
  
    //   log.info(node.getRevision().getName())
 */ 	 
   /*   node = revIter.next().getNode();
         var price = revIter.next().getNode().getValue("PRICE").getSimpleValue();
         log.info(prevRev);
         log.info(price); 
         prevRev.setMajor();
        log.info(node.getRevision().getName())

	node.getValue("PRICE").setSimpleValue(price);
  	log.info(node.getValue("PRICE").getSimpleValue());
*/ /*   }
   log.info(node.getName());
    var childIter = node.getChildren().iterator();
    while (childIter.hasNext()) {
    	var	child = childIter.next();
    		log.info(child.getName());
    		
     	revIter = child.getRevisions().iterator();
 		prevRev = revIter.next();
		if (revIter.hasNext()) {
			child = revIter.next().getNode();
   		 }
   		 
   		 log.info(child.getValue("PRICE").getSimpleValue());
    }
*/
log.info("111" + node.getValue("Sell_in_Japan_?").getSimpleValue());
if(node.getValue("Sell_in_Japan_?").getSimpleValue() == null) {
	node.getValue("Sell_in_Japan_?").setSimpleValue("Y");
}
log.info("222" + node.getValue("Sell_in_Japan_?").getSimpleValue());
}