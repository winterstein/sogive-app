import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SJTest, {assert} from 'sjtest';
import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';

import StripeCheckout from 'react-stripe-checkout';

class CharityPage extends React.Component {	

	constructor(...params) {
		super(...params);
		this.state = {			
		};
	}

	componentWillMount() {
		// fetch
		let cid = this.props.charityId || 'solar-aid';
		ServerIO.getCharity(cid)
		.then(function(result) {
			let charity = result.cargo;
			assert(NGO.isa(charity), charity);
			this.setState({charity: charity});
		}.bind(this));
	}

    render() {
		const charity = this.state.charity;
		if ( ! charity) {
			return <Misc.Loading />;
		}
		let repProject = _.find(charity.projects, p => p.isRep);
		if ( ! repProject) repProject = _.find(charity.projects, p => p.name === 'overall');
		if ( ! repProject) repProject = charity.projects && charity.projects[0];
        return (
            <div className='page CharityPage'>
                <h2>Charity Profile: {charity.name}</h2>
				<div><small><a href={'/#charity/'+charity.id}>{charity.id}</a></small></div>
				<img src={charity.logo} />
				<p>{charity.description}</p>
				Tags: {charity.tags}

				Turnover: 

				Employees: {charity.numberOfEmployees}

				Website: <a href={charity.url} target='_blank' rel="noopener noreferrer">{charity.url}</a>
				<ProjectList charity={charity} />
				<DonationForm charity={charity} project={repProject} />
            </div>
        );
    }

} // ./CharityPage

class DonationForm extends React.Component {
	onToken() {

	}

	render() {
		return(<div className='DonationForm'>
			<button>Donate</button>
			Do we need a Stripe token??
			<StripeCheckout name="SoGive" description="See the impact of your charity donations"
  image="https://www.vidhub.co/assets/logos/vidhub-icon-2e5c629f64ced5598a56387d4e3d0c7c.png"
  panelLabel="Give Money"
  amount={1000000}
  currency="GBP"
  stripeKey="pk_test_RyG0ezFZmvNSP5CWjpl5JQnd"
  bitcoin
  allowRememberMe
  token={this.onToken}
  >
  <button className="btn btn-primary">
    Use your own child component, which gets wrapped in whatever
    component you pass into as "ComponentClass" (defaults to span)
  </button>
</StripeCheckout>
		</div>);
	}
}

const ProjectList = ({charity}) => {
	return (<div>
		<h2>Projects</h2>
		{ _.map(charity.projects, p => <Project key={p.name} project={p} charity={charity} />) }
	</div>);
};

const Project = ({project}) => {
	return (<div>		
		{printer.str(project.name)}
		{printer.str(project.stories)}
		{printer.str(project.directImpact)}
		{printer.str(project.annualCosts)}
	</div>);
};

export default CharityPage;
