package org.sogive.server;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.sogive.data.charity.SoGiveConfig;
import org.sogive.server.payment.StripeWebhookServlet;

import com.winterwell.utils.Dep;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.HttpServletWrapper;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.KServerType;
import com.winterwell.web.app.LogServlet;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.app.MasterServlet;
import com.winterwell.web.app.UploadServlet;
import com.winterwell.web.app.WebRequest;

/**
 * Minor TODO replace with use of {@link MasterServlet}
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
		WebRequest request = null;
		try {
			request = new WebRequest(null, req, resp);
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
			case "giftcard":
				s = new GiftCardServlet();
				s.process(request);
				return;
			case "card":
				s = new CardServlet();
				s.process(request);
				return;
			case "repeatdonation":
				s = new RepeatdonationServlet();
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
			case "manifest":
				s = new ManifestServlet();
				s.process(request);
			}			
			WebUtils2.sendError(500, "TODO - no servlet for "+servletName+" full path: "+path, resp);
		} catch(Throwable ex) {			
			HttpServletWrapper.doCatch(ex, resp, request);
		} finally {
			Thread.currentThread().setName("...done servlet: "+servletName);
			WebRequest.close(req, resp);
		}
	}

}
