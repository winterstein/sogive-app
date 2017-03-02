import React from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import {Button, Form, FormGroup, FormControl, ControlLabel, Media, MediaLeft, MediaBody, MediaHeading, Well} from 'react-bootstrap';
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
				<h2>Search</h2>
				<SearchForm query={q} setResults={this.setResults.bind(this)}/>
				<SearchResults results={this.state.results} query={q} />
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

	render() {
		return(
			<Form inline onSubmit={(event) => { this.onSubmit(event); }} >
				<Well>
					<FormGroup bsSize='lg' controlId="formq">
						<ControlLabel bsSize='lg'>Keywords</ControlLabel>
						&nbsp;
						<FormControl
							bsSize='lg'
							type="search"
							value={this.state.q || ''}
							placeholder="Enter search terms"
							onChange={(e) => this.onChange('q', e)}
						/>
						&nbsp;
						<Button type='submit' bsSize='lg' bsStyle='primary'>Search</Button>
					</FormGroup>
					<Button onClick={() => { this.search(''); }} className="pull-right" bsSize='xs'>Show All</Button>
				</Well>
			</Form>
		);
	} // ./render
} //./SearchForm


const SearchResults = ({ results, query }) => {
	const num = results.length || query? <div>{results.length} results found</div> : null;
	const ready = _.filter(results, c => _.find(c.projects, 'ready') );
	const unready = _.filter(results, r => ready.indexOf(r) === -1);
	const hu = unready.length? <h3>Analysis in progress</h3> : null;
	return (
		<div className='SearchResults'>
			{num}
			{ _.map(ready, item => <SearchResult key={uid()} item={item} />) }
			{hu}
			{ _.map(unready, item => <SearchResult key={uid()} item={item} />) }
		</div>);
}; //./SearchResults


const SearchResult = ({ item }) => (
	<div className='SearchResult' >
		<Media>
			<a href={`#charity?charityId=${item['@id']}`}>
				<Media.Left>
					{item.logo? <img width={64} height={64} src={item.logo} alt={`Logo for ${item.name}`} /> : null}
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



