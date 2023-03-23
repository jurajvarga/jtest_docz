/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_ReleaseCheck",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_ReleaseCheck",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Approve",
    "libraryAlias" : "BL_Approve"
  }, {
    "libraryId" : "BL_AuditUtil",
    "libraryAlias" : "BL_AuditUtil"
  }, {
    "libraryId" : "BL_CopyRevision",
    "libraryAlias" : "BL_CopyRevision"
  }, {
    "libraryId" : "BL_CreateSKU",
    "libraryAlias" : "BL_CreateSKU"
  }, {
    "libraryId" : "BL_Email",
    "libraryAlias" : "BL_Email"
  }, {
    "libraryId" : "BL_InitPricing",
    "libraryAlias" : "BL_InitPricing"
  }, {
    "libraryId" : "BL_Library",
    "libraryAlias" : "bl_library"
  }, {
    "libraryId" : "BL_MaintenanceWorkflows",
    "libraryAlias" : "bl_maintenancewWFs"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
//STEP-6340
function productRelease(node, productReleased, productQueue, logger, webCategoryQueue, baSetCurrentRevRelease, manager, auditEventType,
	auditQueueMain, auditQueueApproved, pricingQueueNPI, ItemPriceUpdated, BA_Republish_Product_Bibliography, BA_CarrierFree_Product_Release, damPassthrough, damQueue) { //STEP-6747 pricingQueueNPI
	var wfInitiatedNo = node.getValue("Workflow_No_Initiated").getSimpleValue();
	logger.info("wfInitiatedNo " + wfInitiatedNo);

	var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var today = isoDateFormat.format(new Date());

	if (node.isInWorkflow("Product_Release_Workflow")) {
		var product = node.getParent();
		var fromStatus = product.getValue("Product_Status").getSimpleValue()
		var dtPlannedRelease = node.getValue("DATEPLANNEDRELEASE").getSimpleValue();

		if (dtPlannedRelease != null &&
			dtPlannedRelease <= today &&
			product.getValue("Freezer_Date_Check").getSimpleValue() != null &&
			(fromStatus == "Pre-released" || wfInitiatedNo == "2") // STEP-5841
		) {
			// Prepare the revision for sending an email
			node.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");

			//Get WIP Revision
			var wipRevision = bl_maintenancewWFs.getWIPRevision(product);

			if (wipRevision != null) {
				//STEP-5929 && 5993
				//Set Audit for Child Figure Folder
				BL_AuditUtil.buildAndSetAuditMessageForAction(node, manager, "Product_Release_Workflow", "Submit_Action", "Product_Release_Action", "Product_Release_Review", "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved)
				//STEP-5929 && 5993

				//STEP-6224 Edit alternative products outside of a product status change WF
				//delete old alternate products on product and copy from node
				BL_CopyRevision.copyReferenceOfType(node, product, "ALTERNATE_PRODUCT", true);

				//STEP-5841
                    if (wfInitiatedNo == "2") {
                        var republishKits = false; // STEP-6547

                        product.getValue("DateReleased").setSimpleValue(today);
                        product.getValue("PUBLISHED_YN").setSimpleValue(node.getValue("PUBLISHED_YN").getSimpleValue()); // START STEP-6547
                        product.getValue("PRODUCTSHORTNAME").setSimpleValue(node.getValue("PRODUCTSHORTNAME").getSimpleValue());

                        if (product.getValue("PRODUCTNAME").getSimpleValue() != node.getValue("PRODUCTNAME").getSimpleValue()) {
                            product.getValue("PRODUCTNAME").setSimpleValue(node.getValue("PRODUCTNAME").getSimpleValue());
                            product.setName(product.getValue("PRODUCTNAME").getSimpleValue());
                            republishKits = true;
                        }

                        if (republishKits) {
                            var baRepublish_Related_Kits = manager.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_Republish_Related_Kits");
                            baRepublish_Related_Kits.execute(node);
                        } // END STEP-6547
                    }

				//STEP-6427
				product.getValue("Dangerous_Goods_Flag_YN").setSimpleValue(node.getValue("Dangerous_Goods_Flag_YN").getSimpleValue());
				product.getValue("GHS_Label_Required_CB").setSimpleValue(node.getValue("GHS_Label_Required_CB").getSimpleValue());

				//Set Current Rev    
				baSetCurrentRevRelease.execute(node);

				//STEP-6709 adding condition to check if product is published 
				if (product.getValue("PUBLISHED_YN").getSimpleValue() == "Y") { 
					//Add to Queue
					//STEP-6152
					//STEP-6747 Starts
					//pricingQueue.queueDerivedEvent(ItemPriceUpdated, product);
					pricingQueueNPI.queueDerivedEvent(ItemPriceUpdated, product);
					//STEP-6747 Ends
				}
				productQueue.queueDerivedEvent(productReleased, node);
				webCategoryQueue.queueDerivedEvent(productReleased, node);

				var damObjects = bl_library.getRevDAMObjects(node);
				damObjects.forEach(function loop(damObject) {
					damQueue.queueDerivedEvent(damPassthrough, damObject);
				});

				BA_Republish_Product_Bibliography.execute(product); //STEP-6199

				//STEP-6164
				if (node.getValue("ABBR_WORKFLOW_NAME").getSimpleValue() == "CarrierFree") {
					BA_CarrierFree_Product_Release.execute(node);
				}

				var wf = node.getWorkflowInstanceByID("Product_Release_Workflow");
				if (wf) {
					wf.delete("Product met condition to leave the workflow.");
				}
			}
		}
	}
}

function bulkProductRelease(productReleased, productQueue, logger, webCategoryQueue, baSetCurrentRevRelease, manager, auditEventType,
	auditQueueMain, auditQueueApproved, pricingQueueNPI, ItemPriceUpdated, BA_Republish_Product_Bibliography, BA_CarrierFree_Product_Release, lookUp, mailHome, businessRule, damPassthrough, damQueue, rollbackChanges) { //STEP-6747 pricingQueueNPI
	var recipientsEmails_Step_Admin = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "Daily_Check");

	try {
		var conditions = com.stibo.query.condition.Conditions;
		var isInProductReleaseWF = conditions.workflow().eq("Product_Release_Workflow");
		var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.state.Task).where(isInProductReleaseWF);
		var result = querySpecification.execute();

		result.forEach(function (item) {
			var node = item.getNode();
			productRelease(node, productReleased, productQueue, logger, webCategoryQueue, baSetCurrentRevRelease, manager, auditEventType, auditQueueMain,
				 auditQueueApproved, pricingQueueNPI, ItemPriceUpdated, BA_Republish_Product_Bibliography, BA_CarrierFree_Product_Release, damPassthrough, damQueue); //STEP-6747 pricingQueueNPI
			return true;
		});
	} catch (error) {
		if (rollbackChanges)
			sendError(mailHome, recipientsEmails_Step_Admin, businessRule, error);
		throw error;
	}
	if (rollbackChanges) {
		sendToTestUsers(mailHome, recipientsEmails_Step_Admin, "Product release check", "Everything went ok for product release status check.");
		throw 'error';
	}
}

