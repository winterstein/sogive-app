import React from 'react';

const BlogPage = () => {

    return (
        <div className="AboutPage row">
            <div className="col-md-12">
            <Banner/>
            </div>
        </div>
    );
};

const Banner = () => {

    return (
        <div className="gradient">
            <div className="worldImage d-flex justify-content-center align-items-center">
                <h1>Blog</h1>
            </div>
        </div>
    );
};

export default BlogPage;
