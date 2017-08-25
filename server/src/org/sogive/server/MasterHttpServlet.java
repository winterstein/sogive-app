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
import org.sogive.server.payment.StripeWebhookServlet;

import com.winterwell.utils.log.Log;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.BestOne;
import com.winterwell.utils.IBuildStrings;
import com.winterwell.utils.Key;
import com.winterwell.utils.Printer;
import com.winterwell.utils.StrUtils;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.Range;
import com.winterwell.utils.io.FileUtils;
import com.winterwell.web.app.FileServlet;
import com.winterwell.web.app.LogServlet;
import com.winterwell.web.app.ManifestServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.fields.AField;
import com.winterwell.web.fields.Checkbox;
import com.winterwell.web.fields.JsonField;
import com.winterwell.web.fields.SField;

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
		try {
			WebRequest request = new WebRequest(null, req, resp);
			Log.d("servlet", request);
			String path = request.getRequestPath();
			if (path.startsWith("/search")) {
				SearchServlet s = new SearchServlet(request);
				s.run();
				return;
			}
			if (path.startsWith("/charity")) {
				CharityServlet s = new CharityServlet();
				s.process(request);
				return;
			}
			if (path.startsWith("/donation")) {
				DonationServlet s = new DonationServlet(request);
				s.run();
				return;
			}
			if (path.startsWith("/stripe/webhook")) {
				StripeWebhookServlet s = new StripeWebhookServlet();
				s.process(request);
				return;
			}
			if (path.startsWith("/share")) {
				ShareServlet s = new ShareServlet();
				s.process(request);
				return;
			}
			if (path.startsWith("/manifest")) {
				ManifestServlet s = new ManifestServlet();
				s.process(request);
				return;
			}
			if (path.startsWith("/log")) {
				LogServlet s = new LogServlet();
				s.process(request);
				return;
			}	
			WebUtils2.sendError(500, "TODO", resp);
		} catch (WebEx ex) {
			Log.e("error", ex);
			WebUtils2.sendError(ex.code, ex.getMessage()+"\n\n------\n"+Printer.toString(ex, true), resp);
		} catch(Throwable ex) {
			ex.printStackTrace();
			Log.e("error", ex);
			WebUtils2.sendError(500, "Server Error: "+ex, resp);
		} finally {
			WebRequest.close(req, resp);
		}
	}

}
