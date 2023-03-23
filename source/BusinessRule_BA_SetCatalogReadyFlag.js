/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetCatalogReadyFlag",
  "type" : "BusinessAction",
  "setupGroups" : [ "CatalogDiscountPrice" ],
  "name" : "BA_SetCatalogReadyFlag",
  "description" : "Sets Catalog Ready Flag on Approval of SKU",
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
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Calc_Discount_Completeness_Percentage",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateUSRefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToUSCatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateUKRefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToUKCatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateEURefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToEUCatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateDERefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToDECatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateJNRefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToJNCatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCreateCNRefs",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateSkuToCNCatalogReference",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CalculateCustomoerPriceFromProduct",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionCalcCustUSPrices",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Customer_Price_United_States",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busAction,busActionCreateUSRefs,busActionCreateUKRefs,busActionCreateEURefs,busActionCreateDERefs,busActionCreateJNRefs,busActionCreateCNRefs,busActionCalcCustPrices,busActionCalcCustUSPrices) {
log.info(" in -->BA_SetCatalogReadyFlag" );

Array.prototype.contains = function(elem){
    for (var i in this){
        if (this[i] == elem) return true;
    }
    return false;
}
var eProductStatus = [
// 'Pre-discontinued',
// 'Pending',
// 'Pre-released',
   'Released',
   'Released - On Hold'

];
var eProductType = [
'Antibody Array Kit',
'Antibody Cocktail Kit',
'Antibody Cocktail',
'Antibody Duet',
'Antibody Sampler Kit',
'AQUA Peptide',
'Assay Kit',
'Biotinylated Peptide',
//'Blocking Peptide',
'Buffer Kit',
'Buffer',
'Cell Extract Kit',
'Cell Extracts',
'Cellular Dyes',
'CUT&RUN KIT',
'CUT&RUN Kit', // STEP-6139
'CUT&Tag Kit', // STEP-6139
'Chemical Modulators',
'ChIP Kit',
'Detection System Kit',
'Detection System',
'ELISA Antibody Pair',
'ELISA Kit',
'FastScan ELISA Kit',
'Growth Factors and Cytokines',
'IHC Control Slides',
'IHC Kit',
//'Instrument',
//'Instrument Accessories',
'MeDIP Kit',
'Miscellaneous',
'Monoclonal Antibody',
'MW Marker Kit',
'MW Marker',
//'Phosphatases',
'PhosphoPlus Antibody Kit',
'Polyclonal Antibody',
'Primer Set',
'Protein Control Kit',
'Protein Control',
//'Protein Kinase',
'Protein substrate',
//'PTMScan',
'Secondary Antibody',
//'Service',
//'siRNA Kit',
'siRNA',
'Sourced Antibody',
'Subassembly Kit'
];
var sSKU = node.getName(); 
var sProductType = node.getValue("PRODUCTTYPE").getSimpleValue();          
var sProductStatus = node.getValue("Product_Status").getSimpleValue();
log.info("BA_SetCatalogReadyFlag: sSku: " +sSKU + " sProductStatus:" +sProductStatus + " sProductType:" +sProductType);
var bCatalogReady="N";
if( eProductStatus.contains(sProductStatus) && eProductType.contains(sProductType)){
	var sPublished = node.getValue("PUBLISHED_YN").getSimpleValue();
	var sEBSFlag = node.getValue("EBSFLAG_YN").getSimpleValue();
	var sBlockCustShip = node.getValue("BLOCKCUSTSHIP_YN").getSimpleValue();
	var sItemActive = node.getValue("ITEMACTIVE_YN").getSimpleValue();
	var sPublish = node.getValue("PUBLISH_YN").getSimpleValue();
	var sPrice = node.getValue("PRICE").getSimpleValue();
	log.info("BA_SetCatalogReadyFlag: SKU " + sSKU + " sPublished:" + sPublished + " sEBSFlag:" +sEBSFlag + " sBlockCustShip:" +sBlockCustShip + " sItemActive:" + sItemActive + " sPublish:" + sPublish + " sPrice:" +sPrice);
	if (sPublished=="Y" && sEBSFlag=="Y" && sBlockCustShip=="N" && sItemActive=="Y" && sPublish=="Y" && (sPrice && sPrice>0))
		bCatalogReady="Y"
}

//STEP-2244 Set Catalog Ready No Date to enable searching for disabled catalog ready SKUs
var cCatalogReady = node.getValue("Catalog_Ready").getSimpleValue();
log.info("BA_SetCatalogReadyFlag: bCatalogReady:" + bCatalogReady + " cCatalogReady:" +cCatalogReady);
var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
var today = isoDateFormat.format(new Date());
// If the catalog ready flag goes from Y to N, then Catalog Ready No Date attribute will be set for today.
if (cCatalogReady == "Y" && bCatalogReady == "N") {
	//log.info("Setting Catalog_Ready_No_Date going from Y to N")
	node.getValue("Catalog_Ready_No_Date").setSimpleValue(today)
	}
// If the catalog ready flag goes from N to Y, then Catalog Ready No Date attribute will be blanked out and SKU to customer product references will be added again
if (cCatalogReady == "N" && bCatalogReady == "Y") {
	//log.info("Setting Catalog_Ready_No_Date going from N to Y")
	node.getValue("Catalog_Ready_No_Date").setSimpleValue(null)
	busActionCreateUSRefs.execute(node);
	busActionCreateUKRefs.execute(node);
	busActionCreateDERefs.execute(node);
	busActionCreateEURefs.execute(node);
	busActionCreateJNRefs.execute(node);
	busActionCreateCNRefs.execute(node);
	busActionCalcCustPrices.execute(node);
	}
// Round the price to two digits, always
var price = node.getValue("PRICE").getSimpleValue();
price = Number(price).toFixed(2);
node.getValue("PRICE").setSimpleValue(price);
price = node.getValue("Future_Global_Base_Price").getSimpleValue();
if (price)
{
price = Number(price).toFixed(2);
node.getValue("Future_Global_Base_Price").setSimpleValue(price);
}
//log.info("BA_SetCatalogReadyFlag: Exiting SKU :" +sSKU);
node.getValue("Catalog_Ready").setSimpleValue(bCatalogReady);
//STEP-6326 fix catalogue updates - recalculate US prices, when catalogue ready flag is already Y
log.info("bCatalogReady: " + bCatalogReady);
if (bCatalogReady == "Y") {

    busActionCalcCustUSPrices.execute(node); //BA_Customer_Price_United_States (BA_Customer_Price_United_States)
    busActionCalcCustPrices.execute(node);
}
//STEP-6326 ends
busAction.execute(node);
}