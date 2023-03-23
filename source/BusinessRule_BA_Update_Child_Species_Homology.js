/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Update_Child_Species_Homology",
  "type" : "BusinessAction",
  "setupGroups" : [ "Product_Release" ],
  "name" : "BA Update Child Species Homology",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  } ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_MigrateCatalogAttributesFinal",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_MigrateCatalogAttributesFinal",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "productQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=OB_PRODUCT_JSON_TEST",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webDataRepublished",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebDataRepublished",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Send_To_Preview",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Send_To_Preview",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,BA_MigrateCatalogAttributesFinal,productQueue,webDataRepublished,BA_Approve,BA_Send_To_Preview,BL_MaintenanceWorkflows) {
var product = node.getParent();

// Get Product Homology in the parent product being released (product)
var refTypeHomology = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Species");

//STEP-6396
var refLinks = product.queryReferences(refTypeHomology);
var specHomList = [];
var parentSpecHomListNames = [];

refLinks.forEach(function(refLink) {
    var speciesHomology = refLink.getTarget();
    specHomList.push(speciesHomology);
    parentSpecHomListNames.push(speciesHomology.getName());

    return true;
});
//STEP-6396

log.info("Parent Product Species Homology: " + parentSpecHomListNames);


// Get Parent Species from Western Blotting in the parent product revision being released (node)
var refTypeAppProt = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
var linksAppProt = node.getClassificationProductLinks(refTypeAppProt);
//log.info(" links.size() "+links.size());
var testedSpeciesParentArr;
for (var i = 0; i < linksAppProt.size(); i++) {
    var refApp = linksAppProt.get(i);
    var cApplication = refApp.getClassification();
    // log.info(" links.cApplication() "+cApplication);
    var sApplication = cApplication.getValue("APPLICATIONABBR").getSimpleValue();
    if (!sApplication) {
        sApplication = cApplication.getValue("PROTOCOLAPPLICATIONABBR").getSimpleValue();
    }
    //log.info("sApplication: " + sApplication);
    if (sApplication == "W") {
        var testedSpeciesParent = refApp.getValue("Appl_Species_Tested").getSimpleValue();
        //log.info("testedSpeciesParent: " + testedSpeciesParent);
        if (testedSpeciesParent != null) {
        	if (testedSpeciesParent.indexOf("multisep")>-1){
        		testedSpeciesParentArr = testedSpeciesParent.split("<multisep/>");
        		}
        	else{
        		testedSpeciesParentArr = testedSpeciesParent.split(";");
        		}
            
        }
    }
}

var refTypeParentProd = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Parent_Product");
var refsParentProds = product.queryReferencedBy(refTypeParentProd);

//STEP-6396
refsParentProds.forEach(function(refParentProd) {
    var childProd = refParentProd.getSource();
    //log.info("Child Product: " + childProd.getValue("PRODUCTNO").getSimpleValue());

    var conjugateFlag = childProd.getValue("CONJUGATEFLAG_YN").getSimpleValue();
    //log.info("CONJUGATEFLAG_YN: " + conjugateFlag);

    if (conjugateFlag == "Y") {
        // Update Product Homology
        //for testing
        var childOldHomList = [];
        var refChildHomologyLinks = childProd.queryReferences(refTypeHomology);
        refChildHomologyLinks.forEach(function(refChildHomologyLink) {
            childOldHomList += refChildHomologyLink.getTarget().getName() + ",";

            return true;
        });
        //log.info("old child homology: " + childOldHomList);

        // delete old child homology
        refChildHomologyLinks = childProd.queryReferences(refTypeHomology);
        refChildHomologyLinks.forEach(function(refChildHomologyLink) {
            refChildHomologyLink.delete();

            return true;
        });

        // add from parent homology
        for (var i = 0; i < specHomList.length; i++) {
            childProd.createReference(specHomList[i], "Product_To_Species");
        }

        //for testing
        var childNewHomList = [];
        refChildHomologyLinks = childProd.queryReferences(refTypeHomology);
        refChildHomologyLinks.forEach(function(refChildHomologyLink) {
            childNewHomList += refChildHomologyLink.getTarget().getName() + ",";

            return true;
        });
        //log.info("new child homology: " + childNewHomList);

        // Update Species
        var children = childProd.getChildren().iterator();
        while (children.hasNext()) {
            var child = children.next();
            var childType = child.getObjectType().getID();
            //log.info("  ##  object type: " + childType);

            if (childType == "Product_Revision") {
                var isCurrent = false;
                if (BL_MaintenanceWorkflows.getCurrentRevision(childProd)) {
                    isCurrent = BL_MaintenanceWorkflows.getCurrentRevision(childProd).getName() == child.getName();
                }

                var isWIP = false;
                if (BL_MaintenanceWorkflows.getWIPRevision(childProd)) {
                    isWIP = BL_MaintenanceWorkflows.getWIPRevision(childProd).getName() == child.getName();
                }

                var isInRevRelease = child.isInState("Revision_Release_Workflow", "Revision_Release_Workflow");

                // Check for current, wip or in Revision Release WF revisions
                log.info("  ##  " + child.getName() + " isCurrent: " + isCurrent + ", isWIP: " + isWIP + ", isInRevRelease: " + isInRevRelease);
                if (testedSpeciesParentArr && (isCurrent || isWIP || isInRevRelease)) {
                    var refTypeSpecies = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Revision_To_Species");

                    // Remove old species
                    var refChildSpeciesLinks = child.queryReferences(refTypeSpecies);
                    refChildSpeciesLinks.forEach(function(refChildSpeciesLink) {
                        refChildSpeciesLink.delete();

                        return true;
                    });

                    // Add new species
                    for (var i = 0; i < testedSpeciesParentArr.length; i++) {
                        var speciesCode = testedSpeciesParentArr[i];
                        //log.info("species code: " + speciesCode);
                        var species = manager.getNodeHome().getObjectByKey("SPECIESNO", speciesCode);
                        //log.info(" species " + species.getName());
                        if (species == null)
                            throw ("Unable to locate existing Species object. [" + speciesCode + "]" + " revision: " + node.getName());
                        else {
                            child.createReference(species, "Product_Revision_To_Species");
                        }
                    }

                    //for testing
                    var childNewSpeciesList = [];
                    refChildSpeciesLinks = child.queryReferences(refTypeSpecies);
                    refChildSpeciesLinks.forEach(function(refChildSpeciesLink) {
                        childNewSpeciesList += refChildSpeciesLink.getTarget().getName() + ",";

                        return true;
                    });
                    
                    log.info("new child species: " + childNewSpeciesList + "for the revision: " + node.getName());

                    // Update child product, approve child product and its revision, send to queues
                    if (isCurrent) {
                        BA_MigrateCatalogAttributesFinal.execute(child);

                        BA_Approve.execute(childProd);
                        BA_Approve.execute(child);

                        BA_Send_To_Preview.execute(child);
                        productQueue.queueDerivedEvent(webDataRepublished, product);
                    }

                    if (isInRevRelease) {
                        BA_Approve.execute(childProd);
                        BA_Approve.execute(child);
                    }
                }
            }
        }
    }

    return true;
});
//STEP-6396
}