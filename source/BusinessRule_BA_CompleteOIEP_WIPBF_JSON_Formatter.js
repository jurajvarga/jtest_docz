/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CompleteOIEP_WIPBF_JSON_Formatter",
  "type" : "BusinessAction",
  "setupGroups" : [ "Outbound_WIP_BF_Revision" ],
  "name" : "BA_CompleteOIEP_WIPBF_JSON_Formatter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "Product", "Product_Kit", "Product_Revision" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "BL_JSONCreation"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_Maintenance"
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
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,manager,executionReportLogger,BL_JSONCreation,BL_Library,BL_Maintenance) {
// Node Handler Source bound to nodeHandlerSource
// Node Handler Result bound to nodeHandlerResult

Object.buildRegionalNodeMessage = function buildRegionalNodeMessage(node, simpleEventType) {
    executionReportLogger.logInfo("  buildRegionalNodeMessage ");
    var mesg = {};

    //If the Object is Product Revision/Kit Revision ,get Parent.
    if (node.getObjectType().getID().equals("Regional_Revision")) {
        product = node.getParent();
    }

    mesg.eventid = simpleEventType.getID() + "";

    var productstepid = product.getID() + "";
    var productno = product.getValue("PRODUCTNO").getSimpleValue() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;

    var prodRegRevnodeID = node.getID() + "";
    var prodRegRevname = node.getName() + "";
    var prodRegRevNo = node.getValue("REVISIONNO").getSimpleValue() + "";
    var prodRegRevStatus = node.getValue("REVISIONSTATUS").getSimpleValue() + "";
    var prodRegEuDGClassfication = node.getValue("EU_DG_Classification").getSimpleValue() + "";

    mesg.REVISIONID = prodRegRevnodeID;
    mesg.REVISIONNO = prodRegRevNo;
    mesg.REVISIONSTATUS = prodRegRevStatus;
    mesg.EU_DG_Classification = prodRegEuDGClassfication;


    var initiatedCountry = "";
    var initiatedRevNo = "";


    var krs = []; //kit revision sku
    var prodRegRevReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Regional_Revision");

    var prodRegRevReferences = product.queryReferences(prodRegRevReferenceType);//STEP-6396
    var currev = [] //currev array
    prodRegRevReferences.forEach(function(ref) {    //STEP-6396

        var initiatedCountyTmp = ref.getValue("Initiated_Country").getSimpleValue() + "";//STEP-6396
        if (prodRegRevname.indexOf(initiatedCountyTmp) > 0) {
            initiatedCountry = initiatedCountyTmp;
            initiatedRevNo = ref.getValue("Initiated_REVISIONNO").getSimpleValue() + ""; //STEP-6396
        }
        return true; //STEP-6396
    });

    mesg.Initiated_Country = initiatedCountry;
    mesg.Initiated_RevNo = initiatedRevNo;

    //STEP-6250
    var regRevWfName = node.getValue("Workflow_Name_Initiated").getSimpleValue() + "";
    var regRevWfBy = node.getValue("Workflow_Initiated_By").getSimpleValue() + "";
    var regRevMsSelected = node.getValue("MasterStock_Selected").getSimpleValue() + "";
    var regRevWfNotes = node.getValue("Workflow_Notes").getSimpleValue() + "";

    mesg.Workflow_Name_Initiated = regRevWfName;
    mesg.Workflow_Initiated_By = regRevWfBy;
    mesg.MasterStock_Selected = regRevMsSelected;
    mesg.Workflow_Notes = regRevWfNotes;
    //STEP-6250 ENDS

    //Get Masterstock and SKU for pricing event
    var mss = [];
    var children = product.getChildren();
    for (i = 0; i < children.size(); i++) {

        var child = children.get(i);
        var childId = child.getObjectType().getID();
        //log.info("childId"+childId);
        if (childId == "MasterStock") {
            //To get Child Main Attributes
            var chJson = BL_JSONCreation.getObjectAttributesJson(child, false);

            var mssrevisionid = child.getID() + "";
            chJson["MASTERSTOCKSTEPID"] = mssrevisionid;


            //To Get Child of Child Values
            var gcl = [];
            var gcnameid = "";
            var grandchild = child.getChildren();
            for (j = 0; j < grandchild.size(); j++) {

                var gcobj = grandchild.get(j);
                var gcId = gcobj.getObjectType().getID();
                //log.info(" gcId "+gcId);
                gcnameid = gcId + "s";

                // json with SKU attributes
                var jsonGC = BL_JSONCreation.getObjectAttributesJson(gcobj, false);

                var skuid = gcobj.getID() + "";
                jsonGC["SKUSTEPID"] = skuid;

                gcl.push(jsonGC);
            }

            chJson[gcnameid] = gcl;
            mss.push(chJson);
            mesg[childId] = mss;
        }
    }

    return mesg;
};

//Changes done for STEP-5564
//Node Message Built for Maintenance Event Creation

Object.buildMaintenanceEventNodeMessage = function buildMaintenanceEventNodeMessage(node, simpleEventType) {
    executionReportLogger.logInfo("  buildMaintenanceEventNodeMessage ");
    var mesg = {};
    // STEP-6286
    var notify = false;
    var product;
    //If the Object is Product Revision/Kit Revision/Equipment Revision, get Parent.
    //STEP-6035 + STEP-6513
    var checkServiceRevision = true;
    if (BL_Library.isRevisionType(node, checkServiceRevision)) {
        product = node.getParent();
    }
    //END STEP-6035



    mesg.eventid = simpleEventType.getID() + "";
    //For testing monitor process
    //node=null;
     var productstepid =  "";
    var productno = "";
 if (product!=null){

     productstepid = product.getID() + "";
     productno = product.getValue("PRODUCTNO").getSimpleValue() + "";
 }
    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;


    //To Get Product Attributes
    var prodAttrJson = BL_JSONCreation.getObjectAttributesJson(product, false);

    mesg = BL_JSONCreation.mergeJsonObjects(mesg, prodAttrJson);


    var mss = [];
    var children = product.getChildren();
    for (i = 0; i < children.size(); i++) {

        var child = children.get(i);
        var childId = child.getObjectType().getID();
        //log.info("childId"+childId);
        if (childId == "MasterStock") {
            //To get Child Main Attributes
            var chJson = BL_JSONCreation.getObjectAttributesJson(child, false);

            var mssrevisionid = child.getID() + "";
            chJson["MASTERSTOCKSTEPID"] = mssrevisionid;


            //To Get Child of Child Values
            var gcl = [];
            var gcnameid = "";
            var grandchild = child.getChildren();
            for (j = 0; j < grandchild.size(); j++) {

                var gcobj = grandchild.get(j);
                var gcId = gcobj.getObjectType().getID();
                //log.info(" gcId "+gcId);
                gcnameid = gcId + "s";

                // json with SKU attributes
                var jsonGC = BL_JSONCreation.getObjectAttributesJson(gcobj, false);

                var skuid = gcobj.getID() + "";
                jsonGC["SKUSTEPID"] = skuid;

                gcl.push(jsonGC);
            }

            chJson[gcnameid] = gcl;
            mss.push(chJson);
            mesg[childId] = mss;
        }
    }
    //executionReportLogger.logInfo (" gcnameid "+gcnameid);

    var currev = [] //currev array
    var prodCurRevnode = node;
    //logger.info(" prodCurRevnode "+prodCurRevnode);

    var prodCurRevnodeID = prodCurRevnode.getID() + "";


    //To Get Tech Transfer Lot  Information
    var techtranslot = BL_JSONCreation.getLots(manager, prodCurRevnode);



    //To get Current Revision  Attributes

    var crtarget = BL_JSONCreation.getObjectAttributesJson(prodCurRevnode, false);

    var prodCurRevname = prodCurRevnode.getName() + "";
    var masterStockStepID = BL_JSONCreation.getProductRevision_To_MasterStock(manager, prodCurRevnode, notify);

    crtarget["name"] = prodCurRevname;
    crtarget["PRODUCTSTEPID"] = productstepid;
    crtarget["PRODUCTNO"] = productno;
    crtarget["REVISIONID"] = prodCurRevnodeID;
    crtarget["ProductRevision_To_MasterStock"] = masterStockStepID;

    currev.push(crtarget);

    mesg.ProductToWIPRevision = currev;
    mesg.TechTransferLot = techtranslot;

    return mesg;
};


//Changes done for STEP-5564


Object.buildNodeMessage = function buildNodeMessage(node, simpleEventType) {
    //log.info(" ================ 100 inside function buildNodeMessage" );

    var mesg = {};
    var notify = false;

    //If the Object is Product Revision/Kit Revision/Equipment, get Parent.
    // STEP-6035 + STEP-6513
    var checkServiceRevision = true;
    if (BL_Library.isRevisionType(node, checkServiceRevision)) {
        node = node.getParent();
    }
    //END STEP-6035

    var kit = false;
    if (node.getObjectType().getID().equals("Product_Kit") || node.getObjectType().getID().equals("Kit_Revision")) {
        kit = true;
    }

    mesg.eventid = simpleEventType.getID() + "";
    //For testing monitor process
    //node=null;
    var productstepid = node.getID() + "";
    var productno = node.getValue("PRODUCTNO").getSimpleValue() + "";

    mesg.PRODUCTNO = productno;
    mesg.stepid = productstepid;


    //To Get Product Attributes
    var prodAttrJson = BL_JSONCreation.getObjectAttributesJson(node, false);

    mesg = BL_JSONCreation.mergeJsonObjects(mesg, prodAttrJson);


    var mss = [];
    var children = node.getChildren();
    for (i = 0; i < children.size(); i++) {

        var child = children.get(i);
        var childId = child.getObjectType().getID();
        //log.info("childId"+childId);
        if (childId == "MasterStock") {
            //To get Child Main Attributes
            var chJson = BL_JSONCreation.getObjectAttributesJson(child, false);

            var mssrevisionid = child.getID() + "";
            chJson["MASTERSTOCKSTEPID"] = mssrevisionid;


            //To Get Child of Child Values
            var gcl = [];
            var gcnameid = "";
            var grandchild = child.getChildren();
            for (j = 0; j < grandchild.size(); j++) {

                var gcobj = grandchild.get(j);
                var gcId = gcobj.getObjectType().getID();
                //log.info(" gcId "+gcId);
                gcnameid = gcId + "s";

                // json with SKU attributes
                var jsonGC = BL_JSONCreation.getObjectAttributesJson(gcobj, false);

                var skuid = gcobj.getID() + "";
                jsonGC["SKUSTEPID"] = skuid;

                gcl.push(jsonGC);
            }

            chJson[gcnameid] = gcl;
            mss.push(chJson);
            mesg[childId] = mss;
        }
    }
    //executionReportLogger.logInfo (" gcnameid "+gcnameid);



    var krs = []; //kit revision sku

    var prodCurRevnode = BL_Maintenance.getWIPRevision(node) //STEP-6396

    var currev = [] //currev array
    if (prodCurRevnode) { //STEP-6396

        //logger.info(" prodCurRevnode "+prodCurRevnode);

        var prodCurRevnodeID = prodCurRevnode.getID() + "";


        //To Get Tech Transfer Lot  Information
        var techtranslot = BL_JSONCreation.getLots(manager, prodCurRevnode);


        if (kit) {

            //Get All SKU Objects
            var kitComponents = new java.util.TreeMap();

            var kitRevskuReferenceType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
            var kitRevskuReferences = prodCurRevnode.queryReferences(kitRevskuReferenceType); //STEP-6396
            kitRevskuReferences.forEach(function(ref) {    //STEP-6396

                var kitRevSkuNode = ref.getTarget();//STEP-6396
                // executionReportLogger.logInfo ( " kitRevSkuNode "+kitRevSkuNode);

                var kitRevSkuName = kitRevSkuNode.getName() + "";
                //executionReportLogger.logInfo ( " kitRevSkuName "+kitRevSkuName);

                kitComponents.put(kitRevSkuName, kitRevSkuNode)
                return true; //STEP-6396
            });
            // executionReportLogger.logInfo ( " size "+kitComponents.size());


            //Get Kit SKU attributes

            var curRevKitCompChildList = prodCurRevnode.getChildren();
            // executionReportLogger.logInfo ( " size "+curRevKitCompChildList.size());
            for (var i = 0; i < curRevKitCompChildList.size(); i++) {
                var curRevKitCompChild = curRevKitCompChildList.get(i);
                if (curRevKitCompChild.getObjectType().getID() == "Kit_Component") {

                    var componentSku = curRevKitCompChild.getValue("COMPONENTSKU").getSimpleValue();

                    var licenseOnlyFlag = curRevKitCompChild.getValue("LICENSINGONLYFLAG_YN").getSimpleValue();
                    var promotionOnlyFlag = curRevKitCompChild.getValue("PROMOTIONONLY_YN").getSimpleValue();


                    //executionReportLogger.info(" Component SKU "+componentSku +" licenseOnlyFlag "+licenseOnlyFlag+" promotionOnlyFlag "+promotionOnlyFlag);

                    if (licenseOnlyFlag == "N" && promotionOnlyFlag == "N") {
                        executionReportLogger.logInfo(" Component SKU" + componentSku);

                        var kitRevSkuTargetNode = kitComponents.get(componentSku);
                        if (kitRevSkuTargetNode != null) {
                            //executionReportLogger.logInfo (" kitRevSkuTargetNode "+kitRevSkuTargetNode);
                            var kitRevSkuTargetName = kitRevSkuTargetNode.getName() + "";
                            executionReportLogger.logInfo(" kitRevSkuTargetName " + kitRevSkuTargetName);

                            //To get Kit SKU attributes
                            var ksJson = BL_JSONCreation.getObjectAttributesJson(kitRevSkuTargetNode, false);


                            var curRevKitCompChildValues = curRevKitCompChild.getValues();
                            var itKCVal = curRevKitCompChildValues.iterator();
                            while (itKCVal.hasNext()) {
                                var attrValueKCVal = itKCVal.next();
                                var attributeKCVal = "";
                                if (attrValueKCVal != null) {
                                    attributeKCVal = attrValueKCVal.getAttribute();
                                    var attributeID = attributeKCVal.getID();
                                    //STEP-6759 attributeID == "COMPONENTINDEX" => "COMPONENTORDER"
                                    if (attributeID == "PROMOTIONONLY_YN" || attributeID == "COMPONENTORDER" || attributeID == "SolutionColor" || attributeID == "LICENSINGONLYFLAG_YN" || attributeID == "COMPONENTCOUNT" ||
                                        attributeID == "COMPONENTSKUNAME" || attributeID == "COMPONENTPARENTKITSKU" || attributeID == "LabelNameOverride" || attributeID == "CapColor") {
                                        var attValKCVal = "";
                                        if (attrValueKCVal.getSimpleValue() != null) {
                                            attValKCVal = attrValueKCVal.getSimpleValue() + "";
                                            //executionReportLogger.logInfo (" *************** "+attributeKCVal.getID()+" "+attValKCVal);
                                            ksJson[attributeKCVal.getID()] = attValKCVal;
                                        }
                                    }
                                }
                            }

                            krs.push(ksJson);

                        }
                    }



                }
            }

            mesg["KitRevisionToSKU"] = krs;
        }


        //To get Current Revision  Attributes

        var crtarget = BL_JSONCreation.getObjectAttributesJson(prodCurRevnode, false);

        var prodCurRevname = prodCurRevnode.getName() + "";
        var masterStockStepID = BL_JSONCreation.getProductRevision_To_MasterStock(manager, prodCurRevnode, notify);

        crtarget["name"] = prodCurRevname;
        crtarget["PRODUCTSTEPID"] = productstepid;
        crtarget["PRODUCTNO"] = productno;
        crtarget["REVISIONID"] = prodCurRevnodeID;
        crtarget["ProductRevision_To_MasterStock"] = masterStockStepID;

        currev.push(crtarget);
    }




    mesg.ProductToWIPRevision = currev;
    mesg.TechTransferLot = techtranslot;


    return mesg;
};

//Start of Event Process
var simpleEventType = nodeHandlerSource.getSimpleEventType();
if (simpleEventType == null) {
    executionReportLogger.logInfo("No event information available in node handler");
} else {
    executionReportLogger.logInfo("Event with ID '" + simpleEventType.getID() + "' passed to node handler");
}

var node = nodeHandlerSource.getNode();
executionReportLogger.logInfo(" approvalStatus " + node.getApprovalStatus());
var mesgfinal;

//Changes done for STEP-5564 - Rework Starts
if (node != null && (simpleEventType.getID() == "MaintenanceWorkflowCanceled" || simpleEventType.getID() == "MaintenanceWorkflowCompleted" || simpleEventType.getID() == "MaintenanceWorkflowInitiated") && !node.getObjectType().getID().equals("Regional_Revision")) {
    if (nodeHandlerSource.isDeleted()) {
        mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
        nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
    } else {
        mesgfinal = Object.buildMaintenanceEventNodeMessage(node, simpleEventType);
    }
    nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
} else {

//Changes done for STEP-5564 - Rework Ends

    if (node != null && (node.getApprovalStatus() == "Partly approved" || node.getApprovalStatus() == "Not in Approved workspace")) {
        var checkServiceRevision = false;
        if (node != null && (node.getObjectType().getID().equals("Product_Kit") || node.getObjectType().getID().equals("Product") ||
            node.getObjectType().getID().equals("Equipment") || BL_Library.isRevisionType(node, checkServiceRevision))) {
            //executionReportLogger.logInfo(" Product Kit ");
            if (nodeHandlerSource.isDeleted() && !simpleEventType.getID().equals("RejectTechTransfer")) {
                mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
                nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
            } else {
                mesgfinal = Object.buildNodeMessage(node, simpleEventType);
            }
            nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
        } else if (node != null && node.getObjectType().getID().equals("Regional_Revision")) {
            //executionReportLogger.logInfo(" Product Kit ");
            if (nodeHandlerSource.isDeleted()) {
                mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
                nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
            } else {
                mesgfinal = Object.buildRegionalNodeMessage(node, simpleEventType);
            }
            nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
        }

    } else if (node != null && (node.getApprovalStatus() == "Completely Approved")) {	   
        if (simpleEventType.getID() == "RegionalRevisionCompleted") { 
            if (nodeHandlerSource.isDeleted()) {
                mesgfinal = BL_JSONCreation.buildNodeDeleteMessage(node, simpleEventType);
                nodeHandlerResult.addMessage("delete", JSON.stringify(mesgfinal));
            } else {
                mesgfinal = Object.buildRegionalNodeMessage(node, simpleEventType);
            }
            nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
            
		//STEP-6176
        } else if (simpleEventType.getID() == "ProductCopyCompleted"){ 
				 mesgfinal = Object.buildNodeMessage(node, simpleEventType);
				 nodeHandlerResult.addMessage("upsert", JSON.stringify(mesgfinal, BL_JSONCreation.htmlEntities));
    	            }
	}
}
}