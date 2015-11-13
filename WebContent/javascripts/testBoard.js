"use strict";

var canvas;
var context;
var container;
var CANVAS_WIDTH = 1440;
var CANVAS_HEIGHT = 1200;

var heightRatio = 1;
var widthRatio = 1;

var mode = 4; // 0: normal, 1: help, 2: before event, 3: during event, 4: pregame help, 5: pregame select bet, 
			  // 6: facts/tips display screen, 7: news display screen (if needed), 8: guess the cloud, 9: game over, 10 menu, 11 onLoad, 12 onLoad completeGame, 13 onLoad beforeStart
var playerStartingCoins = 0; // The amount of coins the user has before starting the game
var playerCoins = 0; // Coins kept track in the game
//var bet = -1; // index of bets array
//var modelBet = -1; // index of cloudList, the cloud user bets on
var totalQuestions = 25; 
var questionAsked = -1; 
//var gameName = "modernizationProj";
var cloudList = ["SAAS Public", "SAAS Private", "PAAS Public", "PAAS Private", "IAAS Public", "IAAS Private"];
var cloudGuess = -1; // Used to store the index in the "Guess Which Cloud is First" event
var positions = []; // Stores the pieces' move information
var bonusSquares = []; // Stores the location of bonus squares on the board
var MAX_BONUS_SQUARES = 8;
var showBonus = 0; // The number of turns bonus squares are drawn on the board ("Show Bonus Squares" event)
var bonusCount = 0; // Keeps track of the # bonus squares that are landed on in a turn
//var lowEvents = ["Facts and Tips", "Current News", "Show Bonus Squares", "Guess Which Cloud is First", "Get Coins"]; // News is not in DB yet
//var lowEvents = ["Facts and Tips", "Show Bonus Squares", "Guess Which Cloud is First", "Get Coins"];
var lowEvents = ["Facts and Tips", "Facts and Tips"]; 
var midEvents = ["Guess Which Cloud is First", "Change Your Bet", "Get Coins"];
var lastEvent = "none";
//var newsArray = ["A cloud just walked into a bar. It dissolved into precipitation.", "Three clouds were seen suspiciously loitering around a tobacco store.", "Prince Cumulus and Princess Cirrostratus have set their wedding day to July of 2016."];
//var tfArray = ["A cloud is made of mostly H2O", "Clouds can block the sun's rays, providing shade.", "Cotton candies are not clouds."]; // Do we need to keep track of which tips were given to user? 
var tipsArray = [];
var ween = false;
//var QAArray = ["Security", "Scalability", "Integrability", "Availability", "Performance", "Maintainability"];
var QAIDList = ["Security", "Performance", "Availability", "Integrability", "Scalability", "Maintainability"];
var pieceNames = ["tea", "blue", "red", "black", "green", "purple"];
var pieceColors =[
                  {red: "100", green: "120", blue: "0"},
                  {red: "0", green: "120", blue: "255"},
                  {red: "255", green: "0", blue: "0"},
                  {red: "50", green: "50", blue: "50"},
                  {red: "0", green: "180", blue: "0"},
                  {red: "255", green: "0", blue: "255"}
                  ];
var pieces = []; // Holds the game pieces
var AList = []; // Holds the answered questions at start of game (when loading saved game)
var QList = [];  // Holds the questions to be answered. Randomized for your convenience
var cloudString = [""]; // String representation of cloud array for saving to DB
var qString = [""]; // String representation of questions array for saving to DB
var currentSave = 0; // Determines which data to save (if case DB gives an unfavorable response)
var tipsFlag = false;


	
	/*canvas.height = window.innerHeight;
	//canvas.width = window.innerWidth;
	context.height = window.innerHeight;
	context.width = window.innerWidth;
	console.log("resized height "+canvas.height);
	console.log("resized width "+ canvas.width);
	
	CANVAS_HEIGHT = context.height;
	CANVAS_WIDTH = context.width;
	
	/*if(CANVAS_HEIGHT < window.innerHeight){
		CANVAS_HEIGHT = window.innerHeight;
		console.log(CANVAS_HEIGHT);
	}
	if(CANVAS_WIDTH < window.innerWidth){
		CANVAS_WIDTH = window.innerWidth;
		console.log(CANVAS_WIDTH);
	}
	console.log("draw function");
	draw(null, false);
}*/

function piece(name, x, y, width,sprite, colorR, colorG, colorB) { // Function for creating the pieces in the game, as well as the floating position indicators
    this.name = name;  
    this.loc = 0;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = this.width;
    this.sprite = Sprite(sprite);
    this.score = 0;
    this.QAScores = []; // Array with score for each QA selected. Need a QA array to load from DB that has the name of each 
    this.cloud = "";
    this.rank = 0;
    this.rankSign = {
		red : colorR,
		green : colorG,
		blue : colorB,
		x : 0,
		y : 0,
		width : 80,
		height : 54,
		arrowX : 0,
		arrowY : 0,
		aWidth : 20,
		aHeight : 20,
		src : "C1.png",
		arrowSrc : "CA1.png",
		draw : function(sign) {
			if(sign.x != 0 && sign.y != 0){
				var rank = new Image();
				rank.src = sign.src;
				rank.onload = function() {
					context.drawImage(rank, sign.x, sign.y, sign.width, sign.height);
					rank.style.display = 'none';
					var imageData = context.getImageData(sign.x, sign.y, sign.width, sign.height);
					var data = imageData.data;
					for (var i = 0; i < data.length; i += 4) {
						if(imageData.data[i] - imageData.data[i+1] > 80 && imageData.data[i] - imageData.data[i+2] > 80){
							imageData.data[i]=sign.red;
				            imageData.data[i+1]=sign.green;
				            imageData.data[i+2]=sign.blue;
				        }
					}
					context.putImageData(imageData, sign.x, sign.y);
				};
			}
			if(sign.arrowX != 0 && sign.arrowY != 0){
				var arrow = new Image();
				arrow.src = sign.arrowSrc;
				arrow.onload = function() {
					context.drawImage(arrow, sign.arrowX, sign.arrowY, sign.aWidth, sign.aHeight);
					arrow.style.display = 'none';
					var imageData = context.getImageData(sign.arrowX, sign.arrowY, sign.aWidth, sign.aHeight);
					var data = imageData.data;
					for (var i = 0; i < data.length; i += 4) {
						if(imageData.data[i] - imageData.data[i+1] > 80 && imageData.data[i] - imageData.data[i+2] > 80){
							imageData.data[i]=sign.red;
				            imageData.data[i+1]=sign.green;
				            imageData.data[i+2]=sign.blue;
				        }
					}
					context.putImageData(imageData, sign.arrowX, sign.arrowY);
				};	
			}
		}
    }
    this.draw = function() {
		this.sprite.draw(context, this.x, this.y);
	},
	this.clicked = function(xCoord, yCoord){
		if(Math.sqrt((xCoord-(this.x+(this.width/2)))*(xCoord-(this.x+(this.width/2))) + (yCoord-(this.y+(this.height/2)))*(yCoord-(this.y+(this.height/2)))) < this.width/2){
			return true;
		} else {
			return false;
		}
	},
	this.init = function() {
	      var origValues = {};
	      for (var prop in this) {
	          if (this.hasOwnProperty(prop) && prop != "origValues") {
	              origValues[prop] = this[prop];
	          }
	      }
	      this.origValues = origValues;
	  },
	  this.reset = function() {
	      for (var prop in this.origValues) {
	          this[prop] = this.origValues[prop];
	      }
	  }
}

function screenElem(color, sprite, x, y, width, height, hasText, text, textOffsetX, textOffsetY, font, fontColor){ // Function for creating the element to be drawn on the screen
	this.color = color;
	this.src = sprite;
	this.x = x;  
	this.y = y;
	this.width = width;
	this.height = height;
	if(hasText){
		this.text = text;
		this.font = font;
		this.fontColor = fontColor;
		this.textOffsetX = textOffsetX;
		this.textOffsetY = textOffsetY;
		this.draw = function() {
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.width, this.height);
			context.fillStyle = this.fontColor;
			context.font = this.font;
			context.fillText(this.text, this.x+this.textOffsetX, this.y+this.textOffsetY);
		},
		this.drawWrap = function(lineOffset) { // Used if you want multiple lines of text for a single screen element
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.width, this.height);
			context.fillStyle = this.fontColor;
			context.font = this.font;
			var lineNumber = 0;
			var words = this.text.split(' ');
	        var line = '';
	        for(var n = 0; n < words.length; n++) {
	          var testLine = line + words[n] + ' ';
	          var metrics = context.measureText(testLine);
	          var testWidth = metrics.width;
	          if (testWidth > (this.width-this.textOffsetX) && n > 0) {
	        	  context.fillText(line, this.x+this.textOffsetX, this.y+this.textOffsetY+lineOffset*lineNumber);
	        	  //console.log("printed: "+line+" at y: "+parseInt(this.y+this.textOffsetY+lineOffset*lineNumber));
	        	  line = words[n] + ' ';
	        	  lineNumber += 1;
	          } else {
	        	  line = testLine;
	          }
	        }
	        context.fillText(line, this.x+this.textOffsetX, this.y+this.textOffsetY+lineOffset*lineNumber);
		},
		this.drawResize = function(hasBorder) { // Used if you want to shrink the font to fit the screen element
			context.fillStyle = this.color;
			context.fillRect(this.x-(this.width/2), this.y, this.width, this.height);
			context.fillStyle = this.fontColor;
			context.font = this.font;
			while(context.measureText(this.text).width > (this.width-this.textOffsetX)){
				var fontArgs = context.font.split(' ');
				var tempFont = "";
				for(var i in fontArgs){
					if(fontArgs[i].indexOf("px") > -1){
						var num = parseInt(fontArgs[i].split("px")[0]) - 4;
						tempFont = tempFont + num + "px ";
					} else {
						tempFont = tempFont + fontArgs[i] + " ";
					}
				}
				context.font = tempFont;
			}
			context.fillText(this.text, this.x+this.textOffsetX, this.y+this.textOffsetY);
			if(hasBorder){
				context.strokeRect(this.x-(this.width/2), this.y, this.width, this.height);
			}
		}
	} else {
		this.draw = function() {
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.width, this.height);
		},
		this.drawPic = function(self) {
			var picture = new Image();
			picture.src = this.src;
			picture.onload = function() {
				context.drawImage(picture, self.x-(self.width/2), self.y, self.width, self.height);
				context.fillStyle = "#000000";
				context.strokeRect(self.x-(self.width/2)-10, self.y-10, self.width+20, self.height+20);
			};
		}
	}
	this.clicked = function(xCoord, yCoord, detectCenter){
		var x = this.x * widthRatio;
		var y = this.y * heightRatio;
		var width = this.width * widthRatio;
		var height = this.height * heightRatio;
		
		/*if(detectCenter){
			if(this.x-(this.width/2) <= xCoord && xCoord <= this.x-(this.width/2)+this.width && this.y <= yCoord && yCoord <= this.y+this.height){
				return true;
			} else {
				return false;
			}
		}*/
		if(detectCenter){
			if(x-(width/2) <= xCoord && xCoord <= x-(width/2)+width && y <= yCoord && yCoord <= y+height){
				return true;
			} else {
				return false;
			}
		}
		/*if(this.x <= xCoord && xCoord <= this.x+this.width && this.y <= yCoord && yCoord <= this.y+this.height){
			return true;
		} else {
			return false;
		}*/
		if(x <= xCoord && xCoord <= x+width && y <= yCoord && yCoord <= y+height){
			return true;
		} else {
			return false;
		}
	}
}



