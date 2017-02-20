import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest'

import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';

class CharityPage extends React.Component {	

	constructor(...params) {
		super(...params);
		this.state = {			
		}
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
			return <Misc.Loading />
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

				Website: <a href={charity.url} target='_blank'>{charity.url}</a>
				<ProjectList charity={charity} />
				<DonationForm charity={charity} project={repProject} />
            </div>
        );
    }

}; // ./CharityPage

class DonationForm extends React.Component {
	render() {
		return(<div className='DonationForm'>

			<button>Donate</button>
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
