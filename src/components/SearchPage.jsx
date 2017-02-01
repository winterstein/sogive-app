import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';
import {uid} from 'wwutils';

export default class SearchPage extends React.Component {

    render() {
        return (
            <div className='page SearchPage'>
                <h2>Search</h2>
                <SearchForm />
                <SearchResults />
            </div>
        );
    }

};


class SearchForm extends React.Component {
    constructor(...params) {
        super(...params);
        this.state = {
            q: 'bar'
        };
    }

    onChange(name, e) {
		e.preventDefault();
		let newValue = e.target.value;
        let newState = {};
        newState[name] = newValue;
        this.setState(newState);
    }

    render() {
        return(
            <form>
                <div className='form-group'>
                    <label>Keywords</label> 
                    <TextInput onChange={this.onChange.bind(this,'q')} name='q' value={this.state.q} type='search' className='form-control'/>
                </div>
                <div className='form-group'>
                    <label>Category / Tags</label> 
                    <input type='text' name='category' className='form-control'/>
                </div>
                <button className="btn btn-primary">Search</button>
            </form>
        );
    }

}; //./SearchForm

class TextInput extends React.Component {
    
    render() {
        let {value, onChange, ...other} = this.props;
        return (<input onChange={onChange} value={this.props.value} {...other} />)
    }
} // ./TextInput

class SearchResults extends React.Component {

    render() {
        let items = [{name:'RSPCA'}, {name:'Cancer Research UK'}];
        let results = _.map(items, item => <SearchResult key={uid()} item={item}/>);
        return (
            <div className='SearchResults'>
                {results}
            </div>
        );
    }

}; //./SearchResults


class SearchResult extends React.Component {

    render() {
        const item = this.props.item;
        return (
            <div className='SearchResult'>
                <h4>{item.name}</h4>
            </div>
        );
    }

}; //./SearchResult

