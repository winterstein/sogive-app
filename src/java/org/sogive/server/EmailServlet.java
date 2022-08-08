package org.sogive.server;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;

import org.sogive.data.DBSoGive;
import org.sogive.data.commercial.Event;
import org.sogive.data.user.Person;

import com.winterwell.utils.Dep;
import com.winterwell.web.app.CommonFields;
import com.winterwell.web.app.CrudServlet;
import com.winterwell.web.app.Emailer;
import com.winterwell.web.app.IServlet;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;
import com.winterwell.web.email.EmailConfig;
import com.winterwell.web.email.SimpleMessage;
import com.winterwell.web.fields.Checkbox;

public class EmailServlet extends CrudServlet<Event> implements IServlet {

	private static final String DEFAULT_MESSAGE = "default message";

	public EmailServlet() {
		super(Event.class);
	}

	// This isn't strictly necessary at the moment. Felt that it'd come in handy
	// later when we want to insert the message body into a more complete email
	// template.
	public String generateMessageBody(WebRequest state) {
		String message = state.get("optionalMessage");

		if (message == null)
			return DEFAULT_MESSAGE;
		else
			return message;
	}

	@Override
	public void process(WebRequest state) throws Exception {
		// Think it might be better to check enableNotification before the email request
		// is sent. Feels a bit wasteful to send an extraneous request
		Boolean enableNotification = state.get(new Checkbox("enableNotification"));
		String message = generateMessageBody(state);
		Person sender = DBSoGive.getCreateUser(new XId(state.get("senderId")));
		String senderName = sender.getName() != null ? sender.getName() : sender.getEmail();

		InternetAddress recipient = state.get(CommonFields.EMAIL);
		if (enableNotification) {
			sendAnEmail(recipient, message, senderName);
		}
	}

	public void sendAnEmail(InternetAddress recipient, String message, String senderName) throws AddressException {
		EmailConfig ec = Dep.get(EmailConfig.class);
		InternetAddress sender = new InternetAddress(ec.emailFrom);
		Emailer e = new Emailer(ec);

		// Might be nice to retrieve sender's ID and append to front of title. Feel
		// people are more likely to open email if they recognise the sender's name
		SimpleMessage email = new SimpleMessage(sender, recipient,
				senderName + " has invited you to an event on sogive.org", message);
		e.send(email);
	}
}
