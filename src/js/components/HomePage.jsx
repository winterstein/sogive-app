import React from 'react';

const HomePage = () => {

    return (
        <div className="HomePage row">
            <div className="col-md-12">
            <HeroBanner/>
            </div>
        </div>
    );
};

const HeroBanner = () => {

    return (
        <div className="gradient">
            <div className="worldImage">
                <div className="row">
                    <div className="col-6">
                        <h2>Donate to Charity More Effectively</h2>
                        <p>SoGive researches which charities achieve outsized impact through analysing independent evaluations and financial data.</p>
                        <a href="#search" className="btn">Explore impact ratings</a>
                    </div>
                    <div className="col-6">
                        <h2>Insert Images Here</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;