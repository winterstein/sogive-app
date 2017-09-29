/* eslint-disable react/no-multi-comp */ // Don't complain about more than one React class in the file
import React from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import {Button, Form, FormGroup, FormControl, Glyphicon, Media, InputGroup} from 'react-bootstrap';
import {uid, encURI, parseHash, modifyHash} from 'wwutils';
import Login from 'you-again';

import ServerIO from '../plumbing/ServerIO';
import DataStore from '../plumbing/DataStore';
import NGO from '../data/charity/NGO';
import Misc from './Misc';
import {ImpactDesc, impactCalc} from './ImpactWidgetry';
import C from '../C';

// #Minor TODO refactor to use DataStore more. Replace the FormControl with a Misc.PropControl

const RESULTS_PER_PAGE = 20;
const MAX_PAGES = 10;

export default class SearchPage extends React.Component {

	constructor(...params) {
		super(...params);
		this.state = {
			results: []
		};
	}

	setResults(results, total) {
		assert(_.isArray(results));
		this.setState({
			results: results,
			total: total
		});
	}

	render() {
		// query comes from the url
		let q = DataStore.getUrlValue('q');
		let from = DataStore.getUrlValue('from') || 0;
		let status = DataStore.getUrlValue('status') || '';
		if (q==='ERROR') { // HACK
			throw new Error("Argh!");
		}

		let searchResults = null;
		let searchPager = null;
		// Show results box if (a) a query was entered (so we get "No Results") or (b) there were results (so Show All works)
		if (this.state.q || this.state.total) {
			searchResults = (
				<div className='col-md-12'>
					<SearchResults results={this.state.results} total={this.state.total} from={from} query={q} />
				</div>
			);
		}

		return (
			<div className='page SearchPage'>
				<div className='col-md-12'>
					<SearchForm query={q} from={from} status={status} setResults={this.setResults.bind(this)}/>
				</div>
				{searchResults}
				{searchPager}
				<div className='col-md-10'>
					<FeaturedCharities />
				</div>
			</div>
		);
	}
}

const FeaturedCharities = () => null; 
/*
<div> class='featured-charities''
	<p className='featured-charities-header'>
		Featured Charities
	<FeaturedCharities results={ { TODO a render-er for top-charities or a featured charity. When a search returns results, this should convert into a sidebar, or at least become hidden, and a sidebar should be generated. } }/>
	</p>
*/


class SearchForm extends React.Component {
	constructor(...params) {
		super(...params);
		this.state = {
			q: this.props.query,
		};
	}

	componentDidMount() {
		if (this.state.q) {
			this.search(this.state.q);
		}
	}

	// Allow hash change to provoke a new search
	componentWillReceiveProps(nextProps) {
		if (nextProps.query && (nextProps.query !== this.state.q || nextProps.from !== this.props.from || nextProps.status !== this.props.status)) {
			this.search(nextProps.query, nextProps.status, nextProps.from);
		}
	}

	onChange(name, e) {
		e.preventDefault();
		let newValue = e.target.value;
		let newState = {};
		newState[name] = newValue;
		this.setState(newState);
	}

	onSubmit(e) {
		e.preventDefault();
		console.warn("submit",this.state);
		this.search(this.state.q || '', this.props.status, this.props.from);
	}

	search(query, status, from) {
		// Put search query in URL so it's bookmarkable / shareable
		DataStore.setUrlValue("q", query);
		DataStore.setValue(['widget', 'Search', 'loading'], true);

		// hack to allow status=DRAFT
		ServerIO.search({q: query, from, size: RESULTS_PER_PAGE, status})
			.then(function(res) {
				console.warn(res);
				let charities = res.cargo.hits;
				let total = res.cargo.total;
				DataStore.setValue(['widget', 'Search', 'loading'], false);
				// DataStore.setValue([], { TODO
				// 	charities: charities,
				// 	total: total
				// });
				this.props.setResults(charities, total);
			}.bind(this));
	}

	showAll(e) {
		e.preventDefault();
		this.setState({q: ''});
		this.search('');
	}

	clear(e) {
		e.preventDefault();
		this.setState({q: ''});
	}

	render() {
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
						<FieldClearButton onClick={(e) => this.clear(e)}>
							<Glyphicon glyph='remove-circle' />
						</FieldClearButton>
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
	} // ./render
} //./SearchForm


const FieldClearButton = ({onClick, children}) => (
	<span className='field-clear-button visible-xs-block' onClick={onClick}>
		{children}
	</span>
);


