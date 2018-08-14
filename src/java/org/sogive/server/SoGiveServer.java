package org.sogive.server;

import java.io.File;

import org.sogive.data.DBSoGive;
import org.sogive.data.charity.ImportCharityDataFromCSV;
import org.sogive.data.charity.Money;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.user.RepeatDonationProcessor;
import org.sogive.server.payment.StripeConfig;
import org.sogive.server.payment.StripePlugin;

import com.winterwell.utils.Dep;
import com.winterwell.utils.Utils;
import com.winterwell.utils.io.ArgsParser;
import com.winterwell.utils.io.ConfigBuilder;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.Dt;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.utils.web.XStreamUtils;
import com.winterwell.web.WebEx;
import com.winterwell.web.app.AMain;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.HttpServletWrapper;
import com.winterwell.web.app.JettyLauncher;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.data.XId;
import com.winterwell.youagain.client.YouAgainClient;
import com.google.common.util.concurrent.ListenableFuture;
import com.winterwell.data.AThing;
import com.winterwell.data.AThingAdapter;
import com.winterwell.datalog.DataLog;
import com.winterwell.datalog.ESStorage;
import com.winterwell.datalog.IDataLog;
import com.winterwell.datalog.IDataLogAdmin;
import com.winterwell.datalog.IDataLogStorage;
import com.winterwell.datalog.DataLogConfig;
import com.winterwell.datalog.DataLogImpl;
import com.winterwell.es.ESUtils;
import com.winterwell.es.IESRouter;
import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.FlexiGsonBuilder;
import com.winterwell.gson.Gson;
import com.winterwell.gson.GsonBuilder;
import com.winterwell.gson.KLoopPolicy;
import com.winterwell.gson.StandardAdapters;

public class SoGiveServer extends AMain<SoGiveConfig> {
	
	private static SoGiveServer main;
	private static RepeatDonationProcessor rdp;

	public SoGiveServer() {
		super("sogive");
	}

	public static void main(String[] args) {
		main = new SoGiveServer();

		logFile = new LogFile(new File("sogive.log"))
					// keep 8 weeks of 1 week log files ??revise this??
					.setLogRotation(TUnit.WEEK.dt, 8);
		
		main.doMain(args);		
	}
	
	@Override
	protected void doMain2() {
		if (rdp!=null) {
			rdp = new RepeatDonationProcessor();
			rdp.main(null);
		}
	}
	
	@Override
	protected void addJettyServlets(JettyLauncher jl) {		
		super.addJettyServlets(jl);
		jl.addServlet("/*", new MasterHttpServlet());
	}

	
	@Override
	protected void init2(SoGiveConfig config) {
		super.init2(config);
		// data
		DBSoGive.init();
		// actors
		Dep.set(BasketPublishedActor.class, new BasketPublishedActor());
		Dep.set(DonateToFundRaiserActor.class, new DonateToFundRaiserActor());		
	}
	
	@Override
	public SoGiveConfig init2_config(String[] args) {		
		if (initFlag) return Dep.get(SoGiveConfig.class);
		SoGiveConfig config = AppUtils.getConfig("sogive", new SoGiveConfig(), args);
		StripeConfig sc = AppUtils.getConfig("sogive", new StripeConfig(), args); 
		Log.d("stripe.config", FlexiGson.toJSON(sc));
		Log.d("stripe.config.key", StripePlugin.secretKey());

		// gson		
		Gson gson = new FlexiGsonBuilder()
		.setLenientReader(true)
		.registerTypeAdapter(Time.class, new StandardAdapters.TimeTypeAdapter())
		.registerTypeAdapter(XId.class, new XIdTypeAdapter())
		.registerTypeAdapter(long.class, new StandardAdapters.LenientLongAdapter(0L))
//		.registerTypeHierarchyAdapter(AThing.class, new AThingAdapter())		
		.serializeSpecialFloatingPointValues()
		.setDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
//		.setClassProperty(null) // NB: "@type" would conflict, so use the @class default
		.setClassMapping("org.sogive.data.MonetaryAmount", Money.class) // update old data
		.setLoopPolicy(KLoopPolicy.QUIET_NULL)
		.create();
		Dep.set(Gson.class, gson);
				
		// config
		ESConfig value = new ESConfig();
		value.setGson(gson);
		Dep.set(ESConfig.class, value);
		// client
		Dep.setSupplier(ESHttpClient.class, true, 
				() -> new ESHttpClient(Dep.get(ESConfig.class))
				);
		// ES router
		Dep.set(IESRouter.class, config);
		// login
		Dep.set(YouAgainClient.class, new YouAgainClient(config.youagainApp));
		
		// local DataLog
		DataLogConfig dlc = AppUtils.getConfig(this.appName, DataLog.getImplementation().getConfig(), args);
		DataLog.init(dlc);
		
		return config;
	}


}
