/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveProductObjects",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_ApproveProductObjects",
  "description" : "Used to approve product referenced objects",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Equipment_Revision", "Kit_Revision", "Product", "Product_Kit", "Product_Revision", "Service_Conjugates", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
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
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,manager,BA_Approve,bl_library) {
var businessRule = "Business Rule: BA_ApproveProductObjects";

function processNodesRecursively(node) {
    //Update Lot Objects if the object type is revision
    var checkServiceRevision = true;
    if (bl_library.isRevisionType(node, checkServiceRevision)) {

        var pRevtoTechTranType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
        var pTechTranLinks = node.getProductReferences().get(pRevtoTechTranType);

        if (pTechTranLinks && pTechTranLinks.size() > 0) {
            for (var i = 0; i < pTechTranLinks.size(); i++) {
                var revLotNode = pTechTranLinks.get(i).getTarget();
                if(node.getApprovalStatus().name() != "CompletelyApproved") {
                    BA_Approve.execute(revLotNode); //STEP-6039 approveProdObjects(revLotNode)
                }    
            }
        }
    }

    if(node.getApprovalStatus().name() != "CompletelyApproved") {
       BA_Approve.execute(node); //STEP-6039 approveProdObjects(node)
       logger.info("Object Name:  " + node.getName() + " Object Id: " + node.getID() + " after: Object Approval Status " + node.getApprovalStatus().name());
    }   
   
    var query = node.queryChildren();
    query.forEach(function (child) {
        //if revision then only not canceled
        if (bl_library.isRevisionType(child, checkServiceRevision)) {
            if(child.getValue("REVISIONSTATUS").getSimpleValue() != "Canceled") {
        		processNodesRecursively(child);
            }	
        }
    	   else {
        	processNodesRecursively(child);
    	   }
        return true;
    });

}

//Get the Parent Node in order to move the entire structure (Product, Product Kit, Equipment, Service_Conjugates)
var parent = null;
var checkServiceRevision = true;
var checkServiceConjugates = true;
if (bl_library.isRevisionType(node, checkServiceRevision)) {
    parent = node.getParent();
} else if (bl_library.isProductType(node, checkServiceConjugates)) {
    parent = node;
}

//Reparent the Node to the Reject bucket
if (parent) {
    logger.info(businessRule + " Approving :   " + node.getName() + " Object Id: " + parent.getObjectType().getID() + " Object Approval Status " + parent.getApprovalStatus().name());
    //Update UniqueKey Fields recursively
    processNodesRecursively(parent);

    processNodesRecursively(parent); // STEP-6039
}
}