const SearchResults = ({ results, total, query, from }) => {
	if ( ! results) results = [];
	// NB: looking for a ready project is deprecated, but left for backwards data compatibility
	// TODO adjust the DB to have ready always on the charity
	const ready = _.filter(results, NGO.isReady);
	const unready = _.filter(results, r => ! NGO.isReady(r) );
	return (
		<div className='SearchResults'>
			<div className='top-tab'>Results for &ldquo;{query}&rdquo;</div>
			<SearchResultsNum results={results} total={total} query={query} />
			<div className='results-list'>
				{ _.map(ready, item => <SearchResult key={uid()} item={item} />) }
				{ unready.length ? (
					<div className='unready-results row'>
						<h3>Analysis in progress</h3>
						SoGive is working to collect data and model the impact of every UK charity -- all 200,000.
					</div>
				) : null}
				{ _.map(unready, item => <SearchResult key={uid()} item={item} />) }
				<SearchPager total={total} from={from} />
			</div>
			<div className='col-md-12'>
				<DownloadLink />
			</div>
		</div>
	);
}; //./SearchResults


const SearchResultsNum = ({results, total, query}) => {
	let loading = DataStore.getValue('widget', 'Search', 'loading');
	if (loading) return <div className='num-results'><Misc.Loading /></div>;
	if (results.length || query) return <div className='num-results'>{total} charities found</div>;
	return <div className='num-results' />; // ?!
};

// The +/- buttons don't just work linearly - bigger numbers = bigger jumps
// Amount up to {key} => increment of {value}
const donationIncrements = {
	10: 1,
	50: 5,
	100: 10,
	500: 50,
	1000: 100,
	5000: 500,
	10000: 1000,
	50000: 5000,
	Infinity: 10000,
};


const SearchResult = ({ item }) => {
	let project = NGO.getProject(item);
	let status = item.status;
	let page = C.KStatus.isDRAFT(status)? 'edit' : 'charity';
	const charityUrl = '#'+page+'?charityId='+encURI(NGO.id(item));

	// The donation picker needs to store its value
	// DataStore.setValue(['widget','DonationForm', NGO.id(item), 'amount'], newAmount);
	// const impactDesc = <ImpactDesc charity={item} project={project} outputs={project && project.outputs} amount={false} />;
	const impact = impactCalc({charity: item, project, outputs: project && project.outputs, amount: false});
	// Need to use impactCalc again

	// Does the desc begin with the charity name (or a substring)? Strip it and make a sentence!
	const charityName = item.displayName || item.name || '';
	let charityDesc = item.summaryDescription || item.description || '';
	let commonPrefixLength = 0;
	for (let i = 0; i < charityName.length && i < charityDesc.length; i++) {
		if (charityName[i] === charityDesc[i]) {
			commonPrefixLength = i + 1;
		} else {
			break;
		}
	}
	if (commonPrefixLength >= 3) {
		charityDesc = charityDesc.slice(commonPrefixLength).trim();
	}

	const recommendedTab = item.recommended ? (
		<span className='recommended-tab'><img className='recommended-icon' src='/img/recommended.svg' />Recommended Charity</span>
	) : null;

	const impactAmountEntry = impact ? (
		<div className='amount-picker col-md-1'>
			<img className='change-donation-amount' src='/img/donation-amount-up.svg' />
			<Misc.Money amount={impact.amount} />
			<img className='change-donation-amount' src='/img/donation-amount-down.svg' />
		</div>
	) : null;

	const impactExplanation = impact ? (
		<div className='impact col-md-6'>
			<div className='impact-summary'>
				<h3>Impact Summary:</h3>
				will fund <span className='impact-count'>{impact.impactNum}</span> {impact.unitName}
			</div>
			<div className='impact-detail'>
				1 unit of impact will be brought about by this amount of donation
			</div>
			<a href={charityUrl} className='read-more'>
				Read more
				<img className='read-more-caret' src='/img/read-more-caret.svg' />
			</a>
		</div>
	) : null;
	
	const noImpact = !impact ? (
		<div className='noImpact col-md-7'>
			We don't have impact data!
		</div>
	) : null;

	
	return (
		<div className={`SearchResult row ${item.recommended ? 'recommended' : ''}`} >
			{recommendedTab}
			<a href={charityUrl} className='logo col-md-2'>
				{item.logo? (
					<img className='charity-logo' src={item.logo} alt={`Logo for ${charityName}`} />
				) : (
					<div className='charity-logo-placeholder'>{charityName}</div>
				)}
			</a>
			<a href={charityUrl} className='text-summary col-md-3'>
				<span className='name'>{charityName}</span>
				<span className='description'>{charityDesc}</span>
			</a>
			{impactAmountEntry}
			{impactExplanation}
			{noImpact}
		</div>
	);
}; //./SearchResult


