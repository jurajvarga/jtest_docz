/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_setAttr_fromContentOnly",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Maintenance" ],
  "name" : "BA_SetAttr_fromContentOnly",
  "description" : "Sets attributes from Content Only revision on the all product revisions in Product evision WF",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
// Store attribute IDs and Values from an attribute group to the String
var wfInstance = node.getWorkflowInstanceByID("WF6_Content_Review_Workflow");

var attGroup = manager.getAttributeGroupHome().getAttributeGroupByID("WebUI_Content_Review");

log.info("*** BA_setAttr_fromContentOnly starts: Copying changed attributes during Content Only maintenance from the revision " + node.getName() +
    "  to revisions in the Revision Release Workflow for the product " + node.getValue("PRODUCTNO").getSimpleValue() + ".");


//For all revisions of the product in the Revision_Release_Workflow, change the attributes which has been changed during Content Only Review
var product = node.getParent();

var revsInRevReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Revision_Release_Workflow");
//log.info("revsInRevReleaseWF " + revsInRevReleaseWF)
//Find any revision in Release workflow and then start the below changes

if (revsInRevReleaseWF.length > 0) {
    // Check for attribute changes between starting maintenance state and state after revision is updated by the user in Content Review
    var changedAttributes = [];
    var strInitAttrValues = String(wfInstance.getSimpleVariable("tempWebUIContentReview"));
    //log.info(strInitAttrValues);
    var listAttr = strInitAttrValues.split("<attributesep/>");
    //log.info("listAttr" + listAttr);
    for (var i = 0; i < listAttr.length; i++) {
        var storedAttr = listAttr[i];
        var attrID = storedAttr.split("=")[0];
        var attrVal = storedAttr.split("=")[1]

        //log.info("attrID" + attrID);

        var attr = manager.getAttributeHome().getAttributeByID(attrID);

        if (attr && attr.isMultiValued()) {
            // checking multiValued attributes
            var valuesStoredMultiVal = [];

            if (attrVal != "NULL") {
                valuesStoredMultiVal = attrVal.split("<multisep/>");
            }

            var bAttributeChanged = hasMultiValuedAttrChanged(valuesStoredMultiVal, node.getValue(attrID).getValues());
            //log.info(attrID + " : bAttributeChanged - " + bAttributeChanged);

            if (bAttributeChanged) {
                changedAttributes.push(attrID);
            }
        } else {
            // checking single valued attributes
            if (attrVal == "NULL") {
                attrVal = null;
            }

            if (attrVal != node.getValue(attrID).getSimpleValue()) {
                changedAttributes.push(attrID);
            }
        }
    }
    log.info("changedAttributes: " + changedAttributes);


    if (changedAttributes.length != 0) {
        for (var i = 0; i < revsInRevReleaseWF.length; i++) {
            var rev = revsInRevReleaseWF[i];

            for (var j = 0; j < changedAttributes.length; j++) {
                var changedAttrID = changedAttributes[j];
                var changedAttr = manager.getAttributeHome().getAttributeByID(changedAttrID);
                if (changedAttr.isMultiValued()) {
                    BL_Library.copyMultiValuedAttribute(changedAttrID, node, rev, true); //STEP-6648 added true
                } else {
                    rev.getValue(changedAttrID).setSimpleValue(node.getValue(changedAttrID).getSimpleValue());
                }
            }

            log.info(rev.getName() + " - Revision changed by revision " + node.getName() + " from Content Only WF");

            BA_Approve.execute(rev);
        }
    }

    log.info("*** BA_setAttr_fromContentOnly ends.")
}

/**
 * Compares current multivalued attribute values valuesNodeMultiVal and stored values of the multivalued attribute before the Content Only maintenance changes valuesStoredMultiVal
 * @param valuesStoredMultiVal a list with stored values for a multivalued attribute before the Content Only maintenance changes
 * @param valuesNodeMultiVal java.util.List<SingleValue>, java list with values from the MultiValue object
 * @returns true, if number of values is different or at least one value is different; false, otherwise
 */
function hasMultiValuedAttrChanged(valuesStoredMultiVal, valuesNodeMultiVal) {

    if (valuesStoredMultiVal.length != valuesNodeMultiVal.size()) {
        return true;
    }

    for (var i = 0; i < valuesNodeMultiVal.size(); i++) {

        var valueNode = valuesNodeMultiVal.get(i).getSimpleValue();
        var valueStored = valuesStoredMultiVal[i];
        //log.info(i + "valueNode : " + valueNode + " VS valueStored : " + valueStored);

        if (!valueNode.equals(valueStored)) {
            return true;
        }
    }

    return false;
}
}