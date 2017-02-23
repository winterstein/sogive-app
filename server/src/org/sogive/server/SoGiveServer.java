package org.sogive.server;

import java.io.File;

import org.sogive.data.charity.ImportCharityDataFromCSV;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.server.payment.StripeConfig;

import com.winterwell.utils.Dependency;
import com.winterwell.utils.Utils;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.Dt;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.JettyLauncher;
import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.datalog.DataLog;
import com.winterwell.datalog.ESStorage;
import com.winterwell.datalog.IDataLog;
import com.winterwell.datalog.IDataLogAdmin;
import com.winterwell.datalog.IDataLogStorage;
import com.winterwell.datalog.StatConfig;
import com.winterwell.datalog.DataLogImpl;
import com.winterwell.es.ESUtils;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;

public class SoGiveServer {

	private static JettyLauncher jl;
	
	public static LogFile logFile;

	public static void main(String[] args) {
		SoGiveConfig config = getConfig(new SoGiveConfig(), args);
		StripeConfig sc = getConfig(new StripeConfig(), args); 
		
		logFile = new LogFile()
					// keep 8 weeks of 1 week log files ??revise this??
					.setLogRotation(TUnit.WEEK.dt, 8);
		
		Log.i("Go!");
		// storage layer (eg ES)
		init();
		assert jl==null;
		jl = new JettyLauncher(new File("web"), config.port);
		jl.setup();
		jl.addServlet("/*", new MasterHttpServlet());
		Log.i("web", "...Launching Jetty web server on port "+jl.getPort());
		jl.run();

		Log.i("Running...");
		
		initCharityData();
	}

	private static <X> X getConfig(X config, String[] args) {
		config = ArgsParser.getConfig(config, args, new File("config/sogive.properties"), null);
		String thingy = config.getClass().getSimpleName().toLowerCase().replace("config", "");
		config = ArgsParser.getConfig(config, args, new File("config/"+thingy+".properties"), null);
		config = ArgsParser.getConfig(config, args, new File("config/"+WebUtils2.hostname()+".properties"), null);
		Dependency.set((Class)config.getClass(), config);
		assert config != null;
		return config;

	}

	private static void initCharityData() {
		try {
			File export = new File("data/charities.csv");
			new ImportCharityDataFromCSV(export).run();
		} catch(Throwable ex) {
			Log.e("init", ex);
		}
	}

	private static void init() {
		// config
		ESConfig value = new ESConfig();
		Dependency.set(ESConfig.class, value);
		// client
		Dependency.setSupplier(ESHttpClient.class, true, 
				() -> new ESHttpClient(Dependency.get(ESConfig.class))
				);		
	}


}
