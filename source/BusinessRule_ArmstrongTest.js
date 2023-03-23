/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "ArmstrongTest",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Armstrong Test",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib) {
function checkValidatedApplications(step, pTechTransfer, pRevision, log) {
    var lotApplications = new java.util.TreeMap();
    var revApplications = new java.util.TreeMap();
    //lot_application
    var children = pTechTransfer.getChildren();

    //log.info(" child "+children.size());

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Lot_Application") {
            var sAppResult = child.getValue("RESULT").getSimpleValue();
            //log.info(" sAppResult "+sAppResult);

            if (sAppResult == "Positive") {
                var sApplication = child.getValue("APPLICATIONABBR").getSimpleValue();
                var nProtocol = child.getValue("PROTOCOLNO").getSimpleValue();
                if (!nProtocol)
                    nProtocol = "";


                var cApplication = step.getNodeHome().getObjectByKey("APPLICATIONNO", sApplication);
                //log.info(" cApplication "+cApplication);
                var sExportFlag = cApplication.getValue("APPLICATIONEXPORTFLAG_YN").getSimpleValue();
                //log.info(" sExportFlag "+sExportFlag);
                if (sExportFlag == "Y" || nProtocol) {
                    var sDilutionLow = child.getValue("Dilution_Low").getSimpleValue();
                    var sDilutionHigh = child.getValue("Dilution_High").getSimpleValue();
                    var sDilution = child.getValue("DILUTIONFACTOR").getSimpleValue();
                    var sSpecies = child.getValue("Appl_Species_Tested").getSimpleValue();
                    var sChildString = sApplication + "_" + nProtocol + "_" + sDilution + "_" + sSpecies + "_" + sDilutionLow + "_" + sDilutionHigh;
                    lotApplications.put(sApplication + nProtocol, sChildString);
                }
            }
        }
    }
    if (lotApplications.size() == 0)
        return false;

    //log.info(" lotApplications.size() "+lotApplications.size());


    //rev application  -- Revision_to_ApplicationProtocol
    var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    var links = pRevision.getClassificationProductLinks(refType);
    //log.info(" links.size() "+links.size());
    for (var i = 0; i < links.size(); i++) {
        var ref = links.get(i);
        var cApplication = ref.getClassification();
       // log.info(" links.cApplication() "+cApplication);
        var sApplication = cApplication.getValue("APPLICATIONABBR").getSimpleValue();
       log.info("i= "+i+"  links.sApplication() " + sApplication);
        var nProtocol = cApplication.getValue("PROTOCOLNO").getSimpleValue();
        log.info(" links.nProtocol() " + nProtocol);
       /* if (!sApplication) {
            nProtocol = "";
        }
         else {
            sApplication = cApplication.getValue("APPLICATIONID").getSimpleValue();
            log.info(" links.sApplication() " + sApplication);
        }*/

         if (!nProtocol)
               nProtocol = "";


        log.info(" links.nProtocol() 1 " + nProtocol);
        var sExportFlag = cApplication.getValue("APPLICATIONEXPORTFLAG_YN").getSimpleValue();
        //log.info(" links.sExportFlag() "+sExportFlag);
        if (sExportFlag == "Y" || nProtocol) {
            var sDilutionLow = ref.getValue("Dilution_Low").getSimpleValue();
            var sDilutionHigh = ref.getValue("Dilution_High").getSimpleValue();
            var sDilution = ref.getValue("DILUTIONFACTOR").getSimpleValue();
            var sSpecies = ref.getValue("Appl_Species_Tested").getSimpleValue();
            if (sSpecies != null) {
                sSpecies = sSpecies.replace("<multisep/>", ";")
            }
            log.info(" links.sSpecies() 1 " + sSpecies);
            var sChildString = sApplication + "_" + nProtocol + "_" + sDilution + "_" + sSpecies + "_" + sDilutionLow + "_" + sDilutionHigh;
            revApplications.put(sApplication + nProtocol, sChildString);

        }
    }
    if (revApplications.size() == 0)
        return false;


    //log.info(" revApplications.size() "+revApplications.size());

    var sLotApplicationResult;
    var lst = lotApplications.entrySet().toArray();
    for (var i = 0; i < lst.length; i++) {
        var sValue = lst[i].getValue();
        if (i == 0)
            sLotApplicationResult = sValue;
        else
            sLotApplicationResult = sLotApplicationResult + "-" + sValue;
    }


    var sRevApplicationResult;
    var lst = revApplications.entrySet().toArray();
    for (var j = 0; j < lst.length; j++) {
        var sValue = lst[j].getValue();
        if (j == 0)
            sRevApplicationResult = sValue;
        else
            sRevApplicationResult = sRevApplicationResult + "-" + sValue;
    }

    log.info(" sLotApplicationResult " + sLotApplicationResult);
    log.info(" sRevApplicationResult " + sRevApplicationResult);
    if (sLotApplicationResult == sRevApplicationResult)
        return false;
    else
        return true;
}

 var nMasterStock = node.getValue("MasterStock_SKU").getSimpleValue();
    var pMasterStock = step.getNodeHome().getObjectByKey("MASTERSTOCKNO", nMasterStock);
    log.info("pMasterStock " + pMasterStock);

    var pRevision = Lib.getLatestAssociatedRevision(pMasterStock);

     log.info("Existing revision = " + pRevision + " Checking bCheckApplications ");
                 bCheckApplications = checkValidatedApplications(step, node, pRevision, log);
                log.info("bCheckApplications " + bCheckApplications);
}