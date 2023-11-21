import React, { useEffect } from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';
import MDText from '../base/components/MDText';
import ServerIO from '../plumbing/ServerIO';
import DataStore from '../base/plumbing/DataStore';
import Misc from '../base/components/Misc';

const CareersPageContent = () => {
    return (
        <>
        <br/><br/>
        <center><p className="text-muted">Current Vacancies</p></center>

        <JobAd title="Research Analyst - Full-time temporary contract" url="/content/careers/research-analyst.md" />
        {/* <JobAd title="Lead Researcher/Philanthropy Adviser" url="/content/careers/lead-adviser.md" /> */}

        <br/><hr/><br/>
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

function JobAd({title, url}) {
    let pvFetch = DataStore.fetch(['misc','jobad',url], () => {
        let pFetch = ServerIO.load(url);
        return pFetch;
    });
    console.log("pvFetch",pvFetch);
    return (<div className="container">
        <h2>{title}</h2>
        {pvFetch.resolved? <MDText source={pvFetch.value} /> : <Misc.Loading />}
        </div>);
};

const CareersPage = () => {
    
    const viewSection = () => {
        if (document.getElementById('volunteer')) {
            if (window.location.hash == "#careers?view=analyst") {
                document.getElementById('analyst').scrollIntoView();
                window.scrollBy(0,-100);
            } else if (window.location.hash == "#careers?view=volunteer") {
                document.getElementById('volunteer').scrollIntoView();
                window.scrollBy(0,-100);
            }
        } else {
            setTimeout(viewSection, 15);
        }
    }
    
    viewSection();

    return (
        <div className="privacy-policy">
            <Banner title="Careers"/> 
            <CareersPageContent />
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default CareersPage;
