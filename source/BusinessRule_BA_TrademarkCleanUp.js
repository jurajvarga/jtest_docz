/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_TrademarkCleanUp",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_TrademarkCleanUp",
  "description" : "BR for copy attr from product to rev for removing Inheritance ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
//STEP-6238
var toBeRemoved = ["Acumen","All Other Trademarks","AMPure","ArrayScan","AviTag","BackDrop","Bioanalyzer","BODIPY","BOND","Burdick and Jackson","Cell Signaling Technology","CellSImple ScreenShots","CellSimple US only availability","CF","DELFIA","Dispase","DRAQ5","DRAQ7","DyLight","eFluor","FLAG","Ghost Dye","Gleevec","HEK-Blue","Illumina","Image-iT","Leica","Licor","LumiGlo","Lyso Tracker","MitoTracker","NEBNext","NovaRed","Odyssey","OrbiTrap","PageRuler","Pierce","ProLong","ProtiFi","Q5","RAW-Blue","redFluor","Sepharose","Sep-Pak","ShortCut","SimpleDIP","SPRIselect","Stem-Trol","SureQuant","SYBR Green","Tapestation","Thermo Fisher","Triton","Trizma","TrueBlack","TSA","Tween 20","Ultra","USER Enzyme","violetFluor"];
var productno = node.getValue("PRODUCTNO").getValue();
var changedProduct = false;

var query = node.queryChildren();
query.forEach(function(child) {
if (child.getObjectType().getID() == "Product_Revision" || child.getObjectType().getID() == "Kit_Revision" || child.getObjectType().getID() == "Equipment_Revision"
    || child.getObjectType().getID() == "Regional_Revision") {
    	
	//log.info(child.getName());
	var changedRevision = false;
     var trademarkStatement = child.getValue("TRADEMARKSTATEMENT");
 
     if(trademarkStatement){
          var allStatements = trademarkStatement.getValues();
          
	     for (var i1 = 0; i1 < allStatements.size(); i1++) {
	         var oneStatementID = allStatements.get(i1).getID();
	         
	         if(bl_library.isItemInArray(toBeRemoved, oneStatementID)){
	         	     allStatements.get(i1).deleteCurrent();         	    
	               changedRevision = true;
	               changedProduct = true;	
	         }
	     }
	 }	 
	 
     var trademarkStatement = child.getValue("GENERALSTATEMENT");
 
     if(trademarkStatement){
          var allStatements = trademarkStatement.getValues();
          
	     for (var i1 = 0; i1 < allStatements.size(); i1++) {
	         var oneStatementID = allStatements.get(i1).getID();
	         
	         if(bl_library.isItemInArray(toBeRemoved, oneStatementID)){
	         	     allStatements.get(i1).deleteCurrent();         	    
	               changedRevision = true;
	               changedProduct = true;	
	         }
	     }
	 }
	 
     var trademarkStatement = child.getValue("ORDERINGDETAILSSTATEMENT");
 
     if(trademarkStatement){
          var allStatements = trademarkStatement.getValues();
          
	     for (var i1 = 0; i1 < allStatements.size(); i1++) {
	         var oneStatementID = allStatements.get(i1).getID();
	         
	         if(bl_library.isItemInArray(toBeRemoved, oneStatementID)){
	         	     allStatements.get(i1).deleteCurrent();         	    
	               changedRevision = true;
	               changedProduct = true;	
	         }
	     }
	 }
	 
     var trademarkStatement = child.getValue("LEGALSTATEMENT");
 
     if(trademarkStatement){
          var allStatements = trademarkStatement.getValues();
          
	     for (var i1 = 0; i1 < allStatements.size(); i1++) {
	         var oneStatementID = allStatements.get(i1).getID();
	         
	         if(bl_library.isItemInArray(toBeRemoved, oneStatementID)){
	         	     allStatements.get(i1).deleteCurrent();         	    
	               changedRevision = true;
	               changedProduct = true;	
	         }
	     }
	 }
   }
	if(changedRevision) {
	   if(child.getValue("REVISIONSTATUS").getSimpleValue() != "In-process"){
		         ba_approve.execute(child);
	   }    	
	}    
   return true;           
});

//if(changedProduct){
//	liveQueue.queueDerivedEvent(webPassthrough, node);
//	log.info(" Product No "+productno + " - trademarks changed by STEP-6238");
//}
}