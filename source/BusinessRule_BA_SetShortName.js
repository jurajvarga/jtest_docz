/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetShortName",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_SetShortName",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Kit_Revision", "Product_Revision" ],
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
    "contract" : "BusinessActionBindContract",
    "alias" : "ba_approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,ba_approve,bl_library) {
if (!node.getValue("PRODUCTSHORTNAME").getSimpleValue()) {
    var ttNode = bl_library.getReferenceTarget(node, "ProductRevision_to_Lot");

    if (ttNode) {
        var prodShortName = ttNode.getValue("PRODUCTSHORTNAME").getSimpleValue();

        if (prodShortName) {
            node.getValue("PRODUCTSHORTNAME").setSimpleValue(prodShortName);
            ba_approve.execute(node);
        }
    }
}

/*if (!node.getValue("PRODUCTSHORTNAME").getSimpleValue()) {
	var prod = node.getParent();
	var prodShortName = prod.getValue("PRODUCTSHORTNAME").getSimpleValue();

	if (prodShortName) {
		node.getValue("PRODUCTSHORTNAME").setSimpleValue(prodShortName);
		ba_approve.execute(node);
	}
}
*/
}