// Screen elements for the HUD
var HUD = new screenElem("#8fefbf", null, 4, 4, 1432, 60, false, null, null, null, null, null);
var menuButton = new screenElem("#000066", null, 1374, 30, 60, 34, true, "Menu", 9, 22, "bold 16px sans-serif", "#FFFFFF");
var helpButton = new screenElem("#000066", null, 1310, 30, 60, 34, true, "Help", 12, 22, "bold 16px sans-serif", "#FFFFFF");

// Screen elements for the questions in the center of the board
//var quesBG = new screenElem("#FFFFFF", null, 248, 336, CANVAS_WIDTH*0.648, CANVAS_HEIGHT*0.486, false, null, null, null, null, null);
var quesBG = new screenElem("#FFFFFF", null, 248, 336, 934, 584, false, null, null, null, null, null);
var quesTitle = new screenElem("#99ff99", null, 715, 360, 894, 100, true, "", 0, 66, "bold 64px sans-serif", "#000000"); // 859 max text length 40

var star1 = new piece("star1", 342, 608, 100, "wstar", "0", "120", "255");
var star2 = new piece("star2", 492, 608, 100, "wstar", "0", "120", "255");
var star3 =  new piece("star3", 642, 608, 100, "wstar", "0", "120", "255");
var star4 = new piece("star4", 792, 608, 100, "wstar", "0", "120", "255");
var star5 = new piece("star5", 942, 608, 100, "wstar", "0", "120", "255");     
var quesAnsw = [star1, star2, star3, star4, star5];		//white stars

var star11 = new piece("star1", 342, 608, 100, "bstar", "0", "120", "255");
var star12 = new piece("star2", 492, 608, 100, "bstar", "0", "120", "255");
var star13 =  new piece("star3", 642, 608, 100, "bstar", "0", "120", "255");
var star14 = new piece("star4", 792, 608, 100, "bstar", "0", "120", "255");
var star15 = new piece("star5", 942, 608, 100, "bstar", "0", "120", "255");     
var quesAnsw2 = [star11, star12, star13, star14, star15];	//blue stars

// Other elements
var dimOut = new screenElem("rgba(211, 211, 211, 0.5)", null, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, false, null, null, null, null, null);
var welcomeText1 = new screenElem("#d3d3d3", null, 710, 280, 500, 50, true, "Welcome to Cloud Race!", 16, 46, "bold 48px sans-serif", "#000000");

// Elements for the help screen
var helpBG = new screenElem("#d3d3d3", null, 190, 245, 1060, 770, false, null, null, null, null, null);
var helpDesc01 = 
		"The goal of the game is to find the best cloud for your" +
		" project. The game pieces on the board secretly represents" +
		" one of the six cloud options. By answering questions, the " +
		"cloud options will be ranked according to how useful it is to " +
		"you, and the pieces will move around the board accordingly. " +
		"When all questions have been answered, the clouds that " +
		"each piece represents will reveal themselves and show you " +
		"which one is recommended. At the beginning of the game, " +
		"you can bet on which cloud will come in first place. You will " +
		"receive coins if you guess correctly. There are also bonus " +
		"squares the pieces may land on, which leads to random " +
		"events. ";
/*var helpDesc02 = 
<<<<<<< HEAD
=======
var helpDesc02 = 
>>>>>>> 32488006180bc92f045b0f8ccd8e78d6de5842fa
=======
>>>>>>> refs/remotes/origin/Rick's-Branch
	"Get Coins: Gain coins that can be used for betting on clouds." +
	"                                                                                                  "+
	"Facts and Tips: The game gives you interesting facts about clouds and tips for using cloud in your project." +
	"                                                                                                                 "+
	"Current News: The game provides you news about clouds to help you stay current." +
	"           " +
	"                                                                                                                                                     "+
	"Show Bonus Squares: Shows you where the bonus squares are on the board." +
	"                  " +
	"                                                                                                                                                     "+
	"Guess Which Cloud is First: Shows you what cloud the piece in 1st place represents and gives you coins if you guess correctly." +
	"                            " +
	"                                                                                                                                                     "+
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> refs/remotes/origin/Rick's-Branch
	"Change Your Bet: Allows you to change the cloud and the amount you bet on.";*/
var helpDesc02 = 
	"Get Coins: Gain coins that can be used for betting on clouds." +
	"                                                                                                  "+
	"Facts and Tips: The game gives you interesting facts about clouds and tips for using cloud in your project." +
	"                                                                                                                 "+
	"Show Bonus Squares: Shows you where the bonus squares are on the board." +
	"                  " +
	"                                                                                                                                                     "+
	"Guess Which Cloud is First: Shows you what cloud the piece in 1st place represents and gives you coins if you guess correctly." +
	"                            " +
	"                                                                                                                                                     "+
	"Change Your Bet: Allows you to change the cloud and the amount you bet on.";
var helpDesc10 = "(Click anywhere in the game to close this help screen.)";
var helpText1 = new screenElem("#d3d3d3", null, 230, 350, 1000, 600, true, helpDesc01, 16, 46, "36px sans-serif", "#000000");
var helpTextEnd = new screenElem("#d3d3d3", null, 721, 990, 30, 20, true, helpDesc10, 0, 0, "24px sans-serif", "#000000");

// Elements for the bonus screen
var bonusBG = new screenElem("#006400", null, 190, 245, 1060, 770, false, null, null, null, null, null);
var bnsTitle = new screenElem("#99ff99", null, 715, 360, 894, 100, true, "", 0, 66, "bold 64px sans-serif", "#000000");
var bonusText1 = new screenElem("rgba(0, 0, 0, 0)", null, 710, 280, 984, 100, true, "", 0, 46, "48px sans-serif", "#FFFFFF");
var bonusText2 = new screenElem("rgba(0, 0, 0, 0)", null, 710, 380, 1000, 600, true, "", 0, 46, "36px sans-serif", "#FFFFFF");
var bonusText3 = new screenElem("#006400", null, 710, 840, 1, 1, true, "erwe", 0, 46, "36px sans-serif", "#FFFFFF");
var bonusTextEnd = new screenElem("#006400", null, 710, 990, 30, 20, true, "", 0, 0, "24px sans-serif", "#FFFFFF");
var eventCenter = new screenElem("#000000", "Current News.png", 710, 535, 240, 240, null, null, null, null, null, null);
var eventLeft = new screenElem("#000000", "Get Coins.png", 390, 535, 240, 240, null, null, null, null, null, null);
var eventRight = new screenElem("#000000", "Change Your Bet.png", 1030, 535, 240, 240, null, null, null, null, null, null);

// Elements for choosing the cloud to bet on
var chooseBG = new screenElem("#c2dcd6", null, 190, 245, 1060, 770, false, null, null, null, null, null);
var cloud1 = new screenElem("#FFFFFF", null, 390, 380, 240, 120, true, cloudList[0], 0, 72, "36px sans-serif", "#001d87"); 
var cloud2 = new screenElem("#FFFFFF", null, 710, 380, 240, 120, true, cloudList[1], 0, 72, "36px sans-serif", "#001d87");
var cloud3 = new screenElem("#FFFFFF", null, 1030, 380, 240, 120, true, cloudList[2], 0, 72, "36px sans-serif", "#001d87");
var cloud4 = new screenElem("#FFFFFF", null, 390, 545, 240, 120, true, cloudList[3], 0, 72, "36px sans-serif", "#001d87"); 
var cloud5 = new screenElem("#FFFFFF", null, 710, 545, 240, 120, true, cloudList[4], 0, 72, "36px sans-serif", "#001d87");
var cloud6 = new screenElem("#FFFFFF", null, 1030, 545, 240, 120, true, cloudList[5], 0, 72, "36px sans-serif", "#001d87");
var clouds = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];
var betText2 = new screenElem("#c2dcd6", null, 710, 730, 480, 50, true, "Your Coins: "+(parseInt(playerCoins)+parseInt(playerStartingCoins)), 0, 30, "bold 36px sans-serif", "#000000");
var bet1 = new screenElem("#FFFFFF", null, 366, 828, 120, 60, true, "10", 0, 42, "36px sans-serif", "#001d87"); 
var bet2 = new screenElem("#FFFFFF", null, 602, 828, 120, 60, true, "20", 0, 42, "36px sans-serif", "#001d87");
var bet3 = new screenElem("#FFFFFF", null, 838, 828, 120, 60, true, "50", 0, 42, "36px sans-serif", "#001d87");
var bet4 = new screenElem("#FFFFFF", null, 1074, 828, 120, 60, true, "100", 0, 42, "36px sans-serif", "#001d87"); 
var bets = [bet1, bet2, bet3, bet4];
var betButton = new screenElem("#000066", null, 710, 938, 80, 40, true, "Confirm", 0, 24, "bold 16px sans-serif", "#FFFFFF");

