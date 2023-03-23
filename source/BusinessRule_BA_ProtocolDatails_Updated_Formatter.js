/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProtocolDatails_Updated_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_ProtocolDatails_Updated" ],
  "name" : "BA_ProtocolDetails_Updated_Formatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,executionReportLogger,step,BL_JSONCreation) {
Object.buildNodeMessage = function buildNodeMessage(node) {
	var mesg = {};
  	mesg.protocolno = node.getValue("PROTOCOLNO").getSimpleValue() + "";	 
     mesg.protocol_active_yn = node.getValue("PROTOCOLACTIVEFLAG_YN").getSimpleValue() + "";
       
       var products = [];
       var msRef = node.queryClassificationProductLinks()
       msRef.forEach(function(ref) { 
     	  	var productRevision= ref.getProduct().getParent();
       		var JsonProduct = productRevision.getValue("PRODUCTNO").getSimpleValue() + "";
		     if (JsonProduct){
          		 products.push(JsonProduct);
       		}
       		return true; 
       });
       
       var uniqueProducts = products.filter(onlyUnique); 

       var productList = [];
       uniqueProducts.forEach(function(prod) { 
		 var productJson = {};
           productJson["productno"] = prod + "";
           productList.push(productJson);
           return true; 
           });

   mesg["Products"] = productList; 
       
   return mesg;
 }
    
 function onlyUnique(value, index, self) {
	 return self.indexOf(value) === index;
  }

//=========================================================================
//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();

if (simpleEventType == null) {
	executionReportLogger.logInfo("No event information available in node handler");
}
else {
	executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
var mesgfinal;

if (node != null) {
	executionReportLogger.logInfo("node ID: " + node.getID()); 
		
	if (nodeHandlerSource.isDeleted()) {
		mesgfinal = {};
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
	}
	else {
		mesgfinal = Object.buildNodeMessage(node);
	}
	
	//mesgfinal2 = JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities);
   	//log.info(mesgfinal2);
   
	nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
	
}
}