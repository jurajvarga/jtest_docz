/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyContentRevAttrToRev_Inherited",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_CopyContentRevAttrToRev_Inherited",
  "description" : "BR for copy attr from product to rev for removing Inheritance ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
//STEP-5891 Content Review: previously cleared content field appears again after Save Revision Info
var productno = node.getValue("PRODUCTNO").getValue();
//logger.info(" Product No "+productno + " - Revisions changed by STEP-5891");
var checkServiceRevision = false;
var query = node.queryChildren();
query.forEach(function(child) {

	if (bl_library.isRevisionType(child, checkServiceRevision)) {
		//log.info(child.getName());
		var changedRevision = false;
		if (node.getValue("ACTIVITY").getSimpleValue() == child.getValue("ACTIVITY").getSimpleValue()){
			child.getValue("ACTIVITY").setSimpleValue(node.getValue("ACTIVITY").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("REAGENTS_NOT_SUPPLIED").getSimpleValue() == child.getValue("REAGENTS_NOT_SUPPLIED").getSimpleValue()){
			child.getValue("REAGENTS_NOT_SUPPLIED").setSimpleValue(node.getValue("REAGENTS_NOT_SUPPLIED").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("ENDOTOXIN").getSimpleValue() == child.getValue("ENDOTOXIN").getSimpleValue()){
			child.getValue("ENDOTOXIN").setSimpleValue(node.getValue("ENDOTOXIN").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("Fluorescent_Properties").getSimpleValue() == child.getValue("Fluorescent_Properties").getSimpleValue()){
			child.getValue("Fluorescent_Properties").setSimpleValue(node.getValue("Fluorescent_Properties").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("DIRECTIONS_FOR_USE").getSimpleValue() == child.getValue("DIRECTIONS_FOR_USE").getSimpleValue()){
			child.getValue("DIRECTIONS_FOR_USE").setSimpleValue(node.getValue("DIRECTIONS_FOR_USE").getSimpleValue());
			changedRevision = true;
           }
		if (node.getValue("Solubility").getSimpleValue() == child.getValue("Solubility").getSimpleValue()){
			child.getValue("Solubility").setSimpleValue(node.getValue("Solubility").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("PURITY").getSimpleValue() == child.getValue("PURITY").getSimpleValue()){
			child.getValue("PURITY").setSimpleValue(node.getValue("PURITY").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("SOURCEPURIF").getSimpleValue() == child.getValue("SOURCEPURIF").getSimpleValue()){
			child.getValue("SOURCEPURIF").setSimpleValue(node.getValue("SOURCEPURIF").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("SPECIFSENSIV").getSimpleValue() == child.getValue("SPECIFSENSIV").getSimpleValue()){
			child.getValue("SPECIFSENSIV").setSimpleValue(node.getValue("SPECIFSENSIV").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("STORAGE").getSimpleValue() == child.getValue("STORAGE").getSimpleValue()){
			child.getValue("STORAGE").setSimpleValue(node.getValue("STORAGE").getSimpleValue());
			changedRevision = true;
           }           
    		if (node.getValue("PRODUCTDESCRIPTION").getSimpleValue() == child.getValue("PRODUCTDESCRIPTION").getSimpleValue()){
			child.getValue("PRODUCTDESCRIPTION").setSimpleValue(node.getValue("PRODUCTDESCRIPTION").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("MOLECULAR_FORMULA").getSimpleValue() == child.getValue("MOLECULAR_FORMULA").getSimpleValue()){
			child.getValue("MOLECULAR_FORMULA").setSimpleValue(node.getValue("MOLECULAR_FORMULA").getSimpleValue());
			changedRevision = true;
           }
    		if (node.getValue("QUALITY_CONTROL").getSimpleValue() == child.getValue("QUALITY_CONTROL").getSimpleValue()){
			child.getValue("QUALITY_CONTROL").setSimpleValue(node.getValue("QUALITY_CONTROL").getSimpleValue());
			changedRevision = true;
           }           
    		if (node.getValue("FORMULATION").getSimpleValue() == child.getValue("FORMULATION").getSimpleValue()){
			child.getValue("FORMULATION").setSimpleValue(node.getValue("FORMULATION").getSimpleValue());
			changedRevision = true;
           }  

          if(changedRevision) {
          	if(child.getValue("REVISIONSTATUS").getSimpleValue() != "In-process"){
 		         	ba_approve.execute(child);
          	}   	
          }
 
       }
           
	return true;
});
}