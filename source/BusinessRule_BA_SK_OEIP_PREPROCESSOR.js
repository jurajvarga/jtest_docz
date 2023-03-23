/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SK_OEIP_PREPROCESSOR",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "BA_SK_OEIP_PREPROCESSOR",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Kit_Revision", "MasterStock", "Product", "Product_Kit", "SKU", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentEventBatchBinding",
    "alias" : "currentEventBatch",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (step,currentEventBatch) {
// BA_CompleteProductPreProcessor

function nodeIsAlreadyInBatch(node) {
   result = false;
   var eventsList = currentEventBatch.getEvents();
   for (var ix=0; ix<eventsList.size(); ix++) {
      var event = eventsList.get(ix);
      if (event.getNode() != null) {
         if (event.getNode().getID().equals(node.getID())) {
            result = true;
            break;
         }
      }
   }
   return result;
}

function handleParentProduct(productOrProductKit) {
   if (!nodeIsAlreadyInBatch(productOrProductKit)) {
      //logger.info("BA_CompleteProductPreProcessor: adding "+productOrProductKit.getObjectType().getID()+": "+productOrProductKit.getID());
      currentEventBatch.addAdditionalNode(productOrProductKit);
   }
   // Special handling for kits only to get SKUs linked to the kit's revision...
   if (productOrProductKit.getObjectType().getID().equals("Product_Kit")) {
      var children = productOrProductKit.getChildren();
      for (var cx = 0; cx < children.size(); cx++) {
          var child = children.get(cx);
          if (child.getObjectType().getID().equals("Kit_Revision")) {
             var refs = child.getProductReferences().asList();
             for (var rx=0; rx<refs.size(); rx++) {
                var ref = refs.get(rx);
                if (ref.getReferenceType().getID().equals("KitRevision_to_SKU")) {
                   var sku = ref.getTarget();
                   // Find the Product or Product_Kit related to this sku...
                   var productNoValue = sku.getValue("PRODUCTNO").getSimpleValue();
                   if (productNoValue) {
                      var skuProductOrProductKit = step.getNodeHome().getObjectByKey("PRODUCTNO", productNoValue);
                      if (skuProductOrProductKit) {
                         if (!nodeIsAlreadyInBatch(skuProductOrProductKit)) {
                            logger.info("BA_CompleteProductPreProcessor: adding skuProductOrProductKit: "+skuProductOrProductKit.getID());
                            currentEventBatch.addAdditionalNode(skuProductOrProductKit);
                         }
                      }
                   }
                }
             }
          }
      }
   }
}

var eventsList = currentEventBatch.getEvents();
for (var ix = 0; ix < eventsList.size(); ix++) {
   var event = eventsList.get(ix);
   var node = event.getNode();
   if (node == null) {          // get rid of those useless global events!
      //logger.info("BA_CompleteProductPreProcessor: removing global event");
      currentEventBatch.removeEvent(event);
   } else if (node instanceof com.stibo.core.domain.Product) {
      log.info("node" +node);
      if (node.getObjectType().getID().equals("Product")) {
         // no additional action here required for Product types
      } else if (node.getObjectType().getID().equals("Product_Kit")) {
         handleParentProduct(node);
      } else {
         // Find the Product or Product_Kit related to this node...
         var productNoValue = node.getValue("PRODUCTNO").getSimpleValue();
         if (productNoValue) {
            var productOrProductKit = step.getNodeHome().getObjectByKey("PRODUCTNO", productNoValue);
            if (productOrProductKit) {
                handleParentProduct(productOrProductKit);
            }
         }
         //logger.info("BA_CompleteProductPreProcessor: removing event for: "+node.getID());
         currentEventBatch.removeEvent(event);
      }
   }
}
}