// @Flow
import React from 'react';
import _ from 'lodash';
import {assert} from 'sjtest';

import { Panel, Image, Well, Label } from 'react-bootstrap';

import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer';
import C from '../C';
import NGO from '../data/charity/NGO';
import Misc from './Misc';

import DonationForm from './DonationForm';
import PageMetaInfo from './PageMetaInfo';

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


	splitTags(tags = []) {
		return 
	}

	render() {
		const charity = this.state.charity;

		if ( ! charity) {
			return <Misc.Loading />;
		}

		const tags = charity.tags && (
			<p>
				<h4>Tags</h4>
				{ charity.tags.split('&').map((tag) => (
					<span key={tag}><Label>{tag.trim()}</Label> </span>
				)) }
			</p>
		);

		const turnover = charity.turnover && (
			<p>
				Turnover: { charity.turnover }
			</p>
		);

		const employees = charity.employees && (
			<p>
				Employees: { charity.employees }
			</p>
		);

		const website = charity.website && (
			<p>
				Website: <a href={charity.url} target='_blank' rel="noopener noreferrer">{charity.url}</a>
			</p>
		);


		return (
			<div className='page CharityPage'>
				<PageMetaInfo />
				<Panel header="Charity Profile">
					<Image src={charity.logo} responsive thumbnail className="pull-right" />
					<h2>{charity.name}</h2>

					<div ><small><a href={`/#charity/${charity['@id']}`}>{charity.id}</a></small></div>
					<p>{charity.description}</p>
					{ tags }
					{ turnover }
					{ employees }
					{ website }
					<ProjectList charity={charity} />
				</Panel>
				<Panel header={<h2>Donate to { charity.name }</h2>}>
					<DonationForm charity={charity} project={NGO.getProject(charity)} />
				</Panel>
			</div>
		);
	}
} // ./CharityPage


const ProjectList = ({charity}) => {
	if (!charity.projects) return <div />;

	const renderedProjects = charity.projects
		.map(p => <Project key={`${p.name}${p.year}`} project={p} charity={charity} />);

	if (renderedProjects.length === 0) return <div />;

	return (
		<div>
			<h2>Projects</h2>
			{ renderedProjects }
		</div>
	);
};

const Project = ({project}) => {
	return (<div>
		<h3>{project.name}</h3>
		<p dangerouslySetInnerHTML={{ __html: project.stories }} />
		{printer.str(project.directImpact)}
		{printer.str(project.annualCosts)}
	</div>);
};

export default CharityPage;
