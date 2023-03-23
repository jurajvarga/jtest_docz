/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_TechTransferComponentEval",
  "type" : "BusinessAction",
  "setupGroups" : [ "TechTransferActions" ],
  "name" : "BA Tech Transfer Component Evaluation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Lot", "NonLot" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "BL_TechTransfer",
    "libraryAlias" : "lib_tt"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,lookupTableHome,Lib,lib_tt) {
// BA_TechTransferComponentEval
// node: Current Object
// step: STEP Manager
// Lib: BL_Library
// lib_tt: BL_TechTransfer
// validity: Tech Transfer (Lot), Tech Transfer (NonLot)

// STEP-5953 to remove tested species duplicates
lib_tt.removeDuplicateSpecies(node);

//(2)Check For New vs. Existing Product -->Check by product-no
var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
log.info("BA_EvaluateRevisionTechTransfer = " + nProduct);

//PRODUCTNO
var pProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
log.info(pProduct);
if (!pProduct) {
    node.getValue("NewProductFlag_YN").setSimpleValue("Y");
    node.getValue("NewMasterStockFlag_YN").setSimpleValue("Y");
    node.getValue("NewRevisionFlag_YN").setSimpleValue("Y");
    node.getValue("REVISIONNO").setSimpleValue(Number(Lib.getNextRevisionNo(pProduct)) + 1); // node.getValue("REVISIONNO").setSimpleValue ("1");
    node.getValue("NewTechTransferFlag_YN").setSimpleValue("");

} else {
    node.getValue("NewProductFlag_YN").setSimpleValue("N");
    //log.info("NewProductFlag_YN =  "+node.getValue("NewProductFlag_YN").getSimpleValue());
    node.getValue("NewTechTransferFlag_YN").setSimpleValue("");
    node.getValue("NewRevisionFlag_YN").setSimpleValue("N");
    //log.info("NewRevisionFlag_YN =  "+node.getValue("NewRevisionFlag_YN").getSimpleValue());

    //(3)Existing Product: Check for New vs. Existing Master Stock --> Check by master-stock SKU
    var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
    var pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
    log.info("pMasterStock " + pMasterStock);
    if (!pMasterStock) {
        node.getValue("NewMasterStockFlag_YN").setSimpleValue("Y");
        node.getValue("NewRevisionFlag_YN").setSimpleValue("Y");
        node.getValue("REVISIONNO").setSimpleValue(Number(Lib.getNextRevisionNo(pProduct)) + 1); // node.getValue("REVISIONNO").setSimpleValue ("1");
        node.getValue("NewTechTransferFlag_YN").setSimpleValue("");
    } else {
        node.getValue("NewMasterStockFlag_YN").setSimpleValue("N");
        node.getValue("NewTechTransferFlag_YN").setSimpleValue("");
        var pRevision = Lib.getLatestAssociatedRevision(pMasterStock);

        if (!pRevision) {
            node.getValue("NewRevisionFlag_YN").setSimpleValue("Y");
            node.getValue("REVISIONNO").setSimpleValue(Number(Lib.getNextRevisionNo(pProduct)) + 1); // node.getValue("REVISIONNO").setSimpleValue ("1");
        } else {

            // Check for changes in Values, Applications, Targets (and Components if Kit) if it is not Custom Lot
            var bChangeInTechTransferLot = false;
            if (node.getValue("CustomLotRev_YN") != "Y") {

                log.info("Existing revision = " + pRevision + " Checking checkAtomicValues ");
                var bCheckValues = false;
                bCheckValues = lib_tt.checkAtomicValues(step, node, pRevision, pMasterStock, log);
                log.info("bCheckValues " + bCheckValues);

                //Check Applications only for Tech Transfer Lot Object
                var bCheckApplications = false;
                if (node.getObjectType().getID() != "NonLot") {
                    log.info("Existing revision = " + pRevision + " Checking bCheckApplications ");
                    bCheckApplications = lib_tt.checkValidatedApplications(step, node, pRevision, log);
                    log.info("bCheckApplications " + bCheckApplications);
                }

                log.info("Existing revision = " + pRevision + " Checking bCheckTargets ");
                var bCheckTargets = lib_tt.checkTargetsValidation(step, node, pRevision);
                log.info("bCheckTargets " + bCheckTargets);


                var bCheckComponents = false;
                log.info("bCheckComponents " + bCheckComponents);

                if (lib_tt.isKit(node)) {

                    log.info("Existing revision = " + pRevision + " Checking bCheckComponents ");

                    bCheckComponents = lib_tt.checkComponents(node, pRevision, log);
                    log.info("bCheckComponents " + bCheckComponents);
                }
                log.info("bCheckApplications " + bCheckApplications + " bCheckValues " + bCheckValues + " bCheckComponents " + bCheckComponents + " bCheckTargets " + bCheckTargets);

                //STEP-6159
                if ((!bCheckValues) && (bCheckApplications != "maintenance") && (!bCheckComponents) && (!bCheckTargets)) {
                    node.getValue("NewRevisionFlag_YN").setSimpleValue("N");

                    //Pivotree Comment, Jul-30-2019: Populate the revision number on the tech transfer based on the revision object
                    var pRevNum = pRevision.getValue("REVISIONNO").getSimpleValue();
                    node.getValue("REVISIONNO").setSimpleValue(pRevNum);
                    //var sRevision = node.getValue("REVISIONNO").getSimpleValue();
                    //log.info("No New revision = Y "+sRevision);

                    bChangeInTechTransferLot = true;
                }

            } else {
                log.info("CustomLotRev_YN Attribute in the incoming lot object is Y.");
            }

            if (!bChangeInTechTransferLot) {
                var systemInitiatedWF = lib_tt.getSystemInitiatedWF(step, log, node, pRevision, pMasterStock, lookupTableHome);
                if (systemInitiatedWF != null) {
                    log.info(" systemInitiatedWF " + systemInitiatedWF[0]);
                    log.info(" systemInitiatedMessage " + systemInitiatedWF[1]);
                    node.getValue("NewTechTransferFlag_YN").setSimpleValue(systemInitiatedWF[0]);
                    node.getValue("TechTransferInitiatedSystemMessage").setSimpleValue(systemInitiatedWF[1]);
                }
                log.info("New revision = Y " + pRevision);
                node.getValue("NewRevisionFlag_YN").setSimpleValue("Y");
                var lRevision = Lib.getNextRevisionNo(pProduct);
                var NxtRevision = Number(lRevision) + 1;
                log.info("Last Revision No= " + lRevision + " :Next Revision No= " + NxtRevision);
                node.getValue("REVISIONNO").setSimpleValue(NxtRevision);
            }
        }
    }
}

log.info("  NewProductFlag_YN = " + node.getValue("NewProductFlag_YN").getSimpleValue());
log.info("  NewRevisionFlag_YN  = " + node.getValue("NewRevisionFlag_YN").getSimpleValue());
log.info("  NewMasterStockFlag_YN = " + node.getValue("NewMasterStockFlag_YN").getSimpleValue());
}