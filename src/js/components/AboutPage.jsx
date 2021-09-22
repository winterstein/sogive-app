import React from 'react';
import { Banner, ContactForm, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const AboutHeroCard = () => {
	return (<div className="container">
			<h2>SoGive ranks charities based on impact</h2>
			<p>SoGive is an independent nonprofit that analyses charities to help donors find the most effective places to give. We analyze and rate charities based on how much impact they make, so you can trust your donation is going to effective work.</p>
			<p>SoGive has two approaches to rating charities:</p>
			<ol>
				<li>First, we do a broad-and-shallow analysis to gauge the general cost-effectiveness of charities. </li>
				<li>For charities that do well in our shallow analysis, we then conduct a deeper analysis that assesses how strong the causal evidence is that the charity's work led to the outcomes it states.</li>
			</ol>
			<p>More detailed information about our approach can be found on our Methodology page. (hyperlink)</p>
		</div>
	)
}

const FoundingteamCard = () => {
	return (
	<div className="container-fluid">
		<h2>Founding Team</h2>
		<div className="row">
			<div className="col-2"><img src="#" alt="" /></div>
			<div className="col-10">
				<h3>Sanjay Joshi, CEO</h3>
				<p>Sanjay has spent 15 years of his career in various analytical roles in finance, including experience as a senior credit analyst at Standard & Poors, a senior strategy consultant, and has qualified as a Fellow of the Institute and Faculty of Actuaries. He also has substantial experience of the charity sector, having served on the boards of 7 charities and provided hands-on consulting support to a further 8 charities. He has also founded several initiatives apart from SoGive, including an EdTech company serving investment banks and a web service applying AI techniques to help people feeling low. Aside from his interest in data-driven and model-driven charitable giving, he also has an interest in ESG (Environmental, Social and Governance) Finance.</p>
			</div>
		</div>
		<div className="row">
			<div className="col-2"><img src="#" alt="" /></div>
			<div className="col-10">
				<h3>Daniel Winterstein, CTO</h3>
				<p>Aside from being the CTO of SoGive, Daniel is the CTO of Good-Loop, an advertising firm that gives 50% of ad revenue to a relevant charitable cause. He has played a leading role in the launch of several startups, and has a PhD in artificial intelligence. </p>
			</div>
		</div>
	</div>
	)
}

const VolunteerCard = () => {
	return (
		<div className="container">
			<div className="text-center">
				<h2>SoGive is volunteer-driven</h2>
				<p>If you would like to volunteer with SoGive, please email Matt at Matt@sogive.org. Our main volunteer role is as a volunteer charity analyst, for which you would need to commit at least a few hours each week. If you are interested in volunteering in a non-analyst capacity, please do feel free too reach out and we can discuss.</p>
			</div>
			<ContactForm />
		</div>
	)
}

const AboutPage = () => {

    return (
        <div className="AboutPage">
						<Banner title="About Us"/>
						<AboutHeroCard />
						<FoundingteamCard />
						<VolunteerCard />
						<NewsletterCard />
						<ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default AboutPage;
