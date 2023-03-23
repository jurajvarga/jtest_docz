/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_App_Mgr_PC_Review_OnExit",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA_App_Mgr_PC_Review_OnExit",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_AssetUpdatesUtil",
    "libraryAlias" : "assetLib"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionSetRevAppFiguresBR",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_ProductKitRevisionApprovalAction",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "busActionFigApproveAction",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Figure_Approval_Action",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "imageDataExportQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=ASSET_EXPORT_JSON",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "BA_Approve_Inactive_Figure_Folder",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve_Inactive_Figure_Folder",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "auditEventType",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "AuditEventCreated",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpointMain",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "auditQueueApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=AuditMessageEndpoint",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,busActionSetRevAppFiguresBR,busActionFigApproveAction,imageDataExportQueue,BA_Approve_Inactive_Figure_Folder,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,assetLib,bl_library) {
var businessRule = "Business Rule: BA_App_Mgr_PC_Review_OnExit";
var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
var currentDate = "Date: " + (new Date()).toLocaleString();

var pf2pRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var r2APRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");


var figStatus = node.getValue("Figure_Status").getSimpleValue();


if (figStatus != null && figStatus.equals("Inactive")) {
    
    BA_Approve_Inactive_Figure_Folder.execute(node);
    
    setWorkflowRedirect(node);

} else {
    var imageStatus = getNumImageStatus(node);
    log.info(bl_library.logRecord(["imageStatus: ", businessRule, currentObjectID, currentDate, imageStatus]));

    if (imageStatus.cnt >= 2) {
        var err = node.getID() + " contains more than one Active image";
        throw err;
    } else if (imageStatus.cnt == 0) {
        var err = node.getID() + " contains no Active images";
        throw err;
    } else {
        var objImage = imageStatus.objs[0]; //should only be one
       // var objImageName = objImage.getName();

        //STEP-5662 Add to Application type, heading type & protocol name LOVs - STEP Configuration
        var objImageCurrName = objImage.getName();
        assetLib.updateFigureFolderName(node, objImage, manager)
        
        objImage.getValue("Figure_Key").setSimpleValue(objImageCurrName);
		//End step-5662
		
       //log.info(bl_library.logRecord(["objImage: ", businessRule, currentObjectID, currentDate, objImage]));
        //log.info(bl_library.logRecord(["objImageName: ", businessRule, currentObjectID, currentDate, objImageName]));

        //objImage.getValue("Figure_Key").setSimpleValue(objImageName);
        objImage.getValue("Figure_Display_Index").setSimpleValue(node.getValue("Figure_Display_Index").getSimpleValue());
        objImage.getValue("Figure_Heading").setSimpleValue(node.getValue("Figure_Heading").getSimpleValue());
        node.getValue("Figure_Status").setSimpleValue("Approved");

        var objImagetype = objImage.getObjectType().getID();
        var refID = null;
        if (objImagetype.equals("ProductImage")) {
            refID = "Published_Product_Images";
        } else if (objImagetype.equals("Product_DataSheet")) {
            refID = "DataSheet";
        }

        if (refID != null) {
            var parent = node.getParent();
            var prodRevs = getProductRevision(parent);
            log.info(bl_library.logRecord(["prodRevs: ", businessRule, currentObjectID, currentDate, prodRevs]));


            for (var i = 0; i < prodRevs.length; i++) {
                var prodWIPRev = prodRevs[i];

                log.info(bl_library.logRecord(["Create ref: ", businessRule, currentObjectID, currentDate, objImage.getID() + " refID: " + refID]));
                var refType = manager.getReferenceTypeHome().getReferenceTypeByID(refID);
                var refs = prodWIPRev.queryReferences(refType); //STEP-6396
                var referenceExists = false;

                log.info(bl_library.logRecord(["referenceExists: ", businessRule, currentObjectID, currentDate, referenceExists]));

                //STEP-6396
                refs.forEach(function(ref) {
                
                    var assetnode = ref.getTarget();
                    var assetnodeID = assetnode.getID() + "";
                    log.info(bl_library.logRecord(["assetnodeID: ", businessRule, currentObjectID, currentDate, assetnodeID]));


                    if (assetnodeID == objImage.getID()) {
                        referenceExists = true;
                    }
                    return true;
                });
                //STEP-6396
                
                log.info(bl_library.logRecord([" referenceExists after: ", businessRule, currentObjectID, currentDate, referenceExists]));

                if (!referenceExists) {
                    prodWIPRev.createReference(objImage, refID);
                }

                busActionSetRevAppFiguresBR.execute(prodWIPRev);
            }
            busActionFigApproveAction.execute(objImage);
        }

       

        //Approve
        var productFolder = node.getParent();
        try {

            productFolder.approve();
            node.approve();
            objImage.approve();
        } catch (e) {
            if (e.javaException instanceof com.stibo.core.domain.DependencyException) {
                log.info(bl_library.logRecord(["Dependency Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else if (e.javaException instanceof com.stibo.core.domain.ApproveValidationException) {
                log.info(bl_library.logRecord(["Approve Validation Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else if (e.javaException instanceof com.stibo.core.domain.synchronize.exception.SynchronizeException) {
                log.info(bl_library.logRecord(["Synchronize Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));

            } else {
                log.info(bl_library.logRecord(["Exception:", businessRule, currentObjectID, currentDate, e.javaException.getMessage()]));
                throw (e);
            }
        }

        //After Approval of image object send to meta data image outbound queue
        imageDataExportQueue.republish(objImage);

        setWorkflowRedirect(node);

    }
}

//remove from WF
var wfInst = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");

if (wfInst != null) {
    wfInst.delete("Removed by BA_Initiate_Product_Revision");
     //STEP-6061
    BL_AuditUtil.buildAndSetAuditMessageForAction(node,manager,"WF4_App_Mgr_PC_Review_Workflow","Submit_Action","Review_OnExit","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
    //STEP-6061
}


function setWorkflowRedirect(node) {
    log.info("==> setWorkflowRedirect")
    var parent = node.getParent();
    //logger.info(" parent "+parent);
    var prodRevs = getProductRevision(parent);
    //logger.info("isApproveInactive: " + isApproveInactive(parent));

    log.info("prodRevs: " + prodRevs);
    for (var i = 0; i < prodRevs.length; i++) {
        var prodRev = prodRevs[i];
        var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Rev_To_Figure_Folder");
        var refs = prodRev.queryReferences(refType); //STEP-6396
        var referenceExists = false;

        //STEP-6396
        refs.forEach(function(ref) {
            var figfoldernode = ref.getTarget();
            var figfoldernodeID = figfoldernode.getID() + "";
            log.info(" figure folder " + figfoldernodeID);
            if (figfoldernodeID == node.getID()) {
                referenceExists = true;
            }
            return true;
        });
        //STEP-6396     

        log.info(bl_library.logRecord([" referenceExists after: ", businessRule, currentObjectID, currentDate, referenceExists]));


        if (!referenceExists) {
            prodRev.createReference(node, "Product_Rev_To_Figure_Folder");
        }

        var wf4Inst = node.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow")

        if (isApproveInactive(parent)) {
        	removeIncativeFromWorkflow(parent);
            if (!prodRev.isInWorkflow("WF6_Content_Review_Workflow")) {

                 //Changes done for full maintenance story STEP-5643 Starts
            	var workflowType = prodRev.getValue("Workflow_Type").getSimpleValue();
			log.info(" workflowType " + workflowType );

            	var wfInitiatedNo = prodRev.getValue("Workflow_No_Initiated").getSimpleValue();
			log.info(" wfInitiatedNo " + wfInitiatedNo);

                if (workflowType == "M" && wfInitiatedNo !="20" && wfInitiatedNo != "2") { // STEP-5841 added wf!=2
                    prodRev.getValue("Workflow_No_Current").setSimpleValue("-1");
                }
                 //Changes done for full maintenance story STEP-5643 Ends
                prodRev.startWorkflowByID("WF6_Content_Review_Workflow", "Initiated by WF4 BA_Initiate_Product_Revision");

                var wfInstDummy = prodRev.getWorkflowInstanceByID("WF4-Dummy");
                if (wfInstDummy != null) {
                    wfInstDummy.delete("Removed by BA_Initiate_Product_Revision");
                    //STEP-6014
                    BL_AuditUtil.buildAndSetAuditMessageForAction(prodRev,manager,"WF4-Dummy","Submit_Action","Review_OnExit","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
                    //STEP-6014
                }

               /* if (prodRev.getValue("Workflow_Type").getSimpleValue() == "M" &&
                    node.getValue("Figure_AM_Assign").getSimpleValue() == "Production" &&
                    prodRev.isInState("WF6_Content_Review_Workflow", "Dev_Sci_Review")) {
                    var task = prodRev.getTaskByID("WF6_Content_Review_Workflow", "Dev_Sci_Review");

                    if (task != null) {
                        task.triggerByID("GoToProdWF6", "");
                    }
                }*/
            }
        }
    }
}

/**
 *  STEP-5943 remove incative folder
 */
function removeIncativeFromWorkflow(parent){
    var kids = parent.getChildren();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var kot = kid.getObjectType().getID();

         if (kot.equals("Figure_Folder")) {
          var fs = kid.getValue("Figure_Status").getSimpleValue();
           log.info(bl_library.logRecord([" fs: ", businessRule, currentObjectID, currentDate, fs]));

        if(fs.equals("Inactive")) {
            	
            	var wfInst = kid.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");

               if (wfInst != null) {
                 wfInst.delete("Removed by BA_Initiate_Product_Revision");
                  //STEP-6061
                BL_AuditUtil.buildAndSetAuditMessageForAction(kid,manager,"WF4_App_Mgr_PC_Review_Workflow","Submit_Action","Review_OnExit_Inactive","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
                //STEP-6061
               }
            }
         }
    }

    return true;
	
}

function getProductRevision(parent) {
    var prs = [];
    //STEP-6396
    var pf2ps = parent.queryReferencedBy(pf2pRefType); 

    pf2ps.forEach(function(pf2p) {
        var pf2pTarget = pf2p.getSource();
        var p2WRs = pf2pTarget.queryReferences(p2WRRefType);

            p2WRs.forEach(function(p2WR) {
                var p2WRTarget = p2WR.getTarget();
                prs.push(p2WRTarget);
                return true;
            });
        return true;
    });
    //STEP-6396  
    return prs;
}


function isApproveInactive(parent) {
    var kids = parent.getChildren();
    var kidsItr = kids.iterator();

    while (kidsItr.hasNext()) {
        var kid = kidsItr.next();
        var kot = kid.getObjectType().getID();


        log.info(bl_library.logRecord([" kot: ", businessRule, currentObjectID, currentDate, kot]));
        log.info(bl_library.logRecord([" kid name: ", businessRule, currentObjectID, currentDate, kid.getName()]));


        if (kot.equals("Figure_Folder")) {
            var fs = kid.getValue("Figure_Status").getSimpleValue();
            log.info(bl_library.logRecord([" fs: ", businessRule, currentObjectID, currentDate, fs]));


            if (fs == null) {
                return false;
            } else if (!fs.equals("Approved") && !fs.equals("Inactive")) {
                return false;
            }
        }
    }

    return true;
}


function getNumImageStatus(node) {
    var asss = node.getAssets();
    var asssItr = asss.iterator();
    var cnt = 0;
    var objs = [];

    while (asssItr.hasNext()) {
        var ass = asssItr.next();
        var aot = ass.getObjectType().getID();

        if (aot.equals("ProductImage") || aot.equals("Product_DataSheet")) {
            var is = ass.getValue("Image_Status").getSimpleValue();
            if (is != null && is.equals("Active")) {
                cnt++;
                objs.push(ass);
            }
        }
    }

    return {
        cnt: cnt, objs: objs
    };
}
}