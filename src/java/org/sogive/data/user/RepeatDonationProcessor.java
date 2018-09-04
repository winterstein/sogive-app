package org.sogive.data.user;

import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import org.elasticsearch.search.sort.SortOrder;
import org.sogive.data.commercial.Event;
import org.sogive.server.DonationServlet;
import org.sogive.server.SoGiveServer;

import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.es.client.ESHttpClient;
import com.winterwell.data.KStatus;
import com.winterwell.es.client.SearchRequestBuilder;
import com.winterwell.es.client.SearchResponse;
import com.winterwell.gson.Gson;
import com.winterwell.ical.ICalEvent;
import com.winterwell.utils.Dep;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.Actor;
import com.winterwell.utils.time.Dt;
import com.winterwell.utils.time.TUnit;
import com.winterwell.utils.time.Time;
import com.winterwell.utils.time.TimeUtils;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.data.XId;

/**
 * TODO thread to poll for repeat donations and process them
 * @author daniel
 *
 */
public class RepeatDonationProcessor {

	static RepeatDonationActor rda;
	private static Timer timer;

	/**
	 * TODO could be run as a separate JVM process. 
	 * For now this is run via {@link SoGiveServer}
	 * @param args
	 */
	public static void main(String[] args) {		
		Log.i("RepeatDonationProcessor", "Starting...");
		rda = new RepeatDonationActor();
		// This could be a main process - so stay alive
		timer = new Timer("RepeatDonationTimer", false);	
		timer.scheduleAtFixedRate(new RepeatTask(), 
				// start soon!
				TUnit.MINUTE.dt.getMillisecs()/6,
				// check 4x a day
//				new Dt(8, TUnit.MINUTE).getMillisecs()
				TUnit.MINUTE.getMillisecs() // FIXME for testing
				);
	}
	
}

class RepeatTask extends TimerTask {

	@Override
	public void run() {
		try {
			Log.d("RepeatTask", "run...");
			// poll ES
			// TODO checking all every 8 hours is fine for now but not efficient or scalable to the bigtime.
			ESHttpClient es = Dep.get(ESHttpClient.class);
			SearchRequestBuilder s = new SearchRequestBuilder(es);
			ESPath path = Dep.get(IESRouter.class).getPath(RepeatDonation.class, null, KStatus.PUBLISHED);
			s.setPath(path);
			s.setSize(10000); // TODO paging
			SearchResponse sr = s.get();
			// NB: dont convert yet - so we can handle bad entries better
			List<Map<String, Object>> jsonrdons = sr.getSearchResults();
			
			// send to actor
			Gson gson = Dep.get(Gson.class);
			for (Map<String, Object> map : jsonrdons) {
				try {
					String json = gson.toJson(map);
					RepeatDonation rdon = gson.fromJson(json);
					if (rdon.isDone()) {
						Log.d("RepeatTask", "Skip all done "+rdon);
						continue;
					}
					Log.d("RepeatTask", "Send to actor "+rdon);
					RepeatDonationProcessor.rda.send(rdon);
				} catch(Throwable ex) {
					// don't let one bad object kill the whole process
					Log.e("RepeatTask", ex);
				}
			}
		} catch(Throwable ex) {
			Log.e("RepeatTask", ex); // keep on truckin
		}
	}
	 
}

class RepeatDonationActor extends Actor<RepeatDonation> {
	
	@Override
	protected void consume(RepeatDonation msg, Actor fromActor) throws Exception {
		Log.d(getName(), "consume "+msg);		
		// ready to repeat? Includes screen by end date
		Time next = getNextRepeat(msg);
		if (next==null || next.isAfter(new Time())) {
			Log.d(getName(), "repeat? not yet - "+next+" for "+msg);
			if (next==null) {
				// mark as done
				msg.setDone(true);
				Log.d(getName(), "repeats all done for "+msg);
				AppUtils.doPublish(msg, false, true);
			}
			return;
		}
		
		// donate!
		Donation don = msg.newDraftDonation();
		Log.d(getName(), "repeat! "+don+" for "+msg);
		AppUtils.doPublish(don, true, true);		
		// collect money
		XId from = msg.from;
		String email = from.getName(); // ?? what if they login by Facebook??
		if ( ! WebUtils2.isValidEmail(email)) {
			email = msg.getOriginalDonation().getDonorEmail();
		}
		DonationServlet.doPublish3_ShowMeTheMoney(null, don, from, email);
	}
	

	Time getNextRepeat(RepeatDonation rdon) {
		ESHttpClient es = Dep.get(ESHttpClient.class);
		SearchRequestBuilder s = new SearchRequestBuilder(es);
		ESPath path = Dep.get(IESRouter.class).getPath(Donation.class, null, KStatus.PUBLISHED);
		s.setPath(path);
		s.setSize(2); // don't need many!
		s.addSort("date", SortOrder.DESC);
		SearchResponse sr = s.get();
		List<Donation> dons = sr.getSearchResults(Donation.class);
		Time prev = rdon.getDate();
		if ( ! dons.isEmpty()) {
			prev = dons.get(0).getTime();
		}
		
		ICalEvent ical = rdon.getIcal();
		// NB: This includes stop-at-event-date 'cos its in the ical repeat rule
		Time next = ical.repeat.getNext(prev);		
		return next;	
	}
}

