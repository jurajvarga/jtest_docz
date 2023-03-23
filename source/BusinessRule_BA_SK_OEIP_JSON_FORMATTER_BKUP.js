/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SK_OEIP_JSON_FORMATTER_BKUP",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BA_SK_OEIP_JSON_FORMATTER_BKUP",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "MasterStock", "Product", "Product_Kit", "Product_Revision", "SKU" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult

var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
	executionReportLogger.logInfo("No event information available in node handler");
} else {
	executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}
var node = nodeHandlerSource.getNode();

if (node!=null && node.getObjectType().getID().equals("Product_Kit")) {

	executionReportLogger.logInfo(" Product Kit ");
	
	var mesg = {};
	mesg.stepid = node.getID() + "";
	mesg.eventid = simpleEventType.getID() + "";
				
			
				if (node.getObjectType().getID().equals("Product_Kit")) {
			      var children = node.getChildren();
			      for (var cx = 0; cx < children.size(); cx++) {
			          var child = children.get(cx);
			          if (child.getObjectType().getID().equals("Kit_Revision")) {
			             var refs = child.getProductReferences().asList();
			             for (var rx=0; rx<refs.size(); rx++) {
			                var ref = refs.get(rx);
			                if (ref.getReferenceType().getID().equals("KitRevision_to_SKU")) {
			                   var sku = ref.getTarget();
			                   executionReportLogger.logInfo ( " sku "+sku);
			                   // Find the Product or Product_Kit related to this sku...
			                   var productNoValue = sku.getValue("PRODUCTNO").getSimpleValue();
			                   executionReportLogger.logInfo  (" productNoValue "+productNoValue);
			                   if (productNoValue) {
			                      var skuProductOrProductKit = manager.getNodeHome().getObjectByKey("PRODUCTNO", productNoValue);
			                       executionReportLogger.logInfo (" skuProductOrProductKit "+skuProductOrProductKit);
			                      if (skuProductOrProductKit) {
			                         //if (!nodeIsAlreadyInBatch(skuProductOrProductKit)) {
			                            executionReportLogger.logInfo ("BA_CompleteProductPreProcessor: adding skuProductOrProductKit: "+skuProductOrProductKit.getID());
			                           // currentEventBatch.addAdditionalNode(skuProductOrProductKit);
			                        // }

			                        var setAttr = skuProductOrProductKit.getValues();
							    var it = setAttr.iterator();
							    while (it.hasNext()) {
							    	 var attrValue = it.next();
							      var attribute ="";
							      if (attrValue!=null){
							        attribute =attrValue.getAttribute();
							         var attVal = attrValue.getSimpleValue() + "";	        
							          mesg[attribute.getID()] = attVal;
							         
							      }
							     
							    }
				
					
								var mss = [] ;
								var children = skuProductOrProductKit.getChildren();
								for (i = 0; i < children.size(); i++) {
								
									var child = children.get(i);
									var childId=child.getObjectType().getID();
									//log.info("childId"+childId);
									
									//To get Child Main Attributes
									var setAttrCh = child.getValues();
									var itCh = setAttrCh.iterator();
									var chJson={}
									while (itCh.hasNext()) {
										var attrValueCh = itCh.next();
										var attributeCh ="";
										if (attrValueCh!=null){
											attributeCh =attrValueCh.getAttribute();
											//log.info(" attributeCh "+attributeCh);
											var attValCh = attrValueCh.getSimpleValue() + "";	        
											chJson[attributeCh.getID()] = attValCh;
											//logger.info("attValCh"+attValCh);
										}			
									}
							
				
				
						
									//To Get Child of Child Values
									var gcl=[];
									var gcnameid="";
									var grandchild=child.getChildren();
									for (j = 0; j < grandchild.size(); j++) {
										var gcobj  = grandchild.get(j);
										var gcjson = {}; //SKU
										
										
										var gcId=gcobj.getObjectType().getID();
										//log.info(" gcId "+gcId);
										gcnameid=gcId+"s";
														
										//To get Grand Child Main Attributes
										var setAttrGC = gcobj.getValues();
										var itGC = setAttrGC.iterator();
										var jsonGC={}
										while (itGC.hasNext()) {
											var attrValueGC = itGC.next();
											var attributeGC ="";
											if (attrValueGC!=null){
												attributeGC =attrValueGC.getAttribute();
												//log.info(" attributeGC "+attributeGC);
												var attValGC = attrValueGC.getSimpleValue() + "";	        
												jsonGC[attributeGC.getID()] = attValGC;
												//logger.info("attValCh"+attValCh);
											}
										
										}
										
										gcl.push(jsonGC);	
												
									}
									
									//executionReportLogger.logInfo (" gcnameid "+gcnameid);	
										
									chJson[gcnameid]=gcl;
									mss.push(chJson);
									mesg[childId]=mss;
						
			
								}
		
					
		
					
								var accessoryReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
								
								var accessoryReferences = skuProductOrProductKit.getReferences(accessoryReferenceType);
								var currev=[] //currev array
								for (var j = 0; j < accessoryReferences.size(); j++) {
								   var acctarget={};//currev 
								   var accessoryTarget = accessoryReferences.get(j).getTarget().getName()+"";
								   executionReportLogger.logInfo (" accessoryTarget "+accessoryTarget);
								   acctarget["name"]=accessoryTarget;
								   currev.push(acctarget);
								 }
								
								mesg.ProductToCurrentRevision=currev;
			                      }
			                   }
			                }
			             }
			          }
			      }
			   }
			    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesg));
			    
			} else if (node != null && node instanceof com.stibo.core.domain.Product) {
				
	executionReportLogger.logInfo("Node handler handling product with URL: " + node.getURL());
	//
	//format the JSON message 
	//
	var mesg = {};
	mesg.stepid = node.getID() + "";
	mesg.eventid = simpleEventType.getID() + "";
	mesg.PRODUCTNO = node.getValue("PRODUCTNO").getSimpleValue() + "";
	if (nodeHandlerSource.isDeleted()) {
		nodeHandlerResult.addMessage("delete", JSON.stringify(mesg));
	} else {
		     var setAttr = node.getValues();
			    var it = setAttr.iterator();
			    while (it.hasNext()) {
			    	 var attrValue = it.next();
			      var attribute ="";
			      if (attrValue!=null){
			        attribute =attrValue.getAttribute();
			         var attVal = attrValue.getSimpleValue() + "";	        
			          mesg[attribute.getID()] = attVal;
			         
			      }
			     
			    }
				/*var children = node.getChildren();
				var mss = []  //MasterStock Array
				for (i = 0; i < children.size(); i++) {
					var child = children.get(i);
					if (child.getObjectType().getID() == "MasterStock") {
						var ms = {};  // MasterStock 
						ms["MasterStock_SKU"] = child.getValue("MasterStock_SKU").getSimpleValue() + "";
						ms["CLP_Lot_Concentration_Units"] =  child.getValue("CLP_Lot_Concentration_Units").getSimpleValue() + "";
						var skus=[];  //SKU array
						var skulist = child.getChildren();
						//get all the SKU and format into JSON record
						for (j = 0; j < skulist.size(); j++) {
							var pSKU  = skulist.get(j);
							var sku = {}; //SKU
							sku["Item_SKU"] = pSKU.getValue("Item_SKU").getSimpleValue() + "";
							sku.ITEMSTOCKFORMAT= pSKU.getValue("ITEMSTOCKFORMAT").getSimpleValue() + "";
							sku.QTY_MKTG= pSKU.getValue("QTY_MKTG").getSimpleValue() + "";
							skus.push(sku);
						}
						ms.SKUs=skus;
						mss.push(ms);
						mesg.MasterStocks = mss;
					}
					}*/
		
					var mss = [] ;
					var children = node.getChildren();
					for (i = 0; i < children.size(); i++) {
					
						var child = children.get(i);
						var childId=child.getObjectType().getID();
						//log.info("childId"+childId);
						
						//To get Child Main Attributes
						var setAttrCh = child.getValues();
						var itCh = setAttrCh.iterator();
						var chJson={}
						while (itCh.hasNext()) {
							var attrValueCh = itCh.next();
							var attributeCh ="";
							if (attrValueCh!=null){
								attributeCh =attrValueCh.getAttribute();
								//log.info(" attributeCh "+attributeCh);
								var attValCh = attrValueCh.getSimpleValue() + "";	        
								chJson[attributeCh.getID()] = attValCh;
								//logger.info("attValCh"+attValCh);
							}			
						}
				
				
				
						
						//To Get Child of Child Values
						var gcl=[];
						var gcnameid="";
						var grandchild=child.getChildren();
						for (j = 0; j < grandchild.size(); j++) {
							var gcobj  = grandchild.get(j);
							var gcjson = {}; //SKU
							
							
							var gcId=gcobj.getObjectType().getID();
							//log.info(" gcId "+gcId);
							gcnameid=gcId+"s";
											
							//To get Grand Child Main Attributes
							var setAttrGC = gcobj.getValues();
							var itGC = setAttrGC.iterator();
							var jsonGC={}
							while (itGC.hasNext()) {
								var attrValueGC = itGC.next();
								var attributeGC ="";
								if (attrValueGC!=null){
									attributeGC =attrValueGC.getAttribute();
									//log.info(" attributeGC "+attributeGC);
									var attValGC = attrValueGC.getSimpleValue() + "";	        
									jsonGC[attributeGC.getID()] = attValGC;
									//logger.info("attValCh"+attValCh);
								}
							
							}
							
							gcl.push(jsonGC);	
									
						}
						
						//log.info(" gcnameid "+gcnameid);	
							
						chJson[gcnameid]=gcl;
						mss.push(chJson);
						mesg[childId]=mss;
			
			
				}
		
					
		
					
				var accessoryReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
				
				var accessoryReferences = node.getReferences(accessoryReferenceType);
				var currev=[] //currev array
				for (var j = 0; j < accessoryReferences.size(); j++) {
				   var acctarget={};//currev 
				   var accessoryTarget = accessoryReferences.get(j).getTarget().getName()+"";
				   log.info(" accessoryTarget "+accessoryTarget);
				   acctarget["name"]=accessoryTarget;
				   currev.push(acctarget);
				 }
				
				mesg.ProductToCurrentRevision=currev;
				
				
		}

		
	   

	    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesg));
	  
	}
}