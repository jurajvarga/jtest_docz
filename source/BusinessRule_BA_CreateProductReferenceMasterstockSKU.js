/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateProductReferenceMasterstockSKU",
  "type" : "BusinessAction",
  "setupGroups" : [ "ProductPricingRules" ],
  "name" : "BA_CreateProductReferenceMasterstockSKU",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
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
exports.operation0 = function (currentObject,logger,bl_library) {
/**
script purpose: Create references from Product to MasterStock and SKU.
valid object type: Product
bindings: currentObject, logger
dependencies: BL_Library
business rule key for locating rows in main STEP log file: BA_CreateProductReferenceMasterstockSKU
**/

// variables for logging
var currentObjectID = "Current Object ID: " + currentObject.getID();
var businessRule = "BA_CreateProductReferenceMasterstockSKU";

logger.info( bl_library.logRecord( [ businessRule, currentObjectID ] ) )

// collect child objects of the current object
var children = currentObject.getChildren();
logger.info( bl_library.logRecord( [ businessRule, "Children: " + children ] ) )

var masterStocks = [];

// Master Stocks
// try to create references from Product to MasterStock, only need to work with MasterStock objects
for ( i = 0; i < children.size(); i++ ) {
    var child = children.get(i); // any child object
    if ( child.getObjectType().getID() == "MasterStock" ) {
        var masterStock = child;
        masterStocks.push( masterStock ); // collect Master Stock objects for later use
        var masterStockID = masterStock.getID();
        try {
            currentObject.createReference( masterStock, "Product_To_MasterStock" );
            logger.info( bl_library.logRecord( [ businessRule, "Created reference to", masterStockID ] ));
        } catch (e) {
            if ( e.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException ) {
                logger.info( bl_library.logRecord( [ businessRule, "Target already referenced for", masterStockID ] ));
            } else {
                logger.info( bl_library.logRecord( [ "Exception occurred", businessRule, currentObjectID, masterStockID, e ] ) );
                throw(e);
            }
        }
    }
}

// SKUs
// try to create references from Product to SKU, only need to work with SKU objects
for ( i = 0; i < masterStocks.length; i++ ) {
    var masterStock = masterStocks[i];
    var masterStockChildren = masterStock.getChildren();
    for ( x = 0; x < masterStockChildren.size(); x++ ) {
        var child = masterStockChildren.get(x);
        if ( child.getObjectType().getID() == "SKU" ) {
            var sku = child;
            var skuID = sku.getID();
            try {
                currentObject.createReference( sku, "Product_To_SKU" );
                logger.info( bl_library.logRecord( [ businessRule, "Created reference to", skuID ] ));
            } catch (e) {
                if ( e.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException ) {
                    logger.info( bl_library.logRecord( [ businessRule, "Target already referenced for", skuID ] ));
                } else {
                    logger.info( bl_library.logRecord( [ "Exception occurred", businessRule, currentObjectID, skuID, e ] ) );
                    throw(e);
                }
            }
        }
    }
}
}