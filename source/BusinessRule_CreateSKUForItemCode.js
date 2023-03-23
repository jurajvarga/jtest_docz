/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "CreateSKUForItemCode",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Create SKU For Item Code",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "lib"
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "web",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,revisionMasterStock,log,web,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,lib) {
var itemCodes = node.getValue("SKU_Creation_Create").getSimpleValue(); 
var availableCodes = node.getValue("SKU_Creation_Available").getSimpleValue();
var checkItemResult = checkItemCodes(itemCodes,availableCodes);
log.info(checkItemResult);
var sourced="";
var customlot="";
var skuCreated = "";
var skuNotCreated = "";


if ( checkItemResult == "OK"){
	if(itemCodes && itemCodes != "Enter SKU Code...") {
		var itemCodeSplitted = itemCodes.split(","); 	
		if (node!=null){
			//To Get Tech Transfer Lot  Information
			var refTypeTT = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
               //STEP-6396
               var revTTLotReferences = node.queryReferences(refTypeTT);
               //logger.info(" revAppProtClassification "+revAplicationProtocolReferences.size());

               revTTLotReferences.forEach(function(ref) {

                  var ttLotObj = ref.getTarget();
                  //log.info(" ttLotObj " + ttLotObj);
                  if (ttLotObj != null) {
                      sourced = ttLotObj.getValue("Sourced").getSimpleValue();
                      return false;
                  }
                  return true;
               });
               //STEP-6396
				
			customlot = node.getValue("CustomLotRev_YN").getSimpleValue();	
			log.info("sourced " + sourced)
			log.info("customlot " + customlot)
		}
	    // for all SKU that should be created:
		for(var j = 0; j < itemCodeSplitted.length; j++) { 
		    var itemCode = itemCodeSplitted[j].trim().toUpperCase();
			var masterStock = null;
			var masterStockReferences = node.queryReferences(revisionMasterStock); //STEP-6396
			var usedItemCodes = []
			var avaiableItemCodes = []
               //STEP-6396
               masterStockReferences.forEach(function(ref) {
                  masterStock = ref.getTarget();
                  return true;
               });
               //STEP-6396
			if(masterStock) {
				var usedSkus = masterStock.getChildren()
				for (var i=0; i<usedSkus.size();i++) {
					usedItemCodes.push(usedSkus.get(i).getValue("ItemCode").getSimpleValue())
				}		
				var defaultEntity = null;
				var sProductType = masterStock.getValue("PRODUCTTYPE").getSimpleValue();
				var nProduct = masterStock.getValue("PRODUCTNO").getSimpleValue();
				var sMasterItemCode = masterStock.getValue("MASTERITEMCODE").getSimpleValue();
	
				//Search for Entities with matching product type
				var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
				var type = com.stibo.core.domain.entity.Entity;
				var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
				var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);
	
				var belowNode = step.getEntityHome().getEntityByID("ProductItemDefaults");
				query.root = belowNode;
	
				var itemCodesList = searchHome.querySingleAttribute(query).asList(100).toArray();
				for (var i = 0; i < itemCodesList.length; i++) {
					var eSkuDefault = itemCodesList[i];
					var sDefaultItemCode =  eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue();
					var sDefaultMasterItemCode =  eSkuDefault.getValue("MASTERITEMCODE_DFLT").getSimpleValue();
					var sDefaultItemStockFormat =  eSkuDefault.getValue("ITEMSTOCKFORMAT_DFLT").getSimpleValue();
					
					if (!checkSourcedOrCustomProducts(sourced,customlot)){
						if ((sDefaultMasterItemCode == sMasterItemCode) || (sDefaultMasterItemCode== null && sDefaultItemStockFormat!="MASTER") ){ 
							log.info(" sDefaultItemCode "+sDefaultItemCode);
							avaiableItemCodes.push(eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue())
							if(sDefaultItemCode == itemCode ) {
								log.info("Found matching Product Item Default for ? " + sDefaultMasterItemCode +" " +sDefaultItemCode);
								defaultEntity = eSkuDefault;
							}
						}
					}else{
						log.info(" sDefaultItemCode "+sDefaultItemCode);
							//log.info(" sDefaultItemCode1 "+itemCodesList[i].getValue("ItemCode_DFLT").getSimpleValue());
							if (sDefaultMasterItemCode!=null){
							avaiableItemCodes.push(eSkuDefault.getValue("ItemCode_DFLT").getSimpleValue())
							}
							if(sDefaultItemCode == itemCode ) {
								log.info("Found matching Product Item Default for ? " + sDefaultMasterItemCode +" " +sDefaultItemCode);
								defaultEntity = eSkuDefault;
							}
					}
				}
	
				log.info("Did I find matching Product Item Default for ? " + sDefaultMasterItemCode +" " +sDefaultItemCode);
				if(defaultEntity) {
					var sDefaultItemCode = defaultEntity.getValue("ItemCode_DFLT").getSimpleValue();
					log.info("SKU exists? " + lib.isSkuExist(step, nProduct, sDefaultItemCode, log));
					if(!lib.isSkuExist(step, nProduct, sDefaultItemCode, log)) {
						log.info("creating sku");
						var attrGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductItemDefaults");
						var newSku = lib.createSKU(step, masterStock, defaultEntity, nProduct, sDefaultItemCode, attrGroup);
						usedItemCodes.push(sDefaultItemCode);
						if (skuCreated) { skuCreated = skuCreated +  ", "; }
						skuCreated = skuCreated + sDefaultItemCode;
					}
				} else {
						if (skuNotCreated) { skuNotCreated = skuNotCreated +  "; "; }
						skuNotCreated = skuNotCreated + itemCode + " - Product does not have default entity";
						//throw "Product does not have default entity";
				}
				var skusAvaiableArrayValue = node.getValue("SKU_Creation_Available").getSimpleValue();
				
				if (skusAvaiableArrayValue) {
					var skusAvaiableArray = skusAvaiableArrayValue.split(",");
					log.info(" skusAvaiableArray "+skusAvaiableArray);
					var filteredCodes = avaiableItemCodes.filter(function(item) {
						log.info(" Item "+item)
						availableIncItem=(!avaiSkusIncludesUsedItemCode(item))
						//log.info(" availableIncItem "+availableIncItem);
							return availableIncItem
					})
					log.info("available filtered sku "+filteredCodes.join());
					node.getValue("SKU_Creation_Available").setSimpleValue(filteredCodes.join())
					node.getValue("SKU_Creation_Create").setSimpleValue("");
					}
				}
		}
	} else {
		if (skuNotCreated) { skuNotCreated = skuNotCreated +  "; "; }
		skuNotCreated = skuNotCreated + itemCode + " - Product does not have Item Code(s)";
	//	throw "Product does not have Item Code(s)";
	}


	log.info("SKUs created with Item Codes: " + skuCreated);
	log.info("SKUs not created: " + skuNotCreated )
	
	if(!skuNotCreated){
		 //STEP-5929
        //Set Audit for Child Figure Folder
        //STEP-5993
        if (node.isInWorkflow("Production_Workflow")) {
            BL_AuditUtil.buildAndSetAuditMessageForAction(node, step, "Production_Workflow", "Create_Action", "Create SKU - User Entered "+itemCodes+".Created SKU - "+ skuCreated, "Create_Short_Name", "Create_Short_Name", false, "",auditEventType,auditQueueMain,auditQueueApproved);;
        } else if (node.isInWorkflow("WF3B_Supply-Chain")) {
            BL_AuditUtil.buildAndSetAuditMessageForAction(node, step, "WF3B_Supply-Chain", "Create_Action", "Create SKU - User Entered "+itemCodes+".Created SKU - "+ skuCreated, "Create_Short_Name", "Create_Short_Name", false, "",auditEventType,auditQueueMain,auditQueueApproved);
        }
        //STEP-5993
        //STEP-5929
		 web.showAlert("ACKNOWLEDGMENT", "SKU Creation", "SKUs created with Item Codes: " + skuCreated);
	}else {
		if(skuCreated) 
	 		web.showAlert("WARNING", "SKU Creation", "SKUs created with Item Codes: " + skuCreated + "SKUs not created: " + skuNotCreated);
	 	else
	 		web.showAlert("WARNING", "SKU Creation", "SKUs not created: " + skuNotCreated);
	 	
	}

} else {
		web.showAlert("WARNING", "SKU Creation", checkItemResult);
}


