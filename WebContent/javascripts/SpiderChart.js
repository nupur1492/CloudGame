"use strict";
	

var CANVAS_WIDTH = 1200;
var CANVAS_HEIGHT = 850;
var radarChartData = null;
var myRadarChart = null;
var mode = 0; // 0: chart (start), 1: questions, 2: chart
//var canvasChart = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");

//var chart = canvasChart.get(0).getContext("2d");
var canvasChart;
//console.log(canvasChart);
var chart;
var clouds;
var QAs;
var qDtails = [];

var tea = "rgba(100, 120, 0,";
var blue = "rgba(0, 120, 255,";
var red = "rgba(255, 0, 0,";
var black = "rgba(50,50,50,";
var green = "rgba(0,180,0,";
var purple = "rgba(255,0,255,";


$(document).ready(function() {
	canvasChart = document.getElementById("canvasChart");
	chart = canvasChart.getContext("2d");
	var pcs = sessionStorage.getItem('pieces');
	clouds = $.parseJSON(pcs);
	pcs = sessionStorage.getItem('QA');
	QAs = $.parseJSON(pcs);
	pcs = sessionStorage.getItem('QList');
	var QList = $.parseJSON(pcs);
	
	if(clouds == null || QAs == null  || QList == null){
		var query = window.location.search.substring(1);
		var vars = query.split("&"); 
		var pair = vars[0].split("=");
		var ID = pair[1];
		console.log(ID);console.log(query);console.log(vars);
		if(ID == null){
			// Stop the rest of the program and stuff TODO
		} else {
			// TODO grab code from newExising to sort into arrays!
			
			var credentials = {
				fn : 8,
				gameID: ID
			};
			$.post("/CloudGame/gameController", credentials, function(list) {
				console.log(list);
				if(list != null){
					if(list.length > 0){
						// Cloud: Name and QAScores IN ORDER! TODO edit getEndSummary SP to to this with comma separators using group concat
						// Question: title, answer, notes
						// QA: QA in order!
					 	var indCloud = {}, indQues = {}, cloudData = [], quesData = [];
					 	$.each(list, function(index, data) {
							// Make an array that not only has the questions, but clouds, and user data
							//ModelID, QualityAttributeID, cloudScore
							if(indCloud.hasOwnProperty(data.ModelID)){
								if(indCloud[data.ModelID].indexOf(data.QualityAttributeID) == -1){
									var ind = -1;for(var i = 0; i < cloudData.length; i++){ if(cloudData[i].ModelID == data.ModelID){ind = i; break;}}
									cloudData[ind].ModelAnswerValue.push(parseInt(data.cloudScore));
									indCloud[data.ModelID].push(data.QualityAttributeID);
								}
							} else {
								cloudData.push(new cloudInfo(parseInt(data.ModelID))); // TODO: sort this array into one where the scores are in an array (like below)
								cloudData[cloudData.length-1].ModelAnswerValue.push(parseInt(data.cloudScore));
								indCloud[data.ModelID] = [data.QualityAttributeID]
							}
							//QuestionID, theAnswer, UserNotes, QuestionAsked, QuestionValue, AnswerID, AnswerValue, ModelID, ModelAnswerValue, QualityAttributeName
							//quesInfo(id, title, qa, notes, asked)
							if(indQues.hasOwnProperty(data.QuestionID)){
								if(indQues[data.QuestionID].hasOwnProperty(data.AnswerID)){
									if(indQues[data.QuestionID][data.AnswerID].indexOf(data.ModelID) == -1){ // Add new ModelID
										var ind = -1;for(var i = 0; i < quesData.length; i++){ if(quesData[i].QuestionID == data.QuestionID){ind = i; break;}}
										quesData[ind].AnswerValue.push(parseInt(data.ModelAnswerValue));
										indQues[data.QuestionID][data.AnswerID].push(data.ModelID);
									}
								} else { // Add new answerID and ModelID
									var ind = -1;for(var i = 0; i < quesData.length; i++){ if(quesData[i].QuestionID == data.QuestionID){ind = i; break;}}
									quesData[ind].AnswerID.push(parseInt(data.AnswerID));
									quesData[ind].AnswerTitle.push(parseInt(data.AnswerValue));
									quesData[ind].AnswerValue.push(parseInt(data.ModelAnswerValue));
									indQues[data.QuestionID][data.AnswerID] = [data.ModelID];
								}
							} else {
								quesData.push(new quesInfo(parseInt(data.QuestionID), data.QuestionValue, data.QualityAttributeName, data.UserNotes, parseInt(data.QuestionAsked)));
								if(data.QuestionAsked = 1){quesData[quesData.length-1].choice = parseInt(data.theAnswer);}
								quesData[quesData.length-1].AnswerID.push(parseInt(data.AnswerID));
								quesData[quesData.length-1].AnswerTitle.push(parseInt(data.AnswerValue));
								quesData[quesData.length-1].AnswerValue.push(parseInt(data.ModelAnswerValue));
								indQues[data.QuestionID] = {};
								indQues[data.QuestionID][data.AnswerID] = [data.ModelID];
							}
							/*if(!indTips.hasOwnProperty(data.TipID)){
								console.log(data.TipID);
								tipsData.push(new tipInfo(parseInt(data.TipID), data.TipQA, data.TipName, data.TipDescription));
								indTips[data.TipID] = 1;
							}*/
						});
					} else {
						// Stop the rest of the program and stuff TODO
					}
				} else {
					// Stop the rest of the program and stuff TODO
				}
			});
			/*gameID
			elem.addProperty("cloudName", rs1.getString("cloudName"));
			elem.addProperty("QualityAttributeID", rs1.getString("QualityAttributeID"));
			elem.addProperty("ModelAnswerValue", rs1.getString("ModelAnswerValue"));
			elem.addProperty("quesTitle", rs1.getString("quesTitle"));
			elem.addProperty("AnswerValue", rs1.getString("AnswerValue"));
			elem.addProperty("UserNotes", rs1.getString("UserNotes"));
			elem.addProperty("QA", rs1.getString("QA"));*/
		}
	} else {
		console.log(clouds);
		console.log(QList);
		console.log(QAs);
		for(var i = 0, len = QList.length; i < len; i++){ //choice = clicked(!)+1
			var tempString = "For the question: \""+QList[i].title+"\", you answered: \""+QList[i].answer[QList[i].clicked].title;
			if(QList[i].comment != ""){
				tempString += "\", with the comment: \""+QList[i].comment+"\".";
			} else {
				tempString += "\" with no comments.";
			}
			qDtails.push(tempString);
		}
		console.log(qDtails);
		makeChart();
		addListeners();
	}
	$('#SCBack').click(function() {
		window.location = "NewExisting.html"
	});
	$('#SCSwitch').click(function() {
		switchMode();
	});
});
function addListeners(){
	$('#legend0').click(function() {
		if(myRadarChart.datasets[0].strokeColor == tea+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"1)";
			myRadarChart.datasets[1].strokeColor = blue+"0.2)";
			myRadarChart.datasets[2].strokeColor = red+"0.2)";
			myRadarChart.datasets[3].strokeColor = black+"0.2)";
			myRadarChart.datasets[4].strokeColor = green+"0.2)";
			myRadarChart.datasets[5].strokeColor = purple+"0.2)";
			displayCloudStats(0);
		}
		myRadarChart.update();
	});
	$('#legend1').click(function() {
		if(myRadarChart.datasets[1].strokeColor == blue+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"0.2)";
			myRadarChart.datasets[1].strokeColor = blue+"1)";
			myRadarChart.datasets[2].strokeColor = red+"0.2)";
			myRadarChart.datasets[3].strokeColor = black+"0.2)";
			myRadarChart.datasets[4].strokeColor = green+"0.2)";
			myRadarChart.datasets[5].strokeColor = purple+"0.2)";
			displayCloudStats(1);
		}
		myRadarChart.update();
	});
	$('#legend2').click(function() {
		if(myRadarChart.datasets[2].strokeColor == red+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"0.2)";
			myRadarChart.datasets[1].strokeColor = blue+"0.2)";
			myRadarChart.datasets[2].strokeColor = red+"1)";
			myRadarChart.datasets[3].strokeColor = black+"0.2)";
			myRadarChart.datasets[4].strokeColor = green+"0.2)";
			myRadarChart.datasets[5].strokeColor = purple+"0.2)";
			displayCloudStats(2);
		}
		myRadarChart.update();
	});
	$('#legend3').click(function() {
		if(myRadarChart.datasets[3].strokeColor == black+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"0.2)";
			myRadarChart.datasets[1].strokeColor = blue+"0.2)";
			myRadarChart.datasets[2].strokeColor = red+"0.2)";
			myRadarChart.datasets[3].strokeColor = black+"1)";
			myRadarChart.datasets[4].strokeColor = green+"0.2)";
			myRadarChart.datasets[5].strokeColor = purple+"0.2)";
			displayCloudStats(3);
		}
		myRadarChart.update();
	});
	$('#legend4').click(function() {
		if(myRadarChart.datasets[4].strokeColor == green+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"0.2)";
			myRadarChart.datasets[1].strokeColor = blue+"0.2)";
			myRadarChart.datasets[2].strokeColor = red+"0.2)";
			myRadarChart.datasets[3].strokeColor = black+"0.2)";
			myRadarChart.datasets[4].strokeColor = green+"1)";
			myRadarChart.datasets[5].strokeColor = purple+"0.2)";
			displayCloudStats(4);
		}
		myRadarChart.update();
	});
	$('#legend5').click(function() {
		if(myRadarChart.datasets[5].strokeColor == purple+"1)"){
			myRadarChart.datasets[0].strokeColor = tea+"0.5)";
			myRadarChart.datasets[1].strokeColor = blue+"0.5)";
			myRadarChart.datasets[2].strokeColor = red+"0.5)";
			myRadarChart.datasets[3].strokeColor = black+"0.5)";
			myRadarChart.datasets[4].strokeColor = green+"0.5)";
			myRadarChart.datasets[5].strokeColor = purple+"0.5)";
			document.getElementById('cloudDesc').innerHTML = "";
		} else {
			myRadarChart.datasets[0].strokeColor = tea+"0.2)";
			myRadarChart.datasets[1].strokeColor = blue+"0.2)";
			myRadarChart.datasets[2].strokeColor = red+"0.2)";
			myRadarChart.datasets[3].strokeColor = black+"0.2)";
			myRadarChart.datasets[4].strokeColor = green+"0.2)";
			myRadarChart.datasets[5].strokeColor = purple+"1)";
			displayCloudStats(5);
		}
		myRadarChart.update();
	});
}
function makeChart(){
	radarChartData = {
			/*labels : [ "Security", "Scalability", "Integrability",
					"Availability", "Performance", "Maintainability" ], // need function to get names of chosen QAs*/
			labels : QAs,
			datasets : [ {
				label : clouds[0].cloud,
				fillColor : tea+"0)",
				strokeColor : tea+"0.5)",
				pointColor : tea+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke: tea+"1)",
				data : clouds[0].QAScores
			}, {
				label : clouds[1].cloud,
				fillColor : blue+"0)",
				strokeColor: blue+"0.5)",
				pointColor : blue+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke: blue+"1)",
				data : clouds[1].QAScores
			}, {
				label : clouds[2].cloud,
				fillColor : red+"0)",
				strokeColor : red+"0.5)",
				pointColor : red+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : red+"1)",
				data : clouds[2].QAScores
			}, {
				label : clouds[3].cloud,
				fillColor : black+"0)",
				strokeColor : black+"0.5)",
				pointColor : black+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : black+"1)",
				data : clouds[3].QAScores
			}, {
				label : clouds[4].cloud,
				fillColor : green+"0)",
				strokeColor : green+"0.5)",
				pointColor : green+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : green+"1)",
				data : clouds[4].QAScores
			},
			{
				label : clouds[5].cloud,
				fillColor : purple+"0)",
				strokeColor : purple+"0.5)",
				pointColor : purple+"1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : purple+"1)",
				data : clouds[5].QAScores
			}, ]
		};
		
		var options = {
				legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li id=<%=\"legend\"+i%>><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
			    // String - Template string for single tooltips
			    tooltipTemplate: "<%if (label){%><%=label %>: <%}%><%= value + ' %' %>",
			    // String - Template string for multiple tooltips
			    multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
		};
		
		myRadarChart = new Chart(chart).Radar(radarChartData, options);
		
		document.getElementById('js-legend').innerHTML += myRadarChart.generateLegend();
}

