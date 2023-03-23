/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Add_SDS_To_Rev_In_Rev_Release_WF",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Add_SDS_To_Rev_In_Rev_Release_WF",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SDS_ASSET_URL_LINK" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Approve,BL_Library) {
var product = node.getParent().getParent();
var sdsStatus = node.getValue("SDS_Link_Status_CD").getSimpleValue();

if (sdsStatus == "Active") {
	var revsInReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Revision_Release_Workflow");
	var revInProdReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Product_Release_Workflow");

	for (var i = 0; i < revInProdReleaseWF.length; i++) {
		var wfRev = revInProdReleaseWF[i];

		if(wfRev.getValue("Workflow_Name_Initiated").getSimpleValue() == "OTS Conversion"){
			revsInReleaseWF.push(wfRev);
		}
	}

	for (var i = 0; i < revsInReleaseWF.length; i++) {
     	var rev = revsInReleaseWF[i];
     	var sdsLinkKey = rev.getValue("PRODUCTNO").getSimpleValue() + "_rev" + rev.getValue("REVISIONNO").getSimpleValue() + node.getValue("Doc_Revision_No").getSimpleValue() + node.getValue("Plant").getSimpleValue() + node.getValue("SDS_Format").getSimpleValue() + node.getValue("SDS_Subformat").getSimpleValue() + node.getValue("SDS_Language").getSimpleValue();
		var sdsLinkKeyObject = manager.getNodeHome().getObjectByKey("SDS_LINK_KEY", sdsLinkKey);
		
		if (!sdsLinkKeyObject) {
			var sdsItem = rev.createProduct(null, "SDS_ASSET_URL_LINK");
			var sdsName = rev.getValue("PRODUCTNO").getSimpleValue() + "_Rev" +  rev.getValue("REVISIONNO").getSimpleValue() + "_" + node.getValue("SDS_Subformat").getSimpleValue() + "_" + node.getValue("SDS_Language").getSimpleValue() + "_" + node.getValue("Doc_Revision_No").getSimpleValue() + "_" + node.getValue("SDS_Format").getSimpleValue() + "_" + node.getValue("Plant").getSimpleValue();
			
			sdsItem.setName(sdsName);
			BL_Library.copyAttributes(manager, node, sdsItem, "SDS_ATTRIBUTES", null);
			sdsItem.getValue("PRODUCTNO").setSimpleValue(rev.getValue("PRODUCTNO").getSimpleValue() + "_rev" + rev.getValue("REVISIONNO").getSimpleValue());
			sdsItem.getValue("REVISIONNO").setSimpleValue("Rev" + rev.getValue("REVISIONNO").getSimpleValue());
		}
	}
} else if (sdsStatus == "Deleted") {
	var allRevs = product.queryChildren();
	
	allRevs.forEach(function(rev){
		var revObjectTypeID = rev.getObjectType().getID();
		
		if (BL_Library.isRevisionType(rev, false) || revObjectTypeID == "Regional_Revision") {
			var sdsNameWithoutRevNo = rev.getValue("PRODUCTNO").getSimpleValue() + "_" + node.getValue("SDS_Subformat").getSimpleValue() + "_" + node.getValue("SDS_Language").getSimpleValue() + "_" + node.getValue("Doc_Revision_No").getSimpleValue() + "_" + node.getValue("SDS_Format").getSimpleValue() + "_" + node.getValue("Plant").getSimpleValue();
			
			var children = rev.queryChildren();
			children.forEach(function(child){
				var childObjectTypeID = child.getObjectType().getID();

				var childNameWithoutRevNo = rev.getValue("PRODUCTNO").getSimpleValue() + "_" + child.getValue("SDS_Subformat").getSimpleValue() + "_" + child.getValue("SDS_Language").getSimpleValue() + "_" + child.getValue("Doc_Revision_No").getSimpleValue() + "_" + child.getValue("SDS_Format").getSimpleValue() + "_" + child.getValue("Plant").getSimpleValue();
				
				if (childObjectTypeID == "SDS_ASSET_URL_LINK" && childNameWithoutRevNo == sdsNameWithoutRevNo) {
					child.getValue("SDS_Link_Status_CD").setSimpleValue("Deleted");
					BA_Approve.execute(child);
					return false;
				}
				
				return true;
			});
		}
		
		return true;
	});
}
}