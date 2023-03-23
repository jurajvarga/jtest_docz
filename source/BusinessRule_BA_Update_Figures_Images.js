/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Update_Figures_Images",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_FiguresReview" ],
  "name" : "BA Update Figures Images",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Figure_Folder", "ProductImage", "Product_DataSheet" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
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
exports.operation0 = function (node,manager,auditEventType,auditQueueMain,auditQueueApproved,BL_AuditUtil,bl_library) {
var ot = node.getObjectType().getID();


if (ot.equals("Figure_Folder")){
	var kids = node.getAssets();
	var kidsItr = kids.iterator();

	while (kidsItr.hasNext()){
		var kid = kidsItr.next();
		var kot = kid.getObjectType().getID();
		if (kot.equals("ProductImage") || kot.equals("Product_DataSheet")){
			kid.getValue("RetireImage").setSimpleValue("Yes");
			kid.getValue("Image_Status").setSimpleValue("Inactive");
			kid.getValue("Figure_Display_Index").setSimpleValue(null);				
		}
	}
	node.getValue("RetireImage").setSimpleValue("Yes");
	node.getValue("Figure_Status").setSimpleValue("Inactive");
	node.getValue("Figure_Display_Index").setSimpleValue(null);			
	
} else if (ot.equals("ProductImage") || ot.equals("Product_DataSheet")){
	node.getValue("RetireImage").setSimpleValue("Yes");
	node.getValue("Image_Status").setSimpleValue("Inactive");	
	node.getValue("Figure_Display_Index").setSimpleValue(null);					
}

// new  part of ticket in progress STEP-5744
var productFolder = node.getParent();
var figStatus = node.getValue("Figure_Status").getSimpleValue();
var p2WRRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_WIP_Revision");
var r2APRefType = manager.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
var r2APRefTypepp = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
var isNotAbleToRemove = false;
var childFigstatus=[]


// only for incative 
if (figStatus != null && figStatus.equals("Inactive")) {
	var prodRevs = getProductRevision(productFolder);
       for (var i = 0; i < prodRevs.length; i++) {
           var prodWIPRev = prodRevs[i];
           var children = productFolder.getChildren().iterator();
           while(children.hasNext()){
	           var figureFolder = children.next();
	            //STEP-5940
                var figureStatus = figureFolder.getValue("Figure_Status").getSimpleValue()+"";
                if (figureStatus==null || figureStatus=="null"){
                  	figureStatus="NA";
                  }
                  childFigstatus.push(figureStatus);
                  /*var wfInst = figureFolder.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
                  if (wfInst != null && figureStatus != 'Inactive'){
                  	 isNotAbleToRemove = true;
                  }*/
               }
              }
              log.info(" childFigstatus  "+childFigstatus)
              //STEP-5940
               if (childFigstatus.indexOf('NA')>-1 || childFigstatus.indexOf('Change Needed')>-1 || childFigstatus.indexOf('Pending Review')>-1){
              		isNotAbleToRemove = true;
              	}
               log.info(" isNotAbleToRemove  "+isNotAbleToRemove)
              // process 
              if (isNotAbleToRemove == false) {
                 var children = productFolder.getChildren().iterator();
                  while(children.hasNext()){
	               var figureFolder = children.next();
                   var wfInst = figureFolder.getWorkflowInstanceByID("WF4_App_Mgr_PC_Review_Workflow");
                   if (wfInst != null ){
                  	 //BA_Approve_Inactive_Figure_Folder.execute(figureFolder);
                  	  wfInst.delete("Removed by WF4_App_Mgr_PC_Review_Workflow"); 

                  	   //STEP-6061
                        BL_AuditUtil.buildAndSetAuditMessageForAction(figureFolder,manager,"WF4_App_Mgr_PC_Review_Workflow","Submit_Action","Review_OnExit_Inactive","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
                        //STEP-6061
                    }               
               }
              
                var wfInst = productFolder.getWorkflowInstanceByID("PAG_App_Mgr_PC_Review_Workflow");
                //figure folder doesn't exists in PAG Review workflow
                if (wfInst != null) {
                    wfInst.delete("Removed by PAG_App_Mgr_PC_Review_Workflow");

                     //STEP-6061
                    BL_AuditUtil.buildAndSetAuditMessageForAction(productFolder,manager,"PAG_App_Mgr_PC_Review_Workflow","Submit_Action","Review_OnExit_Inactive","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
                    //STEP-6061
                }
          if(prodRevs[0] != null) {
          	       var wfInstDummy = prodRevs[0].getWorkflowInstanceByID("WF4-Dummy");
                if (wfInstDummy != null) {
                    wfInstDummy.delete("Removed by BA_Initiate_Product_Revision");
                      //STEP-6014
				BL_AuditUtil.buildAndSetAuditMessageForAction(prodRevs[0],manager,"WF4-Dummy","Submit_Action","Figure_update_Images","","Exit",false,"",auditEventType,auditQueueMain,auditQueueApproved);
				//STEP-6014
                }
         var wfInst = prodRevs[0].getWorkflowInstanceByID("WF6_Content_Review_Workflow");
         if ( wfInst == null) {
         	prodRevs[0].startWorkflowByID("WF6_Content_Review_Workflow", "Initiated by WF4 BA_Initiate_Product_Revision");
         	wfInst = prodRevs[0].getWorkflowInstanceByID("WF6_Content_Review_Workflow");
      } 
          }
        	
  }
}


function getProductRevision(parent) {
    var prs = [];
    //STEP-6396   
    var pf2pRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product"); 
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
}