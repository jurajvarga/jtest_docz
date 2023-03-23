/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Unit_Abbreviation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "BA_Unit_Abbreviation",
  "description" : "Gets Unit Abbreviations",
  "scope" : "Global",
  "validObjectTypes" : [ "MasterStock", "SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,step,logger) {
// MarketQuantityUnitAbbreviation
// node = Current Object
// logger = Logger
// validity: SKU

function getAbbrev(searchValue, searchBelowRootID, returnAttributeID) {
    var searchHome = step.getHome(com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome);
    var type = com.stibo.core.domain.entity.Entity;
    var searchAttribute = step.getAttributeHome().getAttributeByID("Description");

    if (!searchAttribute) {
        throw "Description attribute not found";
    }

    var query = new com.stibo.core.domain.singleattributequery.SingleAttributeQueryHome.SingleAttributeQuerySpecification(type, searchAttribute, searchValue);
    var belowNode = step.getEntityHome().getEntityByID(searchBelowRootID);

    if (!belowNode) {
        throw searchBelowRootID + " not found";
    }

    query.root = belowNode;

    var lstAssignment = searchHome.querySingleAttribute(query).asList(100).toArray();
    if (lstAssignment.length > 0) {

        //log.info("--- getAbbrev result: " + lstAssignment[0].getValue(returnAttributeID).getSimpleValue());
        return lstAssignment[0].getValue(returnAttributeID).getSimpleValue();
    }
    return null;
}

function lookupAbbreviation(searchAttributeID, searchBelowRootID, returnAttributeID, targetAttributeID) {

    var searchValue = node.getValue(searchAttributeID).getSimpleValue();
    // log.info("searchValue: " + searchValue);

    if (searchValue) {

        var abbrevValue = getAbbrev(searchValue, searchBelowRootID, returnAttributeID);

         //Reverted the code to fix the unit abbreviation missing in XML 2.0
        /*  if (!abbrevValue) {
  
              abbrevValue = "";
          }
        */
        if (abbrevValue == null || abbrevValue.length() == 0) {
            abbrevValue = searchValue;
        }
        //log.info("abbrevValue: " + abbrevValue);
        var valueObject = node.getValue(targetAttributeID);
        var currentValue = valueObject.getSimpleValue();

        if (abbrevValue.equals(currentValue)) {

            /*logger.info("Got " + node.getID() + " " + valueObject.getAttribute().getID() +
                " unchanged abbreviation: " + abbrevValue); // Why is abbreviation such a long word?
           logger.info("-------");*/
        } else {

            valueObject.setSimpleValue(abbrevValue);
            /* logger.info("Set " + node.getID() + " " + valueObject.getAttribute().getID() +
                " to: " + abbrevValue + "; was " + (currentValue == null || currentValue.length() == 0 ? "empty" : currentValue));
             logger.info("-------");*/
        }
    }
}

lookupAbbreviation("MKTGQTYUNITS", "Marketing_Quantity_Units", "Unicode_Abbreviation", "Marketing_Qty_Units_Uni_Abbrev");

lookupAbbreviation("MKTGQTYUNITS", "Marketing_Quantity_Units", "Text_Abbreviation", "Marketing_Qty_Units_Txt_Abbrev");

lookupAbbreviation("UOM_BASE", "Base_Unit_Of_Measure", "Unicode_Abbreviation", "Base_UOM_Uni_Abbrev");

lookupAbbreviation("UOM_BASE", "Base_Unit_Of_Measure", "Text_Abbreviation", "Base_UOM_Txt_Abbrev");

lookupAbbreviation("TESTCOUNT", "Test_Count", "Unicode_Abbreviation", "Test_Count_Uni_Abbrev");
}