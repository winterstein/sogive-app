// @Flow
import React from 'react';
import _ from 'lodash';
import {assert} from 'sjtest';
import Login from 'hooru';

import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';

import DonationForm from './DonationForm.jsx';
import PageMetaInfo from './PageMetaInfo.jsx';

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
		let repProject = NGO.getProject(charity);
		return (
			<div className='page CharityPage'>
				<PageMetaInfo />
				<h2>Charity Profile: {charity.name}</h2>
				<div><small><a href={`/#charity/${charity['@id']}`}>{charity.id}</a></small></div>
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
