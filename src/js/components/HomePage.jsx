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
            content: "SoGive is an independent nonprofit that analyses charities to help donors find the best places to give. We produce ratings of charities based on how much impact they have."
          },
          {
            title: "Who works at SoGive?",
            content: <p>SoGive is co-founded by Sanjay Joshi and Daniel Winterstein. For more about them, <a href="#about">click here</a>. Our staff consists of analysts, developers, creatives, and our operations team.</p>
          },
          // {
          //   title: "How does SoGive make money?",
          //   content: ""
          // },
          {
            title: "Does SoGive contact charities to assess them?",
            content: "In some cases, we do contact a charity to get sufficient information to make our assessments. In other cases, there is ample information about a charity for us to confidently make assessments without said contact."
          }]
      }

    const FAQdataR = {
        rows: [
        {
        title: "Will my donation be tax-deductible?",
        content: "It depends. If the charity you choose offers a tax deduction and they are UK based, it should be. Unfortunately, we cannot provide tax advice."
        },
        {
        title: "Does SoGive recommend charities for every cause?",
        content: "We aim to recommend charities within every major cause area. However, due to limited time, there are some cause areas we do not currently have recommendations for. We hope to improve and expand our analyses in the coming year."
        },
        {
        title: "Can I get SoGive to analyze a charity I'm interested in?",
        content: <p>To speak to us about a particular charity, feel free to reach out to <a href="mailto:matt@sogive.org">matt@sogive.org</a>.</p>
        },
        {
        title: "Can I help in volunteering to analyze charities?",
        content: <p>Yes! We are often recruiting volunteers for our analysis and development teams, respectively. We also offer limited paid positions, and those are posted on our website at <a href="#careers">careers</a>. For more information, please reach out to <a href="mailto:sarah@sogive.org">sarah@sogive.org</a> .</p>
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
						<a href="#about">
              <div className="row mb-5">
                <div className="col-3 col-md-2">
                  <img src="/img/profilepic/sanjay.png" alt="" className="w-100" />
                </div>
                <div className="col-3 col-md-2">
                  <img src="/img/profilepic/daniel.png" alt="" className="w-100" />
                </div>
              </div>
            </a>
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