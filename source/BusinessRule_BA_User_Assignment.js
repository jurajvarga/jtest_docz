/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_User_Assignment",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_User_Assignment",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product_Rev_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "workflow",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,workflow) {
/*if (!node.isInWorkflow("WF4-Dummy")) {
    node.startWorkflowByID("WF4-Dummy", "Returning to figure folder");
}*/
var pf2pRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var r2APRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
log.info('node_parent '+node.getName());
var parent = node;
var prodRevs = getProductRevision(parent);
for (var i = 0; i < prodRevs.length; i++){
				log.info(prodRevs[i].isInWorkflow("WF4-Dummy"))

if (!prodRevs[i].isInWorkflow("WF4-Dummy")) {
	log.info(prodRevs[i].getName())
     prodRevs[i].startWorkflowByID("WF4-Dummy", "Returning to figure folder");
     log.info(prodRevs[i].isInWorkflow("WF4-Dummy"))
  }		
}
            
function getProductRevision(parent){
	var prs = [];
     //STEP-6396    
     var pf2ps = parent.queryReferencedBy(pf2pRefType);
  
     pf2ps.forEach(function(pf2p) {
         var pf2pTarget = pf2p.getSource();
         var p2WRs = pf2pTarget.queryReferences(p2WRRefType);

         p2WRs.forEach(function(p2WR) {
            var p2WRTarget = p2WR.getTarget();

             prs.push(p2WRTarget);
             return true;
         });
         return true;
     });
     //STEP-6396
	return prs;
}

var task = node.getWorkflowInstance(workflow).getTaskByID("PAG_Review");
var reassignUser = node.getValue("PAG_Assignment").getSimpleValue();
logger.info("reassignUser "+reassignUser);
if(reassignUser!=null) {
    var user = manager.getUserHome().getUserById(reassignUser);
    logger.info("user "+user);
    if(user!=null){
        manager.executeWritePrivileged(function() {
            task.reassign(user);
        } );
    }
}
}