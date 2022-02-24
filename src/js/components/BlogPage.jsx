import React, { useState } from 'react';
import { Banner, NewsletterCard, ImpactRatingCard } from './WebsiteCards';
import { Button } from 'reactstrap';

const BlogPage = () => {
    
    const fullscreenStyle = {
        position: "fixed", 
        top: "0",
        left: "0",
        bottom: "0",
        right: "0",
        width: "100%",
        height: "100%",
        border: "none",
        margin: "0",
        padding: "0",
        overflow: "hidden",
        zIndex: "99"
    }

    const fullscreenButtonStyle = {
        position: "absolute",
        top: '8em',
        zIndex:"100"
    }

    const [isFullscreen, setFullscreen] = useState(false);

    const toggleScreen = () => {
        setFullscreen(!isFullscreen);
    }

    return (
        <div className="BlogPage">
            <Banner title="Blog"/> 
            <div className="container py-5 px-0">
                <Button onClick={toggleScreen} style={isFullscreen ? fullscreenButtonStyle : {zIndex:"100"}}>
                    {isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
                </Button>
                <iframe className="blog-iframe" style={isFullscreen ? fullscreenStyle : null} src="https://thinkingaboutcharity.blogspot.com/2021/04/sogives-analysis-methodology.html?view=classic" />
            </div>
            <NewsletterCard />
            <ImpactRatingCard />
        </div>
    );
};

export default BlogPage;
 