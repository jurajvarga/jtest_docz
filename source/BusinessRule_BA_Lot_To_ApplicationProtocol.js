/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Lot_To_ApplicationProtocol",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_Lot_To_ApplicationProtocol",
  "description" : "Not Used - at one point used for data migration before data model change",
  "scope" : "Global",
  "validObjectTypes" : [ "Lot_Application" ],
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
var pTecTransfer = node.getParent();

var refType;
var refLinks;
var ref;
var lstApplication = new java.util.ArrayList();

refType= step.getLinkTypeHome().getClassificationProductLinkTypeByID("LotApplication_to_Protocol");
refLinks = node.getClassificationProductLinks().get(refType);
if (refLinks!=null  && refLinks.size()>0){
	//Lot_To_ApplicationProtocol
	for (var i=0; i< refLinks.size(); i++){
		var refLink = refLinks.get(i);
		var cProtocol = refLink.getClassification();

		lstApplication.add(cProtocol.getParent().getID());
		log.info("Protocol " + cProtocol); 
		/*ref =pTecTransfer.createReference(cProtocol, "Lot_To_ApplicationProtocol");
		ref.getValue("Positive_YN").setSimpleValue(refLink.getValue("Positive_YN").getSimpleValue())
		ref.getValue("DILUTIONFACTOR").setSimpleValue( node.getValue("DILUTIONFACTOR").getSimpleValue());
		*/
		
		//LotApplication_To_ApplicationProtocol
		ref = node.createReference(cProtocol, "LotApplication_To_ApplicationProtocol");
		ref.getValue("Positive_YN").setSimpleValue(refLink.getValue("Positive_YN").getSimpleValue());
		ref.getValue("DILUTIONFACTOR").setSimpleValue( node.getValue("DILUTIONFACTOR").getSimpleValue());
	}
}


refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("LotApplication_to_Application");
refLinks = node.getClassificationProductLinks().get(refType);
if (refLinks!=null  && refLinks.size()>0){
	//Lot_To_ApplicationProtocol
	for (var i=0; i< refLinks.size(); i++){
		var refLink = refLinks.get(i);
		var cApplication = refLink.getClassification();
		if(!lstApplication.contains(cApplication.getID())){
			log.info("Application " + cApplication); 
			/*ref = pTecTransfer.createReference(cApplication, "Lot_To_ApplicationProtocol");
			ref.getValue("Positive_YN").setSimpleValue(refLink.getValue("Positive_YN").getSimpleValue())
			ref.getValue("DILUTIONFACTOR").setSimpleValue( node.getValue("DILUTIONFACTOR").getSimpleValue());
			*/
			//LotApplication_To_ApplicationProtocol
			ref = node.createReference(cApplication, "LotApplication_To_ApplicationProtocol");
			ref.getValue("Positive_YN").setSimpleValue(refLink.getValue("Positive_YN").getSimpleValue())
			ref.getValue("DILUTIONFACTOR").setSimpleValue( node.getValue("DILUTIONFACTOR").getSimpleValue());
		}
	}
}
}