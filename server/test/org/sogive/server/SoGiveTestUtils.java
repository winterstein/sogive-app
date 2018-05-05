package org.sogive.server;

import java.util.ArrayList;
import java.util.List;

import org.mockito.Mockito;
import org.sogive.data.DBSoGive;
import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.charity.SoGiveConfig;
import org.sogive.data.charity.Thing;
import org.sogive.data.commercial.Event;
import org.sogive.data.commercial.FundRaiser;
import org.sogive.data.user.Person;

import com.winterwell.data.JThing;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.es.IESRouter;
import com.winterwell.utils.Dep;
import com.winterwell.utils.TodoException;
import com.winterwell.utils.web.WebUtils2;
import com.winterwell.web.LoginDetails;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.SimpleMessage;
import com.winterwell.youagain.client.AuthToken;
import com.winterwell.youagain.client.YouAgainClient;

public class SoGiveTestUtils {

	static SoGiveServer server;
	
	/**
	 * An in-memory server for unit testing
	 * @return http://localhost:7312
	 */
	public static String getStartServer() {
		if (server==null) {
			server = new SoGiveServer();
			String[] args = new String[] {
				"-port", "7312",
				"-testStripe", "true"
			};
			server.doMain(args);
		}
		SoGiveConfig config = server.getConfig();
		return "http://localhost:"+config.port; 
	}

	public static FundRaiser getTestFundRaiser() {
		Event event = getTestEvent();
		IESRouter r = Dep.get(IESRouter.class);
		String id = event.getId()+".testFundRaiser";
		ESPath path = r.getPath(FundRaiser.class, id);
		FundRaiser fr = AppUtils.get(path, FundRaiser.class);
		
		Person walker = doTestWalker();
		
		if (fr==null) {
			fr = new FundRaiser();
			fr.setId(id);
			// by fork
			fr.setOxid(new XId(walker.getId()));
			fr.setOwner(walker.getPersonLite());
			// event
			fr.setEventId(event.getId());
			fr.name = "Test FundRaiser by "+walker.getName()+" for event "+event.getName();
			
			ESPath dpath = r.getPath(FundRaiser.class, id, KStatus.DRAFT);
			JThing item = new JThing().setJava(fr);
			AppUtils.doSaveEdit(dpath, item, null);
			AppUtils.doPublish(item, dpath, path);
		}		
		
		return fr;
	}


	static Event getTestEvent() {
		Class<Event> klass = Event.class;
		IESRouter r = Dep.get(IESRouter.class);
		String id = "dummyEvent";
		ESPath path = r.getPath(klass, id);
		Event obj = AppUtils.get(path, klass);
		if (obj==null) {
			obj = new Event();
			obj.setId(id);
			ESPath dpath = r.getPath(klass, id, KStatus.DRAFT);
			JThing item = new JThing().setJava(obj);
			AppUtils.doSaveEdit(dpath, item, null);
			AppUtils.doPublish(item, dpath, path);
		}
		return obj;
	}
	
	
	/**
	 * 
	 * @param host
	 * @return Spoon
	 */
	public static AuthToken doTestUserLogin(String host) {
//		if ( ! Dep.has(YouAgainClient.class))
		YouAgainClient yac = Dep.get(YouAgainClient.class);
		try {
			AuthToken auth = yac.login("spoonmcguffin@gmail.com", "my1stpassword");
			return auth;
		} catch(Exception ex) {
			AuthToken reg = yac.register("spoonmcguffin@gmail.com", "my1stpassword");
			return reg;
		}
	}

	public static NGO getCharity() {
		Class<NGO> klass = NGO.class;
		IESRouter r = Dep.get(IESRouter.class);
		String id = "against-malaria-foundation";
		ESPath path = r.getPath(klass, id);
		NGO obj = AppUtils.get(path, klass);
		if (obj==null) {
			obj = new NGO(id);
			ESPath dpath = r.getPath(klass, id, KStatus.DRAFT);
			JThing item = new JThing().setJava(obj);
			AppUtils.doSaveEdit(dpath, item, null);
			AppUtils.doPublish(item, dpath, path);
		}
		return obj;
	}

	/**
	 * 
	 * @return Fork
	 */
	public static Person doTestWalker() {
		Class<Person> klass = Person.class;
		IESRouter r = Dep.get(IESRouter.class);
		String id = "forkmcguffin@gmail.com@email";
		Person tweep = DBSoGive.getCreateUser(new XId(id));
		return tweep;
	}

	/**
	 * Put in a mock emailer
	 * @return sent emails list
	 */
	public static List<SimpleMessage> mockEmailer() {
		ArrayList sent = new ArrayList();
		Emailer emailer = Mockito.mock(Emailer.class);
		Mockito.when(emailer.send(Mockito.any())).thenAnswer(
				invocation -> sent.add((SimpleMessage) invocation.getArguments()[0])
				);
		Mockito.when(emailer.getBotEmail()).thenReturn(WebUtils2.internetAddress("testbot@example.com"));
		Dep.set(Emailer.class, emailer);
		return sent;
	}

}