/**
 * @desc Release Revision 
 * @param {object} node - the current object
 * @param {object} productReleased - DerivedEventType productReleased
 * @param {object} productQueue - EventQueue productQueue
 * @param {object} currentRevisionUpdated - DerivedEventType DerivedEventType
 * @param {Business Action} baApproveProductObjects - BA_ApproveProductObjects //BA_ApproveRevisionObjects - BA_ApproveRevisionObjects
 * @param {Business Action} baMigCatalogAttrFinal - BA_MigrateCatalogAttributesFinal
 * @param {object} manager - the STEP Manager Object
 * @param {object} webCategoryQueue - EventQueue webCategoryQueue
 * @param {Business Action} baUpdateChildSpeciesHomology - BA Update Child Species Homology
 * @param {Business Condition} busCondPublishProduct - BC_changePublishFlag
 * @param {Business Action} baRepublish_Related_Kits - BA_Republish_Related_Kits
 * @param {Business Action} baRepublish_Related_Kits_Name - BA_Republish_Related_Kits_Name
 * @param {Business Action} baResetAuditInstanceID - BA_ResetAuditInstanceID
 * @param {Business Action} baSetRevRegEmailFlag - BA Set Revision Regional Email Flag
 * @param {object} auditEventType - DerivedEventType AuditEventCreated
 * @param {object} auditQueueMain - Audit Message Endpoint - Main Workspace
 * @param {object} auditQueueApproved - Audit Message Endpoint - Approved Workspace
 * @param {object} pricingQueue - EventQueue pricingQueue Pricing
 * @param {object} ItemPriceUpdated - DerivedEventType ItemPriceUpdated
 * @param {Business Action} baUpdatePublishDate - BA_UpdatePublishDate
 * @param {object} lookUp - LookupTableHome
 * @param {object} mailHome - MailHome
 * @param {object} damPassthrough - DerivedEventType AssetSyncToDAMInitiated
 * @param {object} damQueue - EventQueue damQueue
 * @param {object} webDataRepublished - DerivedEventType WebDataRepublished
 * @returns void
 */
