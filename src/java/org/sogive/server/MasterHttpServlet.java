package org.sogive.server;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.util.ajax.JSON;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.server.payment.StripeWebhookServlet;

import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.BestOne;
import com.winterwell.utils.Dep;
import com.winterwell.utils.IBuildStrings;
import com.winterwell.utils.Key;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Range;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.HttpServletWrapper;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.KServerType;
import com.winterwell.web.app.LogServlet;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.app.UploadServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.AField;
import com.winterwell.web.fields.Checkbox;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.SField;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.NoAuthException;
import com.winterwell.youagain.client.YouAgainClient;
import com.winterwell.datalog.DataLog;
import com.winterwell.datascience.Experiment;
import com.winterwell.depot.Desc;
import com.winterwell.es.client.DeleteByQueryRequestBuilder;
import com.winterwell.es.client.DeleteRequestBuilder;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.es.client.IESResponse;
import com.winterwell.es.client.IndexRequestBuilder;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.es.client.UpdateRequestBuilder;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.containers.ListMap;
import com.winterwell.utils.web.SimpleJson;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.WebEx;
import com.winterwell.web.WebInputException;
import com.winterwell.web.WebPage;
import com.winterwell.web.ajax.JsonResponse;

/**
 *
 */
public class MasterHttpServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doGet(req, resp);
	}
	
	public MasterHttpServlet() {
	}
	
	@Override
	protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String servletName = null;
		try {
			WebRequest request = new WebRequest(null, req, resp);
			Log.d("servlet", request);
			String path = request.getRequestPath();
			String[] pathBits = path.split("/");
			servletName = FileUtils.getBasename(pathBits[1]);
			Thread.currentThread().setName("servlet: "+servletName);
			IServlet s;
			switch(servletName) {
			case "search":
				s = new SearchServlet();
				s.process(request);
				return;			
			case "charity":
				s = new CharityServlet();
				s.process(request);
				return;			
			case "donation":
				s = new DonationServlet();
				s.process(request);
				return;
			case "stripe":
				s = new StripeWebhookServlet();
				s.process(request);
				return;			
			case "share":
				s = new ShareServlet();
				s.process(request);
				return;
			case "upload":
				// upload
				UploadServlet us = new UploadServlet();
				SoGiveConfig conf = Dep.get(SoGiveConfig.class);
				if (conf.uploadDir!=null) us.setUploadDir(conf.uploadDir);				
				KServerType serverType = AppUtils.getServerType(request);
				us.setServer(AppUtils.getServerUrl(serverType, "app.sogive.org").toString());				
				us.process(request);
				return;			
			case "log":
				s = new LogServlet();
				s.process(request);
				return;
			case "import":
				s = new ImportDataServlet();
				s.process(request);
				return;
			case "event":
				s = new EventServlet();
				s.process(request);
				return;
			case "eventReport":
				s = new EventReportServlet();
				s.process(request);
				return;				
			case "basket":
				s = new BasketServlet();
				s.process(request);
				return;
			case "fundraiser":
				s = new FundraiserServlet();
				s.process(request);
				return;
			case "credit":
				s = new CreditServlet();
				s.process(request);
				return;
			case "testEmail":
				s = new EmailServlet();
				s.process(request);
				return;
			}			
			WebUtils2.sendError(500, "TODO - no servlet for "+path, resp);
		} catch(Throwable ex) {
			HttpServletWrapper.doCatch(ex, resp);
		} finally {
			Thread.currentThread().setName("...done servlet: "+servletName);
			WebRequest.close(req, resp);
		}
	}

}
