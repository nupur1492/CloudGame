package controller;

import java.io.*;

import javax.servlet.*;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import com.google.gson.FieldNamingPolicy;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import bean.Question;

import java.sql.*;
import java.util.ArrayList;

/**
 * Servlet implementation class GameController
 */
@WebServlet("/GameController")
public class GameController extends HttpServlet {
	private static final long serialVersionUID = 1L;

	final static String JDBC_DRIVER = "com.mysql.jdbc.Driver";
	final static String DB_URL = "jdbc:mysql://us-cdbr-azure-west-c.cloudapp.net/acsm_c8854637e9312f5";
	final static String USER = "b3a63fd5707ad7";
	final static String PASS = "84fdf080";
	boolean flag = true;

	PreparedStatement stmt = null;

	public GameController() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		// Set the response message's MIME type
		// response.setContentType("text/html; charset=UTF-8");

		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		JsonArray array = new JsonArray();

		// Allocate a output writer to write the response message into the
		// network socket

		PrintWriter out = response.getWriter();

		Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
				.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();

		String fn = request.getParameter("fn");

		/********* call login stored procedure **********/
		if (fn.equals("1")) {
			//JsonArray array1 = new JsonArray();
			String username = request.getParameter("LANID");
			String password = request.getParameter("pwd");

			//array1 = aunthenticateLogin(username, password);
			//System.out.println(gson.toJson(array1));
			out.write(gson.toJson(aunthenticateLogin(username, password)));
		}

		
		/*************** call new game stored procedure ***************/
		else if (fn.equals("2")) {
			String username = request.getParameter("LANID");
			String gameName = request.getParameter("gameName");
			String gameDesc = request.getParameter("gameDesc");
			String qaArray = request.getParameter("QAArray");

			out.write(gson.toJson(newGame(username, gameName, gameDesc,qaArray)));
		}

		
		/************* save game instance ***********************/
		else if (fn.equals("3")) {
			String username = request.getParameter("LANID");
			String gameId = request.getParameter("gameID");
			String modelId = request.getParameter("cloudGuess");
			String completed = request.getParameter("completed");
			String betCoins = request.getParameter("betCoins");
			String netCoins = request.getParameter("playerCoins");
			String clouds = request.getParameter("clouds"); //"1,1,100.1,2,200.1,3,30.1,4,400.1,5,50.1,6,60.";
			String questions = request.getParameter("questions"); //"1|5|1|cool~2|4|1|~3|3|1|bad~4|2|1|I want cake.~5|1|1|Oden is good too.~";
			
			out.write(gson.toJson(saveGame(username,gameId, modelId, completed, betCoins, netCoins,
					clouds, questions)));
		}

		
		/**************** load saved game ***************/
		else if (fn.equals("4")) {
			String username = request.getParameter("LANID");
			String gameId = request.getParameter("gameID");
			out.write(gson.toJson(loadGame(username, gameId)));
		}
		
		
		/*************** call tips stored procedure ***************/
		else if (fn.equals("5")) {
			String qaArray = request.getParameter("QAArray");

			out.write(gson.toJson(getTips(qaArray)));
		}
		
		/*************** call QA stored procedure ***************/
		else if (fn.equals("6")) {
			out.write(gson.toJson(spGetAllQA()));
		}
		
		/*************** call QA stored procedure ***************/
		else if (fn.equals("7")) {
			out.write(gson.toJson(spGetAllClouds()));
		}
		
