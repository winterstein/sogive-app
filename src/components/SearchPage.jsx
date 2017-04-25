import React from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import {Button, Form, FormGroup, FormControl, Glyphicon, ControlLabel, Media, MediaLeft, MediaBody, MediaHeading, Well, InputGroup, InputGroupButton} from 'react-bootstrap';
import {uid, yessy} from 'wwutils';

import ServerIO from '../plumbing/ServerIO';
import Misc from './Misc.jsx';

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
		const { q } = this.props;
		return (
			<div className='page SearchPage'>
				<div className='col-md-12'>
					<SearchForm query={q} setResults={this.setResults.bind(this)}/>
				</div>
				<div className='col-md-12'>
					<SearchResults results={this.state.results} query={q} />
				</div>
				<div className="col-xs-10 cheapverticalspace">
				</div>				
			</div>
		);
	}
}


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
		// Put search query in URL so it's bookmarkable / shareable
		const newHash = `#search?q=${this.state.q}`;
		if (window.history.pushState) {
			window.history.pushState(null, null, newHash);
		} else {
			window.location.hash = newHash;
		}

		this.search(this.state.q);
	}

	search(query) {
		ServerIO.search(query)
		.then(function(res) {
			console.warn(res);
			let charities = res.cargo.hits;
			let total = res.cargo.total;
			this.props.setResults(charities, total);
		}.bind(this));
	}


/* the 'clearSearch function currently doesn't work */
clearSearch () {
	document.getElementById('formq').value = '';
}


	render() {
		return (
			<Form onSubmit={(event) => { this.onSubmit(event); }} >
				<FormGroup className='no-margin-bottom' bsSize='lg' controlId="formq">
						<ControlLabel bsSize='lg'></ControlLabel>
						{' '}
						<InputGroup>
							<FormControl
								className='hidden-xs hidden-sm sogive-search-box'
								bsSize='lg'
								type="search"
								value={this.state.q || ''}
								placeholder="Keyword search"
								onChange={(e) => this.onChange('q', e)}
							/>
							<FormControl
								className='visible-xs visible-sm sogive-search-box-mobile'
								bsSize='lg'
								type="search"
								value={this.state.q || ''}
								placeholder="Keyword search"
								onChange={(e) => this.onChange('q', e)}
							/>
							<span className='input-group-btn'>
								<Button onClick={() => { this.clearSearch; }} type='submit' bsSize='lg' bsStyle='default' className='clear-search-btn'>
									<Glyphicon glyph='remove-circle' />
								</Button>
							</span>
						</InputGroup>
						&nbsp;
						<Button className='hidden' type='submit' bsSize='lg' bsStyle='primary'>Search</Button>
				</FormGroup>
				<div className='col-md-10'>
					<div className='hidden-xs hidden-sm col-md-offset-3 col-md-6 text-center'>
						<Button onClick={() => { this.search(''); }} className="btn-showall" bsSize='xs'>Show All</Button>
					</div>
					<div className='visible-xs visible-sm col-md-offset-3 col-md-6 text-center'>
						<Button onClick={() => { this.search(''); }} className="btn-showall-mobile" bsSize='xs'>Show All</Button>
					</div>
				</div>
			</Form>
		);
	} // ./render
} //./SearchForm


const SearchResults = ({ results, query }) => {
	const num = results.length || query? <div className='num-results'>{results.length} results found</div> : null;
	const ready = _.filter(results, c => _.find(c.projects, 'ready') );
	const unready = _.filter(results, r => ready.indexOf(r) === -1);
	const hu = unready.length? <div className='unready-results col-md-10'><h3>Analysis in progress</h3>SoGive is working to collect data and model the impact of every UK charity -- all 200,000.</div> : null;
	return (
		<div className='SearchResults'>
			{num}
			{ _.map(ready, item => <SearchResult key={uid()} item={item} />) }
			{hu}
			{ _.map(unready, item => <SearchResult key={uid()} item={item} />) }
		</div>);
}; //./SearchResults

const SearchResult = ({ item }) => (
	<div className='SearchResult col-md-10' >
		<Media>
			<a href={`#charity?charityId=${item['@id']}`}>
				<Media.Left>
					{item.logo? <img className='charity-logo' src={item.logo} alt={`Logo for ${item.name}`} /> : null}
				</Media.Left>
				<Media.Body>
					<Media.Heading>{item.name}</Media.Heading>
					<p>{item.description}</p>
					<Misc.ImpactDesc unitImpact={item.unitRepImpact} amount={10} />
				</Media.Body>
			</a>
		</Media>
	</div>
); //./SearchResult