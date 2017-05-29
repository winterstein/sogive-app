package org.sogive.server;

import java.io.File;

import org.sogive.data.charity.ImportCharityDataFromCSV;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.user.DB;
import org.sogive.server.payment.StripeConfig;
import org.sogive.server.payment.StripePlugin;

import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.Dt;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.utils.web.XStreamUtils;
import com.winterwell.web.WebEx;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.JettyLauncher;
import com.winterwell.web.data.XId;
import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.datalog.DataLog;
import com.winterwell.datalog.ESStorage;
import com.winterwell.datalog.IDataLog;
import com.winterwell.datalog.IDataLogAdmin;
import com.winterwell.datalog.IDataLogStorage;
import com.winterwell.datalog.DataLogConfig;
import com.winterwell.datalog.DataLogImpl;
import com.winterwell.es.ESUtils;
import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.FlexiGsonBuilder;
import com.winterwell.gson.Gson;
import com.winterwell.gson.GsonBuilder;
import com.winterwell.gson.KLoopPolicy;
import com.winterwell.gson.StandardAdapters;

public class SoGiveServer {

	public static final Time startTime = new Time();
	
	private static JettyLauncher jl;
	
	public static LogFile logFile;

	private static JettyLauncher esjl;

	public static void main(String[] args) {
		SoGiveConfig config = getConfig(new SoGiveConfig(), args);
		StripeConfig sc = getConfig(new StripeConfig(), args); 
		Log.d("stripe.config", FlexiGson.toJSON(sc));
		Log.d("stripe.config.key", StripePlugin.secretKey());
		
		logFile = new LogFile(new File("sogive.log"))
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
		
//		// Also run an ES upload server
//		esjl = new JettyLauncher(new File("web"), config.portUpload);
//		esjl.setup();
//		esjl.addServlet("/*", new ESProxyServlet());
//		Log.i("web", "...Launching ES proxy on port "+esjl.getPort());
//		esjl.run();
		
		initCharityData();
	}

	public static <X> X getConfig(X config, String[] args) {
		config = ArgsParser.getConfig(config, args, new File("config/sogive.properties"), null);
		String thingy = config.getClass().getSimpleName().toLowerCase().replace("config", "");
		config = ArgsParser.getConfig(config, args, new File("config/"+thingy+".properties"), null);
		config = ArgsParser.getConfig(config, args, new File("config/"+WebUtils2.hostname()+".properties"), null);
		Dep.set((Class)config.getClass(), config);
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
		// gson
		GsonBuilder gb;
		Gson gson = new FlexiGsonBuilder()
		.setLenientReader(true)
		.registerTypeAdapter(Time.class, new StandardAdapters.TimeTypeAdapter())
		.registerTypeAdapter(XId.class, new XIdTypeAdapter())
		.serializeSpecialFloatingPointValues()
		.setDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
		.setClassProperty(null).setLoopPolicy(KLoopPolicy.QUIET_NULL)
		.create();
		// config
		ESConfig value = new ESConfig();
		value.gson = gson;
		Dep.set(ESConfig.class, value);
		// client
		Dep.setSupplier(ESHttpClient.class, true, 
				() -> new ESHttpClient(Dep.get(ESConfig.class))
				);
		// mappings
		DB.init();
	}


}
