/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Push_Product_Data_To_IDM",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_Push_Product_Data_To_IDM",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Equipment_Revision", "Kit_Revision", "Product", "Product_Kit", "Product_Revision", "SKU" ],
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productAutoApproveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Prod_AutoApprRev_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "autoApproveRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AutoApproveRevisionUpdated",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "currentRevisionUpdated",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CurrentRevisionUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,productAutoApproveQueue,autoApproveRevisionUpdated,currentRevisionUpdated,productQueue,BL_Library,BL_MaintenanceWorkflows) {
var object;
var eventType = "autoApprove";

if (BL_Library.isProductType(node, false)) {
    eventType = "current";
    object = BL_MaintenanceWorkflows.getCurrentRevision(node);

} else if (BL_Library.isRevisionType(node, false)) {
    object = node;

} else if (node.getObjectType().getID() == "SKU") {
    var ms = node.getParent();
    var rev = getLatestApprovedRevision(ms);       
    
    if (rev) {
        object = rev;
    } else {
        log.info("This SKU: " + node.getName() + " does not have appropriate revision.");
    }
};

if(object != null){
	if (eventType == "autoApprove") {
		productAutoApproveQueue.queueDerivedEvent(autoApproveRevisionUpdated, object);
	} else {
		productQueue.queueDerivedEvent(currentRevisionUpdated, object);	
	};
};

function getLatestApprovedRevision(pMasterStock) {
    var nLatestVersion = -1;
    var pLatestRevsion = null;

    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock");
    var refs = pMasterStock.queryReferencedBy(refType);
    
    refs.forEach(function(ref) {
        var pRevision = ref.getSource();
        var revStatus = pRevision.getValue("REVISIONSTATUS").getSimpleValue();
        
        if (revStatus == "Approved") {
            var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(), 10);
            
            if (nVersion > nLatestVersion) {
                nLatestVersion = nVersion;
                pLatestRevsion = pRevision;
            }
        }
        return true;
    });
    return pLatestRevsion;
}
}