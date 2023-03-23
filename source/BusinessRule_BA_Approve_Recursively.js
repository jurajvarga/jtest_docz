/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Approve_Recursively",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA_Approve_Recursively",
  "description" : "Approves CLP attributes for updates during import process",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Equipment_Revision", "Kit_Component", "Kit_Revision", "MasterStock", "Product", "ProductImageRoot", "ProductStatusDocuments", "Product_Kit", "SDS_ASSET_URL_LINK", "SKU", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "bl_approve"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,bl_approve,bl_library) {
// This business rule approves updates to data in PDP flowing into STEP while the product is still in the regional pricing workflow.
// variables for logging
//


var businessRule = "Business Rule: BA_Approve_Recursively";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

logger.info(bl_library.logRecord(["Starting", businessRule, currentObjectID]))

var date = new Date();

function approveObj(obj) {
    var date2 = new Date();
    if (date2 - date >= 15000) {
        throw "error, ran too long";
    }
    try {

        node.approve();
    }
    catch (e) {
        if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
            logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
            logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
            logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

        } else {
            logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            throw (e);
        }
    } 
      logger.info(bl_library.logRecord([businessRule, "approved object", obj.getID()]))
    


    var children = obj.getChildren().iterator();
    while (children.hasNext()) {
        var child = children.next();

        // If an object is completely approved it's children will not be approved

        logger.info(bl_library.logRecord([businessRule, "child object", child.getID(), " getApprovalStatus ", child.getApprovalStatus().name()]))
        if (child.getApprovalStatus().name() != "CompletelyApproved") {
            approveObj(child);
        }
        // Added by Asha STEP-2942
        else {
            if (child.getObjectType().getID() == "MasterStock") {
                var childrenSKU = child.getChildren().iterator();
                while (childrenSKU.hasNext()) {
                    var cSKU = childrenSKU.next();

                    logger.info(bl_library.logRecord([businessRule, "childrenSKU ", cSKU.getID(), " getApprovalStatus ", cSKU.getApprovalStatus().name()]))
                    if (cSKU.getApprovalStatus().name() != "CompletelyApproved") {
                        approveObj(cSKU);
                    }
                }
            }
        }
    }
}

// If we have a Product object we have the node we want
if (node.getObjectType().getID() == "Product" || node.getObjectType().getID() == "Product_Kit") {
    productNode = node;
    logger.info(bl_library.logRecord([businessRule, "productNode ", productNode]))

}
else {
    // If we have a Master Stock object the Product Node will be the Parent
    if (node.getObjectType().getID() == "MasterStock") {
        productNode = node.getParent();
    }
    else {
        // If we have a SKU object the Product Node may be the Parent or the Grandparent
        if (node.getObjectType().getID() == "SKU") {
            parentNode = node.getParent();
            logger.info(bl_library.logRecord([businessRule, "SKU ", node.getObjectType().getID()]))

            if (parentNode.getObjectType().getID() == "Product") {
                productNode = parentNode;
            }
            else {
                productNode = parentNode.getParent()
            }
        }
    }
}

logger.info(bl_library.logRecord([businessRule, "associated object", productNode.getID()]))

// If the associated Product is in one of the following workflows bypass this business rule
if (productNode.getWorkflowInstanceByID("ProductPricingWorkflow") || productNode.getWorkflowInstanceByID("Product_Creation_For_Pricing")) {
    logger.info(bl_library.logRecord([businessRule, "business rules bypassed", "associated object is in workflow", productNode.getID()]))
}
else {
   approveObj(node);
    }
}