const SearchPager = ({total, from = 0}) => {
	const pageCount = Math.ceil(total / RESULTS_PER_PAGE);
	const thisPage = Math.ceil((from / RESULTS_PER_PAGE) + 1);
	const pageNumbers = [];
	if (pageCount > MAX_PAGES) {
		// Present a "nice" abbreviated list of page numbers
		// Always first and last, always 2 (if they exist) either side of current page
		if (thisPage <= 4) {
			for (let i = 1; i <= thisPage + 2; i++) {
				pageNumbers.push(i);
			}
			pageNumbers.push('…');
			pageNumbers.push(pageCount);
		} else if (thisPage >= pageCount - 3) {
			pageNumbers.push('1');
			pageNumbers.push('…');
			for (let i = thisPage - 2; i <= pageCount; i++) {
				pageNumbers.push(i);
			}
		} else {
			pageNumbers.push('1');
			pageNumbers.push('…');
			for (let i = thisPage - 2; i <= thisPage + 2; i++) {
				pageNumbers.push(i);
			}
			pageNumbers.push('…');
			pageNumbers.push(pageCount);
		}
	} else {
		for (let i = 1; i <= pageCount; i++) {
			pageNumbers.push(i);
		}
	}

	const pageLinks = pageNumbers.map((pageNum, index) => {
		if (Number.isInteger(pageNum)) {
			if (pageNum === thisPage) {
				return <span key={`search-page-${pageNum}`} className='pager-button current-page' title={`Viewing page ${pageNum}`}>{pageNum}</span>;
			}
			return <PageLink key={`search-page-${pageNum}`} pageNum={pageNum} />;
		}
		return <span key={`search-page-gap-${index}`} className='pager-button no-page'>{pageNum}</span>;
	});

	if (thisPage > 1) {
		pageLinks.unshift(
			<PageLink key={`search-page-prev`} pageNum={thisPage - 1} title='Previous page'>
				&lt;
			</PageLink>
		);
	}
	if (thisPage > 2) {
		pageLinks.unshift(
			<PageLink key={`search-page-first`} pageNum={1} title='First page'>
				&lt;&lt;
			</PageLink>
		);
	}
	if (pageCount - thisPage > 0) {
		pageLinks.push(
			<PageLink key={`search-page-next`} pageNum={thisPage + 1} title='Next page'>
				&gt;
			</PageLink>
		);
	}
	if (pageCount - thisPage > 1) {
		pageLinks.push(
			<PageLink key={`search-page-last`} pageNum={pageCount} title='Last page'>
				&gt;&gt;
			</PageLink>
		);
	}


	return (
		<div className='search-pager'>
			{pageLinks}
		</div>
	);
};

const PageLink = ({pageNum, title, children}) => {
	const newFrom = (pageNum - 1) * RESULTS_PER_PAGE;
	const newHash = modifyHash(null, {from: newFrom}, true);
	const goToPage = (event) => {
		DataStore.setUrlValue('from', newFrom);
		event.stopPropagation();
		event.preventDefault();
	};
	
	return (
		<a 
			href={window.location.pathname + newHash}
			className='pager-button'
			onClick={goToPage}
			title={title || `Go to page ${pageNum}`}
		>
			{children || pageNum}
		</a>
	);
};

const DownloadLink = ({total}) => {
	let noCos = false;
	if ( ! Login.isLoggedIn()) noCos = "not logged in";
	if ( ! total) noCos = "no results";
	const locn = ""+window.location;
	const qi = locn.indexOf('?');
	const qry = qi === -1? '' : locn.substr(qi+1);
	if (noCos) {
		return (
			<span className='pull-right text-secondary' 
				title={'('+noCos+') Download these reults in .csv (spreadsheet) format'}>
				<Glyphicon glyph='download-alt' /> csv
			</span>);	
	}
	return (
		<a className='pull-right' 
			title='Download these reults in .csv (spreadsheet) format'
			href={'/search.csv?'+qry} 
			target='_new'>
			<Glyphicon glyph='download-alt' /> csv
		</a>
	);
};