//Screen elements for the menu
var menuBG = new screenElem("#91c0b5", null, 710, 300, 400, 600, true, "", 0, 72, "36px sans-serif", "#001d87");
var menuTitle = new screenElem("rgba(0, 0, 0, 0)", null, 710, 345, 220, 100, true, "MENU", 0, 24, "bold 48px sans-serif", "#000066");
var menuSave = new screenElem("#000066", null, 710, 480, 320, 60, true, "Save", 0, 44, "bold 48px sans-serif", "#FFFFFF");
var menuQuit = new screenElem("#000066", null, 710, 640, 320, 60, true, "Quit", 0, 44, "bold 48px sans-serif", "#FFFFFF");
var menuEvents = new screenElem("#000066", null, 710, 560, 320, 60, true, "Detailed Help", 0, 44, "bold 48px sans-serif", "#FFFFFF");
var menuButtons = [menuSave, menuQuit, menuEvents];

function answer(id, title, points1, points2, points3, points4, points5, points6){ // Function to create answer object that are tied to questions
	this.id = id; 
	this.title = title;
	this.points = [points1, points2, points3, points4, points5, points6];
}

function questions(id, title, QA, ansID, ansTitle, ansPts){ // Function to create question objects to be used in the game
	this.id = id;
	this.title = title;
	this.QA = QA
	this.answer = [
	               new answer(ansID[0], ansTitle[0], ansPts[0], ansPts[1], ansPts[2], ansPts[3], ansPts[4], ansPts[5]),
	               new answer(ansID[1], ansTitle[1], ansPts[6], ansPts[7], ansPts[8], ansPts[9], ansPts[10], ansPts[11]),
	               new answer(ansID[2], ansTitle[2], ansPts[12], ansPts[13], ansPts[14], ansPts[15], ansPts[16], ansPts[17]),
	               new answer(ansID[3], ansTitle[3], ansPts[18], ansPts[19], ansPts[20], ansPts[21], ansPts[22], ansPts[23]),
	               new answer(ansID[4], ansTitle[4], ansPts[24], ansPts[25], ansPts[26], ansPts[27], ansPts[28], ansPts[29])
	];
	this.answered = false;
	this.choice = -1;
	this.clicked = -1;
	this.comment = "";
}


/*var QList = [ // temp array of questions, will be replaced by organized data from server
                 new questions(0, "How important is server virtualization to you?", "Security", [0, 1, 2, 3, 4], 
                		 ["5: Completely essential.", "4: Useful.", "3: Useful but not a priority.", "2: Not important.", "1: Not needed."], 
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2]),
        		 new questions(1, "How useful is scalability?", "Scalability", [5, 6, 7, 8, 9], 
        				 ["5", "4", "3", "2", "1"],
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2]),
        		 new questions(2, "How important is integrability?", "Integrability", [10, 11, 12, 13, 14], 
        				 ["5", "4", "3", "2", "1"],
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2]),
        		 new questions(3, "How important is Availability?", "Availability", [15, 16, 17, 18, 19], 
        				 ["5", "4", "3", "2", "1"], 
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2]),
        		 new questions(4, "How important is Performance?", "Performance", [20, 21, 22, 23, 24], 
        				 ["5", "4", "3", "2", "1"], 
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2]),
        		 new questions(5, "How useful is Maintainability?", "Maintainability", [25, 26, 27, 28, 29], 
        				 ["5", "4", "3", "2", "1"],
                		 [1, 2, 3, 4, 5, 6, 2, 4, 5, 6, 3, 1, 4, 5, 2, 6, 3, 1, 5, 4, 2, 3, 1, 6, 6, 5, 4, 3, 2, 1, 3, 5, 6, 1, 4, 2])
                ];*/
var curQues = -1; // Keeps track of the questions asked. 

// Main draw function. Calls other draw functions depending on mode. Drawing using onload is asynchronous so need to be timed correctly
function draw(moveData, isMoving) { 
	// Draw background
	var background = new Image();
	background.src = "background.jpg";
	background.onload = function() {
		context.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		console.log(" draw height " + CANVAS_HEIGHT);
		console.log(" draw width " + CANVAS_WIDTH);
		// After background is drawn, draw the board TODO: Make the board parts not transparent so we can save time by just drawing the board to hide the pieces.
		var board = new Image();
		board.src = "board.png";
		board.onload = function() {
			context.drawImage(board, 0, 210);
			if(showBonus > 0){
				for(var i in bonusSquares){
					context.fillStyle = "rgba(255, 255, 0, 0.25)";
					context.fillRect(boardSpaces[bonusSquares[i]].x, boardSpaces[bonusSquares[i]].y, 110, 110);
					context.fillStyle = "rgba(255, 255, 255, 0.5)";
					context.fillRect(boardSpaces[bonusSquares[i]].x-10, boardSpaces[bonusSquares[i]].y-10, 130, 130);
				}
				if(isMoving){
					showBonus -= 1;
				}
			}
			// After board is drawn, draw the squares
			drawSquares();
			// Draw the game pieces
			drawPieces();
			if(moveData != null && mode != 13){
				drawSigns(moveData);
			}
			if(isMoving){
				if(mode == 0){ 
					checkBonus();
				}
			}
			if(mode == 4){
				openHelpMenu(1);
			} else if(mode == 5){
				openBetMenu(0);
			} else if(mode == 11 || mode == 13){
				openHelpMenu(1);
			} else if(mode == 12){
				openEndMenu();
			}
		};
	};
}
function drawPieces() {
	for(var i = pieces.length-1; i >= 0; i--){
		pieces[i].draw();
	}
	/*if(mode == 3){
		alert("!"); // Is this really needed?
		openBonusScreen();
	}*/
}
function drawSigns(positions){ // For each piece, draw the floating indicators while preventing complete overlap
	positions.sort(function(a, b){return b.score > a.score ? 1 : -1;});
	console.log(positions);
	var checked = {};
	var pos = 1;
	for(var i in positions){
		var sqr = positions[i].location;
		if(!checked.hasOwnProperty(''+sqr)){	// If the square haven't been checked before
			if(boardSpaces[sqr].orientation == 1){
				positions[i].piece.rankSign.x = boardSpaces[sqr].x+15;
				positions[i].piece.rankSign.y = boardSpaces[sqr].y+140;
				positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x+45;
				positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y+120;
			} else if(boardSpaces[sqr].orientation == 2){
				positions[i].piece.rankSign.x = boardSpaces[sqr].x+140;
				positions[i].piece.rankSign.y = boardSpaces[sqr].y+30;
				positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x+120;
				positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y+45;
			} else if(boardSpaces[sqr].orientation == 3){
				positions[i].piece.rankSign.x = boardSpaces[sqr].x+15;
				positions[i].piece.rankSign.y = boardSpaces[sqr].y-80;
				positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x+45;
				positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y-25;
			} else {
				positions[i].piece.rankSign.x = boardSpaces[sqr].x-110;
				positions[i].piece.rankSign.y = boardSpaces[sqr].y+30;
				positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x-25;
				positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y+45;
			}
			positions[i].piece.rankSign.src = "C"+pos+".png";
			positions[i].piece.rankSign.arrowSrc = "CA"+boardSpaces[sqr].orientation+".png";
			positions[i].piece.rank = pos;
			if(mode == 0 || mode == 11){
				positions[i].piece.rankSign.draw(positions[i].piece.rankSign);
			}
			checked[""+sqr] = 1;							// Record the square as being checked already
			checked[""+sqr+"rank"] = pos;					// Record the rank
			checked[""+sqr+"score"] = [positions[i].score];	// Record the score of the piece on the square
			pos += 1;
		} else {
			if(checked[""+sqr+"score"].indexOf(positions[i].score) == -1){	// If the scores of the two pieces are not the same
				if(boardSpaces[sqr].orientation == 1){ // Check where the sign should be placed
					positions[i].piece.rankSign.x = boardSpaces[sqr].x+15+25*(checked[""+sqr]-1); // Place the sign to not completely cover each other
					positions[i].piece.rankSign.y = boardSpaces[sqr].y+200+25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowX = 0;
					positions[i].piece.rankSign.arrowY = 0;
				} else if(boardSpaces[sqr].orientation == 2){
					positions[i].piece.rankSign.x = boardSpaces[sqr].x+140+25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.y = boardSpaces[sqr].y+90+25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x+120+25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y+105+25*(checked[""+sqr]-1);
				} else if(boardSpaces[sqr].orientation == 3){
					positions[i].piece.rankSign.x = boardSpaces[sqr].x+15+25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.y = boardSpaces[sqr].y-140-25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowX = 0;
					positions[i].piece.rankSign.arrowY = 0;
				} else {
					positions[i].piece.rankSign.x = boardSpaces[sqr].x-110-25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.y = boardSpaces[sqr].y-30-25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowX = boardSpaces[sqr].x-25-25*(checked[""+sqr]-1);
					positions[i].piece.rankSign.arrowY = boardSpaces[sqr].y-15-25*(checked[""+sqr]-1);
				}
				positions[i].piece.rankSign.src = "C"+pos+".png";
				positions[i].piece.rankSign.arrowSrc = "CA"+boardSpaces[sqr].orientation+".png";
				positions[i].piece.rank = pos;
				if(mode == 0 || mode == 11){
					positions[i].piece.rankSign.draw(positions[i].piece.rankSign);
				}
				checked[""+sqr] += 1;
				checked[""+sqr+"rank"] = pos;
				checked[""+sqr+"score"].push(positions[i].score);
				pos += 1;
			} else {
				positions[i].piece.rankSign.src = "C"+(pos-1)+".png";
				positions[i].piece.rank = checked[""+sqr+"rank"];
			}
		}
	}
	if(mode == 9){
		openEndMenu(); // The game is over
	}
}
function checkBonus(){
	bonusCount = 0;
	for(var l in pieces){ // Highlight the bonus squares
		var isBonus = bonusSquares.indexOf(pieces[l].loc);
		if(isBonus > -1){console.log(pieces[l].loc);
			console.log(bonusSquares);
			context.fillStyle = "rgba(255, 255, 0, 0.25)";
			context.fillRect(boardSpaces[pieces[l].loc].x, boardSpaces[pieces[l].loc].y, 110, 110);
			context.fillStyle = "rgba(255, 255, 255, 0.5)";
			context.fillRect(boardSpaces[pieces[l].loc].x-10, boardSpaces[pieces[l].loc].y-10, 130, 130);
			context.fillStyle = "rgba(255, 255, 255, 0.25)";
			context.fillRect(boardSpaces[pieces[l].loc].x-20, boardSpaces[pieces[l].loc].y-20, 150, 150);
			bonusSquares.splice(isBonus, 1);
			bonusCount += 1;
		}
	}
	// For # of bonus squares: (should the player gain some coins just for landing on a BS?)
	// 1: random of: tip/fact, current news, show BS location (3 turns?), bonus coins, guess which cloud is first (and show you what it is)
	// 2: random of: guess which cloud is first (and show you what it is), change amount/type of bet (separated?), more bonus coins
	// 3 or more: choose between (not random): guess which cloud is first (and show you what it is), change amount/type of bet (separated?), even more bonus coins
	// # of coins gained increases when landing on 4 or more BS has landed on a BONUS SQUARE!
	if(bonusCount > 0){
		if(bonusCount < 3){
			if(bonusCount == 1){
				var tempList = lowEvents.slice();
			} else {
				var tempList = midEvents.slice();
			}
			var idx = tempList.indexOf(lastEvent);
			if(idx > -1){
				tempList.splice(idx, 1);
			}
			var num = Math.floor(Math.random() * tempList.length);
			lastEvent = tempList[num];
			
		}
		bnsTitle.text = "It's Bonus time! Click to continue.";
		quesBG.draw();
	    context.textAlign="center"; 
	    context.font = "bold 80px sans-serif";
	    bnsTitle.drawResize(false);
	    context.textAlign="left";
	    mode = 2;
	}
	if(bonusSquares.length < 3){ // If there's not many BS left, add more. 
		setBonusSquares(MAX_BONUS_SQUARES-bonusSquares.length);
	}
}

