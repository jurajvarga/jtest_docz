/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Approve_Inactive_Figure_Folder",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_Approve_Inactive_Figure_Folder",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionSetRevAppFiguresBR",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionFigApproveAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Figure_Approval_Action",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,busActionSetRevAppFiguresBR,busActionFigApproveAction,bl_library) {
var businessRule = "Business Rule: BA_Approve_Inactive_Figure_Folder";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var kids = node.getAssets();
var kidsItr = kids.iterator();
log.info(bl_library.logRecord(["figStatus: ", businessRule, currentObjectID, currentDate, "inactive"]));

while (kidsItr.hasNext()) {
    var kid = kidsItr.next();
    var kot = kid.getObjectType().getID();

    if (kot.equals("ProductImage") || kot.equals("Product_DataSheet")) {
        kid.getValue("Image_Status").setSimpleValue("Inactive");
        var refs = kid.queryReferencedBy(null); //STEP-6396

        //STEP-6396
        refs.forEach(function(ref) {
            var rot = ref.getReferenceTypeString();
            if (rot.equals("Published_Product_Images") || rot.equals("DataSheet")) {
                ref.delete();
            }
            return true;
        });
        //STEP-6396 

        var name = node.getName();
        var parent = node.getParent();
        var prodRevs = bl_library.getProductWIPRevision(manager, parent); //STEP-6526
        for (var i = 0; i < prodRevs.length; i++) {
            var prodRev = prodRevs[i];
            busActionSetRevAppFiguresBR.execute(prodRev);
        }
        //Approve Image after setting image status
        busActionFigApproveAction.execute(kid);

        try {
            kid.approve();
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
}