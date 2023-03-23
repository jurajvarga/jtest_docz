/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RevertNodes",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_RevertNodes",
  "description" : "Reverts specific attributes of all children that are not \"Completely Approved\"  to the values from the Approved Workspace.",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "LibMaintain"
  }, {
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,LibMaintain,bl_library) {
// Reverts specific attributes of all children that are not in the approval status = "Completely Approved" to the values from the Approved Workspace.
// Applied to the Master Stock of the input node (product revision)
var businessRule = "Business Rule: BA_RevertNodes";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();
log.info(bl_library.logRecord([businessRule, currentObjectID, currentDate]));

var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
//log.info("wfInitiatedNo " + wfInitiatedNo)

var isChinaMaintenanceWf = LibMaintain.isChinaMaintenanceWokflow(wfInitiatedNo);
var isJapanMaintenanceWf = LibMaintain.isJapanMaintenanceWokflow(wfInitiatedNo);
var isEUMaintenanceWf = LibMaintain.isEUMaintenanceWokflow(wfInitiatedNo);

if (isChinaMaintenanceWf || isJapanMaintenanceWf ||isEUMaintenanceWf)
   var refType = manager.getReferenceTypeHome().getReferenceTypeByID("RegionalRevision_To_MasterStock");
else
   var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
   
if (refType){
    //STEP-6396
    var msRefs = node.queryReferences(refType);
    var mStock = "";
    msRefs.forEach(function(msRef) {
        mStock = msRef.getTarget();
        return false;
    }); 
    var masterStock = mStock;
    //STEP-6396
	var reverted = "N";
	
	var childIter = masterStock.getChildren().iterator();
	while (childIter.hasNext()) {
	
	   var child = childIter.next();
	   //log.info(child.getName() + " - " + child.getApprovalStatus());
	
	   if (child.getApprovalStatus() != "Completely Approved") {
	
	       // node from the approved workspace
	       var childAppWs = bl_library.getApprovedNode(manager, child);
	
	       // if the child exists in the approved Workspace
	       if (childAppWs) {
	
                //STEP-5877 Refactor reverted SKU values for the cancel maintenance
                if (isEUMaintenanceWf) {
                    //STEP-5957
                    bl_library.copyAttributes(manager, childAppWs, child, "Editable_SKU_EU_Attr", null);
                    reverted = "Y";
        
                } else if (isJapanMaintenanceWf) {
                    //STEP-5957
                    bl_library.copyAttributes(manager, childAppWs, child, "Editable_SKU_Japan_Attr", null);
                    reverted = "Y";
        
                } else if (isChinaMaintenanceWf) {
                    //STEP-5957
                    bl_library.copyAttributes(manager, childAppWs, child, "Editable_SKU_China_Attr", null);
                    reverted = "Y";
        
                } else { //For all non regional maintenance workflows
      			    //STEP-5957
                        bl_library.copyAttributes(manager, childAppWs, child, "Editable_SKU_Attr", null);
                        reverted = "Y";
                }

                try {
                    if (reverted = "Y") {
                        child.approve();
                    }
                } catch (e) {
                    if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                        log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                        log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                        log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

                    } else {
                        log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                        throw (e);
                    }
            }
	           
	   } else //SKU is not in the Approved workspace
		   	{
		       bl_library.deleteRefRecursively(child);
		       bl_library.deleteRefByRecursively(child);
		       child.delete();
		       log.info("Deleted SKU: " + child.getID());
		   }
	   }
	}
}

// STEP-5834 adding removing master stock on cancel if it has never been apprvoed before
var msApprovedWs = bl_library.getApprovedNode(manager, masterStock);
if (!msApprovedWs) {
   bl_library.deleteRefRecursively(masterStock);
   bl_library.deleteRefByRecursively(masterStock);
   masterStock.delete();
   log.info("Deleted Master Stock: " + masterStock.getID());
}

// STEP-5738
//revert attr from MS for system initiated WF 20 and 12
//revert MS attributes on the Product from MS
//STEP-5965
var isSystem_Initiated = node.getValue("System_Initiated").getSimpleValue();
if ((wfInitiatedNo == "20" || wfInitiatedNo == "12" || wfInitiatedNo == "2") && isSystem_Initiated == "Y" && masterStock.getApprovalStatus() != "Completely Approved") { // STEP-5841 added or wf==2

   // node from the approved workspace
   var masterStockAppWs = bl_library.getApprovedNode(manager, masterStock);

   // if the MS exists in the approved Workspace
   if (masterStockAppWs) {
   	   //STEP-6010
        var attGroup = manager.getAttributeGroupHome().getAttributeGroupByID("New_Revision_Evaluation_Attributes");
        if (attGroup != null) {
            var lstAttributes = attGroup.getAttributes();
            var iterator = lstAttributes.iterator();

            while (iterator.hasNext()) {
                var attribute = iterator.next();
                
                //All MS attributes from the group New_Revision_Evaluation_Attributes are replaced with value from approved ws 
                if (attribute.getValidForObjectTypes().contains(masterStock.getObjectType())) {
                    var sAttributeID = attribute.getID();
                    var valueAppWs = masterStockAppWs.getValue(sAttributeID).getSimpleValue();
                    masterStock.getValue(sAttributeID).setSimpleValue(valueAppWs);
                }
            }
        }

       // revert MS passthrough attributes
       // STEP-5713
       //STEP-5957
       //STEP-6121
       //bl_library.copyAttributes(manager, masterStockAppWs, masterStock, "TTPT_Masterstock_Attributes", null);

       try {
           masterStock.approve();
       } catch (e) {
           if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
               log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

           } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
               log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

           } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
               log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

           } else {
               log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
               throw (e);
           }
       }
       

   }
}

//STEP-6010 revert attribute ProdTeam_Planner_Product and Dangerous_Goods_Flag_YN
var parent = node.getParent();
// parent from the approved workspace
var productAppWs = bl_library.getApprovedNode(manager, parent);
// if the product exists in the approved Workspace
if (productAppWs) {
    //Lib.copyAttributes(manager, productAppWs, parent, "TTPT_Product_Attributes", null);
    parent.getValue("ProdTeam_Planner_Product").setSimpleValue(productAppWs.getValue("ProdTeam_Planner_Product").getSimpleValue());
    log.info("Reverted value for ProdTeam_Planner_Product attribute to " + productAppWs.getValue("ProdTeam_Planner_Product").getSimpleValue());
    // STEP-6390 reverted attribute value "Dangerous_Goods_Flag_YN" on the product
    parent.getValue("Dangerous_Goods_Flag_YN").setSimpleValue(productAppWs.getValue("Dangerous_Goods_Flag_YN").getSimpleValue());
    // STEP-6755
    parent.getValue("Lot_Recombinant_Flag").setSimpleValue(productAppWs.getValue("Lot_Recombinant_Flag").getSimpleValue());
}
}