function writeMessage(canvas, message) { // Was used for debugging, no longer used
    //context.clearRect(10, 8, 270, 24);
	context.fillStyle="#8fefbf";
	context.fillRect(10, 8, 300, 24);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
  }
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: parseInt(evt.clientX - rect.left),
		y: parseInt(evt.clientY - rect.top)
	};
}
function openHelpMenu(type){ // If type is 1, show the normal help menu, else show the advanced help menu
	dimOut.draw();
	helpBG.draw();
	if(type == 1){
		if(mode == 11 || mode == 13){welcomeText1.text = "Welcome Back to Cloud Race!";}else{welcomeText1.text = "Welcome to Cloud Race!";}
		helpText1.text = helpDesc01;
		welcomeText1.color = "#d3d3d3";
		welcomeText1.font = "bold 48px sans-serif"
		helpText1.drawWrap(45);
	} else {
		helpText1.text = helpDesc02;
		helpText1.font = "36px sans-serif"
		welcomeText1.text = "Bonus Square Events:";
		welcomeText1.color = "#d3d3d3";
		welcomeText1.font = "bold 48px sans-serif"
		helpText1.drawWrap(34);
	}
	context.textAlign="center";
	if(mode == 4 || mode == 11 || mode == 13 || type == 2){
		welcomeText1.draw();
	}
	helpTextEnd.draw();
	context.textAlign="left"; 
}
function openBonusScreen(){
	bonusText1.text = "You have landed on "+bonusCount+" bonus squares!"; 
	if(bonusCount < 3){
		bonusText2.text = "The randomly selected event is: ";
		bonusTextEnd.text = "(Click anywhere in the game to continue.)";
		if(bonusCount == 1){
			bonusText1.text = "You have landed on a bonus square!";
		}
		eventCenter.src = lastEvent+".png";
	} else {
		bonusTextEnd.text = "(Click on an icon to select the event.)";
		bonusText2.text = "Choose from these three events: ";
		eventCenter.src = "Guess Which Cloud is First.png";
	}
	bonusText3.text = eventCenter.src.replace(".png", "");
	dimOut.draw();
	bonusBG.draw();
	context.textAlign="center";
	bonusText1.draw();
	bonusText2.draw();
	bonusText3.draw();
	bonusTextEnd.draw();
	eventCenter.drawPic(eventCenter);
	if(bonusCount > 2){
		eventLeft.drawPic(eventLeft);
		eventRight.drawPic(eventRight);
	}
	context.textAlign="left";
}
function openBetMenu(type){
	dimOut.draw(); 
	chooseBG.draw(); //TODO: change what part of bet can be changed based on the int of type
	welcomeText1.text = "Please select your bet and the type of cloud you think will be the best for your project.";
	welcomeText1.color = "#c2dcd6";
	welcomeText1.font = "bold 24px sans-serif"
	context.textAlign="center";
	welcomeText1.draw(false);
	for(var i in clouds){
		clouds[i].drawResize(true);
	}
	for(var j in bets){
		bets[j].drawResize(true);
	}
	betButton.text = "Confirm";
	betButton.drawResize(false);
	if(lastEvent == "none" && parseInt(playerCoins)+parseInt(playerStartingCoins) < 10){
		playerCoins = 10;
		alert("You're a bit poor, so we gave you some coins.");
	}
	betText2.text = "Your Coins: "+(parseInt(playerCoins)+parseInt(playerStartingCoins));
	betText2.drawResize(false);
	context.textAlign="left";
}
function openTextMenu(type){
	if(type == 0){ // facts/tips
		//call tips stored procedure
		console.log(tipsFlag);
		if(tipsFlag == false){
			var QAString = "";
			for(var i = 0; i < QAArray.length; i++){
				QAString+=(QAArray[i])+",";
				console.log("qaarray"+QAArray[i]);
			}
			console.log(QAString);
			var gameInfo = {
		    		fn : 5,
					QAArray : QAString
				};
			$.post("/game1.1/gameController", gameInfo, function(list) {
		    	console.log(QAString);
				if(list != null){
				 	$.each(list, function(index, data) {
						//QuestionID, QuestionValue, AnswerID, AnswerValue, ModelID, ModelAnswerValue, QualityAttributeName
						//quesInfo(id, title, qa, notes, asked)
				 		tipsArray.push(new tipInfo(data.TipID, data.TipQA, data.TipName, data.TipDescription));
					});
					shuffle(tipsArray);	
					console.log(tipsArray);
					tipsFlag = true;
					openTextMenu(0);
				} else {
					alert("Failed to load tips. The database is busy.");
				}
			});
		}
		//replace tipsArray with tipsData?
		console.log(tipsArray.length);
		if(tipsArray.length > 0){
			var num = 0;
			console.log(tipsArray);
			console.log(QList[curQues-1].QA);
			console.log(tipsArray[0].QA);
			while(num < tipsArray.length && QList[curQues-1].QA != tipsArray[num].QA && tipsArray[num].QA != "None"){
				console.log(QList[curQues-1].QA);
				console.log(tipsArray[num].QA);
				num += 1;
			}
			console.log(num);
			if(num < tipsArray.length){
				bonusText1.text = tipsArray[num].TipName;
				bonusText2.text = tipsArray[num].TipDescription;
				tipsArray.splice(num, 1);
			} else {
				bonusText1.text = "No tips to display for this question";
				bonusText2.text = "Sorry!";
			}
		} else {
			bonusText1.text = "No more tips to display";
			bonusText2.text = "Sorry!";
		}
	} else { // news
		if(newsArray.length > 0){
			var num = Math.floor(Math.random() * newsArray.length);
			bonusText1.text = "In current news:";
			bonusText2.text = newsArray[num];
			newsArray.splice(num, 1);
		} else {
			bonusText1.text = "No more news to display";
			bonusText2.text = "Sorry!";
		}
	}
	dimOut.draw(); 
	bonusBG.draw();
	context.textAlign="center";
	bonusText1.draw();
	bonusText2.drawWrap(45);
	context.textAlign="left";
}
function openGuessMenu(){
	cloudGuess = -1;
	if(modelBet > -1){
		clouds[modelBet].color = "#FFFFFF";
		clouds[modelBet].fontColor = "#001d87";
	}
	dimOut.draw(); 
	chooseBG.draw();
	welcomeText1.text = "Can you guess which cloud the "+positions[0].piece.name+"-colored piece represents?";
	welcomeText1.color = "#c2dcd6";
	welcomeText1.font = "bold 24px sans-serif"
	context.textAlign="center";
	welcomeText1.draw(false);
	for(var i in clouds){
		clouds[i].drawResize(true);
	}
	var tempSprite = new Image();
	tempSprite.src = "images/bcs-"+positions[0].piece.name+".png";
	tempSprite.onload = function() {
		context.drawImage(tempSprite, 710-30, 770, 60, 60);
		context.fillStyle = "#000000";
		context.strokeRect(710-10-30, 770-10, 60+20, 60+20);
	};
	betButton.text = "Guess";
	betButton.drawResize(false);
	context.textAlign="left";
}
function openEndMenu(){
	bonusText2.text = "Hover over the pieces to see which piece is which cloud.";
	bonusText3.text = positions[0].piece.cloud;
	bonusTextEnd.text = "(Click anywhere in the game to continue.)";
	dimOut.draw();
	bonusBG.draw();
	context.textAlign="center";
	bonusText2.draw();
	bonusText3.draw();
	bonusTextEnd.draw();
	var lastRank = -1;
	var firstRank = -1;
	for(var i = positions.length-1; i > -1; i--){ // Place the image of the pieces according to their place
		var uwai;
		if(lastRank == -1){
			lastRank = positions[i].piece.rank;
			uwai = 694;
		} else {
			uwai = 694 - (lastRank - positions[i].piece.rank)*46;
		}
		var place = i+1;
		var eks = 383 + ((place%2-1)*(6-place)*-60) + ((place%2)*((place-1)*60+360));
		if(firstRank == -1 && positions[i].piece.rank == 1){
			firstRank = i;
		}
		//console.log("pos: "+i+", color: "+positions[i].piece.name+", rank: "+positions[i].piece.rank+", ("+eks+" "+uwai+")");
		positions[i].piece.x = eks;
		positions[i].piece.y = uwai;
		positions[i].piece.rankSign.arrowSrc = "CA1.png";
		positions[i].piece.rankSign.x = eks-8;
		positions[i].piece.rankSign.y = uwai+62+20;
		positions[i].piece.rankSign.arrowX = eks+21;
		positions[i].piece.rankSign.arrowY = uwai+62;
		positions[i].piece.rankSign.draw(positions[i].piece.rankSign);
		 
	}
	if(firstRank == 0){
		bonusText1.text = "And the winner is "+positions[0].piece.cloud+"!";
		if(positions[0].piece.cloud === cloudList[modelBet]){
			ween = true;
		}
	} else {
		bonusText1.text = "And the winners are: ";
		for(var i = firstRank; i > -1; i--){
			if(i == firstRank){
				bonusText1.text += positions[i].piece.cloud;
			} else if(i == 0){
				bonusText1.text += " and "+positions[0].piece.cloud+"!";
			} else {
				bonusText1.text += ", "+positions[i].piece.cloud;
			}
			if(ween == false && positions[i].piece.cloud === cloudList[modelBet]){
				ween = true;
			}
		}
	}
	bonusText1.drawResize();
	drawPieces();
	context.textAlign="left";
	if(mode != 12){
		saveGame();
	}
	// TODO close tab warning if not finished saving
}
function openMainMenu(){
	dimOut.draw(); 
	context.textAlign="center";
	menuBG.drawResize(false);
	menuTitle.drawResize(false);
	for(var i in menuButtons){
		menuButtons[i].drawResize(false);
	}
	context.textAlign="left";
}

