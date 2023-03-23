/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Approved"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_testWednesdayDeadline",
  "type" : "BusinessAction",
  "setupGroups" : [ "Actions" ],
  "name" : "BA_testWednesdayDeadline",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
	var d = new Date();
	d.setYear(year);
	d.setMonth(month);
	d.setDate(1);
	//var month = d.getMonth();
	var wednesdays = [];
	while (d.getDay() !== 3) {
		d.setDate(d.getDate() + 1);
	}

	// Get all the other Wednesdays in the month
	while (d.getMonth() === month) {
		wednesdays.push(new Date(d.getTime()));
		d.setDate(d.getDate() + 7);
	}
	/*log.info("================");
	for (var i = 0; i < wednesdays.length; i++) {
		var wednesday = wednesdays[i];
		log.info(wednesday);
	}
	log.info("================");*/

	return wednesdays;
}
var dtPlannerRelease;
var today= new Date();
//today = new Date(2016, 8, 22);
//log.info("today ==> " + today);
var daysBuffer = 5;

var lstWednesday = getWednesdays(today.getMonth(), today.getFullYear());
var firstWednesday = lstWednesday[0];
var thirdWednesday = lstWednesday[2];

var day = parseInt(today.getDate(), 10);
if ((day + daysBuffer) <= parseInt(firstWednesday.getDate(), 10)) {
	//log.info("1st " + firstWednesday);
	dtPlannerRelease = firstWednesday;
} else if ((day + daysBuffer) <= parseInt(thirdWednesday.getDate(), 10)) {
	//log.info("3rd " + thirdWednesday);
	dtPlannerRelease = thirdWednesday;
} else {
	var lastDay;
	if (today.getMonth() == 11) {
		lastDay = 31;
		lstWednesday = getWednesdays(0, today.getFullYear() + 1);
	} else {
		lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
		lstWednesday = getWednesdays(today.getMonth() + 1, today.getFullYear());
	}
	//log.info("lastDay " + lastDay)

	if (((lastDay - day) + parseInt(lstWednesday[0].getDate(), 10)) >= daysBuffer) {
		//log.info("new year 1st " + lstWednesday[0]);
		dtPlannerRelease = lstWednesday[0];
	} else {
		//log.info("new year 3rd " + lstWednesday[2]);
		dtPlannerRelease = lstWednesday[2];
	}
}
//log.info(dtPlannerRelease);
var sPlannerRelease = dtPlannerRelease.getMonth()+1 +"/" + dtPlannerRelease.getDate() +"/"+dtPlannerRelease.getFullYear();
log.info(sPlannerRelease);
node.getValue("DATEPLANNEDRELEASE").setSimpleValue(sPlannerRelease);

var deadlineTime = dtPlannerRelease;
deadlineTime.setDate(deadlineTime.getDate() - 1);
deadlineTime.setHours(0);
deadlineTime.setMinutes(0);
deadlineTime.setSeconds(0);
deadlineTime.setMilliseconds(0);

node.getTaskByID("Product_SKU_Creation", "Release").setDeadline(deadlineTime);
log.info("deadline: " + node.getTaskByID("Product_SKU_Creation", "Release").getDeadline());
}