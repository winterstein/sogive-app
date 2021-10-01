import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const TermsContent = () => {
    return (
        <div className="container py-5">
						<center><p class="text-muted">Version 1.0.1</p></center>
						<h3>1. Introduction</h3>
						<p>SoGive ("us") provide data and information about charity impact, and the facility to make donations to charities (the "Service").</p>
						<p>The following terms and conditions of use, plus our privacy policy which collectively make up the "Terms of Service", govern your use of the Service.</p>
						<p>By using the Service, the organisation or individuals using the services ("You") are agreeing to be bound by the Terms of Service. If you disagree with these Terms of Service or any part of these Terms of Service, you must not use the Service.</p>
						<h3>2. Account Terms</h3>
						<ol>
						<li>You must be 13 years or older to use this Service</li>
						<li>You must provide your legal full name, a valid email address or social media account, and any other information requested in order to complete the signup process</li>
						<li>Your login may only be used by one person - a single login shared by multiple people is not permitted. You may create separate logins for as many people as you'd like</li>
						<li>You must be a human. Accounts registered or operated by "bots" or automated methods are not permitted unless agreed with SoGive</li>
						<li>You are responsible for maintaining the security of your account and password</li>
						<li>You understand that SoGive uses third party vendors and hosting partners to provide the necessary hardware, software, networking, storage, and related technology required to run the Service</li>
						</ol>
						<h3>3. Acceptable Use</h3>
						<ol>
						<li>You must not use SoGive in any way that may cause damage to the Service; or in any way which is unlawful, illegal, fraudulent or harmful, or in connection with any unlawful, illegal, fraudulent or harmful activity.</li>
						<li>You must not use the Service to copy, store, host, transmit, send, use, publish or distribute any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, keystroke logger, rootkit or other malicious computer software</li>
						<li>You must not modify, adapt or hack the Service or modify another website so as to falsely imply that it is associated with the Service, SoGive, or any other SoGive service.</li>
						<li>You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service without the express written permission by SoGive</li>
						<li>Verbal, physical, written or other abuse (including threats of abuse or retribution) of any SoGive customer, employee, member, or officer are not acceptable.</li>
						<li>In order to preserve the quality of service for all users, please avoid putting undue strain on our servers. If we determine that you are using more than your fair share of resources, then we may limit or restrict your use.</li>
						</ol>
						<h3>4. Restricted Access</h3>
						<ol>
						<li>Access to certain content and services is restricted. For example: customer data is kept private! SoGive reserve the right to further restrict access to content and services.</li>
						<li>You must ensure that your user ID and password details are kept confidential.</li>
						<li>SoGive may disable your user ID and password without notice if we believe you have broken the Terms of Service or any other agreement you have with us.</li>
						<li>You must not try to disable or circumvent the restrictions SoGive puts in place.</li>
						</ol>
						<h3>5. User Generated Content</h3>
						<ol>
						<li>In these terms of use, "your user content" means material that you submit to our website, for whatever purpose.</li>
						<li>By choosing to submit material, you grant SoGive a permanent royalty free license to use, distribute, re-license, and modify your user content, online or in digital or printed form.</li>
						<li>Your user content must not be illegal or unlawful, must not infringe any third party's legal rights, and must not be capable of giving rise to legal action whether against you or us or a third party (in each case under any applicable law). Offensive, racist, or defamatory content is also forbidden</li>
						<li>You must not submit any user content to the website that is or has ever been the subject of any threatened or actual legal proceedings or other similar complaint.</li>
						<li>SoGive reserve the right to edit or remove any material submitted to our website, or stored on our servers, or hosted or published upon our website.</li>
						<li>SoGive do not undertake to monitor the submission or the publication of user content on and from our website.</li>
						<li>While SoGive prohibits certain content on the Service, you understand that SoGive cannot be responsible for the Content posted on the Service and you nonetheless may be exposed to such materials.</li>
						</ol>
						<h3>6. Charges</h3>
						<ol>
						<li>SoGive reserves the right at any time to modify the Service, including the fee basis for services.</li>
						<li>Prices of all Services are subject to change upon 30 days' notice from us. Such notice may be provided at any time by posting the changes to the SoGive Site (SoGive.org). SoGive shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service</li>
						<li>While not necessarily imposing a charge on You, we may offer You the opportunity to make a donation to SoGive to support Our running costs. Where we do this, references elsewhere in this document to donation amounts going to recipient charities are net of this donation to SoGive</li>
						<li>Where we charge for access to content and services, the following conditions apply:</li>
						</ol>
						<ul>
						<li>At our discretion, payment may be required either upfront or in-arrears</li>
						<li>Payment will be deemed to have been made when the payment is either cleared funds in our bank account, or (b) cleared funds in our PayPal account or Stripe account (or other such payment system which we may specify). Any taxes or third party charges which are subtracted from a payment will not count as part of the payment</li>
						<li>Where payments are late or short, we may cancel or restrict your access to any or all of our services</li>
						</ul>
						<ol>
						<li>Prices of all Services to paying customers are subject to change upon 30 days' notice from us. Such notice may be provided at any time by posting the changes to the SoGive Site (sogive.org). SoGive shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.</li>
						</ol>
						<h3>7. Processing of donations and Gift Aid</h3>
						<ol>
						<li>It is upto SoGive whether or not to include a charity or similar body.</li>
						<li>SoGive enables charities to claim Gift Aid by gathering the Gift Aid declarations necessary to make this happen. SoGive then passes this information on to the charities to enable them to claim Gift Aid. Charities must be registered with the Charity Commission or exempt from registration for SoGive to pass on this information. SoGive may also feature certain not-for-profit and other organisations, which are not eligible for Gift Aid reclaim. Such organisations are indicated on the SoGive site as not eligible for Gift Aid reclaim. Donations to any of these Causes are not tax deductible.</li>
						<li>SoGive also runs a "non member charity" service. This means SoGive may also feature on our Website charities even if they are not one of our member charities.</li>
						<li>When SoGive sends a donation to a non member charity, SoGive will send the non member charity the donation plus the Gift Aid declaration information to enable them to claim Gift Aid. If the non member charity accepts the donation and receives the Gift Aid declaration information an agreement will be formed with SoGive. If they do not accept the cheque or the Gift Aid declaration information, they will not enter into any agreement with SoGive and the donation will not be processed. It may take up to six months from when SoGive passes your donation on to the charity to confirm that the donation will not be processed. If the non member charity refuses the donation, or SoGive is unable to make payment, or doesn't feel it is appropriate to pass on a donation (for example, if a charity has been de-registered by the Charity Commission or has a sanction listed against them) then SoGive will contact you so as to return the donation to you. If SoGive is unable to contact you then SoGive will select an appropriate alternative charity to pass the donation to.</li>
						<li>SoGive does not provide tax advice and must not be used for tax guidance. Please use a qualified professional for tax matters.</li>
						</ol>
						<h3>8. Indemnity</h3>
						<ol>
						<li>You hereby indemnify us and undertake to keep us indemnified against any losses, damages, costs, liabilities and expenses (including without limitation legal expenses and any amounts paid by us to a third party in settlement of a claim or dispute on the advice of our legal advisers) incurred or suffered by us arising out of any breach by you of any provision of these Terms of Service, or arising out of any claim that you have breached any provision of these Terms of Service</li>
						<li>You understand and agree that SoGive shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of goodwill, use, data or other intangible losses (even if SoGive has been advised of the possibility of such damages), resulting from:
						<ul>
						<li>the use or the inability to use the service;</li>
						<li>the cost of procurement of substitute goods and services resulting from any goods, data, information or services purchased or obtained or messages received or transactions entered into through or from the service;</li>
						<li>unauthorized access to or alteration of your transmissions or data statements or conduct of any third party on the service;</li>
						<li>any inaccurate or misleading information;</li>
						<li>or any other matter relating to the service.</li>
						</ul>
						</li>
						</ol>
						<h3>9. License to use Creative Commons and public domain material</h3>
						<p>This website contains some material licensed under a creative commons license. This material is marked by an attribution of the form "cc [The Licensor]". You have rights to reuse such content, subject to restrictions set by the licensor. Please contact the licensor for details.</p>
						<h3>10. Variation</h3>
						<ol>
						<li>SoGive reserves the right to update and change the Terms of Service from time to time. Please check this page regularly, and note the version number at the start, to ensure you are familiar with the current version.</li>
						<li>Continued use of the Service shall constitute your consent to the latest version of the Terms of Service</li>
						<li>Any new features that enhance the current Service, including the release of new tools and resources, shall be subject to the Terms of Service</li>
						</ol>
						<h3>11. Assignment</h3>
						<ol>
						<li>
						<p>SoGive may transfer, sub-contract or otherwise deal with our rights and/or obligations under these terms of use.</p>
						</li>
						<li>
						<p>You may not transfer, sub-contract or otherwise deal with your rights and/or obligations under these terms of use.</p>
						</li>
						</ol>
						<h3>12. Severability</h3>
						<ol>
						<li>If a provision of these terms of use is determined by any court or other competent authority to be unlawful and/or unenforceable, the other provisions will continue in effect. If any unlawful and/or unenforceable provision would be lawful or enforceable if part of it were deleted, that part will be deemed to be deleted, and the rest of the provision will continue in effect</li>
						<li>The failure by us to enforce at any time or for any period any one or more of the clauses set out here shall not be a waiver of them or of the right at any time subsequently to enforce all terms and conditions of this agreement</li>
						</ol>
						<h3>13. Exclusion of third party rights</h3>
						<p>These terms of use are for the benefit of you and us, and are not intended to benefit any third party or be enforceable by any third party. The exercise of our and your rights in relation to these terms of use is not subject to the consent of any third party.</p>
						<h3>14. Law and jurisdiction</h3>
						<p>These terms of use will be governed by and construed in accordance with Scottish law, and any disputes relating to these terms of use will be subject to the jurisdiction of the courts of Scotland.</p>
						<h3>15. Our details</h3>
						<ul>
						<li>SoGive's full name is SoGive Ltd, and we work with Winterwell Associates Ltd.</li>
						<li>SoGive are registered in England and Wales under registration number 09966206.</li>
						<li>Our registered address is: 48 Queen Edith's Way, Cambridge, CB1 8PW, United Kingdom</li>
						<li>You can contact us by email to sanjay at sogive.org.</li>
						</ul>
        </div>
    )
}

const TermsPage = () => {

    return (
        <div className="terms-of-service">
            <Banner title="Terms of Service"/> 
            <TermsContent />
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default TermsPage;