function avaiSkusIncludesUsedItemCode(item) {
	var result = false
	for (var index = 0; index < usedItemCodes.length; index++) {
		if (usedItemCodes[index] == item || itemCode == item) {
			result = true
		}
	}
	return result;
}


function checkSourcedOrCustomProducts(sourcedAttr,customAttr) {
	var result = false;
	if ((sourcedAttr!="" && sourcedAttr!="Not Sourced") || customAttr == "Y"){
		result = true;
	}
	return result;
}

function checkItemCodes(itemCodes,availableCodes) {

    if(availableCodes == null) {
        if (node.getObjectType().getID()=="Kit_Revision") {
            return "Kit has no available Item Codes";
        } else {
            return "Product has no available Item Codes";
        }
    }

    if(itemCodes) {
        var availableCodesSplitted = availableCodes.split(",");
        var newCodesSplitted = itemCodes.split(","); 

        for(var jj = 0; jj < newCodesSplitted.length; jj++) {
            var validCode = false;
            for(var ii = 0; ii < availableCodesSplitted.length; ii++) {
                if(availableCodesSplitted[ii] == newCodesSplitted[jj].trim().toUpperCase()) {
                    validCode = true;
                } 
            }

            if(!validCode){
                if (node.getObjectType().getID()=="Kit_Revision") {
                    return newCodesSplitted[jj] + " is not a valid Item Code for this Kit."
                } else {
                    return newCodesSplitted[jj] + " is not a valid Item Code for this Product."
                }
            }
        }
        
        return "OK";
    }
}
}