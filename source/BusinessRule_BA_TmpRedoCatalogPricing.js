/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_TmpRedoCatalogPricing",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductionSupportBR" ],
  "name" : "BA_TmpRedoCatalogPricing",
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
    "alias" : "busActionCalcDiscCompPerc",
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
    "alias" : "busActionApproveNode",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,busActionCalcDiscCompPerc,busActionCreateUSRefs,busActionCreateUKRefs,busActionCreateEURefs,busActionCreateDERefs,busActionCreateJNRefs,busActionCreateCNRefs,busActionCalcCustPrices,busActionApproveNode) {
function SetPricetoTwoDigits(AttrID){
var price = node.getValue(AttrID).getSimpleValue();
price1 = Number(price).toFixed(2);
price2 = Number(price).toFixed(0);
if (( price != price1 ) && price ) {
	log.info(" For " + sSKU + " Value of " + AttrID + " going to be updated from " + price + " to " + price1);
	node.getValue(AttrID).setSimpleValue(price1);
}
}

var sSKU = node.getName(); 
var cCatalogReady = node.getValue("Catalog_Ready").getSimpleValue();
log.info("BA_TmpRedoCatalogPricing: cCatalogReady: " +cCatalogReady + " SKU " + sSKU);

SetPricetoTwoDigits("PRICE");
SetPricetoTwoDigits("Future_Global_Base_Price");
SetPricetoTwoDigits("EU_CLP");
SetPricetoTwoDigits("EU_Future_CLP");
SetPricetoTwoDigits("DE_CLP");
SetPricetoTwoDigits("DE_Future_CLP");
SetPricetoTwoDigits("UK_CLP");
SetPricetoTwoDigits("UK_Future_CLP");
SetPricetoTwoDigits("China_CLP");
SetPricetoTwoDigits("China_Future_CLP");
SetPricetoTwoDigits("Japan_CLP");
SetPricetoTwoDigits("Japan_Future_CLP");

if (cCatalogReady == "Y") {
	busActionCreateUSRefs.execute(node);
	busActionCreateUKRefs.execute(node);
	busActionCreateDERefs.execute(node);
	busActionCreateEURefs.execute(node);
	busActionCreateJNRefs.execute(node);
	busActionCreateCNRefs.execute(node);
	busActionCalcCustPrices.execute(node);
}
busActionCalcDiscCompPerc.execute(node);
busActionApproveNode.execute(node);
}