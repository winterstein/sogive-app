// @Flow

import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SJTest, {assert} from 'sjtest';
import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';
import Login from 'hooru';
import StripeCheckout from 'react-stripe-checkout';
import {XId,uid} from 'wwutils';
import {Text} from 'react-bootstrap';

export default class DonationForm extends React.Component {
	onToken() {

	}

	render() {		
		// donated?
		if (false) {
			return (<ThankYouAndShare />);
		}

		return (<div className='DonationForm'>
			<DonationFormButton onToken={this.onToken.bind(this)} />

			<ThankYouAndShare />
		</div>);
	}
}


class ThankYouAndShare extends React.Component {

	constructor(...params) {
		super(...params);
		this.state = {
			shareText: 'SoGive thanks $name for funding $charity to $impact'
		};
	}

	shareOnFacebook() {
		let url = ""+window.location;
		FB.ui({
			quote: this.state.shareText,
			method: 'share',
			href: url,
			},
			// callback
			function(response) {
				console.log("FB", response);
				if (response && response.error_message) {
				console.error('Error while posting.');
				return;
				}
				// foo
			}
		);
	}

	onChangeShareText(event) {
		event.preventDefault();
		console.log("event", event);
		this.setState({shareText: event.target.value});
	}

	render() {
		// <div className="fb-share-button" 
	/*data-href={url} 
	data-layout="button_count" 
	data-size="large" data-mobile-iframe="true"><a className="fb-xfbml-parse-ignore" target="_blank" 
	href={"https://www.facebook.com/sharer/sharer.php?u="+escape(url)}>Share</a></div>*/

		let url = ""+window.location;
		return (<div className='ThankYouAndShare'>
			<h3>Thank you for donating!</h3>

			<p>Share this on social media? On average this leads to 2-3 times more donations.</p>

			<textarea className='form-control' value={this.state.shareText} onChange={this.onChangeShareText.bind(this)}>				
			</textarea>

			<a className='btn btn-default' href={'https://twitter.com/intent/tweet?text='+escape(this.state.shareText)+'&url='+escape(url)}><Misc.Logo service='twitter'/></a>
			<button className='btn btn-default' onClick={this.shareOnFacebook.bind(this)}><Misc.Logo service='facebook'/></button>
		</div>);
	}
} // ./ThankYouAndShare

/**
 * one-click donate, or Stripe form?
 */
const DonationFormButton = ({onToken}) => {
	if (false) {
		return <button>Donate</button>;
	}
	let email = Login.getId('Email');
	return (<StripeCheckout name="SoGive" description="See the impact of your charity donations"
				image="http://local.sogive.org/img/SoGive-Light-70px.png"
				email={email}
				panelLabel="Give Money"
				amount={1000000}
				currency="GBP"
				stripeKey="pk_test_RyG0ezFZmvNSP5CWjpl5JQnd"
				bitcoin
				allowRememberMe
				token={onToken}
			>
				<button className="btn btn-primary">Donate</button>
			</StripeCheckout>);
};


const DonationAmounts = ({charity}) => {
	let project = this.props.project;
	let damounts = _.map(this.props.impacts, a => (<DonationAmount key={"donate_"+a.price} charity={charity} project={project} impact={a}/>) );
	return(<ul>{damounts}</ul>);
};

const DonationAmount = function({charity, project, impact}) {
    return <li>£{impact.price} will fund {impact.number} {impact.output}</li>;
};


const DonationList = ({donations}) => {
    let ddivs = _.map(donations, d => <li key={uid()}>{d}</li>);
    return <ul>{ddivs}</ul>;
};
