/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_CreateSKU",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_CreateSKU",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
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
/*
 * Function sets SKU default values from defaultEntity. The defaultEntity attributes with suffix _DFLT 
 * are matched against valid SKU attributes with the suffix _DFLT removed.
 */
function setDefault(manager, attGroup, pSku, defaultEntity) {
    if (attGroup != null) {
        log.info("Attempting to set defaults for " + pSku);
        var lstAttributes = attGroup.getAttributes();
        var iterator = lstAttributes.iterator();
        while (iterator.hasNext()) {
            var dfltAttribute = iterator.next();
            var attributeId = dfltAttribute.getID().replace("_DFLT", "");
            var attribute = manager.getAttributeHome().getAttributeByID(attributeId);
            log.info("attribute Id " + attributeId)
            if (attribute.getValidForObjectTypes().contains(pSku.getObjectType())) {
                var attID = attribute.getID();
                log.info("Default Attribute " + attID);
                var val = defaultEntity.getValue(dfltAttribute.getID()).getSimpleValue();
                log.info("Default Value " + val);
                if (val) {
                    pSku.getValue(attID).setSimpleValue(val);
                }
            }
        }
    }
}

/*
 * Function checks for existing sku based on Unique Key SKUNO.
 * Return true if SKU is found otherwise false.
 */
function isSkuExist(manager, nProduct, sItemCode, logger) {
    var pSku = manager.getNodeHome().getObjectByKey("SKUNO", nProduct + sItemCode);
    if (pSku) {
        return true;
    } else {
        return false;
    }
}

function createSKU(manager, parent, defaultEntity, nProduct, sDefaultItemCode, attGroup) {
    var pSku = parent.createProduct(null, "SKU");
    //log.info("New SKU" + pSku);
    //pSku.getValue("PRODUCTNO").setSimpleValue(nProduct);
    pSku.getValue("ItemCode").setSimpleValue(sDefaultItemCode);
    pSku.getValue("Item_SKU").setSimpleValue(nProduct + sDefaultItemCode);
    pSku.getValue("ITEM_SENT_TO_EBS").setSimpleValue("N");
    pSku.setName(nProduct + sDefaultItemCode);
    log.info(pSku);
    log.info("ITEM_SENT_TO_EBS for the SKU " + pSku.getName() + " is set to: " + pSku.getValue("ITEM_SENT_TO_EBS").getSimpleValue());

    log.info("Calling Set defaults " + pSku);
    setDefault(manager, attGroup, pSku, defaultEntity);

    //STEP-6292 Inheritance rules for conjugates
    if(parent.getValue("CONJUGATEFLAG_YN").getSimpleValue() == 'Y'){
        var msShippingConditions = parent.getValue("ShippingConditions").getSimpleValue();
        var msStorageTemp = parent.getValue("StorageTemp").getSimpleValue();
        var msShelfLife = parent.getValue("ShelfLife").getSimpleValue();
        pSku.getValue("ShippingConditions").setSimpleValue(msShippingConditions);
        pSku.getValue("StorageTemp").setSimpleValue(msStorageTemp);
        pSku.getValue("ShelfLife").setSimpleValue(msShelfLife);
    }

    var pProduct = manager.getNodeHome().getObjectByKey("PRODUCTNO", nProduct);
    pProduct.createReference(pSku, "Product_To_SKU");

    //STEP-6214 start
    var skusArr = [];
    var children = parent.getChildren().iterator();

    while (children.hasNext()) {
        var child = children.next();
	   skusArr.push(child.getValue("ItemCode").getSimpleValue());
    }
    
    parent.getValue("MasterStock_Available_SKUs").setSimpleValue(skusArr.sort().join(", "));
    //STEP-6214 end

    return pSku;
}

function setSkuReleaseDate(manager, revision, releaseDate) {
	
    function updateReleasedDate(skus) {
        for (var i = 0; i < skus.length; i++) {
            var sku = skus[i];
        
            if(revision.getValue("PUBLISHED_YN").getSimpleValue() == "Y" && sku.getValue("EBSFLAG_YN").getSimpleValue() == "Y" && sku.getValue("ITEMACTIVE_YN").getSimpleValue() == "Y" && sku.getValue("PUBLISH_YN").getSimpleValue() == "Y" && sku.getValue("BLOCKCUSTSHIP_YN").getSimpleValue() == "N" && !sku.getValue("DateReleased").getSimpleValue()) {
                sku.getValue("DateReleased").setSimpleValue(releaseDate);
            }
        }
    }

    var skus = [];
    
    if (revision.getObjectType().getID().equals("Kit_Revision")) {
        var refType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
        var refs = revision.queryReferences(refType);

        refs.forEach(function(ref) {
            skus.push(ref.getTarget());
            return true;
            });
    } else {
        var masterStock = BL_Library.getMasterStockForRevision(manager, revision);
        skus = BL_Library.getProductChildren(masterStock, "SKU");
    }

    updateReleasedDate(skus);
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setDefault = setDefault
exports.isSkuExist = isSkuExist
exports.createSKU = createSKU
exports.setSkuReleaseDate = setSkuReleaseDate