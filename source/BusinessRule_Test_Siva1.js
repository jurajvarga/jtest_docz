/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "Test_Siva1",
  "type" : "BusinessAction",
  "setupGroups" : [ "Test_Business_Rules" ],
  "name" : "Test_Siva1",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,logger,Lib) {
/*var nLatestVersion = -1
  var pLatestRevisionMap=new Object();
   var revision=node
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_To_MasterStock")
    var msRef = revision.getReferences().get(refType)
    var masterStock = msRef.get(0).getTarget()
    var byRefsItr = masterStock.getReferencedBy().iterator()
   // var revisions = new java.util.ArrayList()
    while (byRefsItr.hasNext()) {
        var byRef = byRefsItr.next();
        if (byRef.getReferenceTypeString().equals("ProductRevision_To_MasterStock")) {
        	  var msRevision=byRef.getSource()
        	  log.info(msRevision)
            //revisions.add(msRevision)
            if (msRevision){
            	var pRevtoTechTranType = manager.getReferenceTypeHome().getReferenceTypeByID("ProductRevision_to_Lot");
   			var pTechTranLinks = msRevision.getProductReferences().get(pRevtoTechTranType);
   			if ( pTechTranLinks.size()>0){
	   			for (var i = 0; i < pTechTranLinks.size(); i++) {
				        var msRevLot=pTechTranLinks.get(i).getTarget();
				        log.info(msRevLot);
						
						var nVersion = parseInt(msRevLot.getValue("LOTNO").getSimpleValue(),10);
						log.info("nVersion "+nVersion );	
						var	existRevision=pLatestRevisionMap[nVersion];
						log.info("existRevision "+existRevision );
						if (typeof existRevision == 'undefined') {
				            if (nVersion > nLatestVersion) {
				                nLatestVersion = nVersion
				                pLatestRevsion = msRevision
	
				                pLatestRevisionMap[nLatestVersion]=pLatestRevsion
				            }
					    }else{
					    	  nLatestVersion = nVersion
					    	  var nCurrRevVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(),10);
					    	  var nExistRevVersion= parseInt(existRevision.getValue("REVISIONNO").getSimpleValue(),10);
					    	  log.info("nCurrRevVersion "+nCurrRevVersion );
					    	  log.info("nExistRevVersion "+nExistRevVersion );
				            if (nCurrRevVersion > nExistRevVersion) {
				              
				                pLatestRevisionMap[nLatestVersion]=msRevision
				            }
					    	
					    	}
				 }
   			}else{
   				         var nVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(),10);
						log.info("nVersion "+nVersion );	
						log.info("nLatestVersion "+nLatestVersion );	
						var	existRevision=pLatestRevisionMap[nVersion];
						log.info("existRevision "+existRevision );
						if (typeof existRevision == 'undefined') {
				            if (nVersion > nLatestVersion) {
				                nLatestVersion = nVersion
				                pLatestRevsion = msRevision
	
				                pLatestRevisionMap[nLatestVersion]=pLatestRevsion
				            }
					    }else{
					    	  nLatestVersion = nVersion
					    	  var nCurrRevVersion = parseInt(msRevision.getValue("REVISIONNO").getSimpleValue(),10);
					    	  var nExistRevVersion= parseInt(existRevision.getValue("REVISIONNO").getSimpleValue(),10);
					    	  log.info("nCurrRevVersion "+nCurrRevVersion );
					    	  log.info("nExistRevVersion "+nExistRevVersion );
				            if (nCurrRevVersion > nExistRevVersion) {
				              
				                pLatestRevisionMap[nLatestVersion]=msRevision
				            }
					    	
					    	}
   				}
    
          
            }
        }
    }

      for (var key in pLatestRevisionMap) {
       
        var revObj = pLatestRevisionMap[key];

        log.info(" key "+key+ " value = "+revObj.getID());
      }

      log.info (" nLatestVersion "+nLatestVersion+" pLatestRevsion = "+pLatestRevsion.getID());
   var nLatestVersion = -1
    var pLatestRevsion = null;
    for(var i = 0; i<revisions.size(); i++) {
        var pRevision = revisions.get(i)
        var sObjectType = pRevision.getObjectType().getID()
        if (sObjectType =="Product_Revision" || sObjectType == "Kit_Revision" || sObjectType == "Equipment_Revision") {
            var nVersion = parseInt(pRevision.getValue("REVISIONNO").getSimpleValue(),10);
            if (nVersion > nLatestVersion) {
                nLatestVersion = nVersion
                pLatestRevsion = pRevision
            }
        }
    }
    return pLatestRevsion
}*/

var parentObject;
    var inparentObjectID;
    var instanceid = node.getValue("Audit_InstanceID").getSimpleValue();
 logger.info( instanceid);
    var searchHome = manager.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.Product;
    var searchAttribute = manager.getAttributeHome().getAttributeByID("Audit_InstanceID");
    var searchValue = instanceid;
    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
    var lstParentObjClass = searchHome.querySingleAttribute(query).asList(10).toArray();
    if (lstParentObjClass != null) {
    	for (var i=0;i<lstParentObjClass.length;i++){
        parentObject = lstParentObjClass[i];
        if (typeof parentObject !== 'undefined') {
        	  logger.info( parentObject.getObjectType().getID());
            logger.info( parentObject.getID());
        }
    	}
    }
}