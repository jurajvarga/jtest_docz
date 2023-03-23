/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SaveApprove_and_UpdateQueuedRev",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_SaveApprove_and_UpdateQueuedRev",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "bl_AssetUpdatesUtil"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "bl_WorkflowUtil"
  }, {
    "libraryId" : "BL_Library",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetAttr_fromContentOnly",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_setAttr_fromContentOnly",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetFigureDisplayIndex",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Set_Figure_Display_Index",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,baSetAttr_fromContentOnly,baSetFigureDisplayIndex,manager,webui,bl_AssetUpdatesUtil,bl_WorkflowUtil,lib) {
var businessRule = "Business Rule: BA_SaveApprove_and_UpdateQueuedRev";
var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
//log.info(wfInitiatedNo +" *** "+ node.isInState("WF6_Content_Review_Workflow", "Copy_Editor_Review"));

//removed this restriction to make it easier for user to just click one button always and to support other workflows updating queued revisions.
//if (wfInitiatedNo == "19") {
    var changeNeeded = false;
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
    //STEP-6396
    var links = node.queryReferences(refType);
    links.forEach(function(ref) {
        var productFolder = ref.getTarget();
        //Check if exists FF with the status "Change Needed"
        changeNeeded = bl_AssetUpdatesUtil.isFFStatusChangeNeeded(productFolder);
        return true;
    });
    //STEP-6396

    if (changeNeeded) {
        webui.showAlert("WARNING", "Approve WIP & Update Queued Revision not allowed.", "Item was not approved because there is Figure Folder with a status of Change Needed.");
    } else {
        //Set Figure Display Index from Figure folder to Product Image/Datasheet Before Approval
        baSetFigureDisplayIndex.execute(node);

        //Update all attributes from Content Review on all revision in the Revision Release WF.		
        baSetAttr_fromContentOnly.execute(node);

        //running the function previously in the BA_Save_and_Approve
        bl_WorkflowUtil.contentApproveSubmit(manager, node, webui, lib);
    }
/*
} else {
    webui.showAlert("ERROR", "Approve WIP & Update Queued revisions.", "The Button works only for the revision in the Content Only workflow.");
}
*/
}