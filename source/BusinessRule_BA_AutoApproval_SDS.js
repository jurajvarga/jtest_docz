/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_AutoApproval_SDS",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_AutoApproval_SDS",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "SDS_ASSET_URL_LINK" ],
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
    "contract" : "BusinessActionBindContract",
    "alias" : "approveAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webChanges",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,approveAction,liveQueue,previewQueueApproved,webChanges,node,sendToPreview) {
var query = node.queryChildren();
var sendEvents = false;

query.forEach(function(child) {
	if (child.getObjectType().getID() == "SDS_ASSET_URL_LINK" && child.getValue("SDS_Link_URL").getSimpleValue() && child.getApprovalStatus() != "Completely Approved") {
		approveAction.execute(child);
		sendEvents = true;
	}
	
	return true;
});

if (sendEvents == true) {
	liveQueue.queueDerivedEvent(webChanges, node);
	previewQueueApproved.queueDerivedEvent(sendToPreview, node);
}


/*var conditions = com.stibo.query.condition.Conditions;
var sdsLink = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("SDS_ASSET_URL_LINK"));
var linkUrl = conditions.valueOf(manager.getAttributeHome().getAttributeByID("SDS_Link_URL")).exists();
var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(sdsLink.and(linkUrl));
var result = querySpecification.execute();

var revisionArr = [];
var revisionNameArr = [];

result.forEach(function(sds) {
	if (sds.getApprovalStatus() != "Completely Approved" && sds.getValue("SDS_Link_URL").getSimpleValue()) {
		var rev = sds.getParent();
		var revName = rev.getName();

		if (rev != null && rev.getValue("REVISIONSTATUS").getSimpleValue() == "Approved" && revisionNameArr.indexOf(revName) == -1) {
			var byRefs = rev.getReferencedBy();
			var byRefsItr = byRefs.iterator();

			while (byRefsItr.hasNext()) {
				var byRef = byRefsItr.next();

			     if (byRef.getReferenceTypeString().equals("Product_To_Current_Revision")) {
			     	approveAction.execute(sds);
			     	revisionArr.push(rev);
			     	revisionNameArr.push(revName);
			     	break;
			     }
			}
		}
	}

	return true;
});

for (var i = 0; i < revisionArr.length; i++) {
	liveQueue.queueDerivedEvent(webChanges, revisionArr[i]);
	wipQueue.queueDerivedEvent(webChanges, revisionArr[i]);
}
*/
}