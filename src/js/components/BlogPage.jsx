import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const BlogPage = () => {

    return (
        <div className="BlogPage">
            <Banner title="Blog"/> 
            <div className="container py-5 px-0">
                <iframe className="blog-iframe" src="https://thinkingaboutcharity.blogspot.com/2021/04/sogives-analysis-methodology.html?view=classic" />
            </div>
            <NewsletterCard />
            <ImpactRatingCard />
        </div>
    );
};

export default BlogPage;
 