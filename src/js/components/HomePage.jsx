import React from 'react';
import Faq from 'react-faq-component';
import { NewsletterCard, ContactForm, ImpactRatingCard } from './WebsiteCards';

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
        <div className="gradient">
            <div className="worldImage">
                <div className="row px-5 py-md-5">
                    <div className="col-md-6 mt-5">
                        <div className="">
                            <h2>Donate to Charity More Effectively</h2>
                            <p>SoGive researches which charities achieve outsized impact through analysing independent evaluations and financial data.</p>
                            <a href="#search" className="btn btn-primary mt-5 p-3">Explore impact ratings</a>
                        </div>
                    </div>
                    <div className="col-md-6 mt-3">
                        <img className="top-cards" src="/img/homepage/top-cards.png" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const MethodCard = () => {
    return (
        <div id="method-card" className="bg-light">
            <div className="container-fluid p-5">
                <h2>Our Methodology</h2>
                <div className="row method-4-steps">
                    <div className="col">
                        <img src="" alt="" />
                        <p>1. Analyse financial statements</p>
                        <p>We review charities' financial and program spending.</p>
                    </div>
                    <div className="col">
                        <img src="" alt="" />
                        <p>2. Assess outcomes</p>
                        <p>We determine what the charity achieved for each program in measurable units.</p>
                    </div>
                    <div className="col">
                        <img src="" alt="" />
                        <p>3. Calculate cost-effectiveness</p>
                        <p>We divide the costs by the outcomes achieved to get the cost per outcome.</p>
                    </div>
                    <div className="col">
                        <img src="" alt="" />
                        <p>4. Compare to others</p>
                        <p>We compare the cost per outcomes with other charities to find the most effective ones.</p>
                    </div>
                </div>
                <div className="text-center">
                    <h4>Read more about our methodology</h4>
                    <a href="#methodology" className="btn btn-secondary">Learn more</a>
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
            content: "Nunc maximus, magna at ultricies elementum, risus turpis vulputate quam."
          },
          {
            title: "How does SoGive make money?",
            content: "Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc"
          },
          {
            title: "Does SoGive contact charities to assess them?",
            content: "Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc"
          }]
      }

    const FAQdataR = {
        rows: [
        {
        title: "Will my donation be tax-deductible?",
        content: "Lorem ipsum dolor sit amet, consectetur "
        },
        {
        title: "Does SoGive recommend charities for every cause?",
        content: "Nunc maximus, magna at ultricies elementum, risus turpis vulputate quam."
        },
        {
        title: "Can I get SoGive to analyze a charity I'm interested in?",
        content: "Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc"
        },
        {
        title: "Can I help in volunteering to analyze charities?",
        content: "Curabitur laoreet, mauris vel blandit fringilla, leo elit rhoncus nunc"
        }]
    }

    return (<div id="method-card" className="bg-light">
      <div className="container-fluid p-5">
        <h2>Frequently answered questions</h2>
        <div className="row mt-3">
            <div className="col">
                <Faq data={FAQdataL}/> 
            </div>
            <div className="col">
                <Faq data={FAQdataR}/>
            </div>
        </div>
      </div>
    </div>);
};

const ContactCard = () => {

    return (<div id="contact-card">
      <div className="container-fluid p-5">
        <div className="row">
          <div className="col">
            <h3>Contact Us</h3>
            <p>Want to learn more about SoGive's work? Need help with your giving decisions? Contact the SoGive team using this form, and we'll be in touch.</p>
          </div>
          <div className="col">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
    );
};

export default HomePage;