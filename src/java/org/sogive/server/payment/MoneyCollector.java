package org.sogive.server.payment;

import java.util.ArrayList;
import java.util.List;

import org.sogive.data.DBSoGive;
import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;

import com.goodloop.data.PaymentException;
import com.stripe.model.Charge;
import com.winterwell.utils.Utils;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

public class MoneyCollector {

	public MoneyCollector(IForSale basket, XId buyer, XId seller, WebRequest state) {
		this.basket = basket;
		this.user = buyer;
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
	
	public List<Transfer> run() {
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
				return transfers;
			}
			Log.d(LOGTAG, "part payment on credit "+basket+" residual: "+residual);
			total = residual;
		} else if (allOnCredit) {
			throw new PaymentException("Cannot pay with credit of "+credit+" (basket: "+basket+")");
		}
		
		// TODO Less half-assed handling of Stripe exceptions
		try {
			/** Donation has provision to store a StripeAuth now - may already be on the object */
			// take payment
			String ikey = basket.getId();
			Person userObj = DBSoGive.getCreateUser(user);

			if (StripeAuth.SKIP_TOKEN.equals(sa.id)) { 
				// TODO security check!
				Log.d(LOGTAG, "skip payment: "+basket);
				return transfers; 
			}
			if (sa == null) {
				sa = new StripeAuth(userObj, state);
			}
			
			String chargeDescription = basket.getClass().getSimpleName()+" "+basket.getId()+" "+basket.getDescription();
			Charge charge = StripePlugin.collect(total, chargeDescription, sa, userObj, ikey);
			Log.d("stripe.collect", charge);
			basket.setPaymentId(charge.getId());
			basket.setPaymentCollected(true);					
			transfers.add(new Transfer(user, to, total));
			// FIXME
//			pi.setRefresh("true");
//			pi.setOpTypeCreate(true);				
			// check we haven't done before: done by the op_type=create
			return transfers;
		} catch(Exception e) {
			throw new RuntimeException(e);
		}
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