function revisionRelease(node, productReleased, productQueue, currentRevisionUpdated, BA_ApproveRevisionObjects, baMigCatalogAttrFinal, manager, webCategoryQueue, //STEP-6465 BA_ApproveRevisionObjects
	baUpdateChildSpeciesHomology, busCondPublishProduct, baRepublish_Related_Kits, baRepublish_Related_Kits_Name, baResetAuditInstanceID, baSetRevRegEmailFlag,
	auditEventType, auditQueueMain, auditQueueApproved, pricingQueue, pricingQueueNPI, ItemPriceUpdated, baUpdatePublishDate, lookUp, mailHome, damPassthrough, damQueue, webDataRepublished) { //STEP-6747 pricingQueueNPI
	var currentObjectID = "Node ID: " + node.getID() + " Node Object ID: " + node.getObjectType().getID();
	var currentDate = "Date: " + (new Date()).toLocaleString();

	var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var today = isoDateFormat.format(new Date());

	if (node.isInWorkflow("Revision_Release_Workflow")) {
		var newCurrRev = null;
		var effectiveDate = node.getValue("MakeRevisionEffectiveDate").getSimpleValue();

		if (effectiveDate != null && effectiveDate <= today) {
			newCurrRev = node;

			var republishKits = false; //STEP-5752
			var republishKits_Name = false; // STEP-5875

			var product = newCurrRev.getParent();
			var p2curRefType = product.getManager().getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
			var refs = product.getProductReferences();
			var p2revRefs = bl_library.getRevisions(product);

			//Looking for the latest revision
			var latestPublishFlagChangeRev = null;

			for (var i = 0; i < p2revRefs.size(); i++) {
				var rev = p2revRefs.get(i);

				if (rev.isInWorkflow("Revision_Release_Workflow") &&
					(rev.getValue("MakeRevisionEffectiveDate").getSimpleValue() <= today ||
						rev.getValue("MakeRevisionEffectiveDate").getSimpleValue() == null)) {

					//STEP-5752
					// STEP-5879 adding wf15
					// STEP-6637 adding wf12, wf19
					var wfNoInitiated = rev.getValue("Workflow_No_Initiated").getSimpleValue();
					if (wfNoInitiated == "12" || wfNoInitiated == "15" || wfNoInitiated == "17" || wfNoInitiated == "19") {
						republishKits = true;
					}

					if (wfNoInitiated == "20") {
						republishKits = true;
						republishKits_Name = true;
					}

					//Find the latest rev with MakeRevisionEffectiveDate <= today     
					if (Number(rev.getValue("REVISIONNO").getSimpleValue()) > Number(newCurrRev.getValue("REVISIONNO").getSimpleValue()) &&
						rev.getValue("MakeRevisionEffectiveDate").getSimpleValue() <= today) {
						newCurrRev = rev;
					}
				}
			}
			log.info("Latest revision: " + newCurrRev.getName());

			//Set current revision 
			var p2curRefs = refs.get(p2curRefType);
			var p2curRef;
			if (p2curRefs.size() == 1) {
				p2curRef = p2curRefs.get(0);
				// p2curRef.delete();
			}

			//Get MS Code
			var currentRevMSCode = bl_library.getReferenceAttrValueWOTarget(p2curRef.getTarget(), "ProductRevision_To_MasterStock", "MASTERITEMCODE");
			var wipRevMSCode = bl_library.getReferenceAttrValueWOTarget(newCurrRev, "ProductRevision_To_MasterStock", "MASTERITEMCODE");

			log.info("currentRevMSCode " + currentRevMSCode + " wipRevMSCode " + wipRevMSCode)

			//If the master stock code for current revision and wip revision are the same then replace current revision else keep it same
			if (currentRevMSCode != null && currentRevMSCode == wipRevMSCode) {
				p2curRef.delete();
				product.createReference(newCurrRev, p2curRefType.getID());

				//STEP-6341, STEP-6645 start
				if(bl_library.isRevisionType(newCurrRev, false)) {
					bl_library.toCompareOGandNewShippingConditions(manager, newCurrRev);
				}
				//STEP-6341, STEP-6645 end
			}
			//end set current revision

			var p2RevReleaseWFType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_RevRelease_WF");
			//var p2RevReleaseRefs = product.queryReferences(p2RevReleaseWFType); ERROR
			//Removing revisions from WF 
			for (var i = 0; i < p2revRefs.size(); i++) {
				var rev = p2revRefs.get(i);

				if (rev.isInWorkflow("Revision_Release_Workflow")) {
					if (rev.getValue("MakeRevisionEffectiveDate").getSimpleValue() <= today ||
						rev.getValue("MakeRevisionEffectiveDate").getSimpleValue() == null) {
						var wf = rev.getWorkflowInstanceByID("Revision_Release_Workflow");
						if (wf) {
							wf.delete("Revision met condition to leave the workflow.");
							var retfalse = true;
							//STEP-6599 - Remove revision released from WF from the reference

							var prodRefByRev = rev.queryReferencedBy(p2RevReleaseWFType);
			                    prodRefByRev.forEach(function (pref){
				                   pref.delete();
				                   return true;
			                    });

							/* ERROR
							p2RevReleaseRefs.forEach(function (ref) {
								if(ref.getTarget().getID() == rev.getID()) {
									ref.delete();
									return false;
								}
								return true;
							});*/
						}
					}
				}
			}
			//STEP-5831
			
			//Set attr PUBLISHED_YN on the product if wf=21,20
			if (newCurrRev.getValue("PUBLISHED_YN").getSimpleValue() != product.getValue("PUBLISHED_YN").getSimpleValue()) {
				var pubFlagProductBefore = product.getValue("PUBLISHED_YN").getSimpleValue(); //STEP-6747
				product.getValue("PUBLISHED_YN").setSimpleValue(newCurrRev.getValue("PUBLISHED_YN").getSimpleValue());

				// STEP-6306 moving the publish date logic outside
				// var prodDatePublished = product.getValue("DATEPUBLISHED").getSimpleValue();
				// if (newCurrRev.getValue("PUBLISHED_YN").getSimpleValue() == "Y" && !prodDatePublished) {
				//     product.getValue("DATEPUBLISHED").setSimpleValue(today);
				// }
			}

			// STEP-6306 set publish date
			baUpdatePublishDate.execute(newCurrRev);

			//Set attr PRODUCTNAME on the product 
			if (newCurrRev.getValue("PRODUCTNAME").getSimpleValue() != product.getValue("PRODUCTNAME").getSimpleValue()) {

				product.getValue("PRODUCTNAME").setSimpleValue(newCurrRev.getValue("PRODUCTNAME").getSimpleValue());
				product.setName(newCurrRev.getValue("PRODUCTNAME").getSimpleValue());
				republishKits_Name = true;

				//STEP-6542 start
				var productName = product.getName();
				
				var prodToSKURefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_SKU");
				var prodToSKURefs = product.queryReferences(prodToSKURefType);
				
				prodToSKURefs.forEach(function(skuRef){
					sku = skuRef.getTarget();
					var skuName = sku.getName();
				
					var kitRevToSKURefType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
					var kitRevToSKURefs = sku.queryReferencedBy(kitRevToSKURefType);
				
					kitRevToSKURefs.forEach(function(kitRevRef){
						kitRevision = kitRevRef.getSource();
						
						var children = kitRevision.queryChildren();
						children.forEach(function(child){
				
							var childObjectTypeID = child.getObjectType().getID();
							var componentSKU = child.getValue("COMPONENTSKU").getSimpleValue();
							
							if (childObjectTypeID == "Kit_Component" && skuName == componentSKU){
								isChildApproved = child.getApprovalStatus().name();
								
								child.getValue("COMPONENTSKUNAME").setSimpleValue(productName);
								
								if (isChildApproved == "CompletelyApproved") {
									var BA_Approve = manager.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_Approve");
									BA_Approve.execute(child);
								}
							}
							
							return true;
						});
						
						return true;
					});
					
					return true;
				});
				//STEP-6542 end
			}

			//Set attr PRODUCTSHORTNAME on the product 
			if (newCurrRev.getValue("PRODUCTSHORTNAME").getSimpleValue() != product.getValue("PRODUCTSHORTNAME").getSimpleValue()) {

				product.getValue("PRODUCTSHORTNAME").setSimpleValue(newCurrRev.getValue("PRODUCTSHORTNAME").getSimpleValue());
			}


			//For system initiated maintenace copy product name & product type & set product object name for the maintenance 12
			//STEP-5965
			if (newCurrRev.getValue("System_Initiated").getSimpleValue() == "Y") {
				product.getValue("PRODUCTTYPE").setSimpleValue(newCurrRev.getValue("PRODUCTTYPE").getSimpleValue());
				// product.getValue("FORMULATION").setSimpleValue(newCurrRev.getValue("FORMULATION").getSimpleValue());
			}

			//Update child products species and homology
			baUpdateChildSpeciesHomology.execute(newCurrRev);

			//Update Catalog related attributes.
			baMigCatalogAttrFinal.execute(newCurrRev);

			//STEP-6224 Edit alternative products outside of a product status change WF
			//delete old alternate products on product and copy from newCurrRev
			BL_CopyRevision.copyReferenceOfType(newCurrRev, product, "ALTERNATE_PRODUCT", true);

			// STEP-5869 moved setting email flag to right place, since the revision to release might change during execution of this BR
			// Prepare for sending an email
			newCurrRev.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("N");

			//STEP-6427
			product.getValue("Dangerous_Goods_Flag_YN").setSimpleValue(newCurrRev.getValue("Dangerous_Goods_Flag_YN").getSimpleValue());
			product.getValue("GHS_Label_Required_CB").setSimpleValue(newCurrRev.getValue("GHS_Label_Required_CB").getSimpleValue());

			log.info("Object name: " + newCurrRev.getName());
			log.info("RELEASE_EMAIL_SENT_YN Value: " + newCurrRev.getValue("RELEASE_EMAIL_SENT_YN").getSimpleValue());

			// STEP-5869 When there is SKU to send for regions set regional email flag on revision
			baSetRevRegEmailFlag.execute(newCurrRev);

			// STEP-6280 Rename SKU email flags for regional emails
			if (newCurrRev.getValue("US_to_EU_Email_Sent_YN").getSimpleValue() == "N") {
				// STEP-6091 For every price change in the US, have a revision automatically drop into the EU Maintenance workflow
				BL_InitPricing.initPricing(manager, newCurrRev, 'EU', lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
			}
			// STEP-6280 Rename SKU email flags for regional emails
			if (newCurrRev.getValue("US_to_China_Email_Sent_YN").getSimpleValue() == "N") {
				// STEP-6256 For every price change in the US, automatically initiate China Pricing Review (including custom products)
				BL_InitPricing.initPricing(manager, newCurrRev, 'CN', lookUp, mailHome, auditEventType, auditQueueMain, auditQueueApproved);
			}

			//STEP-5929 && 5993
			//Set Audit for Child Figure Folder
			BL_AuditUtil.buildAndSetAuditMessageForAction(newCurrRev, manager, "Revision_Release_Workflow", "Submit_Action", "Revision_Release_Action", "Revision_Release_Workflow", "Exit", false, "", auditEventType, auditQueueMain, auditQueueApproved)
			//STEP-5929

			// STEP-6095 removing to fix reseting audit instance for product/figure folders during maintenance in process
			//Changes done for STEP-5612 starts
			//Reset Audit Instance
			//baResetAuditInstanceID.execute(newCurrRev);
			//Changes done for STEP-5612 ends
			// STEP-6095 ends

			//STEP-6755
			if(product.getValue("LOTMANAGED_YN").getSimpleValue() == "Y") {
				var lotRecombinantFlag = bl_library.getLotRecombinantFlag(manager, product, newCurrRev);
				product.getValue("Lot_Recombinant_Flag").setSimpleValue(lotRecombinantFlag);	
			}

			// STEP-6220
			BL_CreateSKU.setSkuReleaseDate(manager, newCurrRev, today);

			//STEP-6465 Starts
			//baApproveProductObjects.execute(product);
			BA_ApproveRevisionObjects.execute(newCurrRev);
			//STEP-6465 Ends

			//STEP-6747 Starts
			if (pubFlagProductBefore == "N" && product.getValue("PUBLISHED_YN").getSimpleValue() == "Y") {
				pricingQueueNPI.queueDerivedEvent(ItemPriceUpdated, product); 
			}
			//STEP-6152
			else if (newCurrRev.getValue("Published_SKU_Price_Changed_YN").getSimpleValue() == "Y") {
				pricingQueue.queueDerivedEvent(ItemPriceUpdated, product);
			}
            	//STEP-6747 Ends

			//productQueue.queueDerivedEvent(currentRevisionUpdated, product);
			//webCategoryQueue.queueDerivedEvent(currentRevisionUpdated, product);

			//STEP-6730 Content Only WF should create event WebDataRePublished
			if (newCurrRev.getValue("Workflow_No_Initiated").getSimpleValue() == "19") 
                 	productQueue.queueDerivedEvent(webDataRepublished, product);
               else {
               	 productQueue.queueDerivedEvent(currentRevisionUpdated, product);
               	 webCategoryQueue.queueDerivedEvent(currentRevisionUpdated, product);
			}

			var damObjects = bl_library.getRevDAMObjects(newCurrRev);
			damObjects.forEach(function loop(damObject) {
				damQueue.queueDerivedEvent(damPassthrough, damObject);
			});

			if (republishKits) {
				// STEP-5752
				baRepublish_Related_Kits.execute(newCurrRev);
			}
			if (republishKits_Name) {
				// STEP-5875
				baRepublish_Related_Kits_Name.execute(newCurrRev);
			}
		}
	}
}

function bulkRevisionRelease(productReleased, productQueue, currentRevisionUpdated, BA_ApproveRevisionObjects, baMigCatalogAttrFinal, manager, webCategoryQueue, //STEP-6465 BA_ApproveRevisionObjects
	baUpdateChildSpeciesHomology, busCondPublishProduct, baRepublish_Related_Kits, baRepublish_Related_Kits_Name, baResetAuditInstanceID, baSetRevRegEmailFlag,
	auditEventType, auditQueueMain, auditQueueApproved, pricingQueue, pricingQueueNPI, ItemPriceUpdated, baUpdatePublishDate, lookUp, mailHome, businessRule, damPassthrough, damQueue, webDataRepublished, rollbackChanges) { //STEP-6747 pricingQueueNPI
	var recipientsEmails_Step_Admin = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "Daily_Check");
	
	try {
		var conditions = com.stibo.query.condition.Conditions;
		var isInRevisionReleaseWF = conditions.workflow().eq("Revision_Release_Workflow");
		var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.state.Task).where(isInRevisionReleaseWF);
		var result = querySpecification.execute();

		//STEP-6472 from queryresult of tasks to array of revisions
          var resultArrRevision = result.asList(150).toArray();
		var revisionInRelease = [];		
          for (var i = 0; i < resultArrRevision.length; i++) {
		 	var node = resultArrRevision[i].getNode();
		     revisionInRelease.push(node);
           }
           
           for (var i = 0; i < revisionInRelease.length; i++) {
		 	var node = revisionInRelease[i];
			//STEP-6472 end

			revisionRelease(node, productReleased, productQueue, currentRevisionUpdated, BA_ApproveRevisionObjects, baMigCatalogAttrFinal, manager, webCategoryQueue, //STEP-6465 BA_ApproveRevisionObjects
				baUpdateChildSpeciesHomology, busCondPublishProduct, baRepublish_Related_Kits, baRepublish_Related_Kits_Name, baResetAuditInstanceID, baSetRevRegEmailFlag,
				auditEventType, auditQueueMain, auditQueueApproved, pricingQueue, pricingQueueNPI, ItemPriceUpdated, baUpdatePublishDate, lookUp, mailHome, damPassthrough, damQueue, webDataRepublished); //STEP-6747 pricingQueueNPI
		};
	} catch (error) {
		if (rollbackChanges)
			sendError(mailHome, recipientsEmails_Step_Admin, businessRule, error);
		throw error;
	}
	if (rollbackChanges) {
		sendToTestUsers(mailHome, recipientsEmails_Step_Admin, "Revision release check", "Everything went ok for revision release status check.");
		throw 'error';
	}
}

