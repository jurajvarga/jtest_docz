/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ProcessProductsToCopy",
  "type" : "BusinessAction",
  "setupGroups" : [ "Inbound_Business_Rules" ],
  "name" : "BA_ProcessProductsToCopy",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyProduct",
    "libraryAlias" : "BL_CopyProduct"
  }, {
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "copyProductMsgQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=ProductsToCopyOIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "stepInitiatedProductEvent",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "STEPInitiatedProductEvent",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (manager,node,BA_Approve,copyProductMsgQueue,stepInitiatedProductEvent,BL_AuditUtil,BL_CopyProduct,BL_Library,BL_MaintenanceWorkflows,BL_TechTransfer) {
// csv file row values
var productno = node.getValue("PRODUCTNO").getValue();
//var productno = node.getValue("PRODUCTNO").getSimpleValue(); //for testing
var itemcode = node.getValue("COPY_MS_CODE").getValue();
if (!itemcode || itemcode == "") {
    itemcode = "MF";
}
var copytype = node.getValue("COPYTYPE").getValue();
if (!copytype || copytype == "") {
    copytype = "CarrierFree"
}

// log
log.info("BA_ProcessProductsToCopy *** Starting evaluating a product to copy for product no " + productno + ". ms: " + itemcode + ", copytype: " + copytype);

// allowed object types
var allowedObjectTypes = ["Product", "Product_Kit", "Equipment"];
var allowedCopyTypes = ["CarrierFree"]

var bCopyTypeAllowed = allowedCopyTypes.indexOf(String(copytype)) > -1;

//STEP-6193
var storedAttributes = ["COPY_MS_CODE", "COPYTYPE"]
var rejectedString = "Ms code: " + itemcode + "; Copy type: " + copytype + "; Rejected reason: ";

if (productno && bCopyTypeAllowed) {
    var product = manager.getNodeHome().getObjectByKey("PRODUCTNO", productno);

    // only existing products 
    if (product) {
        // only products which are one of allowed object types 
        if (allowedObjectTypes.indexOf(String(product.getObjectType().getID())) > -1) {
            // allow masterstocks only if valid for the product PRODUCTTYPE
            if (BL_CopyProduct.isItemValidForProduct(itemcode, product, manager)) {

                //STEP-6636 Starts
                var bSendingToCopyProcess = true;

                var p2pp = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Parent_Product");
                var p2pps = product.queryReferencedBy(p2pp);

                p2pps.forEach(function (prod) {
                    var child = prod.getSource();
                    // check if the product has already a child product in Product-Planned state or Commercialization state with empty ORIGIN_PRODNO_REVNO attribute
                    if (child.getValue("Product_Status").getSimpleValue() == "Product-Planned") {
                        bSendingToCopyProcess = false;
                        product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product already has a Child product in Product-Planned state.");
                        return false;
                    }
                    else if (child.getValue("Product_Status").getSimpleValue() == "Commercialization" && (child.getValue("ORIGIN_PRODNO_REVNO").getSimpleValue() == "" || child.getValue("ORIGIN_PRODNO_REVNO").getSimpleValue() == null)) {
                        bSendingToCopyProcess = false;
                        product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product already has a Child product in Commercialization state.");
                        return false;
                    }

                    return true;
                });

                if (bSendingToCopyProcess) {
                    var prodCopies = BL_CopyProduct.getProductCopies(product, manager);

                    for (var i = 0; i < prodCopies.length; i++) {
                        var prodCopy = prodCopies[i];

                        if (!BL_MaintenanceWorkflows.getCurrentRevision(prodCopy)) {
                            log.info("The product " + productno + " has a copy " + prodCopy.getValue("PRODUCTNO").getSimpleValue() + " currently in the NPI process.");
                            product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product has a copy currently in the NPI process.");
                            bSendingToCopyProcess = false;
                            break;
                        } else if (prodCopy.getValue("Product_Status").getSimpleValue() == "Product-Planned") {
                            log.info("The product " + productno + " has a copy " + prodCopy.getValue("PRODUCTNO").getSimpleValue() + "with a product status Product-Planned.");
                            product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product has a copy with a product status Product-Planned.");
                            bSendingToCopyProcess = false;
                            break;
                        } else {
                            bSendingToCopyProcess = true;
                        }
                    }
                }
                //STEP-6636 Ends

                if (bSendingToCopyProcess) {
                    log.info("Sending product " + productno + " to queue.");
                    product.getValue("COPY_MS_CODE").setSimpleValue(itemcode);
                    product.getValue("COPYTYPE").setSimpleValue(copytype);
                    var acceptedAttr = product.getValue("AcceptedCopyAttributes").getSimpleValue();
                    if (acceptedAttr == null) {
                        product.getValue("AcceptedCopyAttributes").setSimpleValue(BL_CopyProduct.getAcceptedValue(storedAttributes, product));
                    }
                    else {
                        product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product already has Accepted Attribute Values.");
                    }

                    // Sending product to queue
                    copyProductMsgQueue.queueDerivedEvent(stepInitiatedProductEvent, product);

                    // Approve if product not in progress
                    if (!BL_MaintenanceWorkflows.getWIPRevision(product)) {
                        BA_Approve.execute(product);
                    }
                }
            }
            else {
                product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Itemcode " + itemcode + " is not valid for a product type " + product.getValue("PRODUCTTYPE").getSimpleValue());
            }
        }
        else {
            product.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Product is a Service.");
        }
    }
    else {
        log.info("Product " + productno + " does not exist in STEP.");
    }
}
else {
    log.info("Record has productno value in csv: " + (productno && productno != "") + ", copy type allowed: " + bCopyTypeAllowed);
    node.getValue("Rejected_Copy_Attributes").addValue(rejectedString + "Copy type allowed: CarrierFree");
}
//STEP-6193 ENDS
}