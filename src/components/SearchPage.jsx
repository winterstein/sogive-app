import React from 'react';
import _ from 'lodash';
import { assert, assMatch } from 'sjtest';
import {Button, Form, FormGroup, FormControl, Glyphicon, ControlLabel, Media, MediaLeft, MediaBody, MediaHeading, Well, InputGroup, InputGroupButton} from 'react-bootstrap';
import {uid, yessy, encURI} from 'wwutils';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../plumbing/DataStore';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';
import {ImpactDesc, impactCalc} from './ImpactWidgetry.jsx';
import C from '../C';

const SearchPage = () => {
	// query comes from the url
	let q = DataStore.getUrlValue("q");
	if (q==='ERROR') { // HACK
		throw new Error("Argh!");
	}
	let page = DataStore.getUrlValue("page");
	let status = DataStore.getUrlValue("status");
	// fetch the data
	let searchParams = {q, page, status};
	let {value} = DataStore.fetchWithFilters(searchParams, () => {
		ServerIO.search(searchParams)
		.then(res => {
			console.warn(res);
			if ( ! res.success) return;
			let cargo = res.cargo;
			let paths = cargo.map(r => {
				NGO.getId();
			});
			console.warn(paths);
			return paths;
		});
	});
	let results = null;
	if (value) {
		assMatch(value, "String[]");
		results = DataStore.getValues(value);
	}
	return (
		<div className='page SearchPage'>
			<div className='col-md-12'>
				<SearchForm query={q} />
			</div>
			<div className='col-md-12'>
				<SearchResults results={results} query={q} />
			</div>
			<div className='col-md-10'>
				<FeaturedCharities />
			</div>
		</div>
	);
};
export default SearchPage;

const FeaturedCharities = () => null;
/*
<div> class='featured-charities''
	<p className='featured-charities-header'>
		Featured Charities
	<FeaturedCharities results={ { TODO a render-er for top-charities or a featured charity. When a search returns results, this should convert into a sidebar, or at least become hidden, and a sidebar should be generated. } }/>
	</p>
*/


const SearchForm = ({q}) => {
	return (
		<div className='SearchForm'><Form onSubmit={(event) => { this.onSubmit(event); }} >
			<FormGroup className='' bsSize='lg' controlId="formq">
				<InputGroup bsSize='lg'>
					<FormControl
						className='sogive-search-box'
						type="search"
						value={this.state.q || ''}
						placeholder="Keyword search"
						onChange={(e) => this.onChange('q', e)}
					/>
					<FieldClearButton />						
					<InputGroup.Addon className='sogive-search-box' onClick={(e) => this.onSubmit(e)}>
						<Glyphicon glyph="search" />
					</InputGroup.Addon>
				</InputGroup>
			</FormGroup>
			<div className='pull-right'>
				<Button onClick={this.showAll.bind(this)} className="btn-showall" bsSize='sm'>
					Show All
				</Button>
			</div>
		</Form></div>
	);	
}; //./SearchForm

const FieldClearButton = () => (
	<span className='field-clear-button visible-xs-block' 
		onClick={e => {e.preventDefault(); DataStore.setUrlValue('q', '');}} >
		<Glyphicon glyph='remove-circle' />
	</span>
);

const SearchResults = ({ results, query }) => {
	if ( ! results) results = [];
	// NB: looking for a ready project is deprecated, but left for backwards data compatibility
	// TODO adjust the DB to have ready always on the charity
	const ready = _.filter(results, NGO.isReady);
	const unready = _.filter(results, r => ! NGO.isReady(r) );
	return (
		<div className='SearchResults'>
			<SearchResultsNum results={results} query={query} />
			{ _.map(ready, item => <SearchResult key={uid()} item={item} />) }
			{unready.length? <div className='unready-results col-md-10'><h3>Analysis in progress</h3>SoGive is working to collect data and model the impact of every UK charity -- all 200,000.</div> : null}
			{ _.map(unready, item => <SearchResult key={uid()} item={item} />) }
		</div>);
}; //./SearchResults

const SearchResultsNum = ({results, query}) => {
	let loading = DataStore.getValue('widget', 'Search', 'loading');
	if (loading) return <div className='num-results'><Misc.Loading/></div>;
	if (results.length || query) return <div className='num-results'>{results.length} results found</div>;
	return <div className='num-results'></div>; // ?!
};

const SearchResult = ({ item }) => {
	let project = NGO.getProject(item);
	let status = item.status;
	let page = status===C.STATUS.DRAFT? 'edit' : 'charity';
	return (
	<div className='SearchResult col-md-10' >
		<Media>
			<a href={'#'+page+'?charityId='+encURI(NGO.id(item))}>
				<Media.Left>
					{item.logo? <img className='charity-logo' src={item.logo} alt={`Logo for ${item.displayName || item.name}`} /> : null}
				</Media.Left>
				<Media.Body>
					<Media.Heading>{item.displayName || item.name}</Media.Heading>
					<p>{item.summaryDescription || item.description}</p>
					<ImpactDesc charity={item} project={project} outputs={project && project.outputs} amount={false} />
				</Media.Body>
			</a>
		</Media>
	</div>
	);
}; //./SearchResult
