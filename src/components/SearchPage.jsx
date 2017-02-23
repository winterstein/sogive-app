import React from 'react';
import _ from 'lodash';
import { assert } from 'sjtest';
import {Button, Form, FormGroup, FormControl, ControlLabel, Media, MediaLeft, MediaBody, MediaHeading, Well} from 'react-bootstrap';
import {uid} from 'wwutils';

import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';


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
		return (
			<div className='page SearchPage'>
				<h2>Search</h2>
				<SearchForm setResults={this.setResults.bind(this)}/>
				<SearchResults results={this.state.results} />
			</div>
		);
	}
}


class SearchForm extends React.Component {
	constructor(...params) {
		super(...params);
		this.state = {
		};
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
		ServerIO.search(this.state.q)
		.then(function(res) {
			console.warn(res);
			let charities = res.cargo.hits;
			let total = res.cargo.total;
			this.props.setResults(charities, total);
		}.bind(this));
	}

	render() {
		return(
			<Form inline onSubmit={this.onSubmit.bind(this)} >
				<Well>
					<FormGroup bsSize='lg' controlId="formq">
						<ControlLabel bsSize='lg' >Keywords</ControlLabel>
						&nbsp;
						<FormControl
							bsSize='lg'
							type="search"                        
							value={this.state.q || ''}
							placeholder="Enter search terms"
							onChange={this.onChange.bind(this,'q')}
						/>
						&nbsp;
						<Button type='submit' bsSize='lg' bsStyle='primary'>Search</Button>
					</FormGroup>
				</Well>
			</Form>
		);
	} // ./render

} //./SearchForm


const SearchResults = ({ results }) => (
	<div className='SearchResults'>
		{ _.map(results, item => <SearchResult key={uid()} item={item} />) }
	</div>
); //./SearchResults


const SearchResult = ({ item }) => (
	<div className='SearchResult' >
		<Media>
			<a href={`#charity?charityId=${item['@id']}`}>
				<Media.Left>
					<img width={64} height={64} src={item.logo} alt={`Logo for ${item.name}`} />
				</Media.Left>
				<Media.Body>
					<Media.Heading>{item.name}</Media.Heading>
					<p>{item.description}</p>
				</Media.Body>
			</a>
		</Media>
	</div>
); //./SearchResult

