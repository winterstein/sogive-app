import React from 'react';
import { ImpactRatingCard, ContactCardLight, TextBanner } from './WebsiteCards';

const FinancialAdvisersPage = () => {

    return (
        <div className="FinancialAdvisersPage">
						<TextBanner 
							page="SoGive for financial advisers"
							title="Attract more high net worth clients with our philanthropy service."
							subtitle="We can give bespoke advice for your clients on which charity to give to and how much to give."
							image="/img/financial-advisers-1.png"
							/>
						<FinancialAdvisersContent title="Why financial advisers should partner with SoGive" />
						<ContactCardLight title="Ask about our philanthropy service" />
						<ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

const FinancialAdvisersContent = ({title}) => {
	return (
		<div className="container py-5">
			<h2>{title}</h2>
			<div className="row mt-3">
				<div className="col-md text-center">
					<img src="/img/financial-advisers-2.png" alt="" className="w-75" />
					<h5 className="mt-3">Attract philanthropic, high net worth clients</h5>
					<p>Partnering with us lets you offer a philanthropy service to attract more clients and differentiate your firm.  More and more HNW clients are getting philanthropy services, such as those offered by private banks. </p>
					<p>We can give your clients trustworthy advice on which charities to support within or beyond the causes they care about, while keeping costs and regulatory overhead low for you. </p>
				</div>
				<div className="col-md text-center">
					<img src="/img/financial-advisers-3.png" alt="" className="w-75" />
					<h5 className="mt-3">Help clients in generational planning</h5>
					<p>A lot of IFAs relationships with clients ends when the client passes away. The clients' children usually are indifferent to financial advice, but they usually care about making a difference. </p>
					<p>By partnering with us, you can offer philanthropic advice to your clients' children, build a relationship with them, and support the long-term sustainability of your firm. </p>
				</div>
			</div>
		</div>
	)
}

export {FinancialAdvisersContent};
export default FinancialAdvisersPage;
