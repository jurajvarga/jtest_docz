/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_FigureFolderReviewStatus",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Set_FigureFolderReviewStatus",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "BL_AssetUpdatesUtil"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,BL_AssetUpdatesUtil) {
//STEP-6258
var productFigureReviewStatus = node.getValue("Figure_Status").getSimpleValue();
var changeNeeded = false;
var pendingReview = false;

//if (productFigureReviewStatus == null) {
//if (productFigureReviewStatus == null ){ //|| productFigureReviewStatus != "Approved") {

   //Check if exists FF with the status "Change Needed"
   changeNeeded = BL_AssetUpdatesUtil.isFFStatusChangeNeeded(node);

   if (changeNeeded){
      node.getValue("Figure_Status").setSimpleValue("Change Needed");
      //log.info(node + " Change Needed");    
   }
   else {

     //Check if exists FF with the status "Pending Review"
     pendingReview = BL_AssetUpdatesUtil.hasFFStatusPendingReview(node);

     if (pendingReview){
        node.getValue("Figure_Status").setSimpleValue("Pending Review");
        //log.info(node + " Pending Review");    
     }  
   }  
//}
}