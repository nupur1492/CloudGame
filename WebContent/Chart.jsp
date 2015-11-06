<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib  uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<html>
<head>
<title>Game As A Service</title>

<link href="stylesheets/Chart.css" media="all" rel="stylesheet"
	type="text/css" />

<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />

<script 
	src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"
	type="text/javascript"></script>

<script  src="javascripts/jquery.hotkeys.js"
	type="text/javascript"></script>

<script src="javascripts/key_status.js"
	type="text/javascript"></script>

<script src="javascripts/util.js"
	type="text/javascript"></script>

<script src="javascripts/sprite.js"
	type="text/javascript"></script>

<script src="javascripts/sound.js"
	type="text/javascript"></script>

<script src="javascripts/Chart.js"
	type="text/javascript"></script>

<script
	src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>

</head>
<body bgcolor="#ffaa00">

	<script>
	var CANVAS_WIDTH = 1200;
	var CANVAS_HEIGHT = 850;
	var radarChartData = null;
	var myRadarChart = null;
	var canvasChart = $("<canvas width='" + CANVAS_WIDTH + "' height='" + CANVAS_HEIGHT + "'></canvas>");
	var chart = canvasChart.get(0).getContext("2d");
	
	$(document).ready(function() {
	
	canvasChart.appendTo('body');
	canvasChart.show();
	
		radarChartData = {
			labels : [ "Security", "Scalability", "Integrability",
					"Availability", "Performance", "Maintainability" ], // need function to get names of chosen QAs
			datasets : [ {
				label : "First dataset",
				fillColor : "rgba(100, 120, 0,0)",
				strokeColor : "rgba(100, 120, 0,0.3)",
				/* fillColor : "rgba(170, 57, 57,0)",
				strokeColor : "rgba(170, 57, 57,0.2)", */
				pointColor : "rgba(100, 120, 0,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				//pointHighlightStroke: "rgba(220,220,220,1)",
				pointHighlightStroke: "rgba(100, 120, 0,1)",
				data : [ 65, 0, 0, 0, 0, 0 ]
			}, {
				label : "Second dataset",
				fillColor : "rgba(0, 120, 255, 0)",
				strokeColor: "rgba(0, 120, 255,0.3)",
				pointColor : "rgba(0, 120, 255,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke: "rgba(0, 120, 255,1)",
				data : [ 30, 0, 0, 0, 0, 0 ]
			}, {
				label : "Third dataset",
				fillColor : "rgba(255, 0, 0,0)",
				strokeColor : "rgba(255, 0, 0,0.3)",
				pointColor : "rgba(255, 0, 0,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : "rgba(255, 0, 0,1)",
				data : [ 10, 0, 0, 0, 0, 0 ]
			}, {
				label : "Fourth dataset",
				fillColor : "rgba(50,50,50,0)",
				strokeColor : "rgba(50,50,50,0.3)",
				pointColor : "rgba(50,50,50,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : "rgba(50,50,50,1)",
				data : [ 100, 0, 0, 0, 0, 0 ]
			}, {
				label : "Fifth dataset",
				fillColor : "rgba(0,180,0,0)",
				strokeColor : "rgba(0,180,0,0.3)",
				pointColor : "rgba(0,180,0,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : "rgba(0,180,0,1)",
				data : [ 50, 0, 0, 0, 0, 0 ]
			},

			{
				label : "Sixth dataset",
				fillColor : "rgba(255,0,255,0)",
				strokeColor : "rgba(255,0,255,0.3)",
				pointColor : "rgba(255,0,255,1)",
				pointStrokeColor : "#fff",
				pointHighlightFill : "#fff",
				pointHighlightStroke : "rgba(255,0,255,1)",
				data : [ 15, 0, 0, 0, 0, 0 ]
			}, ]
		};

		//scalability
		radarChartData.datasets[0].data[1] = 20; //dataset => model; data => QA
		radarChartData.datasets[1].data[1] = 30;
		radarChartData.datasets[2].data[1] = 50;
		radarChartData.datasets[3].data[1] = 10;
		radarChartData.datasets[4].data[1] = 40;
		radarChartData.datasets[5].data[1] = 60;

		//Integrbility
		radarChartData.datasets[0].data[2] = 40;
		radarChartData.datasets[1].data[2] = 30;
		radarChartData.datasets[2].data[2] = 20;
		radarChartData.datasets[3].data[2] = 60;
		radarChartData.datasets[4].data[2] = 10;
		radarChartData.datasets[5].data[2] = 50;
		
		
		//Availability
		radarChartData.datasets[0].data[3] = 20;
		radarChartData.datasets[1].data[3] = 50;
		radarChartData.datasets[2].data[3] = 10;
		radarChartData.datasets[3].data[3] = 40;
		radarChartData.datasets[4].data[3] = 30;
		radarChartData.datasets[5].data[3] = 60;
		
		//Performance
		radarChartData.datasets[0].data[4] = 50;
		radarChartData.datasets[1].data[4] = 30;
		radarChartData.datasets[2].data[4] = 20;
		radarChartData.datasets[3].data[4] = 60;
		radarChartData.datasets[4].data[4] = 10;
		radarChartData.datasets[5].data[4] = 40;
		
		//Maintainability
		radarChartData.datasets[0].data[5] = 60;
		radarChartData.datasets[1].data[5] = 10;
		radarChartData.datasets[2].data[5] = 30;
		radarChartData.datasets[3].data[5] = 20;
		radarChartData.datasets[4].data[5] = 40;
		radarChartData.datasets[5].data[5] = 50;
		
		<%-- var options = {
			    segmentShowStroke: false,
			    animateRotate: true,
			    animateScale: false,
			    percentageInnerCutout: 50,
			    tooltipTemplate: "<%= value %>%"
			} --%>
		
		myRadarChart = new Chart(chart).Radar(radarChartData,
				{
					<%-- tooltipTemplate: "<%= value %>%" --%>
					/* legendTemplate : "" */
<%-- 					<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>
 --%>				});
		
		$('#one').click(function() {
			if(myRadarChart.datasets[0].strokeColor == "rgba(100, 120, 0,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,1)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.2)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.2)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.2)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.2)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.2)";
			}
			myRadarChart.update();
		});
		$('#two').click(function() {
			if(myRadarChart.datasets[1].strokeColor == "rgba(0, 120, 255,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.2)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,1)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.2)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.2)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.2)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.2)";
			}
			myRadarChart.update();
		});
		$('#three').click(function() {
			if(myRadarChart.datasets[2].strokeColor == "rgba(255, 0, 0,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.2)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.2)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,1)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.2)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.2)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.2)";
			}
			myRadarChart.update();
		});
		$('#four').click(function() {
			if(myRadarChart.datasets[3].strokeColor == "rgba(50,50,50,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.2)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.2)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.2)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,1)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.2)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.2)";
			}
			myRadarChart.update();
		});
		$('#five').click(function() {
			if(myRadarChart.datasets[4].strokeColor == "rgba(0,180,0,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.2)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.2)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.2)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.2)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,1)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.2)";
			}
			myRadarChart.update();
		});
		$('#six').click(function() {
			if(myRadarChart.datasets[5].strokeColor == "rgba(255,0,255,1)"){
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.3)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.3)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.3)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.3)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.3)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,0.3)";
			} else {
				myRadarChart.datasets[0].strokeColor = "rgba(100, 120, 0,0.2)";
				myRadarChart.datasets[1].strokeColor = "rgba(0, 120, 255,0.2)";
				myRadarChart.datasets[2].strokeColor = "rgba(255, 0, 0,0.2)";
				myRadarChart.datasets[3].strokeColor = "rgba(50,50,50,0.2)";
				myRadarChart.datasets[4].strokeColor = "rgba(0,180,0,0.2)";
				myRadarChart.datasets[5].strokeColor = "rgba(255,0,255,1)";
			}
			myRadarChart.update();
		});
		
	});
		
	</script>
	
	<div class="container-fluid">
		<div class="row">
			<!-- <div class="col-md-8" id="coin-count"></div> -->	
			<button name="1" id="one" class="btn btn-default" >One</button>
			<button name="2" id="two" class="btn btn-default" >Two</button>
			<button name="3" id="three" class="btn btn-default" >Three</button>
			<button name="4" id="four" class="btn btn-default" >Four</button>
			<button name="5" id="five" class="btn btn-default" >Five</button>
			<button name="6" id="six" class="btn btn-default" >Six</button>
		</div>
	</div>


	</body>
</html>