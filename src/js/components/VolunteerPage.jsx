import React from 'react';
import MailTo from '../base/components/MailTo';
import MDText from '../base/components/MDText';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

// see https://docs.google.com/document/d/1tAnhMOYVQuIfsrW6V4zx82oxbLHbjSLvqmlXJp5DuLU/edit#

const VolunteerPage = () => {

    return (
        <div className="volunteer">
            <Banner title="Volunteer with SoGive"/> 

            <MDText source={`SoGive's volunteer programme is designed for people pursuing a career in EA research or exploring their fit for this type of work. The programme offers the opportunity to contribute to SoGive's research output. You will have weekly check-ins with your mentor and be supported by the community of EAs involved with SoGive. 

## What to expect?

After joining the programme you will initially contribute to SoGive's charity cost-effectiveness research by carrying out ['shallow analysis'](http://thinkingaboutcharity.blogspot.com/2021/04/sogives-analysis-methodology.html) on some of the UK's most well known charities. During these first few months we expect you'll become skilled in this type of analysis, so when the next volunteer cohort joins SoGive your responsibilities will evolve to include reviewing the shallow analyses conducted by the newer volunteer cohort. At this point you can also start work on an in-depth research project (or something else if you prefer). After another few months you will relinquish your responsibilities of reviewing shallow analysis if you wish and focus on your in-depth research project. 

During the volunteer programme you will undertake training in:

- Writing styles & reasoning transparency
- Advanced cost-effectiveness modelling
- How to read academic papers and randomised controlled trials & conduct literature reviews 

The expectation to join the primary volunteer programme is an average contribution of one day per week for a year and the role will be carried out remotely. We hope this will allow people to fit the programme in around prior commitments such as studying/work.

## How to get involved?

During 2023, there will be three chances to join the volunteer programme:

- February - intake for long-term volunteers; applications will open in January
- March - intake for summer interns
- May - intake for long-term volunteers
- Sept - intake for long-term volunteers

SoGive will also have a stand at the EAGx Berkeley Careers Fair, so if you're attending, please come and chat to us to find out more about our volunteer programme!

If you have any questions about the volunteer programme, you can contact Sanjay Joshi, the CEO of SoGive, via email: [sanjay@sogive.org](mailto:sanjay@sogive.org?subject=Volunteering)
`} />
            
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default VolunteerPage;
