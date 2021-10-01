import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const MethodologyContent = () => {
    return (
        <div className="container py-5">
            <p>Under the SoGive two question method, we consider two questions:</p>
            <ol>
            <li><strong>How much does the charity's programs cost?</strong></li>
            <li><strong>What impact is achieved?</strong></li>
            </ol>
            <p>This two-question method includes a suggestive analogy to purchasing. When you are donating to charity, you are essentially "buying" better lives for beneficiaries. We then benchmark our answer against the top recommended charities.</p>
            <p><strong>What do the benchmarks for excellence look like?</strong></p>
            <p>Let's say you have found out how much it costs for a charity to do a thing, and you have found out as much as you can about how good the thing is per beneficiary. How do we know whether that's good?</p>
            <p>The short answer is that something like a couple of thousand dollars for a life saved is good. More info on the benchmarking that gets to this conclusion can be found here.</p>
            <p>Those benchmarks are chosen because there is an unusually robust level of evidence supporting those outcomes.</p>
            <p><strong>Do any other organisations analyse charities using a similar approach?</strong></p>
            <p>As far as we're aware, SoGive is unique in describing an analytical approach using this easy-to-understand "purchasing" or "shopping" analogy.</p>
            <p>However the core of this is that cost-effectiveness is important, and there are some which think about charitable in similar ways. One of these is GiveWell, on whose analysis we have leaned in our own work.</p>
            <p>However there are also many other charity evaluators for whom this bang for your buck thinking is entirely foreign.</p>
            <p><strong>Surely the "what do the beneficiaries get for your money?" bit masks all the important stuff?</strong></p>
            <p>There is an important point driving this question. To make judgements, we are often relying on information from the charity, however charities typically conduct only very shallow analysis of their own impact. So we are typically missing information about the impact, and the impact is the thing we care about.</p>
            <p>However, as indicated in an answer to another question, the work still adds value. The approach is:</p>
            <ul>
            <li>have some cost-effective charities where the evidence does exist and the work is high-impact -- these are the benchmark charities</li>
            <li>ask the 2 SoGive questions of other charities</li>
            <li>some charities will deliver outcomes that significantly underperform the benchmark charities, even under generous assumptions</li>
            </ul>
            <p>This helps us to sift out some charities which clearly produce substantially lower outcomes.</p>
            <p><strong>Do you take into account the amount spent on overheads?</strong></p>
            <p>In essence, yes, although we avoid focusing attention on overheads, because we think this measure has received too much attention for the reasons set out here. We do this by ensuring that overheads are costed in when we consider the "how much does it cost for the charity to do its thing" question.</p>
            <p><strong>What about research and campaigning work?</strong></p>
            <p>This is a good question. Research and campaigning don't fit into these categories quite so easily. Our views on these are described in more detail here. However you'll note that the approach involves comparing the scale of the impact achieved with the amount of cost needed to get there -- so this is actually essentially the same as the SoGive 2 questions.</p>
            <p><strong>Should the framework not also take into account crowdedness/room for more funding?</strong></p>
            <p>Essentially it does.</p>
            <p>Imagine that a charity and its cause area are already very well funded. What will beneficiaries get for your money? Well, not very much, because the money end up funding a lower impact activity because all of the higher impact work is already being done. Also because of the risk that the money sits in the charity's reserves for want of things for the charity to do.</p>
            <p>You might counter that someone hearing the SoGive two-question method for the first time might not appreciate that they are supposed to take room for more funding considerations into account. This is a reasonable criticism, and it is a price we pay for the pithy, comprehensible nature of the SoGive two-question method.</p>
            <p><strong>Should the analysis take into account what happens on the margin?</strong></p>
            <p>Yes, and we do so where possible, although assessing this is often hard.</p>
            <p>First, to clarify, the important thing is the *marginal* impact, i.e. if another pound goes to the charity, what impact will it have?</p>
            <p>One element of this is the crowdedness consideration mentioned above. I.e. if the charity has very large reserves, then it's more likely that the marginal impact of the next pound is a delayed or minimal impact.</p>
            <p>Another is that where the charity does multiple projects, some judgement is required about which projects are likely to be where money would go at the margin.</p>
            <p><strong>Does the method always work?</strong></p>
            <p>Sometimes this method doesn't tell you anything useful. Two common reasons for this are:</p>
            <ul>
            <li>the charity doesn't have enough information in the public domain to be able find out the answer to question 1 (the cost question)</li>
            <li>sometimes the charity's intervention is sufficiently low cost that it doesn't obviously underperform a high impact charity, however there may be so little information about the impact that we can't tell whether it's high-impact or not.</li>
            </ul>
            <p><a href="#blog">Our blog</a> offers more information on our methdology.</p>
        </div>
    )
}

const MethodPage = () => {

    return (
        <div className="BlogPage">
            <Banner title="Methodology"/> 
            <MethodologyContent />
            <NewsletterCard />
            <ImpactRatingCard title="Find a charity you can trust to be effective." />
        </div>
    );
};

export default MethodPage;
