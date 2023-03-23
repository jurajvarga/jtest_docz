/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Save_and_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Save_and_Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baSetFigureDisplayIndex",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Set_Figure_Display_Index",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,baSetFigureDisplayIndex,bl_AssetUpdatesUtil,bl_WorkflowUtil,lib) {
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

if (changeNeeded){
    webui.showAlert("WARNING", "Approve WIP Revision not allowed.", "Item was not approved because there is Figure Folder with a status of Change Needed.");
}
else {
	
	//Set Figure Display Index from Figure folder to Product Image/Datasheet Before Approval
	baSetFigureDisplayIndex.execute(node);
	
	//running the function previously in the BA_Save_and_Approve
	bl_WorkflowUtil.contentApproveSubmit(manager,node,webui,lib);

}
}