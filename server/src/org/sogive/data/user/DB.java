//package org.sogive.data.user;
//
//import java.io.File;
//import java.util.logging.Level;
//
//
//import com.winterwell.utils.io.SqlUtils;
//import com.winterwell.utils.io.ArgsParser;
//import com.winterwell.utils.io.DBUtils.DBOptions;
//import com.winterwell.utils.log.Log;
//
///**
// * What do we store in SQL? Low latency stuff.
// * 
// *  - Transactions
// *  - Is that it?
// *  
// * @author daniel
// *
// */
//public class DB {
//
//	public void init() {
//		DBOptions options = ArgsParser.getConfig(new DBOptions(), 
//									new File("config/sogive.properties"));
//		SqlUtils.setDBOptions(options);
//	}
//	
//	public storeTransaction(Transaction trans) {
//		
//	}
//	
//	public getTransactions(Transaction trans) {
//		
//	}
//}
