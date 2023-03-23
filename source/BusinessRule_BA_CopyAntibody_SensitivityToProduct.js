/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CopyAntibody_SensitivityToProduct",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_CopyAntibody_SensitivityToProduct",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Republish_WebPassthrough_Event",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Republish_WebPassthrough_Event",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Send_To_Preview",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Send_To_Preview",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_Approve,BA_Republish_WebPassthrough_Event,BA_Send_To_Preview,BL_Library,BL_MaintenanceWorkflows) {
var product = node;
var productApprovalStatus = product.getApprovalStatus();
var productNo = product.getValue("PRODUCTNO").getSimpleValue();
var shippingLotNo = product.getValue("Shipping_Lot_No").getSimpleValue();
var currRevision = BL_MaintenanceWorkflows.getCurrentRevision(product);
var wipRevision = BL_MaintenanceWorkflows.getWIPRevision(product);
var highestLot = null;

logger.info("productNo:" + productNo + "; shippingLotNo:" + shippingLotNo + "; currRevision:" + currRevision + "; wipRevision:" + wipRevision);

if(shippingLotNo) {
    logger.info('shippingLot branch');
    var conditions = com.stibo.query.condition.Conditions;
    var lots = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Lot"));
    var productNoEquals = conditions.valueOf(manager.getAttributeHome().getAttributeByID("PRODUCTNO")).eq(productNo);
    var lotNoEquals = conditions.valueOf(manager.getAttributeHome().getAttributeByID("LOTNO")).eq(shippingLotNo);
    var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(lots.and(lotNoEquals).and(productNoEquals));
    var result = querySpecification.execute();

    result.forEach(function(lot) {
        if (!highestLot) {
            highestLot = lot;
        }
        else {
            var highestLotID = highestLot.getID().replace('l', '1000');
            var lotID = lot.getID().replace('l', '1000');

            if(highestLotID < lotID) {
                highestLot = lot;
            }
        }

        return true;
    });
}
else {
    //logger.info('no shippingLot branch');

    var revision = currRevision || wipRevision;

    if (revision) {
        var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
        var refs = revision.queryReferences(refType);

        refs.forEach(function(ref) { // Finding Nemo ... or highest lot no
            var lot = ref.getTarget();

            if (!highestLot) {
                highestLot = lot;
            }
            else {
                if (parseInt(highestLot.getValue("LOTNO").getSimpleValue(), 10) == parseInt(lot.getValue("LOTNO").getSimpleValue(), 10)) {
                    var highestLotID = highestLot.getID().replace('l', '1000');
                    var lotID = lot.getID().replace('l', '1000');

                    if(highestLotID < lotID) {
                        highestLot = lot;
                    }
                }
                else {
                    if (parseInt(highestLot.getValue("LOTNO").getSimpleValue(), 10) < parseInt(lot.getValue("LOTNO").getSimpleValue(), 10)) {
                        highestLot = lot;
                    }
                }
            }

            return true;
        });
    }
    else {
        logger.info('no current or wip revision was found');
    }
}


if (highestLot) {
    if (highestLot.getValue("Antibody_Sensitivity").getSimpleValue() != product.getValue("Antibody_Sensitivity").getSimpleValue()) {
        // to change after confirmation Antibody_Sensitivity2 to Antibody_Sensitivity
        logger.info("Antibody_Sensitivity on product #" + productNo + " will be set from: '" + product.getValue("Antibody_Sensitivity2").getSimpleValue() + "' to: '" +
            highestLot.getValue("Antibody_Sensitivity").getSimpleValue() + "' source lot object is: " + highestLot.getName() + " (" + highestLot.getID() + ")");

        // to change after confirmation Antibody_Sensitivity2 to Antibody_Sensitivity
        product.getValue("Antibody_Sensitivity2").setSimpleValue(highestLot.getValue("Antibody_Sensitivity").getSimpleValue());

        if (productApprovalStatus == "Completely Approved") {
            BA_Approve.execute(product);
        }

        if(currRevision) {
            BA_Republish_WebPassthrough_Event.execute(product);
        }

        if(wipRevision) {
            BA_Send_To_Preview.execute(wipRevision);
        }
        else {
            BA_Send_To_Preview.execute(currRevision);
        }
    }
    else {
        logger.info("no need to update:" + highestLot.getValue("Antibody_Sensitivity").getSimpleValue() + "=" + product.getValue("Antibody_Sensitivity").getSimpleValue());
    }
}
}