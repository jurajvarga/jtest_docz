/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_InitiateProdMainUpload",
  "type" : "BusinessAction",
  "setupGroups" : [ "New_Product_Maintenance_V2" ],
  "name" : "BA_InitiateProdMainUpload",
  "description" : "Webui Bulk Update rule to enter a product into Product Maintenance Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment_Revision", "Kit_Revision", "Product_Revision" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "BL_Library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_WorkflowUtil",
    "libraryAlias" : "BL_WorkflowUtil"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Product_Maintenance_Change",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Revision_Maintenance_Type</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">1. Revision_Maintenance_Type</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "Workflow_Notes",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">Workflow_Notes</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\">2. Workflow_Notes</Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (Product_Maintenance_Change,node,step,Workflow_Notes,lookUp,BL_AuditUtil,BL_Library,BL_MaintenanceWorkflows,BL_WorkflowUtil) {
var product = node.getParent();

if (Product_Maintenance_Change == '' || Product_Maintenance_Change == null) {
    throw 'Please select Maintanence type ';
} else {
    var wipRev = BL_MaintenanceWorkflows.getWIPRevision(product);
    if (wipRev) { // STEP-5988  && wipRev.getValue("REVISIONSTATUS").getSimpleValue() == "In-process"
        var message = BL_MaintenanceWorkflows.getCurrentWorkflowAndStateOfProduct(step, wipRev);
        message = "Maintenance is not allowed right now. A WIP revision exists for this product. " + message; // // STEP-5988 in status 'In-process' 
        throw message;

    } else {

        if (product.isInWorkflow("Product_Maintenance_Upload") == false) {

        	// STEP-6014 starts
            //Create Audit Instance ID
            BL_AuditUtil.createAuditInstanceID(product);
            //Changes done for STEP-6014 Ends


            var user = step.getCurrentUser().getName();
            var trigger = "Product Maintenance changes to [" + Product_Maintenance_Change + "] by " + user;
            var instance = product.startWorkflowByID("Product_Maintenance_Upload", trigger);

            instance.setSimpleVariable("Product_Change", Product_Maintenance_Change);
            instance.setSimpleVariable("Workflow_Notes", Workflow_Notes);

            product.getValue("Workflow_Notes").setSimpleValue(Workflow_Notes);
            product.getValue("Workflow_Name_Initiated").setSimpleValue(Product_Maintenance_Change);
            product.getValue("Workflow_Initiated_By").setSimpleValue(step.getCurrentUser().getID());
            product.getValue("Main_Initiated_REVISIONNO").setSimpleValue(node.getName());

            var productChange = instance.getSimpleVariable("Product_Change");

            log.info("productChange: " + productChange);
            log.info("is status change: " + (productChange == "Product Status Maintenance"));

          

            if (productChange == "Product Status Change") {
                if (product.isInState("Product_Maintenance_Upload", "Initial")) {
                    log.info("Triggering Submit for Product Status Change");
                    // STEP-5818 using library function
                    BL_Library.triggerTransition(product, "Status_Change", "Product_Maintenance_Upload", "Initial", true);
                    // STEP-5818 ends
                }
            }
            //STEP-STEP-5831 new wf
            else if (productChange == "Publish Product Change") {
                //Check if User is in the group PMLT
                var currentUser = step.getCurrentUser();
                var groups = currentUser.getGroups();

                if ( !step.getGroupHome().getGroupByID("PMLT").isMember(currentUser) &&  !step.getGroupHome().getGroupByID("ProdGL").isMember(currentUser)) {
                    throw "User " + currentUser.getName() + " is not a member of PMLT or GL group, he can not initiate Publish Product Change workflow.";
                } else {
                    if (product.isInState("Product_Maintenance_Upload", "Initial")) {
                        log.info("Triggering Submit for Maintenance other than Product Status Change");
                        // STEP-5818 using library function
                        BL_Library.triggerTransition(product, "Start", "Product_Maintenance_Upload", "Initial", true);
                        // STEP-5818 ends
                    }
                }
            }
            // STEP-5841 new wf
            else if (productChange == "OTS Conversion" && node.getValue("OTS_Conversion_Release_Date").getSimpleValue() != null) {
            	 throw "This product has already been converted.";
        	  }
            else if (productChange == "OTS Conversion" && node.getValue("PUBLISHED_YN").getSimpleValue() == "Y") {
                throw "Only not published products are allowed for OTS Conversion.";
            } else {
                if (product.isInState("Product_Maintenance_Upload", "Initial")) {
                    log.info("Triggering Submit for Maintenance other than Product Status Change");
                    // STEP-5818 using library function
                    BL_Library.triggerTransition(product, "Start", "Product_Maintenance_Upload", "Initial", true);
                    // STEP-5818 ends
                }
            }
        } else {
            throw 'This product has already been sent to queue';
        }
    }
}
}