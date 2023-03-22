/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_CopyProduct",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_CopyProduct",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
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
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
//STEP-6176
function duplicateProduct(step,sourceProduct,newProduct){
var noCopyAttGroup = step.getAttributeGroupHome().getAttributeGroupByID("Product_NotCopy_Attributes");
var noCopyAttrArray = [];
var lstNoAttributes = noCopyAttGroup.getAttributes();
var groupIterator = lstNoAttributes.iterator();
while (groupIterator.hasNext()) {
  var attr = groupIterator.next();
      noCopyAttrArray.push(attr.getID());
}
          
//Copy attributes for the group "Product_Attributes"
BL_Library.copyAttributes(step, sourceProduct, newProduct, "Product_Attributes", noCopyAttrArray); 

//Update the Name in case of CarrierFree copy type
if (newProduct.getValue("COPYTYPE").getSimpleValue() == "CarrierFree"){
	var parentProdName = BL_TechTransfer.removeStringFormulated(sourceProduct.getName()) + " (BSA and Azide Free)"; // STEP-6408
	newProduct.setName(parentProdName); // STEP-6408
	newProduct.getValue("PRODUCTNAME").setSimpleValue(parentProdName); // STEP-6408
	newProduct.getValue("PRODUCTSHORTNAME").setSimpleValue(BL_TechTransfer.removeStringFormulated(sourceProduct.getValue("PRODUCTSHORTNAME").getSimpleValue()) + " (BSA and Azide Free)");
	//var brShortNameCreation = step.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID(brShortNameCreationID);
	//brShortNameCreation.execute(newProduct); // STEP-6408
}

//Update Product Status and History
newProduct.getValue("Product_Status").setSimpleValue("Product-Planned");

//Create reference "Product_To_Parent_Product" if not esists
if (sourceProduct == null){
	log.info("No Parent Product");
}
else	{
	var refTarget = BL_Library.getReferenceTarget(newProduct, "Product_To_Parent_Product");
	if(refTarget){
	   if(!refTarget.equals(sourceProduct)){
     		newProduct.createReference(sourceProduct, "Product_To_Parent_Product");
	   }
	} else {
	newProduct.createReference(sourceProduct, "Product_To_Parent_Product");
	}
}	

//delete  bibliography if exists
var children = newProduct.getChildren();
if (children) {
    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        if (child.getObjectType().getID() == "Product_Bibliography_Folder") {
            BL_Library.deleteRecursively(child);
            child.delete();
        }
    }
}
//copy bibliogrphy
copyBiblioCitations(step, sourceProduct, newProduct );
}



//Create new Product_Bibliography_Folder and it's name under Product, and Product_Bibliography_Citations under Bibliography folder 
//from the source Product to the target Product
function copyBiblioCitations(step, pSourceProduct, pTargetProduct) {

	var children = pSourceProduct.getChildren();
	if (children) {
        for (var i = 0; i < children.size(); i++) {
            var child = children.get(i);

            if (child.getObjectType().getID() == "Product_Bibliography_Folder") {
			var newBibFolder = pTargetProduct.createProduct(null, "Product_Bibliography_Folder");
			var pTargetProductNo = pTargetProduct.getValue("PRODUCTNO").getSimpleValue();
			newBibFolder.setName(pTargetProductNo + "_Bibliography");
               
               var sourceCitations =  child.getChildren();   
               if (sourceCitations) {
                 for (var j = 0; j < sourceCitations.size(); j++) {
                    var sourceCitation = sourceCitations.get(j);
                 
                        if (sourceCitation.getObjectType().getID() == "Product_Bibliography_Citation") {
	                        var newBibCit = newBibFolder.createProduct(null, "Product_Bibliography_Citation");
	                        newBibCit.setName(sourceCitation.getName()); 
	                        BL_Library.copyAttributes(step, sourceCitation, newBibCit, "PRODUCT_BIBLIOGRAPHY", null);
                        }
                    }
                }

            }
        }
    }
}

