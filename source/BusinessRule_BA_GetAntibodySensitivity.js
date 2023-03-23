/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_GetAntibodySensitivity",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_GetAntibodySensitivity",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,log) {
var pMasterStock=node.getParent();
log.info(pMasterStock);

var list = pMasterStock.getReferencedByProducts();
var iter = list.iterator();
while (iter.hasNext()) {
	var ref = iter.next();
	var refType = ref.getReferenceTypeString();
	if (refType == "ProductRevision_To_MasterStock") {
		var pRevision = ref.getSource();
		var sObjectType= pRevision.getObjectType().getID();
		if (sObjectType=="Product_Revision" || sObjectType=="Kit_Revision" || sObjectType=="Equipment_Revision"){
		 	var refTypeTT = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
        		var revTTLotReferences = pRevision.getReferences(refTypeTT);
        		for (var i = 0; i < revTTLotReferences.size() > 0; i++) {
        			var ttLotObj = revTTLotReferences.get(i).getTarget();
        			var abSensitivity=ttLotObj.getValue("Antibody_Sensitivity").getSimpleValue();
        			log.info(" abSensitivity "+abSensitivity);
        			
        			node.getValue("Get_Antibody_Sensitivity").setSimpleValue(abSensitivity);
        			

        			
        		}
		}
	}
}
}