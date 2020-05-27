package org.sogive.server.payment;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.sogive.data.DBSoGive;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.Person;

import com.goodloop.data.Money;
import com.goodloop.data.PaymentException;
import com.stripe.exception.CardException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.Customer;
import com.winterwell.data.KStatus;
import com.winterwell.es.ESPath;
import com.winterwell.utils.Utils;
import com.winterwell.utils.containers.ArrayMap;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.AppUtils;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

/**
 * 
 * TODO handle repeat donations
 * @author daniel
 *
 */
public class MoneyCollector {

	private String buyerEmail;

	public MoneyCollector(IForSale basket, XId buyer, String buyerEmail, XId seller, WebRequest state) {
		this.basket = basket;
		this.user = buyer;
		this.buyerEmail = buyerEmail;
		this.to = seller;
		this.state = state;
		Utils.check4null(basket, buyer);
	}


	private static final String LOGTAG = "money";
	final IForSale basket;
	final XId user;
	final XId to;
	/**
	 * Can be null. StripeAuth gets info from here.
	 */
	final WebRequest state;
	
	List<Transfer> transfers = new ArrayList();
	
	/**
	 * 
	 * @return
	 * @throws RuntimeException If the stripe money collection goes wrong
	 * CardException 
	 */	
	public List<Transfer> run() throws RuntimeException {
		Money total = basket.getAmount();
		
		// already paid?
		if (basket.getPaymentCollected()) {
			Log.d(LOGTAG, "no money collection - payment already collected for "+basket);
			return transfers;
		}

		// nothing to pay?
		if (total.getValue100p()==0) {
			Log.d(LOGTAG, "no money collection - £0 for "+basket);
			return transfers;
		}
		
		// paid on credit?		
		StripeAuth sa = basket.getStripe();
		boolean allOnCredit = false;
		if (sa != null && StripeAuth.credit_token.equals(sa.id)) {
			allOnCredit = true;
		}
		
		Money credit = Transfer.getTotalCredit(user);
		if (credit!=null && credit.getValue100p() > 0) {
			// NB if your account is in debt i.e. < 0, then you cant pay on credit
			Money residual = doCollectMoney2(credit, allOnCredit);
			if (residual==null || residual.getValue100p()==0) {
				Log.d(LOGTAG, "full payment on credit "+basket+".");
				return transfers;
			} else {
				Log.d(LOGTAG, "part payment on credit "+basket+" residual: "+residual);	
			}
			
			total = residual;
		} else if (allOnCredit) {
			throw new PaymentException("Cannot pay with credit of "+credit+" (basket: "+basket+")");
		}
		
		// Stripe key
		StripePlugin.prep();
		
		// TODO Less half-assed handling of Stripe exceptions
		try {
			/** Donation has provision to store a StripeAuth now - may already be on the object */
			// take payment
			String ikey = basket.getId();
			Person userObj = DBSoGive.getCreateUser(user);
			if (sa == null) {
				sa = new StripeAuth(userObj, state);
			}
			
			if (StripeAuth.SKIP_TOKEN.equals(sa.id)) { 
				// TODO security check!
				Log.d(LOGTAG, "skip payment: "+basket);
				return transfers; 
			}						

			// attach source to customer
			if (sa.isSource()) {
				Customer customer = addStripeSourceToCustomer(sa);
				Log.d(LOGTAG, "Made customer "+customer);
			}
			
			// Use polling to do repeats
//			if (basket.getRepeat()!=null) {
//				run2_repeat(sa, userObj);
//				return transfers;
//			}
			
			// one off or first payment
			String chargeDescription = basket.getClass().getSimpleName()+" "+basket.getId()+" "+basket.getDescription();						
			Charge charge = StripePlugin.collect(total, chargeDescription, sa, userObj, ikey);
			Log.d("stripe.collect", charge);
			basket.setPaymentId(charge.getId());
			basket.setPaymentCollected(true);
			
			// TODO save the "paid" edit straight away
//			AppUtils.doSaveEdit(basket, state);
			
			transfers.add(new Transfer(user, to, total));
			// check we haven't done before: done by the op_type=create
			return transfers;
		} catch(CardException cex) {
			Log.w(LOGTAG, "Error from "+basket.getId()+": "+cex);
			throw new PaymentException(cex.getMessage()+" "+cex.getDeclineCode());
		} catch(Throwable e) {			
			Log.w(LOGTAG, "Error from "+basket.getId()+": "+e);
			throw Utils.runtime(e);
		}
	}

	/**
	 * https://stripe.com/docs/sources/customers
	 * @param sa
	 * @return shouldn't be null, but best to handle that
	 * @throws StripeException
	 */
	private Customer addStripeSourceToCustomer(StripeAuth sa) throws StripeException {
		if (sa.getCustomerId() != null) {
			Log.d(LOGTAG, "NOT adding Stripe source to customer 'cos its hopefully already set");
			Customer customer = Customer.retrieve(sa.getCustomerId());
			return customer;
		}
		assert "source".equals(sa.getObject()) : sa;
		try {
			Map<String, Object> customerParams = new ArrayMap<>(
				"email", getBuyerEmail(),
				"source", sa.id
			);
			Customer customer = Customer.create(customerParams);
			sa.setCustomerId(customer.getId());
			Log.d(LOGTAG, "added Stripe source "+sa.getId()+" to customer "+customer.getId());
			return customer;
		} catch(InvalidRequestException ex) {
			if (ex.toString().contains("already been attached")) {
				// already done? well that shouldn't happen but it's OK
				Log.w(LOGTAG, ex);
				return null;
			}
			throw ex;
		}
	}

	private String getBuyerEmail() {
		if (buyerEmail!=null) return buyerEmail;		
		assert user.isService("email") : user;
		return user.getName();
	}


	private Money doCollectMoney2(Money credit, boolean allOnCredit) 
	{		
		// TODO check credit more robustly		
		Money amount = basket.getAmount();
		Money paidOnCredit = amount;
		Money residual = Money.pound(0);
		if (amount.getValue100p() > credit.getValue100p()) {
			residual = amount.minus(credit);
			paidOnCredit = credit;
			if (allOnCredit) {
				throw new PaymentException("Cannot pay "+amount+" with credit of "+credit+" (basket: "+basket+")");
			}
		}
		// reduce credit
		Transfer t = new Transfer(user, to, paidOnCredit);
		t.publish();
		transfers.add(t);
		basket.setPaymentId(t.getId());
		// OK
		return residual;
	}

}
