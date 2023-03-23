/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_FC-FP_Bulk",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_FC-FP_Bulk",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "WebDataRepublished",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebDataRepublished",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,liveQueue,WebDataRepublished,BL_Library,BL_MaintenanceWorkflows) {
var list = {
    "p3317894": "406",
    "p3318690": "406",
    "p3320137": "1344",
    "p3320138": "1345",
    "p3320139": "1345",
    "p3320144": "406",
    "p3320657": "407",
    "p3320710": "404",
    "p3320951": "407",
    "p3321011": "407",
    "p3322410": "407",
    "p3323419": "407",
    "p3323625": "406",
    "p3323640": "406",
    "p3323789": "407",
    "p3323809": "407",
    "p3323922": "407",
    "p3323962": "407",
    "p3324688": "1804",
    "p3313912": "1346",
    "p3314033": "1804",
    "p3315368": "1345",
    "p3315734": "404",
    "p3316341": "404",
    "p3316355": "407",
    "p3316382": "407",
    "p3316465": "407",
    "p3488314": "407",
    "p3316525": "407",
    "p3316538": "1344",
    "p3316568": "407",
    "p3488315": "407",
    "p3521933": "1346",
    "p4747288": "404",
    "p3316746": "407",
    "p3316753": "407",
    "p3317125": "404",
    "p3509762": "407",
    "p3317238": "407",
    "p3488321": "407",
    "p3488322": "407",
    "p3317340": "407",
    "p3317349": "1344",
    "p4717094": "1345",
    "p3507815": "1804",
    "p3317549": "407",
    "p3488325": "407",
    "p3317571": "407",
    "p3317602": "406",
    "p3317636": "1804",
    "p3317662": "1344",
    "p3317766": "407",
    "p3317781": "407",
    "p3317791": "1344",
    "p3317871": "407",
    "p3318193": "407",
    "p3318516": "407",
    "p3318548": "1346",
    "p3318650": "1804",
    "p3318661": "1344",
    "p3318729": "1344",
    "p3318766": "1344",
    "p3318777": "407",
    "p3318822": "404",
    "p3545788": "1346",
    "p3509765": "407",
    "p3318991": "407",
    "p3507817": "1804",
    "p3488332": "407",
    "p3319026": "407",
    "p3319112": "407",
    "p3513904": "1344",
    "p3883889": "404",
    "p3319199": "1804",
    "p4717075": "1345",
    "p3319320": "1344",
    "p3319360": "407",
    "p3488335": "407",
    "p3319437": "407",
    "p3319520": "1804",
    "p3319545": "407",
    "p3319571": "1804",
    "p3319577": "1344",
    "p3319612": "1804",
    "p3319680": "407",
    "p3319755": "407",
    "p3319823": "407",
    "p3319977": "407",
    "p5230764": "406",
    "p3320022": "1804",
    "p3320038": "407",
    "p3488345": "407",
    "p3320110": "404",
    "p3320158": "407",
    "p3563331": "404",
    "p3320264": "407",
    "p3320267": "407",
    "p3488349": "407",
    "p3507818": "1804",
    "p4685628": "407",
    "p5220199": "404",
    "p3320659": "1804",
    "p3320693": "1344",
    "p3320812": "407",
    "p3320819": "1804",
    "p3488356": "407",
    "p3320938": "404",
    "p3320956": "1804",
    "p3488357": "407",
    "p3321084": "1804",
    "p3321110": "407",
    "p3321113": "407",
    "p3321124": "1344",
    "p3321238": "1344",
    "p3321486": "407",
    "p3321509": "1804",
    "p3321526": "1804",
    "p3321538": "407",
    "p3321557": "407",
    "p3321574": "1804",
    "p3321596": "1345",
    "p3321621": "407",
    "p3321661": "407",
    "p3321790": "407",
    "p5166812": "1344",
    "p3321835": "407",
    "p3513908": "1344",
    "p3321877": "1344",
    "p3321879": "407",
    "p3321881": "1344",
    "p3321894": "1344",
    "p3321944": "407",
    "p3664633": "1344",
    "p5570455": "404",
    "p3322004": "1804",
    "p3322007": "407",
    "p3322040": "407",
    "p3322050": "407",
    "p3322056": "1804",
    "p3322096": "407",
    "p3322118": "1804",
    "p3507820": "1804",
    "p3322227": "1344",
    "p3488378": "407",
    "p3322308": "1804",
    "p3322346": "407",
    "p3509769": "407",
    "p3507821": "1804",
    "p3322386": "1344",
    "p3322401": "1804",
    "p3322430": "1804",
    "p3322510": "407",
    "p3322587": "407",
    "p3322625": "407",
    "p3571277": "404",
    "p3322707": "1804",
    "p3322712": "404",
    "p3322877": "407",
    "p3509770": "407",
    "p3322889": "1344",
    "p3513910": "1344",
    "p3322994": "1344",
    "p3323001": "1344",
    "p3323056": "407",
    "p3488390": "407",
    "p3323178": "1804",
    "p3664634": "1344",
    "p3323222": "407",
    "p3323223": "407",
    "p3323229": "407",
    "p3323234": "407",
    "p3323307": "1804",
    "p3488394": "407",
    "p3323490": "1344",
    "p3323506": "1344",
    "p3323551": "407",
    "p3323556": "407",
    "p3323559": "407",
    "p3323570": "404",
    "p3323576": "407",
    "p3507824": "1804",
    "p3323719": "407",
    "p3323721": "1344",
    "p3507825": "1804",
    "p3323797": "1344",
    "p3323812": "1344",
    "p3488400": "1804",
    "p3513914": "1344",
    "p3323968": "1804",
    "p3664236": "1344",
    "p5269542": "1346",
    "p3488406": "407",
    "p4716536": "404",
    "p3324349": "1344",
    "p3324371": "407",
    "p3547614": "407",
    "p3488408": "1344",
    "p3886557": "1344",
    "p3488409": "407",
    "p3885781": "1346",
    "p3509771": "407",
    "p3509772": "407",
    "p3324740": "1344",
    "p3545819": "1344",
    "p3886558": "1344",
    "p3324802": "407",
    "p4725868": "404",
    "p3324857": "1345",
    "p3324924": "407",
    "p3324926": "407",
    "p3324927": "1804"
};

