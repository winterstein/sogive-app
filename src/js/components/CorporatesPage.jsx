import React from 'react';
import { ImpactRatingCard, ContactCardLight, TextBanner, MethodCard } from './WebsiteCards';
import { FinancialAdvisersContent } from './FinancialAdvisersPage';

const CorporatesPage = () => {

    return (
        <div className="CorporatesPage">
						<TextBanner 
							page="SoGive for corporates"
							title="Help your employees make a difference through our charity donation service."
							subtitle="Employees who give to charity are happier, and happier employees keep your company thriving. Engage and retain your employees better through our innovative and engaging corporate donor service."
							image="/img/financial-advisers-1.png"
							/>
						<MethodCard />
						<FinancialAdvisersContent title="Why companies should partner with SoGive" />
						<ContactCardLight title="Ask about our corporate service"/>
						<ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};


export default CorporatesPage;