function makeMove(array){ // TODO: character limit?
	//var array = [1, 2, 3, 4, 5, 6];
	//var array = [1, 1, 1, 1, 1, 1]; //Switch arrays to see how it looks like if all 6 is clumped together
	//console.log("Below");
	//console.log(array);
	positions.length = 0;
	//for(var i = pieces.length-1; i >= 0; i--){
	for(var i = 0; i < pieces.length; i++){
		//var num = Math.floor(Math.random() * (i - 0 + 1)); // Get the number of spaces to move (currently random)
		//if(i == 2){array[num]=1;}else if(i == 4){array[num]=31;} // test code to simulate lapping behavior
		//var dest = pieces[5-i].loc+array[num];
		var dest = pieces[i].loc+parseInt(array[i]);
		//console.log(dest);
		if(dest > 30){ // If the end is reached, loop back to start
			dest -= 30;
		}
		//console.log(dest);
		if(boardSpaces[dest].occupants.length > 0){ // If there's already a piece in destination (we don't want the pieces to completely overlap each other)
			var numPieces = 0;
			for(var j in boardSpaces[dest].occupants) { // Check to see if the occupants have moved yet this turn
				if(boardSpaces[dest].occupants[j] < (i)){ // That piece has a smaller number than this piece, which means it's already moved
					numPieces += 1;
				}
			}
			if(numPieces == 0){ // Draw the pieces to not completely cover each other
				pieces[i].x = boardSpaces[dest].x+27;
				pieces[i].y = boardSpaces[dest].y+27;
			} else if((boardSpaces[dest].orientation != 4 && numPieces == 1) || (boardSpaces[dest].orientation == 4 && numPieces == 2)){ 
				pieces[i].x = boardSpaces[dest].x+50;
				pieces[i].y = boardSpaces[dest].y+57;
			} else if((boardSpaces[dest].orientation != 4 && numPieces == 2) || (boardSpaces[dest].orientation == 4 && numPieces == 1)){
				pieces[i].x = boardSpaces[dest].x-7;
				pieces[i].y = boardSpaces[dest].y-7;
			} else if(numPieces == 3){
				pieces[i].x = boardSpaces[dest].x+7;
				pieces[i].y = boardSpaces[dest].y+57;
			} else if(numPieces == 4){
				pieces[i].x = boardSpaces[dest].x+57;
				pieces[i].y = boardSpaces[dest].y+7;
			} else {
				pieces[i].x = boardSpaces[dest].x+27;
				pieces[i].y = boardSpaces[dest].y-7;
			}
		} else { // If there are no pieces in destination
			pieces[i].x = boardSpaces[dest].x+27;
			pieces[i].y = boardSpaces[dest].y+27;
		}
		var index = boardSpaces[pieces[i].loc].occupants.indexOf(i);
		if (index > -1) {
			boardSpaces[pieces[i].loc].occupants.splice(index, 1); // Remove piece from former space
		}
		pieces[i].loc = dest;
		boardSpaces[dest].occupants.push(i);
		//pieces[5-i].score += array[num];
		//pieces[i].score += array[i];
		positions.push({
			piece: pieces[i],
			location: pieces[i].loc,
			score: pieces[i].score
		});
		//array.splice(num, 1);
	}
	draw(positions, true); // Draw the board, including the signs
	//getDB();
}
//$(document).ready(function() {
function prepGame(qQues, qClouds){ // Function to run when starting the game.
	window.onbeforeunload = function(event) {
		console.log(qString);
		console.log(currentSave);
		if(currentSave < qString.length && qString[currentSave] != ""){
			emergencySaveGame();
		    event.returnValue = "Please wait until the game is done saving.";
		}
	};
	
	
	canvas = document.getElementById("interface");
	context = canvas.getContext('2d');
	container = document.getElementById("app");
	
	//var stretch_flag = false;

	function resize_canvas(){
		
		//canvas = document.getElementById("interface");
		//context = canvas.getContext('2d');
		
		
		
		console.log("resized");
		
		var ratio = canvas.width/canvas.height;
		var newRatio = ratio;
		
		var newWidth = window.innerWidth;
		var newHeight = window.innerHeight;
		console.log("container"+container.style.width+".");
		
		var oldWidth;
		var oldHeight;
		
		var oldContainerW = container.style.width.replace("px","");
		var oldContainerH = container.style.height.replace("px","");
		
		if(oldContainerW == ""){
			oldWidth = CANVAS_WIDTH;
			
		}else{
		oldWidth = parseInt(container.style.width.replace('px',''));}
		
		if(oldContainerH == ""){
			oldHeight = CANVAS_HEIGHT;
		}else{
		oldHeight = parseInt(container.style.height.replace('px',''));}

		
		console.log("old width "+oldWidth);
		console.log("old height "+oldHeight);
		
		
		widthRatio = newWidth/oldWidth;
		console.log("width ratio "+ratioWidth);
		
		heightRatio = newHeight/oldHeight;
		console.log("height ratio "+ ratioHeight);
		
		/*var x = menuButton.x;
		
		menuButton.x = x * ratioWidth;
		menuButton.width = menuButton.width * ratioWidth;
		
		console.log("menu x "+menuButton.x);
		var y = menuButton.y;
		
		menuButton.y = y * ratioHeight;
		menuButton.height = menuButton.height * ratioHeight;*/

		
		//var oldToNew = newWidth/canvas.width;
		
			newRatio = newWidth/newHeight;
		
		
		
		if(newRatio>ratio){
			newWidth = newHeight * ratio;
			container.style.width = newWidth + 'px';
			container.style.height = newHeight + 'px';
		}
		else{
			newHeight = newWidth/ratio;
			container.style.width = newWidth + 'px';
			container.style.height = newHeight + 'px';
		}
		//container.style.marginTop = (-newHeight/2) + 'px';
		//container.style.marginLeft = (-newWidth/2) + 'px';
		
		//CANVAS_HEIGHT = newHeight;
		//CANVAS_WIDTH = newWidth;
		
		/*console.log("newWidth " + newWidth);
		console.log("newHeight "+newHeight);
		console.log("new width "+ CANVAS_WIDTH);
		console.log("new height "+ CANVAS_HEIGHT);*/
		draw(null,false);
	}

	window.addEventListener('resize', function () {
	    resize_canvas();
	}, false);

	
	// also resize the screen on orientation changes
	/*window.addEventListener('orientationchange', function () {
		resize_canvas();
	}, false);*/

	// draw the image on canvas
	// note that you dont need to redraw on resize since the canvas element stays intact    
	draw(null,false);

	// first resize
	//resize_canvas();
	
	
	
	/*window.addEventListener('load', resize_canvas(), false);
	window.addEventListener('resize', resize_canvas(), false);
	
	function resize_canvas(){
		
		console.log("resized");
		canvas.height = window.innerHeight;
		canvas.width = window.innerHeight;
		
		
		console.log("resize height "+ canvas.height);
		if(canvas.height < window.innerHeight){
			//CANVAS_HEIGHT = window.innerHeight;
			canvas.height = window.innerHeight;
			console.log(CANVAS_HEIGHT);
			console.log("resize height "+ canvas.height);
		}
		if(CANVAS_WIDTH < window.innerWidth){
			CANVAS_WIDTH = window.innerWidth;
			console.log(CANVAS_WIDTH);
		}
		draw(null, false);
		//drawPieces();
	}
	
	resize_canvas();
	/*function resize(){
		
		var height = window.innerHeight;
		console.log("height "+ height);
		var ratio = CANVAS_WIDTH/CANVAS_HEIGHT;
		console.log("ratio "+ ratio);
		var width = height * ratio;
		console.log("width" + width);
		
		CANVAS_HEIGHT = height;
		CANVAS_WIDTH = width;
		console.log("resize  " + CANVAS_HEIGHT + "width " + CANVAS_WIDTH);
		draw(null, false);
	}*/
	
	
	
	console.log(gameName);
	for(var k = 0; k < qQues.length; k++){
		if(qQues[k].QuestionAsked == 0){
			QList.push(new questions(qQues[k].QuestionID, qQues[k].QuestionTitle, qQues[k].QAName, qQues[k].AnswerID.slice(), qQues[k].AnswerTitle.slice(), qQues[k].AnswerValue.slice()));
			QList[QList.length-1].answered = qQues[k].QuestionAsked;
		} else {
			AList.push(new questions(qQues[k].QuestionID, qQues[k].QuestionTitle, qQues[k].QAName, qQues[k].AnswerID.slice(), qQues[k].AnswerTitle.slice(), qQues[k].AnswerValue.slice()));
			AList[AList.length-1].answered = qQues[k].QuestionAsked;
			AList[AList.length-1].choice = qQues[k].choice;
			AList[AList.length-1].clicked = qQues[k].AnswerID.indexOf(qQues[k].choice);
			AList[AList.length-1].comment = qQues[k].UserNotes;
		}
	}
	shuffle(QList);
	console.log(QList);
	totalQuestions = AList.length + QList.length;
	questionAsked += AList.length;
	setBonusSquares(MAX_BONUS_SQUARES);
	nextQuestion(); 
	
	if(qClouds == null){
		var tea = new piece("tea", 70, 920,60, "bcs-tea", "100", "120", "0");
		var blue = new piece("blue", 0, 980, 60, "bcs-blue", "0", "120", "255");
		var red = new piece("red", 30, 1000, 60, "bcs-red", "255", "0", "0");
		var black = new piece("black", 0, 920, 60, "bcs-black", "50", "50", "50");
		var green = new piece("green", 30, 950, 60, "bcs-green", "0", "180", "0");
		var purple = new piece("purple", 70, 980, 60, "bcs-purple", "255", "0", "255");
		pieces = [tea, blue, red, black, green, purple];
		var tempList = cloudList.slice();
		for(var i in pieces){
			for(var k in QAArray){ // Initialize scores array for each cloud
				pieces[i].QAScores.push(0);
			}
			pieces[i].init();
			var num = Math.floor(Math.random() * tempList.length);
			pieces[i].cloud = tempList[num]; // Assign a random cloud to each piece
			//pieces[i].cloud = tempList[i];
			tempList.splice(num, 1);
		}
		draw(null, false); // Draw the board, not including the signs
	} else {
		var tempList = qClouds.slice();
		var scoreTrack = 0;
		//console.log(qClouds);
		for(var i = 0; i < 6; i++){
			pieces.push(new piece(pieceNames[i], 0, 0,60, "bcs-"+pieceNames[i], pieceColors[i].red, pieceColors[i].green, pieceColors[i].blue));
			for(var k in QAArray){ // Initialize scores array for each cloud
				pieces[pieces.length-1].QAScores.push(0);
			}
			pieces[pieces.length-1].init();
			var num = Math.floor(Math.random() * tempList.length);
			pieces[pieces.length-1].cloud = cloudList[tempList[num].ModelID-1]; // cloud qascore, score location
			pieces[pieces.length-1].QAScores = tempList[num].ModelAnswerValue.slice();
			//console.log(tempList[num].ModelAnswerValue.slice());
			//console.log(pieces[pieces.length-1].QAScores);
			var tempscore = 0; for(var o = 0; o < pieces[pieces.length-1].QAScores.length; o++){tempscore+=parseInt(pieces[pieces.length-1].QAScores[o]);}
			pieces[pieces.length-1].score = tempscore;
			scoreTrack += tempscore;
			if(tempscore%31 == 0 && AList.length > 0){
				var temploc = 1;
			} else {
				var temploc = tempscore%31;
			}
			//console.log(temploc);
			pieces[pieces.length-1].loc = temploc;
			tempList.splice(num, 1);
		}
		if(QList.length > 0){
			mode = 11;
		} else {
			mode = 12;
		}
		if(scoreTrack > 0){
			boardSpaces[0].occupants.length = 0;
			makeMove([0, 0, 0, 0, 0, 0]);
		} else {
			mode = 13;
			makeMove([0, 0, 0, 0, 0, 0]);
		}
		for(var l = 0; l < bets.length; l++){if(bets[l].text == ""+bet){bet = l;break;}}
		if(modelBet > -1 && bet > -1 && bet < 4){
			clouds[modelBet].color = "#001d87";
			clouds[modelBet].fontColor = "#FFFFFF";
			bets[bet].color = "#001d87";
			bets[bet].fontColor = "#FFFFFF";
		} else {
			modelBet = -1;
			bet = -1;
		}
	}
	
	//console.log(gameName);
	/*for(var j in pieces){
		console.log("The "+pieces[j].name+" piece is the cloud "+pieces[j].cloud+".");
	}*/
	
	
	
	
	
	canvas.addEventListener('mousemove', function(evt) { // Function to handle mousing over screen elements
	    var mousePos = getMousePos(canvas, evt);
	    var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
	    $("p[id^=posMsg]").text(message);
	    if(mode == 3){
	    	var hover = false;
	    	if(bonusCount > 2){
	    		if(eventLeft.clicked(mousePos.x, mousePos.y, true)){
	        		bonusText3.text = eventLeft.src.replace(".png", "");
	        		hover = true;
	        	} else if(eventRight.clicked(mousePos.x, mousePos.y, true)){
	        		bonusText3.text = eventRight.src.replace(".png", "");
	        		hover = true;
	        	}
	    	}
	    	if(eventCenter.clicked(mousePos.x, mousePos.y, true)){
	    		bonusText3.text = eventCenter.src.replace(".png", "");
	    		hover = true;
	    	}
	    	if(hover){
	    		context.fillStyle="#006400";
	    		context.fillRect(450, 860, 500, 50);
	    		context.textAlign = "center";
	    		bonusText3.draw();
	    		context.textAlign = "left";
	    	}
	    } else if(mode == 0){
	    	for(var i = 0; i < quesAnsw.length; i++){
	    		if(quesAnsw[i].clicked(mousePos.x,mousePos.y)){
	    			for(var j=0;j<quesAnsw.length;j++){
	    				if(j <= i){
	    					quesAnsw2[j].draw();
	    				} else {
	    					quesAnsw[j].draw();
	    				}
	    			}
	    			break;
	    		}
	    	}
	    }
	    else if(mode == 9 || mode == 12){
	    	var hover = false;
	    	for(var i in pieces){
	    		if(pieces[i].clicked(mousePos.x, mousePos.y)){
	        		bonusText3.text = pieces[i].cloud;
	        		hover = true;
	        	}
	    	}
	    	if(hover){
	    		context.fillStyle="#006400";
	    		context.fillRect(450, 860, 500, 50);
	    		context.textAlign = "center";
	    		bonusText3.draw();
	    		context.textAlign = "left";
	    	}
	    }
	    //writeMessage(canvas, message);
	 }, false);

	$("#interface").click(function(evt){ // Function to handle click events
	    var x = Math.floor((evt.pageX-$("#interface").offset().left) / 20);
	    var y = Math.floor((evt.pageY-$("#interface").offset().top) / 20);
		var mousePos = getMousePos(canvas, evt);
	    var message = 'You Clicked: ' + mousePos.x + ',' + mousePos.y;
	    /*context.fillStyle = "rgb(255,255,255)";
	    context.fillRect(x*20, y*20, 20, 20);*/
	    message += ". Position of square (20x20) on grid is: "+x*20+" "+y*20;
	    //alert(mode);
	    if(mode == 0){
	        if(HUD.clicked(mousePos.x, mousePos.y, false)){
	        	if(menuButton.clicked(mousePos.x, mousePos.y, false)){
		        	mode = 10;
		        	openMainMenu();
	        	} else if(helpButton.clicked(mousePos.x, mousePos.y, false)){
		        	mode = 1;
		        	openHelpMenu(1);
	        	}
	        } else if(quesBG.clicked(mousePos.x, mousePos.y, false)){
	        	for(var i = 0, len = quesAnsw.length; i < len; i++) {
        			if(quesAnsw[i].clicked(mousePos.x, mousePos.y, false)){
                		//var array = answerQuestion(i);
        				var userTxt = document.getElementById('userComments').value;
        				if(userTxt.indexOf("~") == -1 && userTxt.indexOf("|") == -1){
        					QList[curQues].comment = userTxt;
        					$("#userComments").val('');
	                		makeMove(answerQuestion(i));
        				} else {
        					alert("Please remove special characters ~ and | from your comments below.");
        				}
            			break;
                	}
        		}
	        }/* else {
	        	for(var i in pieces) {
	    			if(pieces[i].clicked(mousePos.x, mousePos.y)){
	    				$("#msg").text("The "+pieces[i].name+" piece is clicked! "+message);
	            		//alert("The "+pieces[i].name+" piece is clicked! "+message);
	        			break;
	            	}
	    		}
	        }*/
	    } else if(mode == 1) {
	    	mode = 0;
	    	if(boardSpaces[0].occupants.length > 0){
	    		draw(null, false);
	    	} else {
	    		draw(positions, false);
	    	}
	    } else if(mode == 2){
	    	mode = 3;
			openBonusScreen();
	    } else if(mode == 3){
	    	if(bonusCount < 3){
	        	if(lastEvent == "Show Bonus Squares"){
	        		showBonus = 3;
	        		mode = 0;
	        		draw(positions, false);
	        	} else if(lastEvent == "Facts and Tips"){
	        		mode = 6;
	        		openTextMenu(0);
	        	} else if(lastEvent == "Current News"){
	        		mode = 7;
	        		openTextMenu(1);
	        	} else if(lastEvent == "Guess Which Cloud is First"){
	        		mode = 8;
	        		openGuessMenu();
	        	} else if(lastEvent == "Change Your Bet"){
	        		mode = 5;
	        		draw(positions, false);
	        	} else {
	        		console.log(playerCoins);
	        		playerCoins = parseInt(playerCoins) + bonusCount * 10;
	        		alert("You gained "+bonusCount * 10+" coins!");
	        		console.log(playerCoins);
	        		mode = 0;
	        		draw(positions, false);
	        	}
	    	} else {
	    		if(eventLeft.clicked(mousePos.x, mousePos.y, true)){
	    			console.log(playerCoins);
	    			playerCoins = parseInt(playerCoins) + bonusCount * 10;
	        		alert("You gained "+bonusCount * 10+" coins!");
	        		console.log(playerCoins);
	        		mode = 0;
	        		draw(positions, false);
	        	} else if(eventRight.clicked(mousePos.x, mousePos.y, true)){
	        		mode = 5;
	        		draw(positions, false);
	        	} else if(eventCenter.clicked(mousePos.x, mousePos.y, true)){
	        		mode = 8;
	        		openGuessMenu();
	        	}
	    	}
	    } else if(mode == 4){
	    	mode = 5;
	    	draw(null, false);
	    } else if(mode == 5){
	    	if(chooseBG.clicked(mousePos.x, mousePos.y, false)){
	    		for(var i in clouds){
	    			if(clouds[i].clicked(mousePos.x, mousePos.y, true)){
	    				if(modelBet != -1){
	    					clouds[modelBet].color = "#FFFFFF";
	    					clouds[modelBet].fontColor = "#001d87";
	                		context.textAlign = "center";
	        				clouds[modelBet].drawResize(true);
	                		context.textAlign = "left";
	    				}
	    				if(modelBet != i){
	        				clouds[i].color = "#001d87";
	        				clouds[i].fontColor = "#FFFFFF";
	        				context.textAlign = "center";
	        				clouds[i].drawResize(true);
	        				context.textAlign = "left";
	        				modelBet = i;
	        				break;
	    				} else {
	    					modelBet = -1;
	    					break;
	    				}
	    			}
	    		}
	    		for(var j in bets){
	    			if(bets[j].clicked(mousePos.x, mousePos.y, true)){
	    				if((bet != -1 && parseInt(bets[j].text) <= (parseInt(playerCoins)+parseInt(playerStartingCoins)) + parseInt(bets[bet].text)) ||
	    						(bet == -1 && parseInt(bets[j].text) <= (parseInt(playerCoins)+parseInt(playerStartingCoins)))){
		    				if(bet != -1){
		    					bets[bet].color = "#FFFFFF";
		    					bets[bet].fontColor = "#001d87";
		        				context.textAlign = "center";
		        				bets[bet].drawResize(true);
		        				context.textAlign = "left";
		        				playerCoins = parseInt(playerCoins) + parseInt(bets[bet].text); 
		    				}
		    				if(bet != j){
		    					bets[j].color = "#001d87";
		    					bets[j].fontColor = "#FFFFFF";
		        				context.textAlign = "center";
		        				bets[j].drawResize(true);
		        				context.textAlign = "left";
		        				bet = j;
		        				playerCoins = parseInt(playerCoins) - parseInt(bets[bet].text); 
		        				betText2.text = "Your Coins: "+(parseInt(playerCoins)+parseInt(playerStartingCoins));
		        				context.fillStyle="#c2dcd6";
		        	    		context.fillRect(710, 730, 500, 50);
		        	    		context.textAlign = "center";
		        	    		betText2.drawResize(false);
		        	    		context.textAlign = "left";
		        				break;
		    				} else {
		    					bet = -1;
		    					betText2.text = "Your Coins: "+(parseInt(playerCoins)+parseInt(playerStartingCoins));
		        				context.fillStyle="#c2dcd6";
		        	    		context.fillRect(710, 730, 500, 50);
		        	    		context.textAlign = "center";
		        	    		betText2.drawResize(false);
		        	    		context.textAlign = "left";
		    					break;
		    				}
	    				} else {
	    					if(bet != -1){
	    						console.log("bet: "+bets[j].text+" <= "+((parseInt(playerCoins)+parseInt(playerStartingCoins)) + parseInt(bets[bet].text)));
	    					} else {
	    						console.log("no bet : "+bets[j].text+" <= "+(parseInt(playerCoins)+parseInt(playerStartingCoins)));

	    					}
	    					console.log(playerCoins);
	    					console.log(playerStartingCoins);
	    					alert("Sorry! You don't have enough coins for that bet.");
	    					break;
	    				}
	    			}
	    		}
	    		if(betButton.clicked(mousePos.x, mousePos.y, true)){
	    			if(modelBet == -1 && bet == -1){
	    				alert("Please select a cloud and a bet amount.");
	    			} else if(modelBet == -1) {
	    				alert("Please select the cloud you think is best for your project.");
	    			} else if(bet == -1) {
	    				alert("Plese select the amount you want to bet on "+clouds[modelBet].text+".");
	    			} else {
	    				mode = 0;
	    				if(lastEvent == "none"){
	    					//alert("You have bet "+bets[bet].text+" coins on "+cloudList[modelBet]+". The game will now begin.");
	        				draw(null, false);
	    				} else {
	    					//alert("You have changed your bet to "+bets[bet].text+" coins on "+cloudList[modelBet]+"."); // TODO: don't display this message if bet hasn't actually changed
	    					draw(positions, false);
	    				}
	    			}
	    		}
	    	}
	    } else if(mode == 6 || mode == 7){
	    	mode = 0;
	    	draw(positions, false);
	    } else if(mode == 8){
	    	if(chooseBG.clicked(mousePos.x, mousePos.y, false)){
	    		for(var i in clouds){
	    			if(clouds[i].clicked(mousePos.x, mousePos.y, true)){
	    				if(cloudGuess != -1){
	    					clouds[cloudGuess].color = "#FFFFFF";
	    					clouds[cloudGuess].fontColor = "#001d87";
	                		context.textAlign = "center";
	        				clouds[cloudGuess].drawResize(true);
	                		context.textAlign = "left";
	    				}
	    				if(cloudGuess != i){
	        				clouds[i].color = "#001d87";
	        				clouds[i].fontColor = "#FFFFFF";
	        				context.textAlign = "center";
	        				clouds[i].drawResize(true);
	        				context.textAlign = "left";
	        				cloudGuess = i;
	        				break;
	    				} else {
	    					cloudGuess = -1;
	    					break;
	    				}
	    			}
	    		}
	    		if(betButton.clicked(mousePos.x, mousePos.y, true)){
	    			if(cloudGuess == -1){
	    				alert("Please select the cloud you think the piece represents.");
	    			} else {
	    				console.log(positions[0].piece.cloud+" is equal to "+clouds[cloudGuess].text+"?");
	    				if(positions[0].piece.cloud === clouds[cloudGuess].text){
	    					console.log(playerCoins);
	    					alert("Congratulations! The "+positions[0].piece.name+"-colored piece represents "+positions[0].piece.cloud+"! You gained 50 coins!");
	    					playerCoins = parseInt(playerCoins) + 50;
	    					console.log(playerCoins);
	    				} else {
	    					alert("Sorry! The "+positions[0].piece.name+"-colored piece actually represents "+positions[0].piece.cloud+".");
	    				}
	    				clouds[cloudGuess].color = "#FFFFFF";
	        			clouds[cloudGuess].fontColor = "#001d87";
	    				if(modelBet > -1){
	        				clouds[modelBet].color = "#001d87";
	        				clouds[modelBet].fontColor = "#FFFFFF";
	    				}
	    				mode = 0;
						draw(positions, false);
	    			}
	    		}
	    	}
	    } else if(mode == 9){
	    	if(ween){
	    		var reward = parseInt(bets[bet].text)*2
	    		playerCoins = parseInt(playerCoins) + reward;
	    		alert("You've won the bet! You gained "+reward+" coins and now have "+(parseInt(playerCoins)+parseInt(playerStartingCoins))+" coins.");
	    	}
	    	for(var i = 0; i < QAArray.length; i++){
	    		if(QAIDList[QAArray[i]-1] != null){
	    			QAArray[i] = QAIDList[QAArray[i]-1];
	    		}
	    	}
	    	sessionStorage.setItem('QA', JSON.stringify(QAArray));
	    	sessionStorage.setItem('pieces', JSON.stringify(pieces));
	    	AList.push.apply(AList, QList);
	    	sessionStorage.setItem('QList', JSON.stringify(AList));
	    	window.location = "SpiderChart.html"
	    } else if(mode == 10){
	    	if(menuBG.clicked(mousePos.x, mousePos.y, true)){
	    		if(menuSave.clicked(mousePos.x, mousePos.y, true)){
	    			saveGame();
	    			mode = 0;
	    			draw(positions, false);
	    		} else if(menuQuit.clicked(mousePos.x, mousePos.y, true)){
	    			window.location = "NewExisting.html"
	    		} else if(menuEvents.clicked(mousePos.x, mousePos.y, true)){
	    			mode = 1;
	    			openHelpMenu(2);
	    		}
	    	} else {
	    		mode = 0;
	    		draw(positions, false);
	    	}
	    } else if(mode == 11){
	    	mode = 0;
	    	draw(positions, false);
	    } else if(mode == 12){
	    	for(var i = 0; i < QAArray.length; i++){
	    		if(QAIDList[QAArray[i]-1] != null){
	    			QAArray[i] = QAIDList[QAArray[i]-1];
	    		}
	    	}
	    	sessionStorage.setItem('QA', JSON.stringify(QAArray));
	    	sessionStorage.setItem('pieces', JSON.stringify(pieces));
	    	//AList.push.apply(AList, QList);
	    	sessionStorage.setItem('QList', JSON.stringify(AList));
	    	window.location = "SpiderChart.html"
	    } else if(mode == 13){
	    	if(bet == -1){
	    		mode = 5;
		    	draw(null, false);
	    	} else {
		    	mode = 0;
		    	draw(null, false);
	    	}
	    }
	 });
}
function answerQuestion(ans){ // Calculates how many spaces to move each piece
	if(curQues == -1){
		nextQuestion();
	} else {
		var pts = QList[curQues].answer[ans].points;
		//console.log(pts);
		var arr = [];
		for(var i = 0, len = pieces.length; i < len; i++){
			var score = pts[cloudList.indexOf(pieces[i].cloud)];
			//console.log(score);
			arr.push(score);
			var QAIndex = QAArray.indexOf(""+(QAIDList.indexOf(QList[curQues].QA)+1));
			//console.log(QAIDList.indexOf(QList[curQues].QA));
			//console.log(QList[curQues].QA);
			//console.log(QAArray);
			//console.log(QAIndex);
			pieces[i].score = parseInt(pieces[i].score) + parseInt(score);
			//console.log(score);
			//console.log("Before: "+pieces[i].QAScores[QAIndex]);
			if(QAIndex > -1){
				pieces[i].QAScores[QAIndex] = parseInt(pieces[i].QAScores[QAIndex]) + parseInt(score); 
			}
			//console.log(score);
			//console.log("After: "+pieces[i].QAScores[QAIndex]);
		}
		QList[curQues].answered = true;
		QList[curQues].choice = QList[curQues].answer[ans].id;
		QList[curQues].clicked = ans;
		qString[qString.length-1] += QList[curQues].id+"|"+QList[curQues].choice+"|1|"+QList[curQues].comment+"~";
		if(qString[qString.length-1].length > 200){ // max is 255
			saveGame();
		}
		//console.log(QAArray[QList[curQues].QA]);
		console.log(arr);
		console.log(pieces);
		nextQuestion();
		return arr;
	}
}
function nextQuestion(){ // Load the next question into the screen elements, or signal the end of the game if there are no more questions
	if(curQues+1<QList.length){
		curQues = curQues + 1;
		quesTitle.text = QList[curQues].title;
		for(var i = 0, len = quesAnsw.length; i < len; i++){
			quesAnsw[i].text = QList[curQues].answer[i].title;
		}
		questionAsked += 1;
	} else {
		questionAsked += 1;
		mode = 9;
	}
}
function reset(){ // Not actually used anymore
	bonusSquares = [];
	setBonusSquares(MAX_BONUS_SQUARES);
	var tempList = cloudList.slice();
	for(var j in pieces){
		boardSpaces[pieces[j].loc].occupants = [];
		pieces[j].reset();
		var num = Math.floor(Math.random() * tempList.length);
		pieces[j].cloud = tempList[num];
		tempList.splice(num, 1);
	}
	if(bet > -1){
		bets[bet].color = "#FFFFFF";
		bets[bet].fontColor = "#001d87";
		bet = -1;
	}
	if(modelBet > -1){
		clouds[modelBet].color = "#FFFFFF";
		clouds[modelBet].fontColor = "#001d87";
		modelBet = -1;
	}
	if(cloudGuess > -1){
		clouds[cloudGuess].color = "#FFFFFF";
		clouds[cloudGuess].fontColor = "#001d87";
		cloudGuess = -1;
	}
	gameName = "Project";
	positions = [];
	showBonus = 0;
	lastEvent = "none";
	curQues = -1
	boardSpaces[0].occupants = [0, 1, 2, 3, 4, 5];
}

