package org.sogive.data.user;

import java.util.Timer;
import java.util.TimerTask;

import com.winterwell.utils.log.Log;
import com.winterwell.utils.threads.Actor;
import com.winterwell.utils.time.TUnit;

/**
 * TODO thread to poll for repeat donations and process them
 * @author daniel
 *
 */
public class RepeatDonationProcessor {

	private static RepeatDonationActor rda;
	private static Timer timer;

	
	public static void main(String[] args) {
		rda = new RepeatDonationActor();
		timer = new Timer("RepeatDonationTimer");		
		timer.scheduleAtFixedRate(new RepeatTask(), TUnit.MINUTE.dt.getMillisecs(), TUnit.DAY.dt.getMillisecs());
	}
	
}

class RepeatTask extends TimerTask {

	@Override
	public void run() {
		Log.d("RepeatTask", "run...");
		// FIXME poll ES
		// FIXME send to actor
	}
	 
}

class RepeatDonationActor extends Actor<RepeatDonation> {
	
	@Override
	protected void consume(RepeatDonation msg, Actor from) throws Exception {
		Log.d(getName(), "consume "+msg);
	}
}
