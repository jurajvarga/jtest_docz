/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "overrideRational",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "overrideRationale",
  "description" : "Sample- to validate that a Rationale is included with price override.  Used in Workflows",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var children =node.getChildren();
//log.info(children);
for(var i=0;i<children.size(); i++){
	var child =children.get(i);
	
	if (child.getObjectType().getID()=="MasterStock"){
		log.info(child.getID())
		var childrenSKU =child.getChildren();
//log.info(children);
		for(var j=0;j<childrenSKU.size(); j++){
			var childSKU =childrenSKU.get(j);
			log.info(childSKU.getID())
			
				var GBP = childSKU.getValue("PRICE").getSimpleValue();
				var GBPOverride = childSKU.getValue("Global_Base_Price").getSimpleValue();
				var GBPOverrideRationale = childSKU.getValue("Global_Base_Price_Rationale").getSimpleValue();
				
				//If GBP does not equal GBPOverride, and GBPOverrideRationale is not null, then true
				log.info(GBP);
				log.info(GBPOverride);
				log.info(GBPOverrideRationale);
				//log.info(child)
				if (GBP != GBPOverride && !GBPOverrideRationale)
					return "An Override Rationale is required if you have entered a Global Base Price Override for "+childSKU.getID();	
			}
		}
	}
return true;
}