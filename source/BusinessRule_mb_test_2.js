/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "mb_test_2",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "mb_test_2_li",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "BL_MaintenanceWorkflows"
  }, {
    "libraryId" : "BL_ServerAPI",
    "libraryAlias" : "BL_ServerAPI"
  }, {
    "libraryId" : "BL_CatalogPrice",
    "libraryAlias" : "LibCatalogPrice"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "bl_copyRevision"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  }, {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "BL_JSONCreation",
    "libraryAlias" : "lib_json"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mail",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "liveQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_ProductBG_Updated_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "webPassthrough",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "WebPassthroughChanges",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewMain",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Main_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "previewApproved",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Preview_Approved_OIEP",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "sendToPreview",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "SendToPreview",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "ba_approve",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_Approve",
    "description" : null
  }, {
    "contract" : "DerivedEventTypeBinding",
    "alias" : "createItemDetails",
    "parameterClass" : "com.stibo.core.domain.impl.eventqueue.DerivedEventTypeImpl",
    "value" : "CreateItemDetails",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "wipQueue",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Complete_Product_Kit_JSON_WIP_OIEP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessConditionBindContract",
    "alias" : "busCondIsNewWorkflow",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessConditionImpl",
    "value" : "BC_IsNewWorkflow",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,mail,liveQueue,webPassthrough,previewMain,previewApproved,sendToPreview,manager,ba_approve,createItemDetails,wipQueue,lookUp,busCondIsNewWorkflow,BL_Email,BL_MaintenanceWorkflows,BL_ServerAPI,LibCatalogPrice,bl_copyRevision,bl_library,lib,lib_json) {
var foo = getParentSpecifSensiv("64953"); // 72359
logger.info(foo);

function getParentSpecifSensiv(productNo) {
        var retVal = null;

        var parentProduct = step.getNodeHome().getObjectByKey("PRODUCTNO", productNo);

        if (parentProduct) {
            var parentProductCurrRev = BL_MaintenanceWorkflows.getCurrentRevision(product = parentProduct);
		  var parentSpecifSensiv = parentProductCurrRev.getValue("SPECIFSENSIV").getSimpleValue();

            if (parentSpecifSensiv) {
                var parentProdName = parentProduct.getValue("PRODUCTNAME").getSimpleValue(); // issue with #72359 and html entities
logger.info("parentSpecifSensiv:" + parentSpecifSensiv);
logger.info("parentProdName:" + parentProdName);
                retVal = parentSpecifSensiv.replace(parentProdName, removeStringFormulated(inputString = parentProdName) + " (BSA and Azide Free)"); //STEP-6408
            }
        }

        return retVal;
}


// STEP-6408
function removeStringFormulated(inputString) {
    var retVal = inputString;

    if(inputString) {
        var myMatch = inputString.match(/(\s?\(\S*\s*Formulated\)\s?\.?)/gi);

        if (myMatch) {
            myMatch = myMatch.toString();

            if(myMatch.substring(myMatch.length - 1) == ".") {
                retVal = inputString.replace(myMatch, ".");
            }
            else if (myMatch.substring(myMatch.length - 1) == " " && myMatch.substring(0, 1) == " ") {
                retVal = inputString.replace(myMatch, " ");
            }
            else {
                retVal = inputString.replace(myMatch, "");
            }
        }
    }

    return retVal;
}
}