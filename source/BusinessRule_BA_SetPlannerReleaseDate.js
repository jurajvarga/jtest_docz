/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetPlannerReleaseDate",
  "type" : "BusinessAction",
  "setupGroups" : [ "BRG_ProductCreation" ],
  "name" : "Set Planner Release Date",
  "description" : "Set Release Date 1st or 3rd Wed, for Product Creation Workflow",
  "scope" : "Global",
  "validObjectTypes" : [ "Equipment", "Product", "Product_Kit", "Service_Conjugates" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
function getWednesdays(month, year) {
   //log.info("getWednesdays: "+month+","+year);
   var d = new Date();
   d.setYear(year);
   // Note: set the month and day together. If you change the month first and the resulting date is not valid
   // e.g. 30th of February, JavaScript will "fix" it for you by bumping it up to March...
   d.setMonth(month, 1);
   //var month = d.getMonth();
   var wednesdays = [];
   while (d.getDay() !== 3) {
      //log.info("getWednesdays d.getDay(): "+d.getDay());
      d.setDate(d.getDate() + 1);
   }

   // Get all the other Wednesdays in the month
   while (d.getMonth() === month) {
      wednesdays.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 7);
   }
   //log.info("================");
   //for (var i = 0; i < wednesdays.length; i++) {
   //   var wednesday = wednesdays[i];
   //   log.info(wednesday);
   //}
   //log.info("================");
   return wednesdays;
}

var dtPlannerRelease;
var today= new Date();
//today = new Date(2016, 8, 22);
log.info("today = " + today);
var daysBuffer = 5;

var lstWednesday = getWednesdays(today.getMonth(), today.getFullYear());
var firstWednesday = lstWednesday[0];
var thirdWednesday = lstWednesday[2];
//log.info("lstWednesday[0] = "+lstWednesday[0]+ " lstWednesday[2] = "+lstWednesday[2]);

var day = parseInt(today.getDate(), 10);
log.info("today.getDate() = "+today.getDate()+ " day = "+day);

if ((day + daysBuffer) <= parseInt(firstWednesday.getDate(), 10)) {
   //log.info("1st " + firstWednesday);
   dtPlannerRelease = firstWednesday;
} else if ((day + daysBuffer) <= parseInt(thirdWednesday.getDate(), 10)) {
   //log.info("3rd " + thirdWednesday);
   dtPlannerRelease = thirdWednesday;
} else {
   var lastDay;
   if (today.getMonth() == 11) {         // December (zero relative!)
      lastDay = 31;
      lstWednesday = getWednesdays(0, today.getFullYear() + 1);
   } else {
      // Note: getMonth() is zero relative. The +2 below indicates that we want the next month as a cardinal number. 
      lastDay = new Date(today.getFullYear(), today.getMonth()+2, 0).getDate();
      lstWednesday = getWednesdays(today.getMonth()+1, today.getFullYear());
   }
   //log.info("lastDay " + lastDay)

   dtPlannerRelease = (((lastDay - day) + parseInt(lstWednesday[0].getDate(), 10)) >= daysBuffer) ? lstWednesday[0] : lstWednesday[2];
}
//log.info("ISO Date -"+ dtPlannerRelease.toISOString().slice(0,10));
var sPlannerRelease = dtPlannerRelease.toISOString().slice(0,10);//dtPlannerRelease.getMonth()+1 +"/" + dtPlannerRelease.getDate() +"/"+dtPlannerRelease.getFullYear();
log.info(sPlannerRelease);
node.getValue("DATEPLANNEDRELEASE").setSimpleValue(sPlannerRelease);
/*
var deadlineTime = dtPlannerRelease;
deadlineTime.setDate(deadlineTime.getDate() - 1);
deadlineTime.setHours(0);
deadlineTime.setMinutes(0);
deadlineTime.setSeconds(0);
deadlineTime.setMilliseconds(0);
log.info("deadlineTime" + deadlineTime);
node.getTaskByID("Product_SKU_Creation", "Release").setDeadline(deadlineTime);
log.info("deadline: " + node.getTaskByID("Product_SKU_Creation", "Release").getDeadline());*/
}