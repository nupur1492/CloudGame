
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib  uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<html>
<head>
<title>Game As A Service</title>

<link href="stylesheets/screen.css" media="all" rel="stylesheet"
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

<body>
	<script type='text/javascript'>
		var CANVAS_WIDTH = 1200;
		var CANVAS_HEIGHT = 850;
		var FPS = 30;
		var score = 0;
		var page = 1;
		
		var player = {
			color : "#00A",
			x : 600,
			y : 600,
			width : 100,
			height : 100,
			draw : function() {
				canvas.fillStyle = this.color;
				canvas.fillRect(this.x, this.y, this.width, this.height);
			}
		};

		$(document)
				.ready(
						function() {

							
							var canvasElement = $("<canvas id='coinCanvas' width='" + CANVAS_WIDTH + 
				"' height='" + CANVAS_HEIGHT + "' ></canvas>");
							var canvas = canvasElement.get(0).getContext("2d");

							var background = new Image();
							background.src = "background.jpg";

							canvasElement.appendTo('#coin-count');

							var canvasChart = $("<canvas width='" + CANVAS_WIDTH + 
				  "' height='" + CANVAS_HEIGHT + "'></canvas>");
							var chart = canvasChart.get(0).getContext("2d");
							canvasChart.appendTo('#coin-count');

							canvasElement.hide();
							canvasChart.hide();

							$('#submit').click(function() {
							
								/* function changeDiv(){
									document.getElementById('balloonStatic').style.display = "hidden"; // hide body div tag
								} */
								$("#balloonStatic").hide();
								canvasElement.show();
								
								startTimer();
								
								enemies = [];
								
								function Enemy(I) {
								  I = I || {};
								
								  I.active = true;
								  I.age = Math.floor(Math.random() * 128);
								  
								  I.color = "#A2B";
								
								  I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
								  I.y = 0;
								  I.xVelocity = 0
								  I.yVelocity = 5;
								
								  I.width = 32;
								  I.height = 32;
								
								  I.inBounds = function() {
									return I.x >= 0 && I.x <= CANVAS_WIDTH &&
					  I.y >= 0 && I.y <= CANVAS_HEIGHT;
								  };
								
								  I.sprite = Sprite("enemy");
								
								  I.draw = function() {
									this.sprite.draw(canvas, this.x, this.y);
								  };
								
								  I.update = function() {
									I.x += I.xVelocity;
									I.y += I.yVelocity;
								
									I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);
								
									I.age++;
								
									I.active = I.active && I.inBounds();
								  };
								
								  I.explode = function() {
									Sound.play("explosion");
								
									this.active = false;
									// Extra Credit: Add an explosion graphic
								  };
								
								  return I;
								};
												
								setInterval(function() {
								  update();
								  draw();
								}, 1000/FPS);
								
								function update() {
								  if(keydown.space) {
									player.shoot();
								  }
								
								  if(keydown.left) {
									player.x -= 5;
								  }
								
								  if(keydown.right) {
									player.x += 5;
								  }
								  if(keydown.up) {
									player.y -= 5;
								  }
								  if(keydown.down) {
									player.y += 5;
								  }
								
								  player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
								  				  
								  enemies.forEach(function(enemy) {
									enemy.update();
								  });
								
								  enemies = enemies.filter(function(enemy) {
									return enemy.active;
								  });
								
								  handleCollisions();
								
								  if(Math.random() < 0.1) {
									enemies.push(Enemy());
								  }
								}
											
								player.midpoint = function() {
								  return {
									x: this.x + this.width/2,
									y: this.y + this.height/2
								  };
								};
								
								function draw() {
								  canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
								  
								  player.draw();
								
								  enemies.forEach(function(enemy) {
									enemy.draw();
								  });
								}
								
								function collides(a, b) {
								  return a.x < b.x + b.width &&
					a.x + a.width > b.x &&
									a.y < b.y + b.height &&
					a.y + a.height > b.y;
								}
								
								function handleCollisions() {
							
								  enemies.forEach(function(enemy) {
									if(collides(enemy, player)) {
									  enemy.explode();
									  player.explode();
									  score++;
									 // alert(score);
									}
								  });
								}
								
								canvas.fillText(score,30,30);
								
								player.explode = function() {
								  this.active = false;
								  // Extra Credit: Add an explosion graphic and then end the game
								};
								
								player.sprite = Sprite("player");
								
								player.draw = function() {
								  this.sprite.draw(canvas, this.x, this.y);
								};
								
								function startTimer() {
									var seconds_left = 15;
									var interval = setInterval(function() {
									document.getElementById('timeCounter').innerHTML = --seconds_left;
									document.getElementById('score').innerHTML = score;

									if (seconds_left <= 0)
										{
											//alert("jhdsgkjh");
										  document.getElementById('timeCounter').innerHTML = '0';
										 // var page = document.getElementById('check');
										  page=page+1;
										  //document.getElementById('check').innerHTML = page;
										  //check = check+1;
											document.getElementById('form1').submit();
										  /* clearInterval(interval);
											//('#timerModal').modal('show');
										  canvasElement.hide();
										  canvasChart.show();
										  // $("#balloonStatic").show();
										  
										  
										 */
										  
										}
									}, 1500); 
								}
									
							}); 

						});
	</script>


	<div class="container-fluid">
		<div class="row">
			<div id="coin-count">
				<p><b>Score:</b> <span id="score"> </span><p>
				<p id="time"><b>Time:</b> <span id="timeCounter">15 </span>sec.<p>

				<!-- Trigger the modal with a button -->
				<button type="button" class="btn" data-toggle="modal" data-target="#myModal">Leaderboard</button>
				<!-- Modal -->
				<div class="modal fade" id="myModal" role="dialog">
					<div class="modal-dialog">
					<!-- Modal content-->
					<div class="modal-content">
						<div class="modal-header">
							<button id="leaderboard" type="button" class="close" data-dismiss="modal">&times;</button>
							<h3 class="modal-title">Leaderboard</h3>
						</div>
						<div class="modal-body col-sm-6">
							<h4 class="leader-header">Username</h4>
							<ol>
								<li>kanika</li>
								<li>nupur</li>
								<li>kwei</li>
							</ol>
						</div>
						<div class="modal-body col-sm-6">
							<h4 class="leader-header">Score</h4>
							<ul>
								<li>283749</li>
								<li>123987</li>
								<li>123983</li>
							</ul>
						</div>
						<div class="modal-footer">
					</div>
				</div>
					</div>
				</div>
				</div>
           
            <%-- <c:set var="page" value="2"/> --%>
            <form id="form1" method="get" action="gameController">
            	
            	<input type="hidden" name="check" id="check" value="${check}"/>
            </form>
			
			<div class="col-md-4" id="questions"
				style="color: #480000; height: 978px">
			<!-- 	<form action="gameController" method="get"> -->
			<form>
					<h3 style="text-align: center">Level 1</h3>
					<br/>
					<c:set var="i" value="1"/>
					<c:forEach var="questions" items="${sessionScope.QuestionList}">
					<c:if test="${i<6 }">
					<h4>${i} <c:out value="${questions.questionName}"/></h4>
					<br /> <span class="spaces"> <label><input
							type="radio" name="qs1_${i}" id="qs11_${i}" value="1" /> 1<br /></label> <label><input
							type="radio" name="qs1_${i}" id="qs12_${i}" value="2" /> 2<br /></label> <label><input
							type="radio" name="qs1_${i}" id="qs13_${i}" value="3" /> 3<br /></label> <label><input
							type="radio" name="qs1_${i}" id="qs14_${i}" value="4" /> 4<br /></label> <label><input
							type="radio" name="qs1_${i}" id="qs15_${i}" value="5" /> 5<br /></label>
							<c:set var="i" value="${i+1}"/>
							
					</span>
					</c:if>
					</c:forEach> 
				</form>
				<br /> <br />
				<div>
					<button id="submit" style="font-size: 125%">Submit</button>

				</div>

			</div>
		</div>
	</div>
	<br />
	<br />
	<div id="balloonStatic">
		<img src="images/player.png" id="balloon" width="150" height="150"
			margin-top="10" margin-left="200" />
	</div>
</body>
</html>
