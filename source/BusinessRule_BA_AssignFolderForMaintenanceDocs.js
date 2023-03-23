/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_AssignFolderForMaintenanceDocs",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_AssignFolderForMaintenanceDocs",
  "description" : "Copy Maintenance Documents from Root to revision folder",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision", "Service_Revision" ],
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
    "alias" : "busAct",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_GeneratePSDFileName",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,busAct,bl_library) {
function moveDocuments(assetObj, parentClass, figureFolderObj, assetClassArray) {
    if (typeof figureFolderObj !== 'undefined') {
        for (var j = 0; j < assetClassArray.length; j++) {

            log.info("Asset Class Name: " + assetClassArray[j].getName());
            log.info("Asset Class ID: " + assetClassArray[j].getID());
            log.info("parentClass.getID(): " + parentClass.getID());


            if (assetClassArray[j].getID() == parentClass.getID()) {

                assetObj.move(parentClass, figureFolderObj, null);
                log.info("Asset moved to figureFolderObj Class");

                busAct.execute(assetObj);

            }
        }
    }
}

var businessRule = "Business Rule: BA_AssignFolderForMaintenanceDocs";
var currentDate = "Date: " + (new Date()).toLocaleString();

var parentClassID = "ProductMaintenanceDocuments";
var referenceType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");
log.info("Reference Type Name: " + referenceType.getName());

//Check if current product node references any asset classified in Root/Parent Class
var assetReferenceList = node.getLocalReferences(referenceType);
if (!assetReferenceList.isEmpty()) {

    //Get Product No
    var productNo = node.getValue("PRODUCTNO").getSimpleValue();
    log.info("Product No: " + productNo);

    if (productNo != null) {

        var parentClass = manager.getClassificationHome().getClassificationByID(parentClassID);
        log.info("Parent Class Name: " + parentClass.getName());
        var childClass = manager.getClassificationHome().getClassificationByID(productNo);

        //Create the child class if it doesn't exist
        if (childClass == null) {

            childClass = parentClass.createClassification(productNo, "Product_Rev_Folder");
            childClass.setName(productNo);
            childClass.getValue("Figure_Key").setSimpleValue("MD_" + productNo);
            log.info("Child Class created with Name: " + childClass.getName());
            log.info("Child Class created with Name: " + childClass.getValue("Figure_Key").getSimpleValue());
        } else { //Move the child class if not under parent class

            if (parentClass != childClass.getParent()) {

                childClass.setParent(parentClass);
                log.info("Child Class moved under Parent Class: " + childClass.getParent().getName());
            }

        }

        //approve childClass
        var currentObjectID = "Node ID: " + childClass.getID() + " Node Object ID: " + childClass.getObjectType().getID();

        try {
            childClass.approve();
        } catch (e) {
            if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
            } else {
                logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                throw (e);
            }
        }

        log.info("Asset Reference List Size: " + assetReferenceList.size());

        for (var i = 0; i < assetReferenceList.size(); i++) {

            var assetObj = assetReferenceList.get(i).getTarget();
            log.info("Asset Name: " + assetObj.getName());

            var assetClassArray = assetObj.getClassifications().toArray();
            log.info("Asset Class Array length: " + assetClassArray.length);

		  var statusChangeReferences = assetObj.queryReferencedBy(referenceType); //STEP-6396

            statusChangeReferences.forEach(function(stChRefernceObj) { //STEP-6396

                    var revisionName = stChRefernceObj.getSource().getName();
                    log.info(" Name " + stChRefernceObj.getSource().getName());
                    if (revisionName.indexOf('rev') > 0) {
                        var searchHome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
                        var type = com.stibo.core.domain.Classification;
                        var searchAttribute = manager.getAttributeHome().getAttributeByID("Figure_Key");
                        var searchValue = "MD_" + revisionName;
                        var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
                        var lstFigureFolderClass = searchHome.querySingleAttribute(query).asList(1).toArray();

                        if (lstFigureFolderClass != null) {
                            var figureFolderObj = lstFigureFolderClass[0];

                            log.info(" figureFolderObj " + figureFolderObj);

                            if (typeof figureFolderObj !== 'undefined') {

                                log.info("figureFolderObj Class created with Name1: " + figureFolderObj.getName());
                                log.info("figureFolderObj Class created with Name1: " + figureFolderObj.getValue("Figure_Key").getSimpleValue());
                                moveDocuments(assetObj, parentClass, figureFolderObj, assetClassArray);

                            } else {

                                var figureFolderObj = childClass.createClassification(null, "Figure_Folder");
                                figureFolderObj.setName(revisionName);
                                figureFolderObj.getValue("Figure_Key").setSimpleValue("MD_" + revisionName);
                                log.info("figureFolderObj Class created with Name: " + figureFolderObj.getName());
                                log.info("figureFolderObj Class created with Name: " + figureFolderObj.getValue("Figure_Key").getSimpleValue());
                                moveDocuments(assetObj, parentClass, figureFolderObj, assetClassArray);


                            }

                            //approve figureFolderObj
                            var currentObjectID = "Node ID: " + figureFolderObj.getID() + " Node Object ID: " + figureFolderObj.getObjectType().getID();

                            try {
                                figureFolderObj.approve();
                            } catch (e) {
                                if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                                    logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                                    logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                                    logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else {
                                    logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                    throw (e);
                                }
                            }

                            //approve assetObj
                            var currentObjectID = "Node ID: " + assetObj.getID() + " Node Object ID: " + assetObj.getObjectType().getID();

                            try {
                                assetObj.approve();
                            } catch (e) {
                                if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                                    logger.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                                    logger.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                                    logger.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                } else {
                                    logger.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                                    throw (e);
                                }
                            }

                        }
                    }
                return true; //STEP-6396
            });
        }
    }
}
}