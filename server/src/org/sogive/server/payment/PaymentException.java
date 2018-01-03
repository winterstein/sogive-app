package org.sogive.server.payment;

public class PaymentException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public PaymentException(String string) {
		super(string);
	}

}
