import React from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';

const BlogPage = () => {

    return (
        <div className="BlogPage">
            <Banner title="Blog"/> 
            <NewsletterCard />
            <ImpactRatingCard />
        </div>
    );
};

export default BlogPage;
 