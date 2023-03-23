/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "product_refer_masterstock_sku",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "product_refer_masterstock_sku",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Product" ],
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
    "alias" : "currentObject",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentObject,logger) {
/**
script purpose: Create references from Product to MasterStock and SKU.
valid object type: Product
bindings: currentObject, logger
business rule key for locating rows in main STEP log file: product_refer_masterstock_sku
**/

function logRecord( messageArray ) {
    return messageArray.join(" ");
}

// variables for logging
currentObjectID = "Current Object ID: " + currentObject.getID();
businessRule = "Business Rule: product_refer_masterstock_sku";

logger.info( logRecord( [ "Running JavaScript for:", currentObjectID, businessRule ] ) )

// all children of Product
var children = currentObject.getChildren();  // returns java.util.List
var masterStocks = [];

/**
potential exceptions handled via filtering of eligible objects:
com.stibo.core.domain.LinkTypeTargetNotValidException
com.stibo.core.domain.reference.TargetAlreadyReferencedException
**/

// Master Stocks
// loop through all child objects of current object (Product), only need to work with Master Stocks
for ( i = 0; i < children.size(); i++ ) {
    var child = children.get(i);
    var childID = "Child Object ID: " + child.getID();
    var objectType= child.getObjectType().getID();
    if ( objectType == 'MasterStock' ) {
        var masterStock = child;
        masterStocks.push( masterStock ); // collect Master Stock objects for later use
        var masterStockID = "Master Stock ID: " + masterStock.getID();
        var masterStockRefBy = masterStock.getReferencedBy().toArray();  // returns a java.util.set, converting to an array
        var masterStockRefTypes = [];
        for ( var ref = 0; ref < masterStockRefBy.length; ref++ ) {
            masterStockRefTypes.push( masterStockRefBy[ref].getReferenceType() );  // collect reference types
        }
        if ( masterStockRefTypes.toString().search( "Product_To_MasterStock" ) >= 0 ) {
            logger.info( logRecord( [ "Product_To_MasterStock reference already exists for objects:", currentObjectID, masterStockID, businessRule ] ) );
        } else if ( masterStockRefTypes.toString().search( "Product_To_MasterStock" ) == -1  ) { // no matching reference found, okay to add
            try {
                currentObject.createReference( masterStock, "Product_To_MasterStock" );
                logger.info( logRecord( ["Created Product_To_MasterStock reference for objects:", currentObjectID, masterStockID, businessRule ] ) );
            }
            catch (e) {
                logger.info( logRecord( ["Exception occurred:", businessRule, currentObjectID, masterStockID, e ] ) );
                throw(e); // All exceptions MUST be re-thrown
            }
        } else {
            logger.info( logRecord( [ "Nothing to do!", currentObjectID, masterStockID, businessRule ] ) )
        }
        masterStockRefTypes = [];  // empty the array
    } else {
        logger.info( logRecord( [ "Child object is not a Master Stock for:", currentObjectID, childID, businessRule ] ) )
    }
}
logger.info( logRecord( [ "No more Master Stocks found:", currentObjectID, businessRule ] ) )

// SKUs
// loop through all child objects of each Master Stock, only need to work with SKUs
for ( i = 0; i < masterStocks.length; i++ ) {
    var masterStock = masterStocks[i];
    var masterStockID = "Master Stock ID: " + masterStock.getID();
    var masterStockChildren = masterStock.getChildren();
    for ( x = 0; x < masterStockChildren.size(); x++ ) {
        var child = masterStockChildren.get(x);
        var objectType= child.getObjectType().getID();
        if ( objectType == 'SKU' ) {
            var sku = child;
            var skuID = "SKU ID: " + sku.getID();
            var skuRefBy = sku.getReferencedBy().toArray();  // returns a java.util.set, converting to an array
            var skuRefTypes = [];
            for ( var ref = 0; ref < skuRefBy.length; ref++ ) {
                skuRefTypes.push( skuRefBy[ref].getReferenceType() );  // collect reference types
            }
            if ( skuRefTypes.toString().search( "Product_To_SKU" ) >= 0 ) {
                logger.info( logRecord( [ "Product_To_SKU reference already exists for objects:", currentObjectID, skuID, businessRule ] ) );
            } else if ( skuRefTypes.toString().search( "Product_To_SKU" ) == -1  ) { // no matching reference found, okay to add
                try {
                    currentObject.createReference( sku, "Product_To_SKU" );
                    logger.info( logRecord( ["Created Product_To_SKU reference for objects:", currentObjectID, skuID, businessRule ] ) );
                }
                catch (e) {
                    logger.info( logRecord( ["Exception occurred:", businessRule, currentObjectID, skuID, e ] ) );
                    throw(e); // All exceptions MUST be re-thrown
                }
            } else {
                logger.info( logRecord( [ "Nothing to do!", currentObjectID, skuID, businessRule ] ) )
            }
            skuRefTypes = [];  // empty the array
        } else {
            logger.info( logRecord( [ "Child object is not a SKU for:", masterStockID, businessRule ] ) )
        }
    }
    logger.info( logRecord( [ "No more SKUs found:", masterStockID, businessRule ] ) )
}
}