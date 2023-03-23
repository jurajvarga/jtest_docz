/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Global_Exit_Product_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_Global_Exit_Product_Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
exports.operation0 = function (node,manager,BL_Library) {
var wfID = "Product_Maintenance_Upload";
var wf = manager.getWorkflowHome().getWorkflowByID(wfID);
var stateID;

BL_Library.clearAttributesInAttributeGroup(manager, node, "Product_Maintenance_Clear_Attributes", null); // STEP-6074


if (node.isInState(wfID, "UserSystem_Initiated_Maintenance") || node.isInState(wfID, "OTS_Conversion")) { // STEP-5841 added OTS Conversion
    // other maintenances

    //stateID = "UserSystem_Initiated_Maintenance"; // STEP-5841 
    stateID = node.isInState(wfID, "UserSystem_Initiated_Maintenance") == true ? "UserSystem_Initiated_Maintenance" : "OTS_Conversion"; // STEP-5841

    // Delete Product Maintenance Documents references in the a product
    var refTypeMaintDocs = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");
    //STEP-6396
    var refProdMaintDocsLinks = node.queryReferences(refTypeMaintDocs);
    refProdMaintDocsLinks.forEach(function(refProdMaintDocsLink) {
        refProdMaintDocsLink.delete();
        return true;
    });
    //STEP-6396

    // Delete Tech Transfer references in the a product
    var refTypeTT = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Tech_Transfer");
    //STEP-6396
    var refProdTTLinks = node.queryReferences(refTypeTT);
    refProdTTLinks.forEach(function(refProdTTLink) {    
        refProdTTLink.delete();
        return true;
    });
    //STEP-6396

} else if (node.isInState(wfID, "Product_Status_Maintenance")) {
    // product status change

    stateID = "Product_Status_Maintenance";

    // Get the Product Status Change Documents reference type
    var refTypeStatusChangeDocs = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Status_Change_Documents");
    // delete old Product Status Change Documents references in a product
    //STEP-6396    
    var refProdStatusChangeDocsLinks = node.queryReferences(refTypeStatusChangeDocs);
    refProdStatusChangeDocsLinks.forEach(function(refProdStatusChangeDocsLink) {       
        refProdStatusChangeDocsLink.delete();
        return true;
    });
    //STEP-6396 

    // set attribute values on a product to blank when exiting workflow
    //Changes done for STEP-5847 Starts
    //Get approved node to set previous value if values are changed
    var prodTeamPlannerChanged = node.getValue("ProdTeam_Planner_Product").getSimpleValue();
    var releaseNotesChanged = node.getValue("RELEASENOTES").getSimpleValue();
    var approvedNode = BL_Library.getApprovedNode(manager, node);
    var prodTeamPlannerOriginal = approvedNode.getValue("ProdTeam_Planner_Product").getSimpleValue();
    var releaseNotesOriginal = approvedNode.getValue("RELEASENOTES").getSimpleValue();

    log.info("ProdTeam_Planner_Product Current" + prodTeamPlannerChanged);
    log.info("ReleaseNotes  Current" + releaseNotesChanged);
    log.info("ProdTeam_Planner_Product Previous" + prodTeamPlannerOriginal);
    log.info("releaseNotes Previous" + releaseNotesOriginal);

    if (prodTeamPlannerChanged != prodTeamPlannerOriginal) {
        node.getValue("ProdTeam_Planner_Product").setSimpleValue(prodTeamPlannerOriginal);
    }
    if (releaseNotesChanged != releaseNotesOriginal) {
        node.getValue("RELEASENOTES").setSimpleValue(releaseNotesOriginal);
    }

    //Changes done for STEP-5847 Ends

    BL_Library.clearAttributesInAttributeGroup(manager, node, "Product_Status_Main_Clear_Attributes", null); // STEP-6074

}

// Remove from the workflow
if (stateID) {
    log.info("Triggering Submit for exiting the product from the Product Maintenance Upload workflow.");
    // STEP-5818 adding an argument to function
    BL_Library.triggerTransition(node, "Cancel", wfID, stateID, false);
    // STEP-5818 ends
}
}