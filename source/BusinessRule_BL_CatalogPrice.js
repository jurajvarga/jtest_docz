/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_CatalogPrice",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_CatalogPrice",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
function calculateSKUPrice(manager, logger, classHomeID, catalogProduct, node) {

	
	logger.info('In Function calculateSKUPrice classHomeID '+classHomeID+ ' catalogProductU: ' + catalogProduct + ' SKU: ' + node.getName());
	
	var customerCatalog = catalogProduct.getParent();
	var location = getLocation(classHomeID);
	//logger.info('In Function calculateSKUPrice location '+location);
	
	var attribute = manager.getAttributeHome().getAttributeByID(customerCatalog.getID() + "_DiscountPrice");

	//logger.info(customerCatalog.getName() + ' SKU: ' + node.getName());

	if (attribute && attribute.getValidForObjectTypes().contains(node.getObjectType())) {
		var currentDiscount = customerCatalog.getValue("Pricing Summary").getSimpleValue();
		var currentPrice;
		
		if (location == 'US') {
			currentPrice = node.getValue("PRICE").getSimpleValue();
		}
		else if (location == 'Region') {
			var currentPriceSourceAttr = customerCatalog.getValue("CLP_Discount_From_Price").getSimpleValue();

			if (currentPriceSourceAttr) {
				currentPrice = node.getValue(currentPriceSourceAttr).getSimpleValue();
			}
		}

		var discountPrice = null;
		
		if (currentPrice) {
			discountPrice = Lib.roundTo(currentPrice, 2);

			if (currentDiscount) {
				discountPrice = Lib.roundTo((1 - currentDiscount / 100) * currentPrice, 2);
			}		
		}

		node.getValue(customerCatalog.getID() + "_DiscountPrice").setSimpleValue(discountPrice);
		logger.info('currentDiscount: ' + currentDiscount + ' currentPrice: ' + currentPrice + ' discountPrice:' + discountPrice);
	}
	
	attribute = manager.getAttributeHome().getAttributeByID(customerCatalog.getID() + "_FutureDiscountPrice");
	
	if (attribute && attribute.getValidForObjectTypes().contains(node.getObjectType())) {
		var futureDiscount = customerCatalog.getValue("CustomerFuturePrice").getSimpleValue();
		var futurePrice;
		
		if (location == 'US') {
			futurePrice = node.getValue("Future_Global_Base_Price").getSimpleValue();
		}
		else if (location == 'Region') {
			var futurePriceSourceAttr = customerCatalog.getValue("CLP_Future_Discount_From_Price").getSimpleValue();

			if (futurePriceSourceAttr) {
				futurePrice = node.getValue(futurePriceSourceAttr).getSimpleValue();
			}
		}

		var futureDiscountPrice = null;

		if (futurePrice) {
			futureDiscountPrice = Lib.roundTo(futurePrice, 2);
	
			if (futureDiscount) {
				futureDiscountPrice = Lib.roundTo((1 - futureDiscount / 100) * futurePrice, 2);				
			}
		}

		node.getValue(customerCatalog.getID() + "_FutureDiscountPrice").setSimpleValue(futureDiscountPrice);
		logger.info('futureDiscount: ' + futureDiscount + ' futurePrice: ' + futurePrice + ' futureDiscountPrice:' + futureDiscountPrice);
	}
}


function getLocation(classHomeID) {
	var china = "CR338406";
	var europe = "CR338407";
	var germany = "DE_Catalogs";
	var japan = "CR338405";
	var uk = "UK000001";
	var us = "CR338408";
	var retVal;
	//logger.info('In Function getLocation '+classHomeID);
	if (us == ""+classHomeID){
		retVal = "US";		
	}else {
		retVal = "Region";		
	}
	/*switch(classHomeID) {
		case "CR338408":
			retVal = "US";
			break;
		case china:
		case europe:
		case germany:
		case japan:
		case uk:
			retVal = "Region";
			break;
		default:
			throw classHomeID + ' not found';
	}*/

	//logger.info('In Function getLocation retVal '+retVal);

	return retVal;
}


