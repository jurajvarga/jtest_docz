/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_LabelConcentrationFlagProcess",
  "type" : "BusinessAction",
  "setupGroups" : [ "Inbound_Business_Rules" ],
  "name" : "BA_LabelConcentrationFlagProcess",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "BL_TechTransfer"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
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
exports.operation0 = function (manager,node,BA_Approve,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_TechTransfer) {
// Business rule: BA_LabelConcentrationFlagProcess
// xlsx/csv file row values
var productno = node.getValue("PRODUCTNO").getValue();
if (productno) {
    var productname = node.getValue("PRODUCTNAME").getValue();
    var producttype = node.getValue("PRODUCTTYPE").getValue();
    log.info("BA_LabelConcentrationFlagProcess *** product no: " + productno + ", product name: " + productname + ", product type: " + producttype);

    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productno);
    var product_name = product.getValue("PRODUCTNAME").getValue();
    var product_type = product.getValue("PRODUCTTYPE").getValue();

    if (product) {
        var children = product.getChildren();
        for (i = 0; i < children.size(); i++) {
            var child = children.get(i);
            var childId = child.getObjectType().getID();

            if (childId == "MasterStock") {
                var grandchildren = child.getChildren();
                for (j = 0; j < grandchildren.size(); j++) {
                    var grandchildObj = grandchildren.get(j);
                    var grandchildId = grandchildObj.getObjectType().getID();

                    if (grandchildId == 'SKU') {
                        var itemcode = grandchildObj.getValue("ItemCode").getSimpleValue();
                        hasDefault = getItemDefault(itemcode, product);
                        if (hasDefault) {
                            grandchildObj.getValue("LABELCONC_YN").setSimpleValue(hasDefault);
                            log.info(grandchildObj.getID() + ' LABELCONC_YN ' + grandchildObj.getValue("LABELCONC_YN").getSimpleValue() + ' set to default value ' + hasDefault);
                        }
                    }
                }
            }
        }
    } else {
        log.info("Product " + productno + " does not exist in STEP or the product is a Service.")
    }
} else {
    log.info("Record has productno value in csv: " + (productno && productno != ""));
}


/**
 * get the defaults for product and p-type
 * @param {String} itemcode String, item code (BC, MC, MF, S, ...) 
 * @param {Product} product STEP product object (Product, Product Kit, Equipment, Service)
 * @returns {String|false} default value for Level Concentration Flag or false, if defaults not exists
 */
function getItemDefault(itemcode, product) {
    var productType = product.getValue("PRODUCTTYPE").getSimpleValue();

    var conditions = com.stibo.query.condition.Conditions;
    var hasProductType = conditions.valueOf(manager.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT")).eq(productType);
    var hasItemCode = conditions.valueOf(manager.getAttributeHome().getAttributeByID("ItemCode_DFLT")).eq(itemcode);

    var queryHomeRevision = manager.getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHomeRevision.queryFor(com.stibo.core.domain.entity.Entity).where(hasProductType.and(hasItemCode));

    var resultEntity = querySpecification.execute();
    var resultArrEntity = resultEntity.asList(100).toArray();

    for (var i = 0; i < resultArrEntity.length; i++) {
        var eItemDefault = resultArrEntity[i];
        var sDefaultLabelConcFlag = eItemDefault.getValue("LABELCONC_YN_DFLT").getSimpleValue();
    }

    if (resultArrEntity.length > 0) {
        return sDefaultLabelConcFlag;
    }

    return false;
}
}