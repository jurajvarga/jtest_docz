/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Joiner",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "BL_Joiner",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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
function join(joinerSource, joinerResult, messageGroup, category) {
    var seen = [];
    var first = true;

    joinerResult.appendToMessage("{\"" + category + "\":[");    
    while (joinerSource.hasNext(messageGroup)) {
        var messageString = joinerSource.getNextMessage(messageGroup);
        var hash = messageString.hashCode();
        if (seen.indexOf(hash) == -1) {
            seen.push(hash);
            if (first) {
                first = false;
            } else {
                joinerResult.appendToMessage(",");
            }
            joinerResult.appendToMessage(messageString);
        }
    }
    joinerResult.appendToMessage("]}");

    return joinerResult;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.join = join