for (productID in list) {
    //console.log(productID); //ID
    //console.log(list[productID]); //PROTOCOLNO
    var product = manager.getProductHome().getProductByID(productID);
    var revInRevReleaseWF = BL_Library.getRevisionsOfProductInWorkflow(product, "Revision_Release_Workflow");
    var wipRev = BL_MaintenanceWorkflows.getWIPRevision(product);
    var curRev = BL_MaintenanceWorkflows.getCurrentRevision(product);

    if (revInRevReleaseWF.length != 0) {
        revInRevReleaseWF.forEach(function loop(rev) {
            createNewProtocolRef(rev);
            rev.approve();
            return;
        });
    }

    if (wipRev != null) {
        createNewProtocolRef(wipRev);
    }

    if (curRev != null) {
        createNewProtocolRef(curRev);
        curRev.approve();
        liveQueue.queueDerivedEvent(WebDataRepublished, product);
    }

}

function createNewProtocolRef(rev) {
    var protocol = manager.getNodeHome().getObjectByKey("PROTOCOLNO", list[productID]);
    var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
    var revAplicationProtocolReferences = rev.getClassificationProductLinks(refType);

    for (var i = 0; i < revAplicationProtocolReferences.size(); i++) {
        var existingProtocolLink = revAplicationProtocolReferences.get(i);

        if (existingProtocolLink.getClassification().getObjectType().getID() == "Protocol"
            && existingProtocolLink.getClassification().getValue("PROTOCOLAPPLICATIONABBR").getSimpleValue() == "FC-L") {

            var newProtocolLink = rev.createClassificationProductLink(protocol, refType);
            newProtocolLink.getValue("Dilution_Low").setSimpleValue(existingProtocolLink.getValue("Dilution_Low").getSimpleValue());
            newProtocolLink.getValue("Dilution_High").setSimpleValue(existingProtocolLink.getValue("Dilution_High").getSimpleValue());
            newProtocolLink.getValue("DILUTIONFACTOR").setSimpleValue(existingProtocolLink.getValue("DILUTIONFACTOR").getSimpleValue());
            newProtocolLink.getValue("Appl_Species_Tested").setSimpleValue(existingProtocolLink.getValue("Appl_Species_Tested").getSimpleValue());
            break;
        }
    }

    //log.info("update reliable.revision set applcodes = case when (applcodes is null or applcodes = '') then 'FC-FP' else applcodes || ', FC-FP' end where productno='" + product.getValue("PRODUCTNO").getSimpleValue() + "' and rev_no=" + rev.getValue("REVISIONNO").getSimpleValue() +";");
}
}