// STEP-6254 Code refactor: OIEP BRs, new BL
/**
 * To identify if itemcode is valid for a product
 * @param {String} itemcode String, item code (BC, MC, MF, S, ...) 
 * @param {Product} product STEP product object (Product, Product Kit, Equipment, Service)
 * @returns {Boolean} true, if there is a default for product PRODUCTTYPE including provided itemcode; false otherwise
 */
function isItemValidForProduct(itemcode, product, manager) {

    log.info(" masteritemcode : " + itemcode);
    var productType = product.getValue("PRODUCTTYPE").getSimpleValue();
    log.info("productType: " + productType);

    var conditions = com.stibo.query.condition.Conditions;
    var isSKUDefault = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("SKUDefault"));
    var hasProductType = conditions.valueOf(manager.getAttributeHome().getAttributeByID("PRODUCTTYPE_DFLT")).eq(productType);
    //var hasItemStockFormat = conditionsRevision.valueOf(manager.getAttributeHome().getAttributeByID("ITEMSTOCKFORMAT_DFLT")).eq("MASTER");
    var hasItemCode = conditions.valueOf(manager.getAttributeHome().getAttributeByID("ItemCode_DFLT")).eq(itemcode);

    var queryHomeRevision = manager.getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHomeRevision.queryFor(com.stibo.core.domain.entity.Entity).where(isSKUDefault.and(hasProductType).and(hasItemCode));

    var resultEntity = querySpecification.execute();
    var resultArrEntity = resultEntity.asList(100).toArray();

    log.info("Matched Item Codes: " + resultArrEntity.length);

    for (var i = 0; i < resultArrEntity.length; i++) {
        var eItemDefault = resultArrEntity[i];

        var sProductTypeDefault = eItemDefault.getValue("PRODUCTTYPE_DFLT").getSimpleValue();
        var sDefaultItemCode = eItemDefault.getValue("ItemCode_DFLT").getSimpleValue();
        var sDefaultItemStockFormat = eItemDefault.getValue("ITEMSTOCKFORMAT_DFLT").getSimpleValue();
        log.info("item default name: " + eItemDefault.getName() + ", sProductTypeDefault: " + sProductTypeDefault + ", sDefaultItemCode : " + sDefaultItemCode + ", sDefaultItemStockFormat : " + sDefaultItemStockFormat);
    }

    if (resultArrEntity.length > 0) {
        return true;
    }

    return false;
}


/**
 * To retrieve list of products for which ORIGIN_PRODNO_REVNO include PRODUCTNO of the product argument object
 * @param {Product} product STEP object product
 * @param {Manager} manager STEP manager
 * @returns {Product[]} list of products for which ORIGIN_PRODNO_REVNO include PRODUCTNO of the product argument object
 */
function getProductCopies(product, manager) {

    var productno = product.getValue("PRODUCTNO").getSimpleValue();

    var conditions = com.stibo.query.condition.Conditions;
    var isProduct = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product"));
    var isProductKit = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Kit"));
    var isEquipment = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment"));
    var hasOriginProduct = conditions.valueOf(manager.getAttributeHome().getAttributeByID("ORIGIN_PRODNO_REVNO")).like(productno + "*");

    var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(((isProduct).or(isProductKit).or(isEquipment)).and(hasOriginProduct));

    var result = querySpecification.execute();
    var resultArr = result.asList(100).toArray();

    for (var i = 0; i < resultArr.length; i++) {
        var copyProduct = resultArr[i];
        log.info("Found copy of " + product.getValue("PRODUCTNO").getSimpleValue() + ": " + copyProduct.getValue("PRODUCTNO").getSimpleValue());
    }

    return resultArr;
}

//STEP-6193
function getAcceptedValue(storedAttributes, product){
	var result = "";	

	for (var j = 0; j < storedAttributes.length; j++) {
        var attrID = storedAttributes[j];
        var attrVal = product.getValue(attrID).getSimpleValue();
        result += attrID + "=" + attrVal;
        
        if (j != storedAttributes.length - 1) {
			result += ";";
         }        
	}
	return result;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.duplicateProduct = duplicateProduct
exports.copyBiblioCitations = copyBiblioCitations
exports.isItemValidForProduct = isItemValidForProduct
exports.getProductCopies = getProductCopies
exports.getAcceptedValue = getAcceptedValue