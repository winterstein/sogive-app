import React from "react";

const Banner = ({title}) => {

	return (
			<div className="gradient-banner">
					<div className="worldImage d-flex justify-content-center align-items-center">
							<h1>{title}</h1>
					</div>
			</div>
	);
};

const NewsletterCard = () => {
	return (
		<div id="newsletter-card" className="bg-light">
			<div className="container-fluid p-5">
				<div className="row">
						<div className="col">
								<h3>Subscribe to our newsletter</h3>
								<p>We send a monthly newsletter with our commentary on the latest news in the charity sector, as well as updates on our new analyses. Sign up here.</p>
						</div>
						<div className="col">
								<p>Your email address</p>
								<div className="email-input">
										<input type="email" placeholder="johndoe@companyxyz.com" />
										<a href="" className="btn btn-primary">Subscribe</a>
								</div>
						</div>
				</div>
			</div>
		</div>
	); 
};

const ImpactRatingCard = ({title}) => {

	return (
		<div id="impact-rating-card" className="">
			<div className="container-fluid p-5">
				<div className="row">
						<div className="col col-md-6">
								<h3>{title}</h3>
								<a href="#" className="btn btn-primary mt-3">Explore impact ratings</a>
						</div>
						<div className="col col-md-4">
								<p className="press-caption text-center">SoGive in the press</p>
								<div className="row">
										<div className="col"><a href="#"><img src="/img/logo/The-Scotsman-logo.jpg" alt="The Scotsman" className="w-100" /></a></div>
										<div className="col"><a href="#"><img src="/img/logo/TEDxCourtauld-logo.jpg" alt="TED" className="w-100" /></a></div>
								</div>
						</div>
				</div>
			</div>
		</div>
	);
};

const ContactForm = () => {

	return (<>
			<div className="info row">
				<div className="col">
						<p>Your name</p>
						<input type="text" name="" id="" />
				</div>
				<div className="col">
						<p>Your email</p>
						<input type="email" name="" id="" />
				</div>
			</div>
			<div className="message row">
				<div className="col">
						<p>Your message</p>
						<input className="w-100 h-100" type="text" name="" id="" />
				</div>
			</div>
			<a href="#" className="btn btn-primary mt-5">Sumbit</a>
	</>)
}

export {
  ContactForm,
	NewsletterCard,
	ImpactRatingCard,
	Banner,
};