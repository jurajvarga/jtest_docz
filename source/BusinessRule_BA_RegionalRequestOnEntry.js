/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RegionalRequestOnEntry",
  "type" : "BusinessAction",
  "setupGroups" : [ "New" ],
  "name" : "BA_RegionalRequestOnEntry",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Regional_Revision" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,wf,BL_Library,BL_MaintenanceWorkflows) {
if (node.isInWorkflow("Regional_Initiation_Workflow")) {
    var children = node.getParent().getChildren().iterator();
    var masterStocksArr = [];

    while (children.hasNext()) {
        var child = children.next();
        if (child.getObjectType().getID() == "MasterStock") {
            var skuChildren = child.getChildren().iterator();
            var skusArr = [];

            while (skuChildren.hasNext()) {
                var sku = skuChildren.next();

                if (sku.getObjectType().getID() == "SKU" && sku.getValue("ItemCode").getSimpleValue()) {
                    skusArr.push("              ◦ " + sku.getValue("ItemCode").getSimpleValue());
                }
            }

            masterStocksArr.push("• " + child.getValue("MASTERITEMCODE").getSimpleValue() + " - available SKUs:\n" + skusArr.sort().join("\n"));
        }
    }

    node.getValue("MasterStocks_Available").setSimpleValue(masterStocksArr.sort().join("\n"));

    var region = BL_MaintenanceWorkflows.getInitiatedCountry(step, node);    
    var destInstance = node.getWorkflowInstance(wf);
    BL_Library.Trigger(destInstance, "Initial", "Init_" + region, "Auto transition to region " + region);

    var currRev = BL_MaintenanceWorkflows.getCurrentRevision(node.getParent());

    if(currRev) {
        var revisionToMSRefType = step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
        //STEP-6396
        var revToMSRefs = currRev.queryReferences(revisionToMSRefType);
    
        revToMSRefs.forEach(function(ref) { // should be max one
            node.getValue("MasterStock_Selected").setSimpleValue(ref.getTarget().getValue("MASTERITEMCODE").getSimpleValue());
            return false;
        });
        //STEP-6396
    }
}
}