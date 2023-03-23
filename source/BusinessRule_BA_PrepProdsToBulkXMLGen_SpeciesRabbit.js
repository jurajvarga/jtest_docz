/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PrepProdsToBulkXMLGen_SpeciesRabbit",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_PrepProdsToBulkXMLGen_SpeciesRabbit",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BL_Library) {
/**
 * Business Action: BA_PrepProdsToBulkCMLGen_SpesiesRabbit
 * 
 * Purpose:
 * For node object containing productNo, lotNo, application_temp retrieve product and his revisions.
 * If there is appropriate lot number on the revision:
 *   - updRevisionToApplicationProtocol: if there is application protocol with appropriate classification, add "Rab" to the list of species 
 *   - addRevisionToSpeciesReactivity: if there is no "Rab" species reactivity on the revision, add it
 */


var businessAction = "Business Action: BA_PrepProdsToBulkCMLGen_SpesiesRabbit";
log.info ("Start " + businessAction);
var productno = node.getValue("PRODUCTNO").getSimpleValue();
//node.getValue("LOTNO").setSimpleValue("cdlcdlcld");
var lotNo = node.getValue("LOTNO").getSimpleValue();
//lotNo = 22;
//node.getValue("Application_temp").setSimpleValue("Western Blotting");
var crossReactivityApp = node.getValue("Application_temp").getSimpleValue();
//crossReactivityApp = "Flow Cytometry (Fixed/Permeabilized)";
//crossReactivityApp = "Western Blotting";
//log.info("crossReactivityApp="+crossReactivityApp);
//setting constants for testing
var specieString = "Rab";
//log.info("productno = " + productno);
if (productno) {
    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productno);
    var revisionList = BL_Library.getRevisions(product);
    //log.info("revisionList.size="+revisionList.size());
	for (var i = 0; i<revisionList.size(); i++){
		var revision = revisionList.get(i);
		var lotNumbersString = BL_Library.getLotNumbers(revision, manager);
		// if there is input Lot No in the list
		//log.info("revision = "+revision.getName() + " lotNo = "+lotNo + " lotNumbersString = " + lotNumbersString);
		//log.info("lotNo="+lotNo);
		//log.info("lotNumbersString.search(lotNo)="+lotNumbersString.search(lotNo));
		if (lotNumbersString.search(lotNo) != -1) {

			// 1. ADD spiece to Application to protocol
			updRevisionToApplicationProtocol(manager, revision, specieString);
			
			// 2. ADD Species Reactivity
			var resultValue = addRevisionToSpeciesReactivity(manager, revision, specieString);
//			log.info("resultValue = " + resultValue);
		}
		else {
//			log.info("lotNo " + lotNo + " not found in " + lotNumbersString + ".");
		}
	}

}
log.info("BA_PrerProds *** FINISH" + productno );

//-----------------------------------------------------------
function productRevisionHasSpeciesByName(refLinks, specie) {
	var index = 0;
	var sizeRefArr = refLinks.size()
	
	while ((index<sizeRefArr) && (refLinks.get(index).getTarget().getName() != specie)){
		index++;
	}

	if (sizeRefArr > index) {
		return true;
	} else {
		return false;
	}
}

function addRevisionToSpeciesReactivity(manager, revision, specie) {
	// get Species Reactivity Entity Reference
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");
	var refLinks = revision.getReferences(refType);

	if (!productRevisionHasSpeciesByName(refLinks,specie)){
		var specieRabbit = manager.getNodeHome().getObjectByKey("SPECIESNO", specie);
		revision.createReference(specieRabbit, "Product_Revision_To_Species");
		return true;
	} else {
		return false;
	}
}

//--------------------------------------------------------------------
function updRevisionToApplicationProtocol(manager, revision, specie) {
			//get all application to revision
			var refType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
			var revAplicationProtocolReferences = revision.getClassificationProductLinks(refType);
			//Pre vsetky aplikacne protokoly
			for (var j = 0; j < revAplicationProtocolReferences.size(); j++) {
				//looking for aCrossReactivityAopplication
  				var classificationProductLink = revAplicationProtocolReferences.get(j);
  				var classification = classificationProductLink.getClassification();
  				var applSpeciedTestedValue = classificationProductLink.getValue("Appl_Species_Tested").getSimpleValue();
  				//log.info( revision.getName() + " SpeciedTested = " + applSpeciedTestedValue);
  				var classificationObjectType = classification.getObjectType().getID().toUpperCase();
  				//log.info("classificationObjectType="+classificationObjectType);
  				if (classificationObjectType == "PROTOCOL") {
					var webAlias = classification.getValue("PROTOCOLWEBALIAS").getSimpleValue();
					//log.info("webAlias="+webAlias);
  				} else {
  					if (classificationObjectType == "APPLICATION") {
  						var application = classification.getValue("Application").getSimpleValue();	
  						//if (applSpeciedTestedValue && applSpeciedTestedValue.toUpperCase() == "ALL") {
  						//	application = "";
  						//}
  						//log.info("application="+application);
  					}
				}
				
				if ((webAlias == crossReactivityApp) || (application == crossReactivityApp )) {
					//Set attribute SpeciesTested to string 'Rab' as Rabbit
					if (applSpeciedTestedValue){
						//log.info("applSpeciedTestedValue");
						if (applSpeciedTestedValue.search(specie) == -1){
							//log.info("applSpeciedTestedValue.search(specie) == -1");
							if (applSpeciedTestedValue.length() > 0){
								//log.info("applSpeciedTestedValue.length() > 0");
								if (specie.search(";") == -1) {
									specie = ";" + specie;
								}
							}
							classificationProductLink.getValue("Appl_Species_Tested").setSimpleValue(applSpeciedTestedValue+specie);
						}
					} else {
						//log.info(revision.getName() + "applSpeciedTestedValue is null and will be added");
						classificationProductLink.getValue("Appl_Species_Tested").setSimpleValue(specie);
					}
				}
			}
}
}