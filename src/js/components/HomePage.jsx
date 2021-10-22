import React from 'react';
import Faq from 'react-faq-component';
import { NewsletterCard, ContactForm, ImpactRatingCard, MethodCard } from './WebsiteCards';

const HomePage = () => {

    return (
        <div className="HomePage">
            <HeroBanner/>
            <MethodCard />
            <FAQCard />
            <ImpactRatingCard title="Find effective charites." />
            <NewsletterCard />
            <ContactCard />
        </div>
    );
};

const HeroBanner = () => {

    return (
        <div className="container-fulid gradient">
            <div className="worldImage">
                <div className="container">
                    <div className="row px-5 py-md-5">
                        <div className="col-md-6 mt-5">
                            <div>
                                <h2>Donate to Charity More Effectively</h2>
                                <p>SoGive researches which charities achieve outsized impact through analysing independent evaluations and financial data.</p>
                                <a href="#search" className="btn btn-primary mt-3 p-3">Explore impact ratings</a>
                            </div>
                        </div>
                        <div className="col-md-6 mt-3">
                            <img className="top-cards" src="/img/homepage/top-cards.png" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQCard = () => {

    const FAQdataL = {
        rows: [
          {
            title: "What is SoGive?",
            content: "SoGive is an independent nonprofit that analyses charities to help donors find the best places to give. We produce ratings of charities based on how much impact they make."
          },
          {
            title: "Who works at SoGive?",
            content: "Most of our team are volunteers, including the directors Sanjay and Daniel. We also have a couple of paid staff."
          },
          {
            title: "How does SoGive make money?",
            content: <p>SoGive is a not-for-profit organisation. You can give us a tip when making a donation to a charity. You can also <a className='' href='/#charity?charityId=sogive'>donate directly to SoGive</a>.</p>
          },
          {
            title: "Does SoGive contact charities to assess them?",
            content: "We sometimes contact charities for information. Most of our assessments are from publicly available data though."
          }]
      }

    const FAQdataR = {
        rows: [
        {
        title: "Will my donation be tax-deductible?",
        content: "Usually. That depends on the charity and your personal circumstances. We cannot provide tax advice."
        },
        {
        title: "Does SoGive recommend charities for every cause?",
        content: "Not yet! We are working to provide recommendations for most major cause areas. However some causes are hard to assess objectively."
        },
        {
        title: "Can I get SoGive to analyze a charity I'm interested in?",
        content: "Please contact us to request it. We will try to prioritise it, but we can't guarantee when a charity will be assessed."
        },
        {
        title: "Can I help in volunteering to analyze charities?",
        content: "Yes - please do. Contact us, and we'll get in touch."
        }]
    }

    return (<div id="faq-card" className="bg-light">
      <div className="container py-5">
        <h2>Frequently answered questions</h2>
        <div className="row mt-3">
            <div className="col-md">
                <Faq data={FAQdataL}/> 
            </div>
            <div className="col-md">
                <Faq data={FAQdataR}/>
            </div>
        </div>
      </div>
    </div>);
};

const ContactCard = () => {

    return (<div id="contact-card">
      <div className="container py-5">
        <div className="row">
          <div className="col-md">
            <h3>Contact Us</h3>
            <p>Want to learn more about SoGive's work? Need help with your giving decisions? Contact the SoGive team using this form, and we'll be in touch.</p>
						<div className="row mb-5">
							<div className="col-3 col-md-2">
								<img src="/img/profilepic/sanjay.png" alt="" className="w-100" />
							</div>
							<div className="col-3 col-md-2">
								<img src="/img/profilepic/daniel.png" alt="" className="w-100" />
							</div>
						</div>
          </div>
          <div className="col-md">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
    );
};

export default HomePage;