/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ApproveRevisionObjects",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_ApproveRevisionObjects",
  "description" : "Used to approve revision referenced objects.",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Regional_Revision", "Service_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
exports.operation0 = function (node,logger,manager,BA_Approve,BL_Library,BL_MaintenanceWorkflows) {
//STEP-6465
var businessRule = "Business Rule: BA_ApproveRevisionObjects";

function processNodesRecursively(obj) {
    if (obj.getValue("REVISIONSTATUS").getSimpleValue() != "Canceled" && (BL_Library.isRevisionType(obj, true) || obj.getObjectType().getID() == "Regional_Revision")) {
        var product = obj.getParent();

        //Approval of SDS Product Folder and its sds asset links - Regional Revisions need SDS completely approved for their complete approval
        var sdsProductFolder = BL_Library.getProductChildren(product, "Product_SDS_Folder");

        if (sdsProductFolder && sdsProductFolder.length > 0) {
            if (sdsProductFolder[0].getApprovalStatus().name() == "NotInApproved") {
                processNodesRecursively(sdsProductFolder[0]);
            }
        }

        if (BL_Library.isRevisionType(obj, true)) {
            lotApproval(manager, "ProductRevision_to_Lot");
        }
        /* 
         *  ELSE IF statement handles scenario for NPI:
         *  When product was released and after that regional revision is submitted - the revision first stayed partly approved. 
         *  It happened also in the scenario when RR was submitted at first, then product was released, first submitted revision stayed partly approved. 
         */
        else if (obj.getValue("Workflow_Type").getSimpleValue() == "N" && obj.getObjectType().getID() == "Regional_Revision") {
            lotApproval(manager, "RegionalRevision_to_Lot");
            
            var currentOrWipRev = BL_MaintenanceWorkflows.getCurrentRevision(product) || BL_MaintenanceWorkflows.getWIPRevision(product);

            if (currentOrWipRev != null && currentOrWipRev.getApprovalStatus().name() != "NotInApproved" && currentOrWipRev.getValue("REVISIONNO").getSimpleValue() == "1") {
                BA_Approve.execute(currentOrWipRev);
            }

            var arrayRegionalRevisions = BL_Library.getProductChildren(product, "Regional_Revision");
            arrayRegionalRevisions.forEach(function (regRev) {
                if (regRev.getApprovalStatus().name() != "NotInApproved") {
                    BA_Approve.execute(regRev);
                }
            });
        }

        var masterStock = BL_Library.getMasterStockForRevision(manager, obj);
        if (masterStock) {
                processNodesRecursively(masterStock);
        }
    }

    if (obj.getApprovalStatus().name() != "CompletelyApproved") {
        BA_Approve.execute(obj);
        logger.info("Object Name:  " + obj.getName() + " Object Id: " + obj.getID() + " after first: Object Approval Status " + obj.getApprovalStatus().name());
    }

    var query = obj.queryChildren();
    query.forEach(function (child) {
        processNodesRecursively(child);
        return true;
    });

    if (obj.getApprovalStatus().name() != "CompletelyApproved") {
        BA_Approve.execute(obj);
        logger.info("Object Name:  " + obj.getName() + " Object Id: " + obj.getID() + " after second: Object Approval Status " + obj.getApprovalStatus().name());
    }

}

//Get the Parent Node in order to move the entire structure (Product, Product Kit, Equipment, Service_Conjugates)
var parent = node.getParent();
logger.info(businessRule + " Approving :   " + parent.getName() + " Object Id: " + parent.getObjectType().getID() + " Object Approval Status " + parent.getApprovalStatus().name());
BA_Approve.execute(parent);
logger.info(businessRule + " Approving :   " + node.getName() + " Object Id: " + node.getObjectType().getID() + " Object Approval Status " + node.getApprovalStatus().name());
processNodesRecursively(node);
BA_Approve.execute(parent);
logger.info("Object Name:  " + parent.getName() + " Object Id: " + parent.getID() + " after final: Object Approval Status " + parent.getApprovalStatus().name());



function lotApproval(manager, refType) {
    var pRevtoTechTranType = manager.getReferenceTypeHome().getReferenceTypeByID(refType);
    var pTechTranLinks = node.queryReferences(pRevtoTechTranType);

    pTechTranLinks.forEach(function (pTechTranLink) {
        var revLot = pTechTranLink.getTarget();

        if (revLot) {
            if (revLot.getApprovalStatus().name() != "CompletelyApproved") {
                processNodesRecursively(revLot);
            }
        }
        return true;
    });
}
}