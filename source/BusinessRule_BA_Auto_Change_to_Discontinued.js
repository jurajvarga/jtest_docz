/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Auto_Change_to_Discontinued",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductStatusAction" ],
  "name" : "BA_Auto_Change_to_Discontinued",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
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
    "contract" : "BusinessActionBindContract",
    "alias" : "productKitDiscontinued",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Product_Kit_Discontinued",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "productStatusChangeDate",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Set_Product_Status_Change_Date",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "currentRevision",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CurrentRevisionProductStatusUpdated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Kit_JSON_WIP_OIEP",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "inactiveItemsAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Inactive_Items",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "setCurrentRevision",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetCurrentRevision_PSC",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "copyAltProducts",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CopyAlternateProduct",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,approveAction,productKitDiscontinued,productStatusChangeDate,sendToPreview,previewQueue,currentRevision,liveQueue,wipQueue,inactiveItemsAction,setCurrentRevision,copyAltProducts,BL_CopyRevision,bl_library) {
var businessRule = "Business Rule: BA_Set_Product_Release_Status";
var currentObjectID;
var currentDate = "Date: " + (new Date()).toLocaleString();

var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());

var conditions = com.stibo.query.condition.Conditions;
var plannedDiscoDate = conditions.valueOf(manager.getAttributeHome().getAttributeByID("PLANNEDDISCONTINUATIONDATE")).exists();
var isPending = conditions.valueOf(manager.getAttributeHome().getAttributeByID("Product_Status")).eq("Pending");
var isPreDiscontinued = conditions.valueOf(manager.getAttributeHome().getAttributeByID("Product_Status")).eq("Pre-discontinued");
var isProduct = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product"));
var isProductKit = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Kit"));
var isEquipment = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment"));

var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where((isPending.or(isPreDiscontinued)).and(plannedDiscoDate).and(isProduct.or(isProductKit).or(isEquipment)));
var result = querySpecification.execute();

result.forEach(function(prod) {
	currentObjectID = prod;

	var prodDiscoDate = prod.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();

	if(prodDiscoDate && prodDiscoDate <= today) {
		var p2wipRefType = prod.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
		var refs = prod.getProductReferences();
		var p2wipRefs = refs.get(p2wipRefType);

		if (p2wipRefs.size() == 0) {
			var p2curRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			var curRefs = prod.queryReferences(p2curRefType); //STEP-6396

			curRefs.forEach(function(ref) {//STEP-6396
				var curTarget = ref.getTarget(); //STEP-6396
				var dup = BL_CopyRevision.duplicateObject(manager, curTarget, false); // STEP-5431 Refactor Product Status Change
				
				dup.getValue("Product_Status_Change_Reason").setSimpleValue("Other");
				dup.getValue("RELEASENOTES").setSimpleValue("Product discontinued because a planned discontinuation date was reached.");
				dup.getValue("Product_Status_Change_To").setSimpleValue("Discontinued");

				var currentStatus = prod.getValue("Product_Status").getSimpleValue();

				if (currentStatus == "Pending") {
					dup.getValue("PSC_Pending").setSimpleValue("Discontinued");
					prod.getValue("PSC_Pending").setSimpleValue("Discontinued");
				}
				else if (currentStatus == "Pre-discontinued") {
					dup.getValue("PSC_Pre-discontinued").setSimpleValue("Discontinued");
					prod.getValue("PSC_Pre-discontinued").setSimpleValue("Discontinued");
				}

				var maxRevisionNo = -1;
				var children = prod.getChildren();

				if(children) {
					var childIter = children.iterator();

			          while(childIter.hasNext()) {
			          	var child = childIter.next();
						var checkServiceRevision = false;
						
			          	if (dup.getID() != child.getID() &&
			          	    child.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue() &&
			          	    child.getValue("Workflow_No_Initiated").getSimpleValue() == "11" &&
						    bl_library.isRevisionType(child, checkServiceRevision)) {
							var actualRevNo = Number(child.getValue("REVISIONNO").getSimpleValue());
							
							if (maxRevisionNo < actualRevNo) {
								maxRevisionNo = actualRevNo;
								dup.getValue("Lot_numbers_affected").setSimpleValue(child.getValue("Lot_numbers_affected").getSimpleValue());
								dup.getValue("SFDC_Number").setSimpleValue(child.getValue("SFDC_Number").getSimpleValue());
								dup.getValue("NC_number").setSimpleValue(child.getValue("NC_number").getSimpleValue());

								bl_library.copyAttributes(manager, child, dup, "WebUI_Status_Discontinued", null);
							}
						}
			     	}
				}

				copyAltProducts.execute(dup);
				inactiveItemsAction.execute(dup);
				productStatusChangeDate.execute(dup);
				productKitDiscontinued.execute(dup);
				setCurrentRevision.execute(dup);

				return true;//STEP-6396
				
			});
		}
	}

	return true;
});
}