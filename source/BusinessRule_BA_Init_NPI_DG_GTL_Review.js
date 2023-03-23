/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Init_NPI_DG_GTL_Review",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Init_NPI_DG_GTL_Review",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "libWF"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "wf",
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
exports.operation0 = function (manager,node,lookup,wf,logger,BL_MaintenanceWorkflows,libWF) {
//Validate Pricing Workflow and GTL workflow is completed before initiating Regional Workflow.
libWF.setWorkflowCompleted(logger, node, wf);

//Populate Completed List
var availableList = libWF.populateWorkflowCompletedList(logger, node);


//Check Ready for Regional Revision Creation
var createRegionRevision = libWF.isRegionalRevisionReadyForCreation(availableList);


//Create Regional Revision only Pricing Workflow and GTL workflow is completed
if (createRegionRevision) {

    var parent = node.getParent();
    var countryCodeList = [];

    //Added to Check Regional Revision Exists Already for SD 303147 Starts
    var availCountryCodeList = [];
    var childList = parent.queryChildren().asList(100).toArray();
    for (var j = 0; j < childList.length; j++) {
        var rrObj = childList[j];
        if (rrObj.getObjectType().getID() == "Regional_Revision") {
            if (rrObj.getName().indexOf("EU") > 0) {
                //log.info(" cc "+(skuObj.getName().indexOf("EU")<0));
                availCountryCodeList.push("EU");
            } else if (rrObj.getName().indexOf("JP") > 0) {
                // log.info(" cc "+(skuObj.getName().indexOf("JP")<0));
                availCountryCodeList.push("JP");
            } else if (rrObj.getName().indexOf("CN") > 0) {
                //log.info(" cc "+(skuObj.getName().indexOf("CN")<0));
                availCountryCodeList.push("CN");
            }
        }

    }
    log.info("Available List" + availCountryCodeList)



    countryCodeList.push("EU");
    countryCodeList.push("JP");
    countryCodeList.push("CN");
    log.info("Before " + countryCodeList)

    //Filter out and add only if regions is not available
    countryCodeList = countryCodeList.filter(function (val) {
        return availCountryCodeList.indexOf(val) == -1;
    });

    log.info("After " + countryCodeList)


    //Added to Check Regional Revision Exists Already for SD 303147 Ends

    for (var j = 0; j < countryCodeList.length; j++) {
        var countryCode = countryCodeList[j];
        // STEP-6537 don't try to init if already in progress, adding checking for reg wip rev
        var regInProgress = BL_MaintenanceWorkflows.getRegionalWIPRevision(parent, countryCode)
        if(!regInProgress) {
	        var regRev = BL_MaintenanceWorkflows.initiateRegMaintenanceWF(manager, parent, null, countryCode, lookup, "U")
	        if (regRev[0] != "ERR") {
	        	  //Changes done for STEP-5929
	        	  var regionalRevision=regRev[1];
	        	  //Copy Audit Instance ID from Revision to Regional Revision
	        	  var auditInstanceID=node.getValue("Audit_InstanceID").getSimpleValue();
	            regionalRevision.getValue("Audit_InstanceID").setSimpleValue(auditInstanceID);
	            //STEP-5993
	            regionalRevision.getValue("Audit_Message").deleteCurrent();
	            regionalRevision.getValue("Audit_Message_Index").setSimpleValue("0");
	            //STEP-5993
	            regionalRevision.startWorkflowByID("WF5_Regional_Workflow", "Initated from SDS-DG Workflow");
	           //Changes done for STEP-5929
	        
	            
	
	        } else {
	            // regRev[1].startWorkflowByID("WF5_Regional_Workflow","Initated from SDS-DG Workflow");
	            throw regRev[2];
	        }
        }
    }

}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBCBusinessCondition",
  "parameters" : [ {
    "id" : "ReferencedBC",
    "type" : "com.stibo.core.domain.businessrule.BusinessCondition",
    "value" : "BC_isNotCustomProduct"
  }, {
    "id" : "ValueWhenReferencedIsNA",
    "type" : "com.stibo.util.basictypes.TrueFalseParameter",
    "value" : "false"
  } ],
  "pluginType" : "Precondition"
}
*/
