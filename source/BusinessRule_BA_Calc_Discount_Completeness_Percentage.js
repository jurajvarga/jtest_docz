/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Calc_Discount_Completeness_Percentage",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_Calc_Discount_Completeness_Percentage",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "SKU" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
exports.operation0 = function (step,node) {
var lAttributeCount = 0;
var lAttributeWithValues=0;
var CompletenessPercentage=0;
var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("Catalog_Ready_Core_Attributes_Group");
	if(attGroup != null){
		var lstAttributes = attGroup.getAttributes();
		var iterator = lstAttributes.iterator();
		while(iterator.hasNext()) {
			var attribute = iterator.next();
			var attributeId = attribute.getID()
			var val = node.getValue(attributeId).getSimpleValue();
			lAttributeCount = lAttributeCount + 1;
			if (val) 
			{
				if (attributeId == "PRODUCTSTATUS")
				{
					if (val == "Released" || val == "Released - On Hold" )
					{
						lAttributeWithValues=lAttributeWithValues+1;
					}
				}
				else if (attributeId == "PRODUCTTYPE")
				{
					if (val != "AQUA Peptide" && val != "Service"  && val != "Subassembly Kit" && val != "Instrument" && val != "PTMScan")
					{
						lAttributeWithValues=lAttributeWithValues+1;
					}
				}
				else if (attributeId == "PRICE")
				{
					if (val > 0)
					{
						lAttributeWithValues=lAttributeWithValues+1;
					}
				}
				else if (attributeId == "PUBLISHED_YN" || attributeId == "EBSFLAG_YN" || attributeId == "ITEMACTIVE_YN" || attributeId == "PUBLISHED_YN" )
				{
					if (val == "Y")
					{
						lAttributeWithValues=lAttributeWithValues+1;
					}
				}
				else if (attributeId == "BLOCKCUSTSHIP_YN")
				{
					if (val == "N")
					{
						lAttributeWithValues=lAttributeWithValues+1;
					}
				}
				//Also need to add validation that UNSPSC is a valid one from the list. Not sure where the list is
				else 
				{
					lAttributeWithValues=lAttributeWithValues+1;
				}
			}
		}
		if (lAttributeWithValues != 0) {
			CompletenessPercentage = (lAttributeWithValues*100/lAttributeCount).toFixed(2);
		}
		else 
		{
			CompletenessPercentage = null;
		}
		node.getValue("Catalog_Ready_Calculated").setSimpleValue(CompletenessPercentage);
		//log.info("Mandatory Count is " + lAttributeCount + " Count with Values is : " + lAttributeWithValues + " Completeness is : " + CompletenessPercentage);
	}
var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("Catalog_Ready_Optional_Attributes_Group");
	if(attGroup != null){
		var lstAttributes = attGroup.getAttributes();
		var iterator = lstAttributes.iterator();
		while(iterator.hasNext()) {
			var attribute = iterator.next();
			var val = node.getValue(attribute.getID()).getSimpleValue();
			lAttributeCount = lAttributeCount + 1;
			if (val) lAttributeWithValues=lAttributeWithValues+1;
		}
		if (lAttributeWithValues != 0) {
			CompletenessPercentage = (lAttributeWithValues*100/lAttributeCount).toFixed(2);
		}
		else 
		{
			CompletenessPercentage = null;
		}
		node.getValue("Catalog_Ready_Score_Optional_Attributes").setSimpleValue(CompletenessPercentage);
		log.info("Optional + Mandatory Count is " + lAttributeCount + " Count with Values is : " + lAttributeWithValues + " Completeness is : " + CompletenessPercentage);
	}
}