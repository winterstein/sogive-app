package org.sogive.server.payment;

import java.util.ArrayList;
import java.util.List;

import org.sogive.data.charity.Money;
import org.sogive.data.charity.NGO;
import org.sogive.data.commercial.Transfer;
import org.sogive.data.user.DBSoGive;
import org.sogive.data.user.Donation;
import org.sogive.data.user.Person;

import com.goodloop.data.PaymentException;
import com.stripe.model.Charge;
import com.winterwell.utils.log.Log;
import com.winterwell.web.app.WebRequest;
import com.winterwell.web.data.XId;

public class MoneyCollector {

	public MoneyCollector(IForSale basket, XId buyer, XId seller, WebRequest state) {
		super();
		this.basket = basket;
		this.user = buyer;
		this.to = seller;
		this.state = state;
	}


	private static final String LOGTAG = "money";
	final IForSale basket;
	final XId user;
	final XId to;
	final WebRequest state;
	
	List<Transfer> transfers = new ArrayList();
	
	public List<Transfer> run() {
		Money total = basket.getAmount();

		// nothing to pay?
		if (total.getValue()==0) {
			return transfers;
		}
		
		// paid on credit?		
		StripeAuth sa = basket.getStripe();
		boolean allOnCredit = false;
		if (sa != null && StripeAuth.credit_token.equals(sa.id)) {
			allOnCredit = true;
		}		
		Money credit = Transfer.getTotalCredit(user);
		if (credit!=null && credit.getValue() > 0) {
			Money residual = doCollectMoney2(credit, allOnCredit);
			if (residual==null || residual.getValue()==0) {
				return transfers;
			}
			Log.d(LOGTAG, "part payment on credit "+basket+" residual: "+residual);
			total = residual;
		}
		
		// TODO Less half-assed handling of Stripe exceptions
		try {
			/** Donation has provision to store a StripeAuth now - may already be on the object */
			// take payment
			String ikey = basket.getId();
			Person userObj = DBSoGive.getCreateUser(user);

			if (StripeAuth.SKIP_TOKEN.equals(sa.id)) { // TODO security check!
				Log.d(LOGTAG, "skip payment: "+basket);
				return transfers; 
			}
			if (sa == null) {
				sa = new StripeAuth(userObj, state);
			}
			
			Charge charge = StripePlugin.collect(total, basket.getId(), sa, userObj, ikey);
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
		if (amount.getValue() > credit.getValue()) {
			residual = amount.minus(credit);
			paidOnCredit = credit;
			if (allOnCredit) {
				throw new PaymentException("Cannot pay "+amount+" with credit of "+credit+" (basket: "+basket+")");
			}
		} else {
			// pay it all
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
