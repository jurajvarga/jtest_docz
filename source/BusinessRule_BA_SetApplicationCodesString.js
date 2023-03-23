/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetApplicationCodesString",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_SetApplicationCodesString",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
log.info("+++SEt Application Codes for Revision +++");


var pRevision = node;
var tmApplicaitons = new java.util.TreeMap();
var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
var pProduct =  pRevision.getParent();


var refLinks = pRevision.getClassificationProductLinks(refType);
if (refLinks != null && refLinks.size() > 0) {
	//Lot_To_ApplicationProtocol
	for (var l = 0; l < refLinks.size(); l++) {
		var refLink = refLinks.get(l);
		var cApplicaiton = refLink.getClassification();
		if (cApplicaiton.getObjectType().getID() == "Protocol")
			cApplicaiton = cApplicaiton.getParent();

		var sApplication = cApplicaiton.getValue("APPLICATIONABBR").getSimpleValue();
		var idxApplicaiton = cApplicaiton.getValue("APPLICATIONINDEX").getSimpleValue();
		tmApplicaitons.put(new java.math.BigInteger(idxApplicaiton), sApplication);

	}
	var lst = tmApplicaitons.entrySet().toArray();
	var sAppCodes;
	for (var j = 0; j < lst.length; j++) {
		var sAppCode = lst[j].getValue();
		if (j == 0)
			sAppCodes = sAppCode;
		else
			sAppCodes = sAppCodes + ", " + sAppCode;

	}
	log.info("ApplCodes_String "+ sAppCodes);
	if (sAppCodes)
		pRevision.getValue("ApplCodes_String").setSimpleValue(sAppCodes);
}




}