function drawSquares() { // draw the screen elements
	// Draw the background for the Menu bar
	HUD.draw();
	// Draw the background for the questions
	quesBG.draw();
	// Draw the question title box
	context.textAlign="center"; 
	quesTitle.drawResize();
	context.textAlign = "left";
	// Draw the answer boxes
	for(var i = 0, len = quesAnsw.length; i < len; i++) {
		quesAnsw[i].draw();
	}
	// Draw HUD elements
    context.font = 'bold 18pt Calibri';
    context.fillStyle = 'black';
    //console.log(gameName);
    context.fillText(gameName, 10, 25);
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.textAlign="center"; 
    //console.log(": "+bet+": "+modelBet);
    if(bet > -1 && modelBet > -1){context.fillText("Bet: "+bets[bet].text+" coins on "+cloudList[modelBet], 723, 54);}
    context.textAlign = "right";
    context.fillText(questionAsked+"/"+totalQuestions+" Questions Answered", 1432, 25);
    context.textAlign = "left";
    console.log("Didn't change: "+playerStartingCoins);
    context.fillText("Your coins: "+(parseInt(playerCoins)+parseInt(playerStartingCoins)), 10, 54);
    // Draw Menu buttons
    menuButton.draw();
    helpButton.draw();
}

function setBonusSquares(number){
	var RNG = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
	for(var i in bonusSquares){
		var index = RNG.indexOf(bonusSquares[i]);
		if(index > -1){
			RNG.splice(index, 1);
		}
	}
	for(var j = 0; j < number; j++){
		var num = Math.floor(Math.random() * RNG.length);
		bonusSquares.push(RNG[num]);
		RNG.splice(num, 1);
	}
}
function saveGame(){ 
	console.log("save game");
	//'1,1,10.' Around 180 characters (6 clouds and 6 QAs) // TODO check if there's anything that actually needes to be saved
	//QAID, cloudID, score
	var tempCS = "";
	console.log(QAArray);
	for(var i = 0, len = pieces.length; i < len; i++){
		for(var j = 0, len2 = pieces[i].QAScores.length; j < len2; j++){
			tempCS += QAArray[j]+","+(cloudList.indexOf(pieces[i].cloud)+1)+","+pieces[i].QAScores[j]+".";
		}
	}
	cloudString[cloudString.length-1] = tempCS;
	//'1|5|1|cool~' Around 7+comment characters per question, we can allow 29 character comments assuming max length is 180 and we save every 5 questions
	//#quesID, ansID (if answered), isAnswered, userNotes
	cloudString.push("");
	qString.push("");
	console.log(cloudString);
	console.log(qString);
	console.log(playerCoins);
	var gameInfo = {
		fn : 3,
		LANID: user,
		gameID: GameID,
		cloudGuess: modelBet,
		completed : 0,
		betCoins : parseInt(bets[bet].text),
		playerCoins : playerCoins,
		clouds : cloudString[currentSave],
		questions : qString[currentSave]
	};
	if(mode == 9){
		gameInfo.completed = 1;
	}
	console.log(gameInfo);
	$.post("/game1.1/gameController", gameInfo, function(list) {
		console.log(list);
		if(list != null){
			currentSave += 1;
			if(mode == 9 && currentSave < qString.length){
				emergencySaveGame();
			}
		} else {
			console.log("Failed to save game instance "+currentSave+".");
			if(mode == 9){
				emergencySaveGame();
			}
		}
	});
}

