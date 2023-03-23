/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "ApproveCLPObjects",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "ApproveCLPObjects",
  "description" : "Approves all childrens of the CLP object ",
  "scope" : "Global",
  "validObjectTypes" : [ "Product user-type root" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,logger) {
var businessRule = "Business Rule: ApproveCLPObjects";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

function approveHierarchy(obj) {
    var parent = obj.getParent();
    if (parent) {
        approveHierarchy(parent);
        parent.approve();
        logger.info(bl_library.logRecord(["Approving parent:", businessRule, currentObjectID, currentDate, parent.getName()]));
    }
}

function approveObj(obj) {
    logger.info(bl_library.logRecord(["STARTING OBJECT:", businessRule, currentObjectID, currentDate, obj.getName() + " | " + obj.getID()]));

    var date2 = new Date();
    if (date2 - date >= 15000) {
        throw "error, ran too long";
    }


    if (obj.getObjectType().isAssetType()) {
        var classifications = obj.getClassifications().iterator();
        while (classifications.hasNext()) {
            var oClass = classifications.next()
            if (oClass.getApprovalStatus().name() != "CompletelyApproved") {
                approveObj(oClass);
            }
        }
        obj.approve();

    }

    else {
        if (obj.getObjectType().getID() == "Product") {
            obj.approve();
            logger.info(bl_library.logRecord(["In parent loop approved object: ", businessRule, currentObjectID, currentDate, obj.getName() + " Object Type: " || obj.getObjectType().getID()]));


            // SKUs
            // try to create references from Product to SKU
            // collect child objects of the current object
            var children = currentObject.getAllChildren();

            logger.info(bl_library.logRecord(["Children: ", businessRule, currentObjectID, currentDate, children]));

            for (i = 0; i < children.size(); i++) {
                masterStock = children.get(i);
                masterStockID = masterStock.getID();
                var masterStockChildren = masterStock.getChildren();
                for (x = 0; x < masterStockChildren.size(); x++) {
                    sku = masterStockChildren.get(x);
                    skuID = sku.getID();
                    try {
                        obj.approve();
                        logger.info(bl_library.logRecord(["Childern loop approved object: ", businessRule, currentObjectID, currentDate, obj.getName() + " Object Type: " || obj.getObjectType().getID()]));


                    } catch (e) {
                        logger.info(bl_library.logRecord(["Exception occurred:", businessRule, currentObjectID, skuID, e]));
                        throw (e);

                    }
                }
            }
        }

        //references
        var refs = obj.getReferences().asSet().iterator();
        while (refs.hasNext()) {
            var target = refs.next().getTarget();
            if (!target.getObjectType().isEntityType()) { //not entity
                logger.info(bl_library.logRecord(["Reference from node:", businessRule, currentObjectID, currentDate, obj.getName(), " to target: ", target.getID()]));

                if (obj.getApprovalStatus().name() != "CompletelyApproved") {
                    approveObj(target);
                }
            }
        }

        //		obj.approve();
        logger.info(bl_library.logRecord(["approved object:", businessRule, currentObjectID, currentDate, obj.getName() + " Object Type: " || obj.getObjectType().getID()]));


        var children = obj.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next();
            logger.info(bl_library.logRecord(["Child object:", businessRule, currentObjectID, currentDate, "child: " + child + " Approval Status " + child.getApprovalStatus().name()]));


            if (child.getApprovalStatus().name() != "CompletelyApproved") {
                approveObj(child);
            }
        }
    }


    logger.info(bl_library.logRecord(["ENDING OBJECT:", businessRule, currentObjectID, currentDate, obj.getName() + " | " + obj.getID()]));

}

var date = new Date();

try {

    approveObj(node);
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
}