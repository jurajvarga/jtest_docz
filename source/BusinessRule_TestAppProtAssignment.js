/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "TestAppProtAssignment",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "TestAppProtAssignment",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Library",
    "libraryAlias" : "Lib"
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger,step,Lib) {
/*var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
logger.info(" Product No "+nProduct);
 
 var pLatestRevisiion = Lib.getLatestRevision(node);

 logger.info(" pLatestRevisiion "+pLatestRevisiion);
  if (pLatestRevisiion) {
      //Published_Product_Images
      var lstApplication = new java.util.ArrayList();
      refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("Revision_to_ApplicationProtocol");
      refLinks = pLatestRevisiion.getClassificationProductLinks().get(refType);

      logger.info(" refLinks.size "+refLinks.size());
      if (refLinks != null && refLinks.size() > 0) {
         //Lot_To_ApplicationProtocol
      /*   for (var i = 0; i < refLinks.size(); i++) {
            var refLink = refLinks.get(i);
            var cProtocol = refLink.getClassification();
            var sApplication = cProtocol.getValue("APPLICATIONABBR").getSimpleValue();
            if (!lstApplication.contains(sApplication))
               lstApplication.add(sApplication);
         }*/

       /*refType = step.getReferenceTypeHome().getReferenceTypeByID("Published_Product_Images");
         if (refType != null) {
            var refLinks = pLatestRevisiion.getReferences(refType);
            for (var i = 0; i < refLinks.size() > 0; i++) {
               var aImage = refLinks.get(i).getTarget();
               var aApplicationType = aImage.getValue("Figure_Image_Application_Type").getSimpleValue();
               if (lstApplication.contains(aApplicationType)) {
                  pRevision.createReference(aImage, "Published_Product_Images");
               }

            }
         }*
      }
   }*/

   var nProduct = node.getValue("PRODUCTNO").getSimpleValue();
 var pProduct;
  var bNewProduct = node.getValue("NewProductFlag_YN").getSimpleValue();
    if (bNewProduct && bNewProduct == "Y") {
      log.info("--->pProduct");
      //var pSubCategory = step.getProductHome().getProductByID("Primary_Antibodies");
      if (bKit)
         pProduct = pSubCategory.createProduct(null, "Product_Kit");
      else
         pProduct = pSubCategory.createProduct(null, "Product");
      log.info(pProduct);
      pProduct.getValue("PRODUCTNO").setSimpleValue(nProduct);
    }

       var pRevision;
   var bNewRevision = node.getValue("NewRevisionFlag_YN").getSimpleValue();
   var nRevision = node.getValue("REVISIONNO").getSimpleValue();
   log.info("nRevision-->" + nRevision + " NewRevisionFlag_YN " + bNewRevision);
   if (bNewRevision && bNewRevision == "Y") {
      if (bKit) {
         pRevision = pProduct.createProduct(null, "Kit_Revision");
         //set Product # and Revision #
         pRevision.getValue("KITITEMNO").setSimpleValue(nProduct);
      } else {
               log.info("createProduct Product_Revision -->" + nRevision);

         pRevision = pProduct.createProduct(null, "Product_Revision");

         log.info("createProduct Product_Revision pRevision -->" + pRevision);

         //set Product # and Revision #
         pRevision.getValue("PRODUCTNO").setSimpleValue(nProduct);
      }
   }
     var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
      var type = com.stibo.core.domain.Classification;
      var searchAttribute = step.getAttributeHome().getAttributeByID("Figure_Key");
      var searchValue=8823;
      var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
      var lstProdFolderClass = searchHome.querySingleAttribute(query).asList(1).toArray();

     if (lstProdFolderClass!=null) {
         var prodFolderObj=lstProdFolderClass[0];
       
         log.info(" No Latest Revision  prodFolderObj "+prodFolderObj);
              if (typeof prodFolderObj !== 'undefined') {
	         var refType = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product_Revision");
	         var refs = pRevision.getReferences().get(refType);
			log.info(" No Latest Revision  refs "+refs.size());
	         if (refs.size() == 0){
	             pRevision.createReference(prodFolderObj, "Product_Folder_To_Product_Revision");
	         }
	
	         var refTypePr = step.getReferenceTypeHome().getReferenceTypeByID("Product_Folder_To_Product");
	         var refsPr = pProduct.getReferences().get(refTypePr);
	         log.info(" No Latest Revision  refsPr "+refsPr.size());
	         if (refsPr.size() == 0){
	             pProduct.createReference(prodFolderObj, "Product_Folder_To_Product");
	         }
         }
      }
}