//STEP-6339 Separate function with rollback parameter for testing daily digest email
function sendDailyDigest(manager, lookUp, mailHome, busCondCustomProd, busCondIsNewWorkflow, busCondComponentWF, busCondNotCustomOrComponent, rollbackChanges) {
	try {
		var businessRule = "Business Rule: Email Product Release Status List";
		var currentDate = "Date: " + (new Date()).toLocaleString();

		// Recipients
		var recipientsEmails = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "10");
		var recipientsEmails_Japan = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "Japan_StatusChange");
		var recipientsEmails_China = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "China_StatusChange");
		var recipientsEmails_Step_Admin = BL_Email.getEmailsFromGroup(manager, lookUp, "WorkflowEmailUserGroupMapTable", "Daily_Check");

		// STEP-5944 if no recipients found for one of the groups, throw error to not set email flags 
		if (!recipientsEmails) {
			throw "BR Email Product Release Status List: No recipients found for daily product release email.";
		} else if (!recipientsEmails_Japan) {
			throw "BR Email Product Release Status List: No recipients found for status change daily email for Japan.";
		} else if (!recipientsEmails_China) {
			throw "BR Email Product Release Status List: No recipients found for status change daily email for China.";
		}
		//STEP-5944 ends

		// ******** CST Logo ********
		var CSTLogo = '<img src=' + lookUp.getLookupTableValue("ServerLookupURL", "email-logo-url") + ' alt="Cell Signaling Technology Logo" width="225" height="47"/>'
		var emailBody = CSTLogo;
		var emailBody_Japan = emailBody + '<h2>The following products have been changed to released, pending or discontinued</h2>' + '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';
		var emailBody_China = emailBody + '<h2>The following products have been changed to released, pending or discontinued</h2>' + '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

		// ******** products ******** 
		var curRefRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_Current_Revision");
		// STEP-5635 Adding dev sci, refactor to use a common function BL_Email.generateHtmlTableHeading
		emailBody += '<h2> New Products Released </h2>';
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">'
		// Add table heading
		var productsHeadingContent = ["PRODUCT", "PRODUCT NAME", "LOT NUMBER", "STATUS", "PLANNED RELEASE DATE", "PROD TEAM", "DEV SCI", "PUBLISHED", "FREEZERDATE", "SIZES"];
		emailBody += BL_Email.generateHtmlTableHeading(productsHeadingContent);

		// STEP-5870
		var productsHeadingContent_Japan = ["PRODUCT NUMBER", "PRODUCT NAME", "PREVIOUS STATUS", "CURRENT STATUS", "PUBLISHED", "SIZES"];
		emailBody_Japan += BL_Email.generateHtmlTableHeading(productsHeadingContent_Japan);

		// STEP-5870
		var productsHeadingContent_China = ["PRODUCT NUMBER", "PRODUCT NAME", "PREVIOUS STATUS", "CURRENT STATUS", "PUBLISHED", "SIZES"];
		emailBody_China += BL_Email.generateHtmlTableHeading(productsHeadingContent_China);

		// Getting products
		var isoDateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd");
		var today = isoDateFormat.format(new Date());

		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday = isoDateFormat.format(yesterday);

		var conditions = com.stibo.query.condition.Conditions;
		var isReleasedToday = conditions.valueOf(manager.getAttributeHome().getAttributeByID("DateReleased")).eq(today);
		var isReleasedYesterday = conditions.valueOf(manager.getAttributeHome().getAttributeByID("DateReleased")).eq(yesterday);
		var isProduct = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product"));
		var isProductKit = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Kit"));
		var isEquipment = conditions.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment"));

		var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where((isReleasedToday.or(isReleasedYesterday)).and((isProduct).or(isProductKit).or(isEquipment)));

		var result = querySpecification.execute();
		var resultArr = result.asList(150).toArray();

		// STEP-6325 - Sort items on product release report by ProdTeam
		//             Also sort by productno as a second parameter
		// Function function(a, b) decide which one of a or b is greater according to the condistions. 
		// Characters || devided conditions.
		// Fisrst condition is on "ProdTeam_Planner_Product".
		// Second is production number. Comparison will be done alphanumeric (as character) not as number.
		
		resultArr.sort(function (a, b) { 
			return a.getValue("ProdTeam_Planner_Product").getSimpleValue().localeCompare(b.getValue("ProdTeam_Planner_Product").getSimpleValue())
			|| a.getValue("PRODUCTNO").getSimpleValue().localeCompare(b.getValue("PRODUCTNO").getSimpleValue()); 
		})

		// STEP-5635 - add counter to avoid counting products with rev1 with RELEASE_EMAIL_SENT_YN already set to Y
		var resultProdCount = 0;
		var resultProdCount_Japan = 0;
		var resultProdCount_China = 0;

		for (var i = 0; i < resultArr.length; i++) {
			var product = resultArr[i];

			var children = product.getChildren().iterator();
			var SKUs = getSKUs(children);

			var curRefs = product.queryReferences(curRefRefType); //STEP-6396
			var prodShortName;
			var lotNumbers;
			var curTarget;
			// STEP-5635 adding rev no for checking rev1 to not include other revision numbers
			var revNo;
			// STEP-5635 Adding dev sci
			var devSci;

			curRefs.forEach(function(ref) {	//STEP-6396
				curTarget = ref.getTarget(); //STEP-6396
				prodShortName = curTarget.getValue("PRODUCTSHORTNAME").getSimpleValue();
				lotNumbers = bl_library.getLotNumbers(curTarget, manager);
				// STEP-5635 Adding dev sci
				devSci = curTarget.getValue("DEV_SCI").getSimpleValue();
				revNo = curTarget.getValue("REVISIONNO").getSimpleValue();
				return true; //STEP-6396
			});

			var isNotCustomOrComponentWF = busCondNotCustomOrComponent.evaluate(curTarget);

			if (curTarget.getValue("RELEASE_EMAIL_SENT_YN").getSimpleValue() == "N" && ((revNo == "1" && isNotCustomOrComponentWF.isAccepted()) || curTarget.getValue("Workflow_Name_Initiated").getSimpleValue() == "OTS Conversion")) { // STEP-5841
				// setting the attribute RELEASE_EMAIL_SENT_YN is moved after the part of Change Status Revisions
				// to not to set it before this part because the revisions are not to select by the query in the next part

				// Create a message body for a product
				var freezerDate = product.getValue("Freezer_Date_Check").getSimpleValue();
				var prodNo = product.getValue("PRODUCTNO").getSimpleValue();
				var prodStatus = product.getValue("Product_Status").getSimpleValue();
				var plannedReleaseDate = curTarget.getValue("DATEPLANNEDRELEASE").getSimpleValue();
				var prodTeam = product.getValue("ProdTeam_Planner_Product").getSimpleValue();
				var published = product.getValue("PUBLISHED_YN").getSimpleValue();

				// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableRow
				var productsTableContent = [prodNo, prodShortName, lotNumbers, prodStatus, plannedReleaseDate, prodTeam, devSci, published, freezerDate, SKUs];
				var tableRowStyle = (resultProdCount % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				emailBody += BL_Email.generateHtmlTableRow(productsTableContent, tableRowStyle);

				resultProdCount++;
			}
		}

		emailBody += '</table>';

		// ******** revisions ******** 
		// STEP-5635 Adding dev sci, refactor to use a common function BL_Email.generateHtmlTableHeading
		emailBody += '<br>' + '<h2> Revisions Released </h2>'
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

		var revisionsHeadingContent = ["REVISION", "PRODUCT NAME", "REVISION REASON", "LOT NUMBER", "PRODUCT STATUS",
			"DATE OF CHANGE", "PROD TEAM", "DEV SCI", "PUBLISHED", "FREEZERDATE", "SIZES"
		]

		emailBody += BL_Email.generateHtmlTableHeading(revisionsHeadingContent);

		var conditionsRevision = com.stibo.query.condition.Conditions;
		var isSentRevision = conditionsRevision.valueOf(manager.getAttributeHome().getAttributeByID("RELEASE_EMAIL_SENT_YN")).eq("N");
		var isProductRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Revision"));
		var isProductKitRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Kit_Revision"));
		var isEquipmentRevision = conditionsRevision.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment_Revision"));

		var queryHomeRevision = manager.getHome(com.stibo.query.home.QueryHome);

		// isSentRevision instead of isReleasedRevision
		var querySpecificationRevision = queryHomeRevision.queryFor(com.stibo.core.domain.Product).where(isSentRevision.and((isProductRevision).or(isProductKitRevision).or(isEquipmentRevision)));

		var resultRevision = querySpecificationRevision.execute();
		var resultArrRevision = resultRevision.asList(150).toArray();

		// STEP-6325 - Sort items on product release report by ProdTeam
		//             Also sort by revision name as a second parameter
		// Function function(a, b) decide which one of a or b is greater according to the condistions. 
		// Characters || devided conditions.
		// Fisrst condition is on "ProdTeam_Planner_Product".
		// Second is on the part of the revision name. The part is all characters to character v ( v from the world rev)
		// example of the part "99999_rev" is part from "99999_rev25".
		// Third is rest of the revision name converted to number. From our example it is number 25.
		// Third was changed to convert product revision attribute REVISIONNO to number, it is cleaner then before
		
		resultArrRevision.sort(function (a, b) { 
			return a.getValue("ProdTeam_Planner_Product").getSimpleValue().localeCompare(b.getValue("ProdTeam_Planner_Product").getSimpleValue())
			|| a.getName().substring(0,a.getName().indexOf("v")+1).localeCompare(b.getName().substring(0,b.getName().indexOf("v")+1))
			|| parseInt(a.getValue("REVISIONNO").getSimpleValue()) - parseInt(b.getValue("REVISIONNO").getSimpleValue());	
		})

		// STEP-5635 - add counter to avoid counting rev1 and Product Status Change revisions
		var resultRevCount = 0;
		for (var i = 0; i < resultArrRevision.length; i++) {
			var revision = resultArrRevision[i];

			// STEP-5635 - Don't include revisions with isNewWorkflow = true, they are in the Product Release table. Don't include revisions created by Product Status Change Maintenance
			// Review: use BC_isNewWorkflow instead, use wf no instead of wf name
			var condNewWFResult = busCondIsNewWorkflow.evaluate(revision);
			var isNewWorkflow = condNewWFResult.isAccepted();
			//STEP-5924 Remove Content Only Updates from the daily Production Release E-mail
			//STEP-5841 added wf==2
			if (isNewWorkflow || revision.getValue("Workflow_No_Initiated").getSimpleValue() == "11" || revision.getValue("Workflow_No_Initiated").getSimpleValue() == "19" || revision.getValue("Workflow_No_Initiated").getSimpleValue() == "2") {
				continue;
			}

			var product = revision.getParent();
			var children = product.getChildren().iterator();
			var SKUs = getSKUs(children);

			var lotNo = bl_library.getLotNumbers(revision, manager);
			var freezerDate = revision.getValue("Freezer_Date_Check").getSimpleValue();
			var shortName = revision.getValue("PRODUCTSHORTNAME").getSimpleValue();
			var prodStatus = revision.getValue("Product_Status").getSimpleValue();
			var prodTeam = revision.getValue("ProdTeam_Planner_Product").getSimpleValue();
			// STEP-5635 Adding dev sci
			var devSci = revision.getValue("DEV_SCI").getSimpleValue();
			var published = revision.getValue("PUBLISHED_YN").getSimpleValue();
			var WorkflowReason = revision.getValue("Workflow_Name_Initiated").getSimpleValue();
			var releaseDate;

			if (WorkflowReason != null) {
				releaseDate = revision.getValue("MakeRevisionEffectiveDate").getSimpleValue();
			} else {
				releaseDate = revision.getValue("DATEPLANNEDRELEASE").getSimpleValue();
			}


			// setting the attribute RELEASE_EMAIL_SENT_YN is moved after the part of Change Status Revisions
			// to not to set it before this part because the revisions are not to select by the query in the next part

			// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableRow   
			var revTableContent = [revision.getName(), shortName, WorkflowReason, lotNo, prodStatus, releaseDate, prodTeam, devSci, published, freezerDate, SKUs];
			var tableRowStyle = (resultRevCount % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
			emailBody += BL_Email.generateHtmlTableRow(revTableContent, tableRowStyle);

			resultRevCount++;
		}
		emailBody += '</table>';

		// ******** products with Status changes ********
		// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableHeading
		emailBody += '<br>' + '<h2> Products with Status Changes </h2>'
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';
		var revisionsPscHeadingContent = ["PRODUCT", "PRODUCT NAME", "REVISION", "PREVIOUS STATUS", "CURRENT STATUS", "AFFECTED LOT #", "SELL OLD STOCK?", "RECALL PRODUCT?", "KITS AFFECTED?",
			"ALTERNATIVE PRODUCTS?", "STATUS CHANGE REASON", "ESTIMATED DATE AVAILABLE", "DISCONTINUATION DATE", "PROD TEAM", "DEV SCI", "PUBLISHED"
		];

		emailBody += BL_Email.generateHtmlTableHeading(revisionsPscHeadingContent);

		var conditionsRevisionPSC = com.stibo.query.condition.Conditions;
		var isSentRevisionPSC = conditionsRevisionPSC.valueOf(manager.getAttributeHome().getAttributeByID("RELEASE_EMAIL_SENT_YN")).eq("N");
		var isProductRevisionPSC = conditionsRevisionPSC.objectType(manager.getObjectTypeHome().getObjectTypeByID("Product_Revision"));
		var isProductKitRevisionPSC = conditionsRevisionPSC.objectType(manager.getObjectTypeHome().getObjectTypeByID("Kit_Revision"));
		var isEquipmentRevisionPSC = conditionsRevisionPSC.objectType(manager.getObjectTypeHome().getObjectTypeByID("Equipment_Revision"));
		var isWfInitiatedPSC = conditionsRevisionPSC.valueOf(manager.getAttributeHome().getAttributeByID("Workflow_No_Initiated")).eq("11");
		var queryHomePSC = manager.getHome(com.stibo.query.home.QueryHome);

		// is Status Changed ?
		var querySpecRevisionPSC = queryHomePSC.queryFor(com.stibo.core.domain.Product).where(isSentRevisionPSC.and(((isProductRevisionPSC).or(isProductKitRevisionPSC).or(isEquipmentRevisionPSC)).and(isWfInitiatedPSC)));

		var resultRevisionPSC = querySpecRevisionPSC.execute();
		var resultArrRevisionPSC = resultRevisionPSC.asList(150).toArray();
		//log.info("Revision with status changed: " + resultArrRevisionPSC.length);

		// STEP-6325 - Sort items on product release report by ProdTeam
		//             Also sort by productno as a second parameter
		// Function function(a, b) decide which one of a or b is greater according to the condistions. 
		// Characters || devided conditions.
		// Fisrst condition is on "ProdTeam_Planner_Product".
		// Second is production number. Comparison will be done alphanumeric (as character) not as number.

		resultArrRevisionPSC.sort(function (a, b) { 
			return a.getValue("ProdTeam_Planner_Product").getSimpleValue().localeCompare(b.getValue("ProdTeam_Planner_Product").getSimpleValue())
			|| a.getValue("PRODUCTNO").getSimpleValue().localeCompare(b.getValue("PRODUCTNO").getSimpleValue());
		})

		for (var i = 0; i < resultArrRevisionPSC.length; i++) {
			var revision = resultArrRevisionPSC[i];

			var prodNo = revision.getValue("PRODUCTNO").getSimpleValue();
			var prodName = revision.getValue("PRODUCTSHORTNAME").getSimpleValue();
			var revName = revision.getName();
			var sellOldStock = revision.getValue("SELLOLDSTOCK_YN").getSimpleValue();
			var recallProduct = revision.getValue("Recall_Product").getSimpleValue();
			var prodStatusReason = revision.getValue("Product_Status_Change_Reason").getSimpleValue();
			var prodTeam = revision.getValue("ProdTeam_Planner_Product").getSimpleValue();
			// STEP-5635 Adding dev sci
			var devSci = revision.getValue("DEV_SCI").getSimpleValue();
			// STEP-5707 Adding published flag
			var publishProduct = revision.getValue("PUBLISHED_YN").getSimpleValue();
			var estAvailableDate = revision.getValue("Estimated_Available_Date").getSimpleValue();
			var plannedPrediscontinuationDate = revision.getValue("PLANNEDDISCONTINUATIONDATE").getSimpleValue();

			// previous Status
			var prevStatus = "";
			var currStatus = "";
			if (revision.getValue("PSC_Abandoned").getSimpleValue()) {
				prevStatus = "Abandoned";
				currStatus = revision.getValue("PSC_Abandoned").getSimpleValue();
			} else if (revision.getValue("PSC_Discontinued").getSimpleValue()) {
				prevStatus = "Discontinued";
				currStatus = revision.getValue("PSC_Discontinued").getSimpleValue();
			} else if (revision.getValue("PSC_InternalUseOnly").getSimpleValue()) {
				prevStatus = "Internal Use Only";
				currStatus = revision.getValue("PSC_InternalUseOnly").getSimpleValue();
			} else if (revision.getValue("PSC_Pending").getSimpleValue()) {
				prevStatus = "Pending";
				currStatus = revision.getValue("PSC_Pending").getSimpleValue();
			} else if (revision.getValue("PSC_Pre-discontinued").getSimpleValue()) {
				prevStatus = "Pre-discontinued";
				currStatus = revision.getValue("PSC_Pre-discontinued").getSimpleValue();
			} else if (revision.getValue("PSC_Released").getSimpleValue()) {
				prevStatus = "Released";
				currStatus = revision.getValue("PSC_Released").getSimpleValue();
			} else if (revision.getValue("PSC_ReleasedOnHold").getSimpleValue()) {
				prevStatus = "Released - On Hold";
				currStatus = revision.getValue("PSC_ReleasedOnHold").getSimpleValue();
			}

			// lot numbers affected	
			var listLotNumbers = "";
			var lotNumbersAffected = revision.getValue("Lot_numbers_affected").getValues();
			for (var ii = 0; ii < lotNumbersAffected.size(); ii++) {
				if (ii > 0) {
					listLotNumbers = listLotNumbers + ", " + lotNumbersAffected.get(ii).getSimpleValue();
				} else {
					listLotNumbers = lotNumbersAffected.get(ii).getSimpleValue();
				}
			}
			// STEP-5635 - if lotNumbersAffected.size() is 0, listLotNumbers will be "" and not null
			if (!listLotNumbers || listLotNumbers == "") {
				listLotNumbers = "None";
			}

			// alternative Products
			//STEP-6396
			var altProdList = "";
			var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ALTERNATE_PRODUCT");
			var refs = revision.queryReferences(refType);
			refs.forEach(function(ref) {
				if (!altProdList || altProdList == "")
					{altProdList = ref.getTarget().getValue("PRODUCTNO").getSimpleValue();}
				else
					{altProdList = altProdList + ", " + ref.getTarget().getValue("PRODUCTNO").getSimpleValue();}
				return true;
			});

			// STEP-5635 - if refs.size() is 0, altProdList will be "" and not null
			if(!altProdList || altProdList == "") {
			altProdList = "No";
			}
			//STEP-6396

			// Kits affected?
			//STEP-6396
			var kitsAffected = "N";
			var parent = revision.getParent()
			var masterStockRefType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_MasterStock")
			var kitRev2SKURefType = manager.getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU")
			var msReferences = parent.queryReferences(masterStockRefType);
			msReferences.forEach(function(msReference) {
				var ms = msReference.getTarget()
				var children = ms.getChildren()
				for (var l = 0; l < children.size(); l++) {
					var byRefs = children.get(l).queryReferencedBy(kitRev2SKURefType);
					byRefs.forEach(function(byRef) {
						var bySource = byRef.getSource();
						if (bySource.getName()) {
							kitsAffected = "Y";
							return false;
						}
						return true;
					});
				}
				return true;
			});
			//STEP-6396

			// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableRow
			var revPscTableContent = [prodNo, prodName, revName, prevStatus, currStatus, listLotNumbers, sellOldStock, recallProduct, kitsAffected, altProdList, prodStatusReason,
				estAvailableDate, plannedPrediscontinuationDate, prodTeam, devSci, publishProduct
			];
			var tableRowStyle = (i % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
			emailBody += BL_Email.generateHtmlTableRow(revPscTableContent, tableRowStyle);

			//STEP-5870
			if (revision.getValue("Sell_in_China_?").getSimpleValue() == "Y" && (currStatus == "Released" || currStatus == "Pending" || currStatus == "Discontinued")) {
				var children = revision.getParent().getChildren().iterator();
				var SKUs = getSKUs(children);

				var tableRowStyle_China = (resultProdCount_China % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				emailBody_China += BL_Email.generateHtmlTableRow([prodNo, prodName, prevStatus, currStatus, publishProduct, SKUs], tableRowStyle_China);
				resultProdCount_China += 1;
			}

			//STEP-5870
			if (revision.getValue("Sell_in_Japan_?").getSimpleValue() == "Y" && (currStatus == "Released" || currStatus == "Pending" || currStatus == "Discontinued")) {
				var children = revision.getParent().getChildren().iterator();
				var SKUs = getSKUs(children);

				var tableRowStyle_Japan = (resultProdCount_Japan % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				emailBody_Japan += BL_Email.generateHtmlTableRow([prodNo, prodName, prevStatus, currStatus, publishProduct, SKUs], tableRowStyle_Japan);
				resultProdCount_Japan += 1;
			}
		}

		emailBody += '</table>';

		// STEP-5870
		emailBody_China += '</table>';
		emailBody_Japan += '</table>';


		// ******** custom products ********
		// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableHeading
		emailBody += '<br>' + '<h2> Custom Products </h2>';
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

		var customProdHeadingContent = ["PRODUCT", "PRODUCT NAME", "LOT NUMBER", "STATUS", "PROD TEAM", "DEV SCI", "PUBLISHED", "SIZES"];
		emailBody += BL_Email.generateHtmlTableHeading(customProdHeadingContent);

		for (var i = 0; i < resultArr.length; i++) {
			var product = resultArr[i];
			var children = product.getChildren().iterator();
			var SKUs = getSKUs(children);

			var curRefs = product.queryReferences(curRefRefType); //STEP-6396

			var prodShortName;
			var lotNumbers;
			var curTarget;
			var revNo;
			var devSci;

			curRefs.forEach(function(ref) {	//STEP-6396
                    curTarget = ref.getTarget();//STEP-6396
				prodShortName = curTarget.getValue("PRODUCTSHORTNAME").getSimpleValue();
				lotNumbers = bl_library.getLotNumbers(curTarget, manager);
				// STEP-5635 Adding dev sci
				devSci = curTarget.getValue("DEV_SCI").getSimpleValue();
				revNo = curTarget.getValue("REVISIONNO").getSimpleValue();
				return true; //STEP-6396
			});

			var condCustomProdResult = busCondCustomProd.evaluate(curTarget);

			if (revNo == 1 && curTarget.getValue("RELEASE_EMAIL_SENT_YN").getSimpleValue() == "N" && condCustomProdResult.isAccepted()) {
				// Create a message body for a custom product
				var prodNo = product.getValue("PRODUCTNO").getSimpleValue();
				var prodStatus = product.getValue("Product_Status").getSimpleValue();
				var prodTeam = product.getValue("ProdTeam_Planner_Product").getSimpleValue();
				var published = product.getValue("PUBLISHED_YN").getSimpleValue();

				// STEP-5635 Adding dev sci, refactor to use common function BL_Email.generateHtmlTableRow
				var customProdTableContent = [prodNo, prodShortName, lotNumbers, prodStatus, prodTeam, devSci, published, SKUs];
				var tableRowStyle = (i % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				emailBody += BL_Email.generateHtmlTableRow(customProdTableContent, tableRowStyle);
			}
		}

		emailBody += '</table>';

		// ******** component workflow ********
		emailBody += '<br>' + '<h2> Components </h2>';
		emailBody += '<table border="1" style="width:100%; border:1px solid black; border-collapse:collapse; background-color:#f1f1f1">';

		var customProdHeadingContent = ["PRODUCT", "PRODUCT NAME", "LOT NUMBER", "STATUS", "PROD TEAM", "DEV SCI", "PUBLISHED", "SIZES"];
		emailBody += BL_Email.generateHtmlTableHeading(customProdHeadingContent);

		for (var i = 0; i < resultArr.length; i++) {
			var product = resultArr[i];
			var children = product.getChildren().iterator();
			var SKUs = getSKUs(children);

			var curRefs = product.queryReferences(curRefRefType); //STEP-6396

			var prodShortName;
			var lotNumbers;
			var curTarget;
			var revNo;
			var devSci;

			curRefs.forEach(function(ref) {	//STEP-6396
                    curTarget = ref.getTarget();//STEP-6396
				prodShortName = curTarget.getValue("PRODUCTSHORTNAME").getSimpleValue();
				lotNumbers = bl_library.getLotNumbers(curTarget, manager);
				devSci = curTarget.getValue("DEV_SCI").getSimpleValue();
				revNo = curTarget.getValue("REVISIONNO").getSimpleValue();
				return true; //STEP-6396
			});

			var condComponentWFResult = busCondComponentWF.evaluate(curTarget);

			if (revNo == 1 && curTarget.getValue("RELEASE_EMAIL_SENT_YN").getSimpleValue() == "N" && condComponentWFResult.isAccepted()) {
				var prodNo = product.getValue("PRODUCTNO").getSimpleValue();
				var prodStatus = product.getValue("Product_Status").getSimpleValue();
				var prodTeam = product.getValue("ProdTeam_Planner_Product").getSimpleValue();
				var published = product.getValue("PUBLISHED_YN").getSimpleValue();
				var customProdTableContent = [prodNo, prodShortName, lotNumbers, prodStatus, prodTeam, devSci, published, SKUs];
				var tableRowStyle = (i % 2 == 0) ? 'style="background-color:#eaeaea"' : 'style="background-color: #fdfdfd"';
				emailBody += BL_Email.generateHtmlTableRow(customProdTableContent, tableRowStyle);
			}
		}

		emailBody += '</table>';

		// change Release Email Sent YN Flag for all revisions
		for (var i = 0; i < resultArrRevision.length; i++) {
			var revision = resultArrRevision[i];
			revision.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("Y");

			// Approve the revision after tthe change on the RELEASE_EMAIL_SENT_YN flag from "N" to "Y"
			var currentObjectID = "Node ID: " + revision.getID() + " Node Object ID: " + revision.getObjectType().getID();

			try {
				revision.approve();
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


		// change Release Email Sent YN Flag for all current revisions of the new product
		for (var i = 0; i < resultArr.length; i++) {
			var product = resultArr[i];
			//log.info(product.getValue("PRODUCTNO").getSimpleValue());
			var curRefs = product.queryReferences(curRefRefType); //STEP-6396

			//STEP-6396
			var curTarget
			curRefs.forEach(function(ref) {
				curTarget = ref.getTarget();
				return true;
			});
			//STEP-6396

			if (curTarget.getValue("RELEASE_EMAIL_SENT_YN").getSimpleValue() == "N") {
				// Change the Release Email Sent YN Flag on the current revision
				curTarget.getValue("RELEASE_EMAIL_SENT_YN").setSimpleValue("Y");

				// Approve the revision upon change of the attribute
				var currentObjectID = "Node ID: " + curTarget.getID() + " Node Object ID: " + curTarget.getObjectType().getID();

				try {
					curTarget.approve();
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

		// Adding a footnote
		//STEP-6027
		/*var hostname = java.net.InetAddress.getLocalHost().getHostName();
		
		emailBody += '<br>';
		emailBody += '<hr>'
		emailBody += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>';*/
		//END STEP-6027

		// STEP-5635 Format email if there were no product/revision updates
		var numberOfReports = resultProdCount + resultRevCount + resultArrRevisionPSC.length;
		log.info("number of product in the daily digest email: " + numberOfReports);
		if (numberOfReports == 0) {
			emailBody = CSTLogo;
			emailBody += '<h2> Please note, there were no product status changes or revisions released today. </h2>';
			//STEP-6027
			/*emailBody += '<br>' + '<hr>';
			emailBody += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>';*/
			//END STEP-6027
		}

		// STEP-6205 email footer disclaimer
		// emailBody += '<br><p>Disclaimer: This email is not intended to be forwarded to recipients outside of CST. If you are not an intended recipient please notify <a href="mailto:stepprod@cellsignal.com">stepprod@cellsignal.com</a> so that an effort can be made to remove your email address from the distribution list.</p>';

		// Sending an email
		// STEP-5944 use common function email sending
		var subject;
		// STEP-5635 Format subject if there were no product/revision updated
		if (numberOfReports != 0) {
			subject = "PRODUCT RELEASE Report " + today;
		} else {
			subject = "No Product Updates on " + today;
		}
		if (!rollbackChanges)
			BL_Email.sendEmail(mailHome.mail(), recipientsEmails, subject, emailBody);
		else
			sendToTestUsers(mailHome, recipientsEmails_Step_Admin, subject, emailBody);
		// STEP-5944 ends

		// STEP-5870
		if (resultProdCount_Japan > 0) {
			//STEP-6027
			/*emailBody_Japan += '<br>';
			emailBody_Japan += '<hr>';
			emailBody_Japan += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>';*/
			//END STEP-6027

			// STEP-5944 use common function email sending
			var subject = "US Status Change Report " + today;
			if (!rollbackChanges)
				BL_Email.sendEmail(mailHome.mail(), recipientsEmails_Japan, subject, emailBody_Japan);
			else
				sendToTestUsers(mailHome, recipientsEmails_Step_Admin, subject, emailBody_Japan);
			// STEP-5944 ends
		}

		// STEP-5870
		if (resultProdCount_China > 0) {
			//STEP-6027
			/*emailBody_China += '<br>';
			emailBody_China += '<hr>';
			emailBody_China += '<p style="text-align:center"><sup>© 2021  Cell Signaling Technology, Inc. | Generated from STEP ' + hostname + '</sup></p>';*/
			//END STEP-6027

			// STEP-5944 use common function email sending
			var subject = "US Status Change Report " + today;
			if (!rollbackChanges)
				BL_Email.sendEmail(mailHome.mail(), recipientsEmails_China, subject, emailBody_China);
			else
				sendToTestUsers(mailHome, recipientsEmails_Step_Admin, subject, emailBody_China);
			// STEP-5944 ends
		}
	} catch (error) {
		if (rollbackChanges)
			if (subject == null)
				subject = businessRule;
		sendError(mailHome, recipientsEmails_Step_Admin, subject, error);
		throw error;
	}
	if (rollbackChanges) {
		throw 'error';
	}
}

function getSKUs(children) {
	var skusArray = [];

	while (children.hasNext()) {
		var child = children.next();

		if (child.getObjectType().getID() == "SKU" && child.getValue("ItemCode").getSimpleValue()) {
			skusArray.push(child.getValue("ItemCode").getSimpleValue());
		} else {
			var grandchildren = child.getChildren().iterator();

			while (grandchildren.hasNext()) {
				var grandchild = grandchildren.next();

				if (grandchild.getObjectType().getID() == "SKU" && grandchild.getValue("ItemCode").getSimpleValue()) {
					skusArray.push(grandchild.getValue("ItemCode").getSimpleValue());
				}
			}
		}
	}

	return skusArray.sort().join(',');
}

function sendError(mailHome, recipientsEmails_Step_Admin, subject, error) {
	BL_Email.sendEmail(mailHome.mail(), recipientsEmails_Step_Admin, "Error happened in " + subject, error.toString() + "<br>" + error.stack);
}

function sendToTestUsers(mailHome, recipientsEmails_Step_Admin, subject, body) {
	BL_Email.sendEmail(mailHome.mail(), recipientsEmails_Step_Admin, "BR_CHECK: " + subject, body);
}

//STEP-6666
/**
 * @desc To update Derivate Products reference for a product
 * @param manager STEP manager
 * @param node Revision to update
 */
 function updateDerivativeProducts(step, node) {
    //Getting all Lot_Clone_ID values for the current revision lots
    var product = node.getParent();
    var productApprovalStatus = product.getApprovalStatus();
	var lotObjectRefs = bl_library.getReferences(node, "ProductRevision_to_Lot");
	var productLotCloneIDs = [];
	lotObjectRefs.forEach(function loop(lotObjectRef) {
		var cloneID = lotObjectRef.getTarget().getValue("Lot_Clone_ID").getSimpleValue();
		if(cloneID) productLotCloneIDs.push(cloneID);
		return true;
	});
	if(productLotCloneIDs.length == 0) return;

    var BA_Approve = step.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_Approve");
	
	//Removing current product from existing derivative products
	var existingDerivativeProducts = bl_library.getReferences(product, "Derivative_Products");
	existingDerivativeProducts.forEach(function loop1(derivativeProductRef) {
		var derivativeProduct = derivativeProductRef.getTarget();
		var derivativeProductApprovalStatus = derivativeProduct.getApprovalStatus();

        derivativeProductRefs = bl_library.getReferences(derivativeProduct, "Derivative_Products");
        derivativeProductRefs.forEach(function loop2(ref) {
            if(ref.getTarget().getID() == product.getID()) {
                ref.delete();
                return false;
            }    
            return true;
        });
		if(derivativeProductApprovalStatus == "Completely Approved")
            BA_Approve.execute(derivativeProduct);
		return true;
	});
	
	//Removing all existing derivative products references
	bl_maintenancewWFs.deleteReferences(step, product, ["Derivative_Products"]);
    
	//Finding all derivative products based on the Lot_Clone_ID value
	productLotCloneIDs.forEach(function loop1(productLotCloneID) {
		var queryHome = step.getHome(com.stibo.query.home.QueryHome);
		var conditions = com.stibo.query.condition.Conditions;
		var objectType = conditions.objectType(step.getObjectTypeHome().getObjectTypeByID​("Lot"));
		var lotCloneID = conditions.valueOf(step.getAttributeHome().getAttributeByID("Lot_Clone_ID")).eq(productLotCloneID);
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(lotCloneID.and(objectType));
		var lotsResult = querySpecification.execute();

		lotsResult.forEach(function loop2(lot) {
			var lotRefs = lot.queryReferencedBy(step.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot"));
			lotRefs.forEach(function loop3(lotRef) {
				rev = lotRef.getSource();
				if(!rev || rev.getValue("Workflow_Name_Initiated").getSimpleValue() == "NPI"
                    || rev.getParent().getID() == product.getID()) return true;
				derivativeProduct = rev.getParent();
				
				try {
					product.createReference(derivativeProduct, "Derivative_Products");
				}catch(err) {
					if(err.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException) {
						log.info(derivativeProduct.getID() + " already referenced for " + product.getID());	
					}
					else throw err;
				}
				try {
                    	var derivativeProductApprovalStatus = derivativeProduct.getApprovalStatus();
					derivativeProduct.createReference(product, "Derivative_Products");
					if(derivativeProductApprovalStatus == "Completely Approved")
                        		BA_Approve.execute(derivativeProduct);
				}catch(err) {
					if(err.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException) {
						log.info(product.getID() + " already referenced for " + derivativeProduct.getID());
					}
					else throw err;
				}
				return true;
			});
			return true;
		});
		return true;
	});
	
	if(productApprovalStatus == "Completely Approved")
     	BA_Approve.execute(product);
}

/*
 * STEP-6734
 * @desc Node is input to the BR. It coud be Product, Equipment and Product Kit
 * @param node {string} ID of the product, or Equipment, or Product Kit
 */

function updateProductsToKit(node){

	// Set variable
	var manager = node.getManager();
	var BA_Approve = manager.getHome(com.stibo.core.domain.businessrule.BusinessRuleHome).getBusinessActionByID("BA_Approve");
	var nodeStatus = node.getApprovalStatus();
	var kitStatus;
	
	// Remove all kit references
	bl_maintenancewWFs.deleteReferences(manager, node, ["Product_To_Kit"]);
	
	// Add all kit references 
	var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Product_To_SKU");
	var refsSku = node.queryReferences(refType);

	refsSku.forEach(function(refSku) { 
		var sku = refSku.getTarget();
		refType = node.getManager().getReferenceTypeHome().getReferenceTypeByID("KitRevision_to_SKU");
		var refsByKitRev = sku.queryReferencedBy(refType);

		refsByKitRev.forEach(function(refKitRev) {
			var kitRev = refKitRev.getSource();
			var productKit = kitRev.getParent();
			kitStatus = productKit.getApprovalStatus();
			
			try {	
				node.createReference(productKit, "Product_To_Kit");	
			} catch(err) {
				if(err.javaException instanceof com.stibo.core.domain.reference.TargetAlreadyReferencedException) {
					log.info(productKit.getID() + " already referenced for " + node.getID());	
				}
				else throw err;
			}
			// Approve reference targe tobject 
			if(kitStatus == "Completely Approved")
	     		BA_Approve.execute(productKit);
			return true;	
		})
		return true;	
	})

	// Approve source object 
	if(nodeStatus == "Completely Approved")
     	BA_Approve.execute(node);
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.productRelease = productRelease
exports.bulkProductRelease = bulkProductRelease
exports.revisionRelease = revisionRelease
exports.bulkRevisionRelease = bulkRevisionRelease
exports.sendDailyDigest = sendDailyDigest
exports.getSKUs = getSKUs
exports.sendError = sendError
exports.sendToTestUsers = sendToTestUsers
exports.updateDerivativeProducts = updateDerivativeProducts
exports.updateProductsToKit = updateProductsToKit