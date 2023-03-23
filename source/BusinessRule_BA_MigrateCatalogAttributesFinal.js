/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_MigrateCatalogAttributesFinal",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_MigrateCatalogAttributesFinal",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
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
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActMigMSSkuAttributes",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateMS_SKU_Attributes",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActSetPrimaryImgURL",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Set_Primary_Image_URL",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,busActMigMSSkuAttributes,busActSetPrimaryImgURL) {
//log.info("+++Copy_Catalog_Attributes_From_ProductRev+++");


var pRevision = node;
var tmApplicaitons = new java.util.TreeMap();
var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
var pProduct =  pRevision.getParent();


var refLinks = pRevision.getClassificationProductLinks(refType);
if (refLinks != null && refLinks.size() > 0) {
	//Lot_To_ApplicationProtocol
	for (var l = 0; l < refLinks.size(); l++) {
		var refLink = refLinks.get(l);
		var cApplicaiton = refLink.getClassification();
		if (cApplicaiton.getObjectType().getID() == "Protocol")
			cApplicaiton = cApplicaiton.getParent();

		var sApplication = cApplicaiton.getValue("APPLICATIONABBR").getSimpleValue();
		var idxApplicaiton = cApplicaiton.getValue("APPLICATIONINDEX").getSimpleValue();
		tmApplicaitons.put(new java.math.BigInteger(idxApplicaiton), sApplication);

	}
	var lst = tmApplicaitons.entrySet().toArray();
	var sAppCodes;
	for (var j = 0; j < lst.length; j++) {
		var sAppCode = lst[j].getValue();
		if (j == 0)
			sAppCodes = sAppCode;
		else
			sAppCodes = sAppCodes + ", " + sAppCode;

	}
	//log.info("ApplCodes_String "+ sAppCodes);
	if (sAppCodes)
		pRevision.getValue("ApplCodes_String").setSimpleValue(sAppCodes);
}

var tmSpecies = new java.util.TreeMap();
var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");
//STEP-6396
var refLinks = pRevision.queryReferences(refType);
refLinks.forEach(function(ref) {
	var eSpecies = ref.getTarget();
	var idxSpecies = eSpecies.getValue("SPECIESINDEX").getSimpleValue();
	if (!idxSpecies)
		idxSpecies = "-1";
	tmSpecies.put(new java.math.BigInteger(idxSpecies), eSpecies);
	return true;
});
//STEP-6396
var lst = tmSpecies.entrySet().toArray();
var sXRSpeciesCodes;
var sXRSpeciesName;
for (var j = 0; j < lst.length; j++) {
	var eSpecies = lst[j].getValue();
	var sSpeciesCode = eSpecies.getValue("SPECIESCODE").getSimpleValue();
	var sSpeciesName = eSpecies.getValue("SPECIES").getSimpleValue();
	if (j == 0) {
		sXRSpeciesCodes = sSpeciesCode;
		sXRSpeciesName = sSpeciesName;
	} else {
		sXRSpeciesCodes = sXRSpeciesCodes + ", " + sSpeciesCode;
		sXRSpeciesName = sXRSpeciesName + ", " + sSpeciesName;
	}
}
log.info("XRSpeciesCodes_String " + sXRSpeciesCodes)
log.info("XRSpeciesName_String " + sXRSpeciesName)
if (sXRSpeciesCodes)
	pRevision.getValue("Species_Codes_XRStr").setSimpleValue(sXRSpeciesCodes);
if (sXRSpeciesName)
	pRevision.getValue("Species_Names_XRStr").setSimpleValue(sXRSpeciesName);


//var sHomology_Species_Abbr_Str = pRevision.getValue("Homology_Species_Abbr_Str").getSimpleValue();
//var sHomologySpeciesName = pRevision.getValue("Homology_Species_NameStr").getSimpleValue();
var sApplCodes_String = pRevision.getValue("ApplCodes_String").getSimpleValue();
var sIsotype = pRevision.getValue("Isotype").getSimpleValue();
var sAbSensitivity = pRevision.getValue("Antibody_Sensitivity").getSimpleValue();

//log.info(" Rev Homology_Species_Abbr_Str " + sHomology_Species_Abbr_Str);
//log.info(" Rev Homology_Species_NameStr " + sHomologySpeciesName);
//log.info(" Rev ApplCodes " + sApplCodes_String);
//log.info(" Rev IsoType " + sIsotype);
//log.info(" Rev sAbSensitivity " + sAbSensitivity);
  
// Below code needs to be removed after catlog is modified for homologous species as reference

var tmHMSpecies = new java.util.TreeMap();
var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_To_Species");
//STEP-6396
var refLinks = pProduct.queryReferences(refType);
refLinks.forEach(function(ref) {
	var eSpecies = ref.getTarget();
	var idxSpecies = eSpecies.getValue("SPECIESINDEX").getSimpleValue();
	if (!idxSpecies)
		idxSpecies = "-1";
	tmHMSpecies.put(new java.math.BigInteger(idxSpecies), eSpecies);
	return true;
});
//STEP-6396

var lst = tmHMSpecies.entrySet().toArray();
/*
Through the Product_To_Species Reference Type.  We need to populate Product Attributes: HOMOLGOUS_SPECIES on the product with the SPECIESCODE values on the Species.
They need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.  For example H (human) should always be first, then M (mouse).
HomologySpeciesName_String, on the product should be populated by SPECIES values on the Species.
This is the species names, they need to be comma delimited and in a sorted order, based on the SPECIESINDEX number on the species.
 */
//populate Product Attributes: HOMOLGOUS_SPECIES
var sHomologySpecies;
var sHomologySpeciesName;
for (var j = 0; j < lst.length; j++) {
	var eSpecies = lst[j].getValue();
	var sSpeciesCode = eSpecies.getValue("SPECIESCODE").getSimpleValue();
	var sSpeciesName = eSpecies.getValue("SPECIES").getSimpleValue();
	if (j == 0) {
		sHomologySpecies = sSpeciesCode;
		sHomologySpeciesName = sSpeciesName;
	} else {
		sHomologySpecies = sHomologySpecies + ", " + sSpeciesCode;
		sHomologySpeciesName = sHomologySpeciesName + ", " + sSpeciesName;
	}
}
//log.info("sHomologySpecies" + sHomologySpecies)
//log.info("sHomologySpeciesName" + sHomologySpeciesName)
if (sHomologySpecies)
	pProduct.getValue("Homology_Species_Abbr_Str").setSimpleValue(sHomologySpecies);
if (sHomologySpeciesName)
	pProduct.getValue("Homology_Species_NameStr").setSimpleValue(sHomologySpeciesName);


/*if (sHomology_Species_Abbr_Str){
	pProduct.getValue("Homology_Species_Abbr_Str").setSimpleValue(sHomology_Species_Abbr_Str);
	log.info(" pProduct Homology_Species_Abbr_Str " + sHomology_Species_Abbr_Str);
}
if (sHomologySpeciesName){
	pProduct.getValue("Homology_Species_NameStr").setSimpleValue(sHomologySpeciesName);
	log.info(" pProduct Homology_Species_Abbr_Str " + sHomologySpeciesName);
}*/



//Call Catalog Related BR's

busActMigMSSkuAttributes.execute(pRevision);
busActSetPrimaryImgURL.execute(pRevision);
}