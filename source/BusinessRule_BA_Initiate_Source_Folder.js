/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Initiate_Source_Folder",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Initiate Source Folder",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "bl_AssetUpdatesUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "referenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "Product_Folder_To_Product_Revision",
    "description" : null
  }, {
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "prodReferenceType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "Product_Folder_To_Product",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "baCreateAuditInstanceID",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_CreateAuditInstanceID",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (referenceType,node,manager,prodReferenceType,logger,baCreateAuditInstanceID,BL_AuditUtil,bl_AssetUpdatesUtil,bl_library) {
function replaceAll(str, map) {
    if (str) {
        for (key in map) {
            str = str.replaceAll(key, map[key]);
        }
    }

    return str;
}

var map = {
    '&lt;lt/&gt;': '<',
    '&lt;gt/&gt;': '>',
    '&amp;': '&',
    '<p>': '',
    '</p>': '',
    '<lt/>': '<',
    '<gt/>': '>'

};

var businessRule = "Business Rule: BA_Initiate_Source_Folder";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

//Find the target SourceFolders and start workflow PAG_App_Mgr_PC_Review_Workflow
var parentClassID = "ProductImageRoot";
var sourceFolders = node.queryReferences(referenceType); //STEP-6396

logger.info(bl_library.logRecord([" sourceFolders: ", businessRule, currentObjectID, currentDate, sourceFolders]));

var productNo = node.getValue("PRODUCTNO").getSimpleValue();
var workflow = manager.getWorkflowHome().getWorkflowByID("PAG_App_Mgr_PC_Review_Workflow");

var pmdRefType = node.getParent().getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Maintenance_Documents");

var Workflow_Initiated_By = node.getValue("Workflow_Initiated_By").getSimpleValue()
var Workflow_Name_Initiated = node.getValue("Workflow_Name_Initiated").getSimpleValue()
var Workflow_No_Initiated = node.getValue("Workflow_No_Initiated").getSimpleValue()
var Workflow_Type = node.getValue("Workflow_Type").getSimpleValue()
var PAG_Assignment = node.getValue("PAG_Assignment").getSimpleValue()
var Workflow_Notes = node.getValue("Workflow_Notes").getSimpleValue()
//Changes done for STEP-5612 starts
//STEP-5929 & 6014
BL_AuditUtil.createAuditInstanceID(node);
var auditInstanceID = node.getValue("Audit_InstanceID").getSimpleValue()
//Changes done for STEP-5612 ends

var workflowstartMessage = "Initated from SDS/GTL Workflow"
if (Workflow_Type == "M") {
    workflowstartMessage = Workflow_Initiated_By;
}

//STEP-6396
var sourceFoldersExists = false;
sourceFolders.forEach(function(iter) {
    sourceFoldersExists = true;
    logger.info(" sourceFolders.isEmpty() " + !sourceFoldersExists);
    var target = iter.getTarget();
    logger.info(" target " + target + "WF ID " + workflow.getID());
    if (!target.isInWorkflow(workflow.getID())) {
    		target.getValue("Workflow_Initiated_By").setSimpleValue(Workflow_Initiated_By)
    		target.getValue("Workflow_Name_Initiated").setSimpleValue(Workflow_Name_Initiated)
            target.getValue("Workflow_No_Initiated").setSimpleValue(Workflow_No_Initiated)
            target.getValue("Workflow_Type").setSimpleValue(Workflow_Type)
            target.getValue("PAG_Assignment").setSimpleValue(PAG_Assignment)
            target.getValue("Workflow_Notes").setSimpleValue(Workflow_Notes)
            //Changes done for STEP-5612 starts
            //Copy AuditInstanceID from  Revision to Product Folder
            target.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
            //Changes done for STEP-5612 Ends
            // STEP-6095 set audit message index to 0 in the beginning of the maintenance
            target.getValue("Audit_Message_Index").setSimpleValue("0");

            //STEP-5977 
            var refTypeFolder2Prod = node.getParent().getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
            var refsFolder2Prod = node.getParent().queryReferences(refTypeFolder2Prod); //STEP-6396

            //STEP-6396
            var refsFolder2ProdExists = false;
            refsFolder2Prod.forEach(function(ref) {
            	refsFolder2ProdExists = true;
            	return false;
        	  });
        	  if (!refsFolder2ProdExists) {
            	node.getParent().createReference(target, "Product_Folder_To_Product");
        	  }
            //STEP-6396            

            target.startWorkflowByID(workflow.getID(), workflowstartMessage);

            //Add document reference from maintenance for STEP-5643 Starts
            var product = node.getParent();
            var refs = product.queryReferences(pmdRefType); //STEP-6396

        	  //STEP-6396 
        	  refs.forEach(function(ref) {
            	var refType = ref.getReferenceType();
            	logger.info(" target " + ref.getTarget().getID() + " target " + refType);

            	try {
                	logger.info(" Inside Loop " + ref.getValue("Figure_Heading").getSimpleValue());
                	var productFolderRef = target.createReference(ref.getTarget(), "Product_Maintenance_Documents");
                	productFolderRef.getValue("Figure_Heading").setSimpleValue(ref.getValue("Figure_Heading").getSimpleValue());
                	productFolderRef.getValue("Figure_Application_Type").setSimpleValue(ref.getValue("Figure_Application_Type").getSimpleValue());
                	productFolderRef.getValue("PROTOCOLNO").setSimpleValue(ref.getValue("PROTOCOLNO").getSimpleValue());
                	productFolderRef.getValue("Figure_Caption").setSimpleValue(ref.getValue("Figure_Caption").getSimpleValue());
                	productFolderRef.getValue("FigureDatasheetNotes").setSimpleValue(ref.getValue("FigureDatasheetNotes").getSimpleValue());
            	} catch (e) {
                	logger.info("create ref: " + e);
            	}
            	return true;
        	});
        	//STEP-6396

            //Add document reference from maintenance for STEP-5643 Ends

            //set attr to Product Folder and its Figure Folders
            bl_AssetUpdatesUtil.setProductandFigureFolderAttr(target, "");

        }
        return true; //STEP-6396
});

if (!sourceFoldersExists) {  //STEP-6396
    var assetFolder = manager.getClassificationHome().getClassificationByID(parentClassID);
    logger.info(bl_library.logRecord([" Asset Folder Name: ", businessRule, currentObjectID, currentDate, assetFolder.getName()]));

    var productFolder;
    var searchHome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.Classification;
    var searchAttribute = manager.getAttributeHome().getAttributeByID("Figure_Key");
    var searchValue = productNo;
    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
    var lstProdFolderClass = searchHome.querySingleAttribute(query).asList(1).toArray();
    if (lstProdFolderClass != null) {
        productFolder = lstProdFolderClass[0];
        logger.info(bl_library.logRecord([" productFolder 1: ", businessRule, currentObjectID, currentDate, productFolder]));


        if (typeof productFolder !== 'undefined') {
            // log.info(" productFolder 1 loop "+productFolder)
            //Create reference if product folder exists
            var refTypeFolder2Rev = node.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
            var refsFolder2Rev = node.queryReferences(refTypeFolder2Rev);  //STEP-6396

            //STEP-6396 
            var refsFolder2RevExists = false;
            refsFolder2Rev.forEach(function(ref) {
                refsFolder2RevExists = true;
                return false;
            });
            if (!refsFolder2RevExists) {
                node.createReference(productFolder, "Product_Folder_To_Product_Revision");
            }
            //STEP-6396 

            var refTypeFolder2Prod = node.getParent().getManager().getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
            var refsFolder2Prod = node.getParent().queryReferences(refTypeFolder2Prod); //STEP-6396

            //STEP-6396
            var refsFolder2ProdExists = false;
            refsFolder2Prod.forEach(function(ref) {
                refsFolder2ProdExists = true;
                return false;
            });
            if (!refsFolder2ProdExists) {
                node.getParent().createReference(productFolder, "Product_Folder_To_Product");
            }
            //STEP-6396 

            //Add document reference from maintenance for STEP-5643 Starts
            var product = node.getParent();
		  var refs = product.queryReferences(pmdRefType);  //STEP-6396

            //STEP-6396
            refs.forEach(function(ref) {
                var refType = ref.getReferenceType();
                logger.info(" target " + ref.getTarget().getID() + " target " + refType);

                try {
                    logger.info(" Inside Loop 1 " + ref.getValue("Figure_Heading").getSimpleValue());
                    var productFolderRef = productFolder.createReference(ref.getTarget(), "Product_Maintenance_Documents");
                    productFolderRef.getValue("Figure_Heading").setSimpleValue(ref.getValue("Figure_Heading").getSimpleValue());
                    productFolderRef.getValue("Figure_Application_Type").setSimpleValue(ref.getValue("Figure_Application_Type").getSimpleValue());
                    productFolderRef.getValue("PROTOCOLNO").setSimpleValue(ref.getValue("PROTOCOLNO").getSimpleValue());
                    productFolderRef.getValue("Figure_Caption").setSimpleValue(ref.getValue("Figure_Caption").getSimpleValue());
                    productFolderRef.getValue("FigureDatasheetNotes").setSimpleValue(ref.getValue("FigureDatasheetNotes").getSimpleValue());
                } catch (e) {
                    logger.info("create ref: " + e);
                }
                return true;
            });
            //STEP-6396

            //Add document reference from maintenance for STEP-5643 Ends

            try {
                //Changes done for STEP-5612 starts
                //Copy AuditInstanceID from  Revision to Product Folder
                productFolder.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
                //Changes done for STEP-5612 ends
                // STEP-6095 set audit message index to 0 in the beginning of the maintenance
                productFolder.getValue("Audit_Message_Index").setSimpleValue("0");

                productFolder.approve();
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

            //set attr to Product Folder and its Figure Folders
            bl_AssetUpdatesUtil.setProductandFigureFolderAttr(productFolder, "");

            //Remove  special characters from Figure caption in  Figure Folder
            var productChFigFolders = productFolder.getChildren();
            for (var i = 0; i < productChFigFolders.size(); i++) {
                var fig_folder = productChFigFolders.get(i);
                //log.info(" Figure Name " + fig_folder.getName());
                //log.info(" Figure Name " + fig_folder.getID());
                var figCaption = fig_folder.getValue("Figure_Caption").getSimpleValue();
                //log.info(" Figure Caption " + figCaption);
                var figCaptionMod = replaceAll(figCaption, map);
                //log.info(" Figure Caption Mod " + figCaptionMod);
                fig_folder.getValue("Figure_Caption").setSimpleValue(figCaptionMod);
                //log.info("------------");

            }
        } else {
            productFolder = assetFolder.createClassification(null, "Product_Rev_Folder");
            logger.info(bl_library.logRecord([" productFolder 2: ", businessRule, currentObjectID, currentDate, productFolder]));

            productFolder.setName(productNo);
            productFolder.getValue("Figure_Key").setSimpleValue(productNo);
            //STEP-6689 - Empty workflow name in PAG review
            productFolder.getValue("Workflow_Name_Initiated").setSimpleValue(Workflow_Name_Initiated);
            logger.info(bl_library.logRecord([" Product Folder created with Name: ", businessRule, currentObjectID, currentDate, productFolder.getName()]));

            //Remove  special characters from Figure caption in  Figure Folder
            var productChFigFolders = productFolder.getChildren();
            for (var i = 0; i < productChFigFolders.size(); i++) {
                var fig_folder = productChFigFolders.get(i);
                //log.info(" Figure Name " + fig_folder.getName());
                //log.info(" Figure Name " + fig_folder.getID());
                var figCaption = fig_folder.getValue("Figure_Caption").getSimpleValue();
                //log.info(" Figure Caption " + figCaption);
                var figCaptionMod = replaceAll(figCaption, map);
                //log.info(" Figure Caption Mod " + figCaptionMod);
                fig_folder.getValue("Figure_Caption").setSimpleValue(figCaptionMod);
                //log.info("------------");
            }

            node.createReference(productFolder, "Product_Folder_To_Product_Revision");
            node.getParent().createReference(productFolder, "Product_Folder_To_Product");

            //Add document reference from maintenance for STEP-5643 Starts
            var product = node.getParent();
            var refs = product.queryReferences(pmdRefType);  //STEP-6396

            //STEP-6396
            refs.forEach(function(ref) {
                var refType = ref.getReferenceType();
                logger.info(" target " + ref.getTarget().getID() + " target " + refType);

                try {
                    logger.info(" Inside Loop 2 " + ref.getValue("Figure_Heading").getSimpleValue());
                    var productFolderRef = productFolder.createReference(ref.getTarget(), "Product_Maintenance_Documents");
                    productFolderRef.getValue("Figure_Heading").setSimpleValue(ref.getValue("Figure_Heading").getSimpleValue());
                    productFolderRef.getValue("Figure_Application_Type").setSimpleValue(ref.getValue("Figure_Application_Type").getSimpleValue());
                    productFolderRef.getValue("PROTOCOLNO").setSimpleValue(ref.getValue("PROTOCOLNO").getSimpleValue());
                    productFolderRef.getValue("Figure_Caption").setSimpleValue(ref.getValue("Figure_Caption").getSimpleValue());
                    productFolderRef.getValue("FigureDatasheetNotes").setSimpleValue(ref.getValue("FigureDatasheetNotes").getSimpleValue());
                } catch (e) {
                    logger.info("create ref: " + e);
                }
                return true;
            });
            //STEP-6396

            //Add document reference from maintenance for STEP-5643 Ends

            try {
                //Changes done for STEP-5612 starts
                //Copy AuditInstanceID from  Revision to Product Folder
                productFolder.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
                //Changes done for STEP-5612 ends
                // STEP-6095 set audit message index to 0 in the beginning of the maintenance
                productFolder.getValue("Audit_Message_Index").setSimpleValue("0");

                productFolder.approve();
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

            //set attr to Product Folder and its Figure Folders
            bl_AssetUpdatesUtil.setProductandFigureFolderAttr(productFolder, "");

        }
    } else {
        productFolder = assetFolder.createClassification(null, "Product_Rev_Folder");
        logger.info(bl_library.logRecord([" productFolder 2: ", businessRule, currentObjectID, currentDate, productFolder]));

        productFolder.setName(productNo);
        productFolder.getValue("Figure_Key").setSimpleValue(productNo);
        logger.info(bl_library.logRecord([" Product Folder created with Name: ", businessRule, currentObjectID, currentDate, productFolder.getName()]));

        node.createReference(productFolder, "Product_Folder_To_Product_Revision");
        node.getParent().createReference(productFolder, "Product_Folder_To_Product");

        try {
            //Copy AuditInstanceID from  Revision to Product Folder
            productFolder.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
            // STEP-6095 set audit message index to 0 in the beginning of the maintenance
            productFolder.getValue("Audit_Message_Index").setSimpleValue("0");

            productFolder.approve();
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

        //set attr to Product Folder and its Figure Folders
        bl_AssetUpdatesUtil.setProductandFigureFolderAttr(productFolder, "");
    }

    if (productFolder != null) {
        if (!productFolder.isInWorkflow(workflow.getID())) {
            productFolder.startWorkflowByID(workflow.getID(), "Initated from Production Workflow");
            if (!node.isInWorkflow("WF4-Dummy")) {
                node.startWorkflowByID("WF4-Dummy", "Initated from Production Workflow")
            }
        }
    }
}
}