function getCatalogRegionID(logger, obj) {
	var retVal;
	
	if (obj.getObjectType().getID() == "CatalogRegion") {
		retVal = obj.getID();
    }
    else if (obj.getObjectType().getID() == "CatalogCustomer") {
        if (obj.getParent().getObjectType().getID() == "CatalogDistributorHub") {
            retVal = obj.getParent().getParent().getID();
        }
        else {
            retVal = obj.getParent().getID();
        }
    }
    else if (obj.getObjectType().getID() == "CatalogProducts") {
        if (obj.getParent().getParent().getObjectType().getID() == "CatalogCustomer" || obj.getParent().getParent().getObjectType().getID() == "CatalogDistributorHub") {
            retVal = obj.getParent().getParent().getParent().getID();
        }
        else {
            retVal = obj.getParent().getParent().getID();
        }
    }
	
	return retVal;
}


function loopToCatalogFolderSKU(manager, logger, classHomeID, classHome, node) {
    var children = classHome.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        var childObjectTypeID = child.getObjectType().getID();

        if (childObjectTypeID == "CatalogProducts") {
            calculateSKUPrice(manager, logger, classHomeID, child, node);
        } else if (childObjectTypeID == "CatalogCustomer" || childObjectTypeID == "CatalogDistributorHub") {
            loopToCatalogFolderSKU(manager, logger, classHomeID, child, node);
        }
    }
}


function calculateRegionalDiscount(step, logger, node, catalogProductsFolder, calcFromProduct) {
    var catalogCustomer = catalogProductsFolder.getParent();
    //logger.info(catalogCustomer.getName() + " recalculating SKU: " + node.getName());

    // current discount price
    var attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_DiscountPrice");

    if (attribute) {
        if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
            var priceSourceCurrent = catalogCustomer.getValue("CLP_Discount_From_Price").getSimpleValue();
            var sPrice;

            if (priceSourceCurrent) {
                try {
                    sPrice = node.getValue(priceSourceCurrent).getSimpleValue();
                }
                catch (e) {
                    logger.info('--< current price attribute ' + priceSourceCurrent + ' not found for : ' + catalogCustomer.getID() + " : " + catalogCustomer.getName());
                }
            }
            else {
                logger.info("--< current price attribute blank for : " + catalogCustomer.getID() + " : " + catalogCustomer.getName());

                if (calcFromProduct == 1) {
                    sPrice = node.getValue("PRICE").getSimpleValue();
                }
            }

            if (sPrice) {
                var sPricingSummary = catalogCustomer.getValue("Pricing Summary").getSimpleValue();
                var sDiscountPrice = Lib.roundTo(sPrice, 2);

                if (sPricingSummary) {
                    sDiscountPrice = Lib.roundTo((((100 - sPricingSummary) / 100) * sPrice), 2);
                }

                node.getValue(catalogCustomer.getID() + "_DiscountPrice").setSimpleValue(sDiscountPrice);
            } else {
                node.getValue(catalogCustomer.getID() + "_DiscountPrice").setSimpleValue(null);
            }
        }
    }

    //logger.info("current price: " + sPrice + " current discount: " + sPricingSummary + " " + catalogCustomer.getID() + "_DiscountPrice = " + sDiscountPrice);

    // future discount price
    attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_FutureDiscountPrice");

    if (attribute) {
        if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
            var priceSourceFuture = catalogCustomer.getValue("CLP_Future_Discount_From_Price").getSimpleValue();
            var sFuturePrice;

            if (priceSourceFuture) {
                try {
                    sFuturePrice = node.getValue(priceSourceFuture).getSimpleValue();
                }
                catch (e) {
                    logger.info('--< Future price attribute ' + priceSourceFuture + ' not found for : ' + catalogCustomer.getID() + " : " + catalogCustomer.getName());
                }
            }
            else {
                logger.info("--< Future price attribute not found for : " + catalogCustomer.getID() + " Name: " + catalogCustomer.getName());

                if (calcFromProduct == 1) {
                    sPrice = node.getValue("Future_Global_Base_Price").getSimpleValue();
                }
            }

            if (sFuturePrice) {
                var sFuturePricingSummary = catalogCustomer.getValue("CustomerFuturePrice").getSimpleValue();
                var sFutureDiscountPrice = Lib.roundTo(sFuturePrice, 2);

                if (sFuturePricingSummary) {
                    sFutureDiscountPrice = Lib.roundTo((((100 - sFuturePricingSummary) / 100) * sFuturePrice), 2);
                }

                node.getValue(catalogCustomer.getID() + "_FutureDiscountPrice").setSimpleValue(sFutureDiscountPrice);
            } else {
                node.getValue(catalogCustomer.getID() + "_FutureDiscountPrice").setSimpleValue(null);
            }
        }
    }

    //logger.info("future price: " + sFuturePrice + " future discount: " + sFuturePricingSummary + " " + catalogCustomer.getID() + "_FutureDiscountPrice = " + sFutureDiscountPrice);
}


