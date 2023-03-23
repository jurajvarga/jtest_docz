/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_LegalStatementUpdates",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_LegalStatementUpdates",
  "description" : "BR for copy attr from product to rev for removing Inheritance ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Lot", "NonLot", "Product_Revision", "Regional_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
    "contract" : "BusinessActionBindContract",
    "alias" : "ba_approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthrough",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,ba_approve,liveQueue,webPassthrough,bl_library) {
//STEP-6238 .. To run this search for all revisions that need a statement to be replaced 
var toBeRemoved = ["Cy"]; // LOV ID to search for
var toBeUpdated = "Cy and CyDye are registered trademarks of GE Healthcare.";  // LOV Value to replace with

var ActionTaken ="";
var PushToWeb ="N";

var productno = node.getValue("PRODUCTNO").getValue();

//log.info(child.getName());
var legalStatement = node.getValue("LEGALSTATEMENT");  // Attribute to search in
var marketingStatement = node.getValue("TRADEMARKSTATEMENT"); // Attribute to add to

if(legalStatement){
     var allStatements = legalStatement.getValues();
     var updateStatementAvailable=false;
     
     for (var i1 = 0; i1 < allStatements.size(); i1++) {
         var oneStatementID = allStatements.get(i1).getID();
         toBeUpdatedValue= allStatements.get(i1).getSimpleValue();
         if(bl_library.isItemInArray(toBeUpdated, oneStatementID)){
         	    allStatements.get(i2).deleteCurrent();  
         	    ActionTaken = "Delete " + toBeRemoved;
				log.info ("Found value " + oneStatementID);         	     
         }

//         log.info (" Idx "+i1+ " ID: " + oneStatementID + " Value: " + toBeUpdatedValue);
     }
}

if(marketingStatement){
     var allStatements = marketingStatement.getValues();
     i2 = allStatements.size()+1;
//   if (!updateStatementAvailable){
		allStatements.get(i2).setSimpleValue(toBeUpdated);
		ActionTaken = ActionTaken + " Add " + toBeUpdated;        	 
//         	     }         	   
}

     log.info(" After Update Values 1: ");
     var allStatements = legalStatement.getValues();
     for (var i1 = 0; i1 < allStatements.size(); i1++) {
         var oneStatementID = allStatements.get(i1).getID();
         toBeUpdatedValue= allStatements.get(i1).getSimpleValue();

         log.info (" Idx "+i1+ " ID: " + oneStatementID + " Value: " + toBeUpdatedValue);
     }
	 
     log.info(" After Update Values 2: ");
     var allStatements = marketingStatement.getValues();
     for (var i1 = 0; i1 < allStatements.size(); i1++) {
         var oneStatementID = allStatements.get(i1).getID();
         toBeUpdatedValue= allStatements.get(i1).getSimpleValue();

         log.info (" Idx "+i1+ " ID: " + oneStatementID + " Value: " + toBeUpdatedValue);
     }
        
if(ActionTaken) {
if(node.getValue("REVISIONSTATUS").getSimpleValue() != "In-process"){
		 ba_approve.execute(node);
	}    	
}   
if(PushToWeb == 'Y'){
	liveQueue.queueDerivedEvent(webPassthrough, node.getParent());
	log.info(" Product No "+productno + " - "+ActionTaken );
}
}