		/*************** call End Game Summary stored procedure ***************/
		else if (fn.equals("8")) {
			String gameId = request.getParameter("gameID");
			out.write(gson.toJson(spGetEndSummary(gameId)));
		}

	} // end of doGet

	/***************** Authenticate login function ***********************/

	private static JsonArray aunthenticateLogin(String username, String password) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			System.out.println("stored proc" + username);

			cStmt = conn.prepareCall("{CALL spLogin(?,?)}");
			System.out.println(cStmt);
			cStmt.setString(1, username);
			cStmt.setString(2, password);

			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("gameID", rs1.getString("GameID"));
				elem.addProperty("gameName", rs1.getString("GameName"));
				elem.addProperty("gameDesc", rs1.getString("GameDescription"));
				elem.addProperty("gameCompleted", rs1.getString("IsGameCompleted"));
				elem.addProperty("coins", rs1.getString("Coins"));
				array.add(elem);
				//System.out.println(gson.toJson(elem));
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}

	/*************** new game function ****************/

	private static JsonArray newGame(String username, String gameName, String gameDesc,String qaArray) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			System.out.println("stored proc" + username);

			cStmt = conn.prepareCall("{CALL spNewGame(?,?,?,?)}");
			System.out.println(cStmt);
			cStmt.setString(1, username);
			cStmt.setString(2, gameName);
			cStmt.setString(3, gameDesc);
			cStmt.setString(4, qaArray);

			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("QualityAttributeName", rs1.getString("QualityAttributeName"));
				elem.addProperty("QuestionID", rs1.getString("QuestionID"));
				elem.addProperty("QuestionValue", rs1.getString("QuestionValue"));
				elem.addProperty("AnswerID", rs1.getString("AnswerID"));
				elem.addProperty("AnswerValue", rs1.getString("AnswerValue"));
				elem.addProperty("ModelID", rs1.getString("ModelID"));
				elem.addProperty("ModelAnswerValue", rs1.getString("ModelAnswerValue"));
				/*elem.addProperty("TipID", rs1.getString("TipID"));
				elem.addProperty("TipName", rs1.getString("TipName"));
				elem.addProperty("TipDescription", rs1.getString("TipDescription"));
				elem.addProperty("TipQA", rs1.getString("TipQA"));*/
				elem.addProperty("GameID", rs1.getString("GameID"));
				array.add(elem);
				// System.out.println(gson.toJson(elem));
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}

	/**************** save game ****************/
	private static JsonArray saveGame(String username, String gameId, String modelId,
			String completed, String betCoins, String netCoins, String clouds, String questions) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			System.out.println("stored proc" + username);

			cStmt = conn.prepareCall("{CALL spSaveGame(?,?,?,?,?,?,?,?,?)}");
			System.out.println(cStmt);
			cStmt.setString(1, username);
			cStmt.setInt(2, Integer.parseInt(gameId));
			cStmt.setInt(3, Integer.parseInt(modelId));
			cStmt.setInt(4, Integer.parseInt(completed));
			cStmt.setInt(5, Integer.parseInt(betCoins));
			cStmt.setInt(6, Integer.parseInt(netCoins));
			cStmt.setString(7, clouds);
			cStmt.setString(8, questions);
			cStmt.registerOutParameter("outID", java.sql.Types.INTEGER);
			cStmt.execute();
			
			JsonObject elem = new JsonObject();
			elem.addProperty("reviewID", cStmt.getInt(9));
			array.add(elem);
			
			//rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}
	
	/********************* get tips ********************/
	private static JsonArray getTips(String qaArray) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			

			cStmt = conn.prepareCall("{CALL spGetTips(?)}");
			System.out.println(cStmt);
			cStmt.setString(1, qaArray);

			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("TipID", rs1.getString("TipID"));
				elem.addProperty("TipName", rs1.getString("TipName"));
				elem.addProperty("TipDescription", rs1.getString("TipDescription"));
				elem.addProperty("TipQA", rs1.getString("TipQA"));
				
				array.add(elem);
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}

	/************** load saved game ***********/

	private static JsonArray loadGame(String username, String gameid) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			System.out.println("stored proc" + username);

			cStmt = conn.prepareCall("{CALL spLoadGame(?,?)}");
			System.out.println(cStmt);
			cStmt.setString(1, username);
			cStmt.setInt(2, Integer.parseInt(gameid));

			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("GameID", rs1.getString("GameID"));
				elem.addProperty("GameName", rs1.getString("GameName"));
				elem.addProperty("CloudModelID", rs1.getString("CloudModelID"));
				elem.addProperty("ModelBettingCoins", rs1.getString("ModelBettingCoins"));
				elem.addProperty("netcoins", rs1.getString("netcoins"));
				elem.addProperty("ModelId", rs1.getString("ModelId"));
				elem.addProperty("QualityAttributeID", rs1.getString("QualityAttributeID"));
				elem.addProperty("cloudScore", rs1.getString("cloudScore"));
				elem.addProperty("QuestionID", rs1.getString("QuestionID"));
				elem.addProperty("theAnswer", rs1.getString("theAnswer"));
				elem.addProperty("UserNotes", rs1.getString("UserNotes"));
				elem.addProperty("QuestionAsked", rs1.getString("QuestionAsked"));
				elem.addProperty("QuestionValue", rs1.getString("QuestionValue"));
				elem.addProperty("AnswerID", rs1.getString("AnswerID"));
				elem.addProperty("AnswerValue", rs1.getString("AnswerValue"));
				elem.addProperty("ModelID", rs1.getString("ModelID"));
				elem.addProperty("ModelAnswerValue", rs1.getString("ModelAnswerValue"));
				elem.addProperty("QualityAttributeName", rs1.getString("QualityAttributeName"));
				/*elem.addProperty("TipID", rs1.getString("TipID"));
				elem.addProperty("TipName", rs1.getString("TipName"));
				elem.addProperty("TipDescription", rs1.getString("TipDescription"));
				elem.addProperty("TipQA", rs1.getString("TipQA"));*/
				array.add(elem);
				// System.out.println(gson.toJson(elem));
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}

	/************** get QA ***********/

	private static JsonArray spGetAllQA() {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			cStmt = conn.prepareCall("{CALL spGetAllQA()}");
			System.out.println(cStmt);
			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("id", rs1.getString("QualityAttributeID"));
				elem.addProperty("name", rs1.getString("QualityAttributeName"));
				elem.addProperty("description", rs1.getString("QualityAttributeDescription"));
				/*elem.addProperty("TipID", rs1.getString("TipID"));
				elem.addProperty("TipName", rs1.getString("TipName"));
				elem.addProperty("TipDescription", rs1.getString("TipDescription"));
				elem.addProperty("TipQA", rs1.getString("TipQA"));*/
				array.add(elem);
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}
	
	
	/************** get clouds ***********/

	private static JsonArray spGetAllClouds() {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;

		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();
			cStmt = conn.prepareCall("{CALL spGetAllClouds()}");
			System.out.println(cStmt);
			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject();
				elem.addProperty("id", rs1.getString("ModelID"));
				elem.addProperty("name", rs1.getString("ModelName"));
				elem.addProperty("description", rs1.getString("ModelDescription"));
				/*elem.addProperty("TipID", rs1.getString("TipID"));
				elem.addProperty("TipName", rs1.getString("TipName"));
				elem.addProperty("TipDescription", rs1.getString("TipDescription"));
				elem.addProperty("TipQA", rs1.getString("TipQA"));*/
				array.add(elem);
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}
	
	/************** load saved game ***********/

	private static JsonArray spGetEndSummary(String gameid) {
		Connection conn = null;
		CallableStatement cStmt = null;
		JsonArray array = new JsonArray();
		ResultSet rs1;
		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Connecting to database...");
			conn = DriverManager.getConnection(DB_URL, USER, PASS);
			Gson gson = new GsonBuilder().setPrettyPrinting().serializeNulls()
					.setFieldNamingPolicy(FieldNamingPolicy.UPPER_CAMEL_CASE).create();

			cStmt = conn.prepareCall("{CALL spGetEndSummary(?)}");
			System.out.println(cStmt);
			cStmt.setInt(1, Integer.parseInt(gameid));
			cStmt.execute();
			rs1 = cStmt.getResultSet();

			while (rs1.next()) {
				JsonObject elem = new JsonObject(); 
				elem.addProperty("cloudName", rs1.getString("cloudName"));
				elem.addProperty("ModelAnswerValue", rs1.getString("ModelAnswerValue"));
				elem.addProperty("quesTitle", rs1.getString("quesTitle"));
				elem.addProperty("AnswerValue", rs1.getString("AnswerValue"));
				elem.addProperty("UserNotes", rs1.getString("UserNotes"));
				elem.addProperty("QA", rs1.getString("QA"));
				array.add(elem);
			}

			rs1.close();
			cStmt.close();
			conn.close();
			return array;

		} catch (SQLException se) {
			se.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				if (cStmt != null)
					cStmt.close();
			} catch (SQLException se2) {
			}
			try {
				if (conn != null) {
					conn.close();
				}
			} catch (SQLException se) {
				se.printStackTrace();
			}
		}
		return null;
	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
