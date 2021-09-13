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
                <div className="row mx-5 p-5">
                    <div className="col-6 mt-5">
                        <div className="">
                            <h2>Donate to Charity More Effectively</h2>
                            <p>SoGive researches which charities achieve outsized impact through analysing independent evaluations and financial data.</p>
                            <a href="#search" className="btn explore-impact-ratings p-3">Explore impact ratings</a>
                        </div>
                    </div>
                    <div className="col-6 mt-5">
                        <img className="h-50" src="/img/homepage/banner-cards.png" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;