function calculateUSDiscount(step, logger, node, catalogProductsFolder) {
    var catalogCustomer = catalogProductsFolder.getParent();
    //logger.info(catalogCustomer.getName() + " recalculating SKU: " + node.getName());

    // current discount price
    var attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_DiscountPrice");

    if (attribute) {
        if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
            var sPrice = node.getValue("PRICE").getSimpleValue();

            if (sPrice) {
                var sDiscountPrice = Lib.roundTo(sPrice, 2);
                var sPricingSummary = catalogCustomer.getValue("Pricing Summary").getSimpleValue();

                if (sPricingSummary) {
                    sDiscountPrice = Lib.roundTo((((100 - sPricingSummary) / 100) * sPrice), 2);
                }

                node.getValue(catalogCustomer.getID() + "_DiscountPrice").setSimpleValue(sDiscountPrice);
            } else {
                node.getValue(catalogCustomer.getID() + "_DiscountPrice").setSimpleValue(null);
            }
        }
    }
    //logger.info("current price: " + sPrice + " current discount: " + sPricingSummary + " " + catalogCustomer.getID() + "_DiscountPrice = " + sDiscountPrice);

    // future discount price
    attribute = step.getAttributeHome().getAttributeByID(catalogCustomer.getID() + "_FutureDiscountPrice");

    if (attribute) {
        if (attribute.getValidForObjectTypes().contains(node.getObjectType())) {
            var sFuturePrice = node.getValue("Future_Global_Base_Price").getSimpleValue();

            if (sFuturePrice) {
                var sFutureDiscountPrice = Lib.roundTo(sFuturePrice, 2);
                var sFuturePricingSummary = catalogCustomer.getValue("CustomerFuturePrice").getSimpleValue();

                if (sFuturePricingSummary) {
                    sFutureDiscountPrice = Lib.roundTo((((100 - sFuturePricingSummary) / 100) * sFuturePrice), 2);
                }

                node.getValue(catalogCustomer.getID() + "_FutureDiscountPrice").setSimpleValue(sFutureDiscountPrice);
            } else {
                node.getValue(catalogCustomer.getID() + "_FutureDiscountPrice").setSimpleValue(null);
            }
        }
    }
    //logger.info("future price: " + sFuturePrice + " future discount: " + sFuturePricingSummary + " " + catalogCustomer.getID() + "_FutureDiscountPrice = " + sFutureDiscountPrice);
}


function loopToCatalogFolderSKU_Region(manager, logger, node, classHome, calcFromProduct) {
    var children = classHome.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        var childObjectTypeID = child.getObjectType().getID();

        if (childObjectTypeID == "CatalogProducts") {
            calculateRegionalDiscount(manager, logger, node, child, calcFromProduct);
        } else if (childObjectTypeID == "CatalogCustomer" || childObjectTypeID == "CatalogDistributorHub") {
            loopToCatalogFolderSKU_Region(manager, logger, node, child);
        }
    }
}


function loopToCatalogFolderSKU_US(manager, logger, node, classHome) {
    var children = classHome.getChildren();

    for (var i = 0; i < children.size(); i++) {
        var child = children.get(i);
        var childObjectTypeID = child.getObjectType().getID();

        if (childObjectTypeID == "CatalogProducts") {
            calculateUSDiscount(manager, logger, node, child);
        } else if (childObjectTypeID == "CatalogCustomer" || childObjectTypeID == "CatalogDistributorHub") {
            loopToCatalogFolderSKU_US(manager, logger, node, child);
        }
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.calculateSKUPrice = calculateSKUPrice
exports.getLocation = getLocation
exports.getCatalogRegionID = getCatalogRegionID
exports.loopToCatalogFolderSKU = loopToCatalogFolderSKU
exports.calculateRegionalDiscount = calculateRegionalDiscount
exports.calculateUSDiscount = calculateUSDiscount
exports.loopToCatalogFolderSKU_Region = loopToCatalogFolderSKU_Region
exports.loopToCatalogFolderSKU_US = loopToCatalogFolderSKU_US