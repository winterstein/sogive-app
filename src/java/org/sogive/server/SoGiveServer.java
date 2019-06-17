package org.sogive.server;

import java.io.File;

import org.sogive.data.DBSoGive;
import com.goodloop.data.Money;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.user.RepeatDonationProcessor;
import org.sogive.server.payment.StripeConfig;
import org.sogive.server.payment.StripePlugin;

import com.winterwell.datalog.DataLog;
import com.winterwell.datalog.DataLogConfig;
import com.winterwell.es.XIdTypeAdapter;
import com.winterwell.es.client.ESConfig;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.gson.FlexiGson;
import com.winterwell.gson.FlexiGsonBuilder;
import com.winterwell.gson.Gson;
import com.winterwell.gson.KLoopPolicy;
import com.winterwell.gson.StandardAdapters;
import com.winterwell.utils.Dep;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.log.LogFile;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.web.app.AMain;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.JettyLauncher;
import com.winterwell.web.data.XId;
import com.winterwell.youagain.client.YouAgainClient;

public class SoGiveServer extends AMain<SoGiveConfig> {
	
	private static SoGiveServer main;
	private static RepeatDonationProcessor rdp;

	public SoGiveServer() {
		super("sogive", SoGiveConfig.class);
	}

	public static void main(String[] args) {
		main = new SoGiveServer();

		logFile = new LogFile(new File("sogive.log"))
					// keep 8 weeks of 1 week log files ??revise this??
					.setLogRotation(TUnit.WEEK.dt, 8);
		try {
			main.doMain(args);
		} catch(Throwable ex) {
			Log.e(ex);
			System.exit(-1);
		}
	}
	
	@Override
	protected void doMain2() {
		if (rdp==null) {
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
		init3_ES();
		// data
		DBSoGive.init();
		// actors
		Dep.set(BasketPublishedActor.class, new BasketPublishedActor());
		Dep.set(DonateToFundRaiserActor.class, new DonateToFundRaiserActor());		
	}
	
	@Override
	public SoGiveConfig init2_config(String[] args) {		
		if (initFlag) return Dep.get(SoGiveConfig.class);
		SoGiveConfig config = AppUtils.getConfig("sogive", SoGiveConfig.class, args);
		StripeConfig sc = AppUtils.getConfig("sogive", StripeConfig.class, args); 
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
		.setClassMapping("org.sogive.data.charity.Money", Money.class)
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
		// ES router - done in the super method

		// login
		Dep.set(YouAgainClient.class, new YouAgainClient(config.youagainApp));
		
		// local DataLog
		DataLogConfig dlc = AppUtils.getConfig(this.appName, DataLog.getImplementation().getConfig(), args);
		DataLog.init(dlc);
		
		return config;
	}


}
