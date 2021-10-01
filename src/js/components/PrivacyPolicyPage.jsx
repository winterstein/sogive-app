import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const PrivacyPolicyContent = () => {
    return (
        <div className="container py-5">
						<center><p class="text-muted">Version 1.1</p></center>
						<center><h3>We will respect and protect your privacy</h3></center>
						<p>&nbsp;</p>
						<center><h4>We promise:</h4></center>
						<ul>
						<li>Your data belongs to you</li>
						<li>We will never sell or share your private information with a third party without your agreement (unless we are required to do so by law)</li>
						<li>No SoGive person will look at your private information, unless it's to fix an issue in the system</li>
						<li>Our staff all sign non-disclosure agreements</li>
						<li>You can delete your data from our systems (unless we are required to keep it by law or for audit purposes). To request deletion of your data from our systems, email&nbsp;<span class="email"><a href="mailto:support@sogive.org">support@sogive.org</a></span>&nbsp;with the subject "Request for user data deletion".</li>
						</ul>
						<br />
						<center><h4>In using SoGive, you agree:</h4></center>
						<ul>
						<li>You authorise SoGive to store information relating to your account, including the use of browser cookies</li>
						<li>Anonymous data is OK. We can use data from your account in anonymised analysis, and the results belong to us. For example, we might produce a report for the charities, helping them understand the pattern of donations in a sector</li>
						<li>Whilst you are a user, you authorise SoGive to use data from your account within our services</li>
						<li>We can contact you as part of the services we supply, e.g. to tell you about new features</li>
						<li>If you submit content to a public part of the site then you grant us an open licence to use, reproduce, adapt and publish that content. An example would be posting a public comment on a blog we host. This does not affect private content, which remains private</li>
						<li>SoGive will ask you to authorise access to sites such as Twitter using a secure system called OAuth. This means you don't have to give us your password. You can revoke OAuth access at any point. E.g. for Twitter, you do that at http://twitter.com/account/connections</li>
						<li>If you link your Facebook or Twitter account to SoGive, we will only use that authorisation to log you in to your SoGive account, and will not retrieve, store or process any other information about you.</li>
						</ul>
        </div>
    )
}

const PrivacyPolicyPage = () => {

    return (
        <div className="privacy-policy">
            <Banner title="Privacy Policy"/> 
            <PrivacyPolicyContent />
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default PrivacyPolicyPage;
