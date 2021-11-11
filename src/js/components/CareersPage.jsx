import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const PrivacyPolicyContent = () => {
    return (
        <>
        <br/><br/>
        <center><p className="text-muted">Current Vacancies</p></center>
        <div className="container">
            <h2>Senior Dev / Team Lead</h2>
            <h3>About SoGive</h3>
            <span>
                SoGive is an independent nonprofit that analyses charities to help donors find the best places to give. We produce ratings of charities based on how much impact they make.
                <br/><br/>
                We're hiring a Senior Dev with project & team management experience to help grow the technical side of our operations, and maximize our ability to most effectively help donors maximize their charitable impact. SoGive is still very much in a start-up phase of its growth. Due to this, there is tremendous potential for having a large impact on the organization, while also involving the risk and excitement of an early stage organization.
                <br/><br/>
                Salary: Depending on skills and experience
                <br/><br/>
                Location: Remote. Our staff is located largely in the UK, Europe, and the U.S., though our volunteer network is truly global. We are flexible on location as long as we’re able to have routine chats as a team. The core team hours are: 3pm to 6pm UK time - any location is OK, as long as those hours work for you in your timezone.
                <br/><br/>
                Hours: Full-Time (flexible options available)
            </span>
            <hr/>
            <h3>ESSENTIAL SKILLS</h3>
            <span>
                <ul>
                    <li>Javascript (+ HTML & CSS)</li>
                    <li>Backend development experience in Java</li>
                    <li>2+ years of team and project management experience (as CTO, team-leader, or similar)</li>
                    <li>4+ years of industry experience</li>
                    <li>A university degree, 2nd className or higher, from a respected university. </li>
                    <li>Experience in agile development</li>
                    <li>Examples of your experience doing UX / User-centred design</li>
                    <li>Good communication skills</li>
                    <li>Entrepreneurial drive and business sense, so you can help define business needs and turn them into development projects</li>
                    <li>Able to work in a team</li>
                    <li>Also must be independent enough to manage your own work</li>
                    <li>Must have example code that you can send us</li>
                </ul>
            </span>
            <hr/>
            <h3>DESIRABLE SKILLS</h3>
            <span>
                We don't expect you to have experience in all of these -- let us know which ones you have:
                <ul>
                    <li>React</li>
                    <li>ElasticSearch</li>
                    <li>Data science</li>
                    <li>Graphic design</li>
                </ul>
            </span>
            <hr/>
            <h3>ABOUT YOU</h3>
            <span>
                You should have a passionate can-do attitude to your work and substantial project & team management experience, in addition to the right dev background. Responsibility and independence are important -- combined with flexible team-work. The right candidate will have the chance to shape the job, and will be at the heart of an exciting company.
            </span>
            <hr/>
            <h3>HOW TO APPLY</h3>
            <span>
                To apply, please email:
                <ul>
                    <li>Your CV</li>
                    <li>A portfolio of your best work</li>
                    <li>A Cover letter expressing your interest and fit for the role</li>
                </ul>
                To <span className='email' name='sarah' domain='sogive.org'>sarah (at) sogive.org</span> with the subject line: "SENIOR DEV Application"
                <br/><br/>
                We will collect applications, and get in touch with you once we're ready. This may take a couple of weeks.
            </span>
        </div>
        <hr/><br/><br/>
        <div className="container">
            <center><p className="text-muted">We anticipate that we might have needs in the following areas in the future:</p></center>
			<ul>
				<li>Software Developers (Frontend &amp; Backend)</li>
				<li>Charity Impact Analysis Personnel</li>
				<li>End-User Design/UX</li>
			</ul>
		</div>
        <br/><br/>
        </>
    )
}

const CareersPage = () => {

    return (
        <div className="privacy-policy">
            <Banner title="Careers"/> 
            <PrivacyPolicyContent />
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default CareersPage;
