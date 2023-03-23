/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_MoveStatetemetsFromProductToRev",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_MoveStatetemetsFromProductToRev",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "revisionMasterStock",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ProductRevision_To_MasterStock",
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
exports.operation0 = function (node,step,revisionMasterStock,BA_Approve,BL_MaintenanceWorkflows) {
// testing with 89011

var generalStat = node.getValue("GENERALSTATEMENT").getSimpleValue();
var orderDetailsStat = node.getValue("ORDERINGDETAILSSTATEMENT").getSimpleValue();
var legalStat = node.getValue("LEGALSTATEMENT").getSimpleValue();
var trademarkStat = node.getValue("TRADEMARKSTATEMENT").getSimpleValue();

//log.info(node.getValue("PRODUCTNO").getSimpleValue());
//log.info("generalStat: " + generalStat);
//log.info("orderDetailsStat: " + orderDetailsStat);
//log.info("legalStat: " + legalStat);
//log.info("trademarkStat: " + trademarkStat);


// Update Species
var children = node.getChildren().iterator();
while (children.hasNext()) {
    var child = children.next();
    var childType = child.getObjectType().getID();
    //log.info("  ##  object type: " + childType);

    if (childType == "Product_Revision") {
        var isCurrent = false;
        if (BL_MaintenanceWorkflows.getCurrentRevision(node)) {
            isCurrent = BL_MaintenanceWorkflows.getCurrentRevision(node).getName() == child.getName();
        }

        var isWIP = false;
        if (BL_MaintenanceWorkflows.getWIPRevision(node)) {
            isWIP = BL_MaintenanceWorkflows.getWIPRevision(node).getName() == child.getName();
        }

        var isInRevRelease = child.isInState("Revision_Release_Workflow", "Revision_Release_Workflow");

        // Check for current, wip or in Revision Release WF revisions
        //log.info("  ##  " + child.getName() + " \n" + "isCurrent: " + isCurrent + ", isWIP: " + isWIP + ", isInRevRelease: " + isInRevRelease);
        if (isCurrent || isWIP || isInRevRelease) {

            // Update Statements on the revision level
            child.getValue("GENERALSTATEMENT").setSimpleValue(generalStat);
            child.getValue("ORDERINGDETAILSSTATEMENT").setSimpleValue(orderDetailsStat);
            child.getValue("LEGALSTATEMENT").setSimpleValue(legalStat);
            child.getValue("TRADEMARKSTATEMENT").setSimpleValue(trademarkStat);

            //log.info("GENERALSTATEMENT: " + child.getValue("GENERALSTATEMENT").getSimpleValue());
            //log.info("ORDERINGDETAILSSTATEMENT: " + child.getValue("ORDERINGDETAILSSTATEMENT").getSimpleValue());
            //log.info("LEGALSTATEMENT: " + child.getValue("LEGALSTATEMENT").getSimpleValue());
            //log.info("TRADEMARKSTATEMENT: " + child.getValue("TRADEMARKSTATEMENT").getSimpleValue());

            // Update child product, approve child product and its revision, send to queues
            if (isCurrent || isInRevRelease) {

                BA_Approve.execute(child);
            }
        }
    }
}
}