function switchMode(){
	if(mode == 0){
		var injectString = "";
		for(var i = 0, len = qDtails.length; i < len; i++){
			injectString += "<p>"+qDtails[i]+"</p>";
		}
		$("#qDiv").append(injectString);
		$("#chartDiv").css("display", "none");
		$("#qDiv").css("display", "");
		mode = 1;
		$('#SCSwitch').html('View Spider Chart');heada
		$('#heada').html('Here are the questions you answered in this game:');
	} else if(mode == 1){
		$("#qDiv").css("display", "none");
		$("#chartDiv").css("display", "");
		mode = 2;
		$('#SCSwitch').html('View Answered Questions');
		$('#heada').html("Here is the Spider Chart of each cloud's performance:");
	} else {
		$("#chartDiv").css("display", "none");
		$("#qDiv").css("display", "");
		mode = 1;
		$('#SCSwitch').html('View Spider Chart');
		$('#heada').html('Here are the questions you answered in this game:');
	}
}

function displayCloudStats(num){
	var cloudText = "<p>Here are the performance of "+myRadarChart.datasets[num].label+": </p><p>";
	var total = 0;
	for(var i in myRadarChart.datasets[num].points){
		cloudText+=myRadarChart.datasets[num].points[i].label+": "+myRadarChart.datasets[num].points[i].value+" <br>";
		total += myRadarChart.datasets[num].points[i].value
	}
	cloudText+="</p><p>Total Score: "+total+". Average: "+total/myRadarChart.datasets[num].points.length+". </p>";
	document.getElementById('cloudDesc').innerHTML = cloudText;
}