function emergencySaveGame(){ // In case the DB doesn't respond, we want to save all the data in our save arrays at once TODO: prevent the user from closing the tab until save is finished
	var tempCS = "";
	for(var i = 0, len = pieces.length; i < len; i++){
		for(var j = 0, len2 = pieces[i].QAScores.length; j < len2; j++){
			tempCS += QAArray[j]+","+(cloudList.indexOf(pieces[i].cloud)+1)+","+pieces[i].QAScores[j]+".";
		}
	}
	cloudString[cloudString.length-1] = tempCS;
	var gameInfo = {
		fn : 3,
		LANID: user,
		gameID: GameID,
		cloudGuess: modelBet,
		completed : 0,
		betCoins : parseInt(bets[bet].text),
		playerCoins : playerCoins,
		clouds : cloudString[currentSave],
		questions : qString[currentSave]
	};
	if(mode == 9){
		gameInfo.completed = 1;
	}
	console.log(gameInfo);
	$.post("/game1.1/gameController", gameInfo, function(list) {
		if(list != null){ 
			currentSave += 1;
			if(currentSave < qString.length && qString[currentSave+1] == ""){
				emergencySaveGame();
			} else {
				alert("Saving is finished. You may now close this tab.");
			}
		} else {
			console.log("Failed to emergency save game instance "+currentSave+".");
			emergencySaveGame();
		}
	});
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;
	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

var boardSpaces = [ // The actual board
                   {
                   	sqNum : 0,
                   	x : 6,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [0, 1, 2, 3, 4, 5],	// Number of pieces on this square
                   	orientation: 0  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 1,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 2,
                   	x : 243,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 3,
                   	x : 363,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 4,
                   	x : 483,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 5,
                   	x : 603,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 6,
                   	x : 723,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 7,
                   	x : 843,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 8,
                   	x : 963,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 9,
                   	x : 1083,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 10,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 930,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 1  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 11,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 811,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 12,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 691,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 13,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 571,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 14,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 451,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 15,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 331,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 16,
                   	x : 1203,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 2  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 17,
                   	x : 1083,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 18,
                   	x : 963,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 19,
                   	x : 843,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 20,
                   	x : 723,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 21,
                   	x : 603,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 22,
                   	x : 483,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 23,
                   	x : 363,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 24,
                   	x : 243,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 25,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 215,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 3  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 26,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 331,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 4  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 27,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 451,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 4  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 28,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 570,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 4  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 29,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 691,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 4  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   },
                   {
                   	sqNum : 30,
                   	x : 126,			// x and y are approximated from the left-hand corner
                   	y : 811,
                   	occupants : [],	// Number of pieces on this square
                   	orientation: 4  // Where the rank sign should be placed relative to the square. 0 for none, 1 for below, 2 for right, 3 for up, 4 for left
                   }
           ];
