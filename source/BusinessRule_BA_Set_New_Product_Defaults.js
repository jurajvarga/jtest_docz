/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_New_Product_Defaults",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA Set New Product Defaults",
  "description" : "Creates SKUs by default entity, and sets default prices ",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
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
/*
var sProductType = node.getValue("PRODUCTTYPE").getSimpleValue();
var sProduct = node.parent;
log.info("PRODUCTTYPE " + sProductType);
var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
var type = com.stibo.core.domain.entity.Entity;
var att = step.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT");
var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, att, sProductType);

var belowNode = step.getEntityHome().getEntityByID("ProductTypeDefaultsList");
query.root = belowNode;
var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductDefaults");
var attGroupRevDefaults = step.getAttributeGroupHome().getAttributeGroupByID("Product_Revision_Defaults");
var lstDefault = searchHome.querySingleAttribute(query).asList(100).toArray();
var defaultEntity;
for (var i = 0; i < lstDefault.length; i++) {
    var eRevisionDefault = lstDefault[i];
    var sRevisionProductType = eRevisionDefault.getValue("PRODUCTTYPE_DFLT").getSimpleValue();
    if (sProductType == sRevisionProductType) {
        log.info("Found matching Product Default for " + sProductType);
        defaultEntity = eRevisionDefault;
        break;
    }
}
if (defaultEntity) {
    log.info(" *************** Product Default Starts *********** ");
    if (attGroup != null) {
        var iterator = attGroup.getAttributes().iterator();
        while (iterator.hasNext()) {
            var dfltAttribute = iterator.next();
            var attributeId = dfltAttribute.getID().replace("_DFLT", "");
            var attribute = step.getAttributeHome().getAttributeByID(attributeId);
            if (attribute.getValidForObjectTypes().contains(sProduct.getObjectType())) {
                var attID = attribute.getID();
                var val = defaultEntity.getValue(dfltAttribute.getID()).getSimpleValue();
                if (val) {
                    log.info("Setting defaults for " + attID + " to " + val + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                    sProduct.getValue(attID).setSimpleValue(val);
                }
            } else {
                log.info("Attribute " + attribute.getID() + " not valid for " + sProduct.getObjectType());
            }

        }
    }

    log.info(" *************** Product Default Ends *********** ");
    log.info(" *************** Product Revision Default Starts *********** ");
    //Add Revision Defaults
    if (attGroupRevDefaults != null) {
        var iterator = attGroupRevDefaults.getAttributes().iterator();
        while (iterator.hasNext()) {
            var dfltAttribute = iterator.next();
            var attributeId = dfltAttribute.getID().replace("_DFLT", "");
            var attribute = step.getAttributeHome().getAttributeByID(attributeId);
            if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
                var attID = attribute.getID();
                var val = defaultEntity.getValue(dfltAttribute.getID()).getSimpleValue();
                if (val) {
                    log.info("Setting defaults for revision " + attID + " to " + val + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                    node.getValue(attID).setSimpleValue(val);
                }
            } else {
                log.info("Attribute " + attribute.getID() + " not valid for " + node.getObjectType());
            }

        }
    }
    log.info(" *************** Product Revision Default Ends *********** ");
} */

var sProductType = node.getValue("PRODUCTTYPE").getSimpleValue();
var sProductName = node.getValue("PRODUCTNAME").getSimpleValue(); //STEP-6050
var sProduct = node.getParent();
log.info("PRODUCTTYPE " + sProductType);
var attGroup = step.getAttributeGroupHome().getAttributeGroupByID("ProductDefaults");
var attGroupRevDefaults = step.getAttributeGroupHome().getAttributeGroupByID("Product_Revision_Defaults");
var eProductTypeRoot = step.getEntityHome().getEntityByID("ProductTypeDefaultsList");
var children = eProductTypeRoot.getChildren().iterator();
var defaultEntity;
while (children.hasNext()) {
    var eMapping = children.next();
    if (eMapping.getValue("PRODUCTTYPE_DFLT").getSimpleValue() == sProductType) {
        defaultEntity = eMapping;
        if (defaultEntity) {
            log.info(" *************** Product Default Starts *********** ");
            if (attGroup != null) {
                var iterator = attGroup.getAttributes().iterator();
                while (iterator.hasNext()) {
                    var dfltAttribute = iterator.next();
                    var attributeId = dfltAttribute.getID().replace("_DFLT", "");
                    var attribute = step.getAttributeHome().getAttributeByID(attributeId);
													 
                    if (attribute.getValidForObjectTypes().contains(sProduct.getObjectType())) {
                        var attID = attribute.getID();
                        var val = defaultEntity.getValue(dfltAttribute.getID()).getSimpleValue();
                        if (val) {
                            log.info("Setting defaults for " + attID + " to " + val + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                            sProduct.getValue(attID).setSimpleValue(val);
                        }
                    } else {
                        log.info("Attribute " + attribute.getID() + " not valid for " + sProduct.getObjectType());
                    }

                }
            }

            log.info(" *************** Product Default Ends *********** ");
            log.info(" *************** Product Revision Default Starts *********** ");
            //Add Revision Defaults
            if (attGroupRevDefaults != null) {
                var iterator = attGroupRevDefaults.getAttributes().iterator();
                while (iterator.hasNext()) {
                    var dfltAttribute = iterator.next();
                    var attributeId = dfltAttribute.getID().replace("_DFLT", "");
														   
                    var attribute = step.getAttributeHome().getAttributeByID(attributeId);
                    if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
                        var attID = attribute.getID();
                        var val = defaultEntity.getValue(dfltAttribute.getID()).getSimpleValue();

                        // Setting Web_Category for ConjugateFlag = Y to Antibody Conjugates
                        //log.info("CONJUGATEFLAG_YN for " + node.getName() +": " + node.getValue("CONJUGATEFLAG_YN").getSimpleValue());
                        //STEP-6050
                        if (attID == "Web_Category") {
                            if (node.getValue("CONJUGATEFLAG_YN").getSimpleValue() == "Y") {
                                log.info("Setting defaults for " + attID + " to " + "Antibody Conjugates" + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                                node.getValue(attID).setSimpleValue("Antibody Conjugates");
                            }
                            else if (sProductType == "Assay Kit" && sProductName.contains("Flow Cytometry Panel")) {
                                log.info("Setting defaults for revision " + attID + " to " + "Flow Cytometry Kits & Reagents" + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                                node.getValue(attID).setSimpleValue("Flow Cytometry Kits & Reagents");
                            }
                            else {
                                node.getValue(attID).setSimpleValue(val);
                            }
                        } 
				    //STEP-5927, STEP-6373	
                        else if (attID == "Commercial_CAS_Number") {
                            if (val && !node.getValue(attID).getSimpleValue()) {
                                log.info("Setting defaults for revision " + attID + " to " + val + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                                node.getValue(attID).setSimpleValue(val);
                            }
                        }

                        else if (val) {
                            log.info("Setting defaults for revision " + attID + " to " + val + " for product # " + sProduct.getValue("PRODUCTNO").getSimpleValue());
                            node.getValue(attID).setSimpleValue(val);
                        }
                    } 
                    else {
                        log.info("Attribute " + attribute.getID() + " not valid for " + node.getObjectType());
                    }

                }
            }
            log.info(" *************** Product Revision Default Ends *********** ");
        }
        break;
    }
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_IsNewWorkflow"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
