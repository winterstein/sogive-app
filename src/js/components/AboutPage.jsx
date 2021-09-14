import React from 'react';

export const Banner = ({title}) => {

	return (
			<div className="gradient-banner">
					<div className="worldImage d-flex justify-content-center align-items-center">
							<h1>{title}</h1>
					</div>
			</div>
	);
};

const AboutPage = () => {

    return (
        <div className="MethodPage row">
            <div className="col-md-12">
            <Banner title="About Us"/>
            </div>
        </div>
    );
};

export default AboutPage;
