package org.sogive.server.payment;

import java.util.Map;
import java.util.Objects;

import org.sogive.data.user.Person;

import com.winterwell.utils.Utils;
import com.winterwell.web.app.WebRequest;

/**
 * Token or Source for a Customer
 * 
 * @author daniel
 *
 */
public class StripeAuth {

	public static final String credit_token = "credit_token";

	public static final String SKIP_TOKEN = "skip_token";

	/**
	 * Stripe-sanitised card details Useful fields: last4: last four digits
	 * exp_month, exp_year: expiry brand: eg "Visa" country: two-letter code
	 */
	Map<String, Object> card;
	/**
	 * ??
	 */
	String client_secret;

	/**
	 * Time when this authorisation was created (NB: Stored as epoch seconds, not
	 * ms)
	 */
	String created;

	/**
	 * Customer info, may be blank
	 */
	String customerId;

	String email;

	/**
	 * The token ID
	 */
	public String id;

	/**
	 * live or test?
	 */
	Boolean livemode;

	/**
	 * "token" or "source"?
	 */
	String object;

	/**
	 * SOurce only (not token)
	 * 
	 * address email name phone verified_address verified_email verified_name
	 * verified_phone
	 */
	Map<String, Object> owner;

	/**
	 * ??
	 */
	String statement_descriptor;
	/**
	 * The token type - usually "card"
	 */
	String type;
	public StripeAuth() {
	}

	/**
	 * 
	 * @param userObj
	 * @param state   Can be null.
	 */
	public StripeAuth(Person userObj, WebRequest state) {
		assert userObj != null || state != null;
		if (state != null) {
			id = state.get("stripeToken");
			type = state.get("stripeTokenType");
			email = state.get("stripeEmail");
		}
		if (userObj != null) {
			Map stripe = (Map) userObj.get("stripe");
			if (stripe != null) {
				// where does this info live??
				String cid = (String) Utils.or(state.get("customerId"), stripe.get("customerId"));
				if (cid != null)
					setCustomerId(cid);
			}
			if (email == null) {
				email = userObj.getEmail();
			}
		}
		// what is the min info needed?
		if (Utils.isBlank(customerId) && Utils.isBlank(email) && Utils.isBlank(id)) {
			throw new IllegalArgumentException("Not enough info for a Stripe charge: " + userObj + " " + state);
		}
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		StripeAuth other = (StripeAuth) obj;
		return Objects.equals(card, other.card) && Objects.equals(client_secret, other.client_secret)
				&& Objects.equals(created, other.created) && Objects.equals(customerId, other.customerId)
				&& Objects.equals(email, other.email) && Objects.equals(id, other.id)
				&& Objects.equals(livemode, other.livemode) && Objects.equals(object, other.object)
				&& Objects.equals(owner, other.owner)
				&& Objects.equals(statement_descriptor, other.statement_descriptor) && Objects.equals(type, other.type);
	}

	public String getCustomerId() {
		return customerId;
	}

	public String getEmail() {
		return email;
	}
	public String getId() {
		return id;
	}
	public String getObject() {
		return object;
	}

	@Override
	public int hashCode() {
		return Objects.hash(card, client_secret, created, customerId, email, id, livemode, object, owner,
				statement_descriptor, type);
	}

	/**
	 * @return true if this is a PaymentMethod (should be all StripeAuths after Dec
	 *         2020 API migration)
	 */
	public boolean isPaymentIntent() {
		return "payment_intent".equals(object);
	}

	public boolean isPaymentMethod() {
		return "payment_method".equals(object);
	}

	/** @return true if this is a (probably reusable) money source */
	public boolean isSource() {
		return "source".equals(object);
	}

	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	@Override
	public String toString() {
		// paranoia - dont leak money tokens into logs
		String tkn = null;
		if (id != null) {
			if (SKIP_TOKEN.equals(id))
				tkn = SKIP_TOKEN;
			else
				tkn = "XXX";
		}
		return "StripeAuth[customerId=" + customerId + ", tokenId=" + tkn + ", tokenType=" + type + ", email=" + email
				+ "]";
	}

}
