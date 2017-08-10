// @Flow
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { assert } from 'sjtest';
import Login from 'you-again';
import StripeCheckout from 'react-stripe-checkout';
import { uid, XId, encURI } from 'wwutils';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import printer from '../utils/printer';
import NGO from '../data/charity/NGO';
import Misc from './Misc';
import ImpactWidgetry from './ImpactWidgetry.jsx';
import GiftAidForm from './GiftAidForm';

import { donate, updateForm, initDonationForm } from './DonationForm-actions';

/**
 * TODO refactor this to not use Redux.
 * 
 * TODO Doc notes on the inputs to this. the charity profile sends in charity and project.
 */

class DonationForm extends React.Component {

	render() {
		const {charity, donationForm, handleChange, initDonation, sendDonation } = this.props;
		let user = Login.getUser();

		// some charities dont accept donations
		if (charity.noPublicDonations) {
			const reason = charity.meta && charity.meta.noPublicDonations && charity.meta.noPublicDonations.notes;
			return (
				<div className="DonationForm noPublicDonations">
					<p>Sorry: This charity does not accept public donations.</p>
					{ reason? (<p>The stated reason is: {reason}</p>) : '' }
				</div>
			);
		}

		if ( ! donationForm) {
			initDonation();
			return <div />;
		}

		assert(NGO.isa(charity), charity);

		let project = this.props.project || NGO.getProject(charity);
		// NB: no project = no data is possible

		// donated?
		if (donationForm.complete) {
			return (<ThankYouAndShare thanks user={user} charity={charity} donationForm={donationForm} project={project} />);
		}

		const donateButton = donationForm.ready ? (
			<DonationFormButton
				amount={Math.floor(donationForm.amount * 100)}
				onToken={(stripeResponse) => { sendDonation(charity, donationForm, stripeResponse); }}
			/>
		) : (
			<Button disabled title='Something is wrong with your donation'>Donate</Button>
		);

		const giftAidForm = charity.uk_giftaid ? (
			<GiftAidForm {...donationForm} handleChange={handleChange} />
		) : <small>This charity is not eligible for Gift-Aid.</small>;

		return (
			<div>
				<div className='DonationForm'>
					<DonationAmounts
							options={[5, 10, 20]}
							outputs={project && project.outputs}
							charity={charity}
							project={project}
							amount={donationForm.amount}
							handleChange={handleChange}
						/>
				</div>
				<div className='col-md-12 donate-button'>
					{ donateButton }
				</div>
				{ giftAidForm }
				<ThankYouAndShare thanks={false} charity={charity} />
			</div>
		);
	}
} // ./DonationForm


class ThankYouAndShare extends React.Component {

	constructor(...params) {
		super(...params);
		const { thanks, user, charity, donationForm, project} = this.props;

		// TODO -- see submit methodlet impacts = Output.getDonationImpact;
		let shareText;
		if (user && user.name) {
			let impact = false; // TODO
			if (impact) {
				shareText = `${charity.name} and SoGive thank ${user.name} for helping to fund ${impact} - why not join in?`;
			} else {
				shareText = `${charity.name} and SoGive thank ${user.name} for their donation - why not join in?`;
			}
		} else {
			shareText = `Help to fund ${charity.name} and see the impact of your donations on SoGive:`;
		}

		this.state = {
			shareText,
		};
	}

	shareOnFacebook({url}) {
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
		const { thanks } = this.props;
		const { shareText } = this.state;
	/*
	<div className="fb-share-button"
		data-href={url}
		data-layout="button_count"
		data-size="large" data-mobile-iframe="true"><a className="fb-xfbml-parse-ignore" target="_blank"
		href={"https://www.facebook.com/sharer/sharer.php?u="+encURI(url)}>Share</a>
	</div>
	*/

		let lcn = window.location;
		const header = thanks ? <h3>Thank you for donating!</h3> : '';
		
		let pageInfo = {
			title: this.props.charity.name,
			image:	'http://cdn.attackofthecute.com/September-21-2011-22-10-11-6765.jpeg', // FIXME
			desc:	this.props.charity.description
		};
		// TODO copy SoDash escape fn into wwutils
		// TODO make this line nicer
		// TODO just send the charity ID, and load the rest server side, to give a nicer url
		// Also window.location might contain parameters we dont want to share.
		let url = "https://app.sogive.org/share?link="+encURI(""+window.location)+"&title="+encURI(pageInfo.title)+"&image="+encURI(pageInfo.image)+"&desc="+encURI(pageInfo.desc);
		pageInfo.url = url;

		return (
			<div className='col-md-12'>
				<div className='ThankYouAndShare panel-success'>
					{ header }

					<p>Share this on social media?<br/>
						We expect this will lead to 2-3 times more donations on average.</p>

					<textarea
						className='form-control'
						onChange={() => { this.onChangeShareText(); }}
						defaultValue={shareText}
					/>
				</div>
				<div className='col-md-12 social-media-buttons'>
					<center>
						<a className='btn twitter-btn' href={'https://twitter.com/intent/tweet?text='+encURI(this.state.shareText)+'&url='+encURI(url)} data-show-count="none">
							<Misc.Logo service='twitter' />
						</a>

						<a className='btn facebook-btn' onClick={() => { this.shareOnFacebook(pageInfo); }}>
							<Misc.Logo service='facebook' />
						</a>
					</center>
				</div>
			</div>
		);
	}
} // ./ThankYouAndShare

/**
 * one-click donate, or Stripe form?
 */
const DonationFormButton = ({onToken, amount}) => {
	let email = Login.getId('Email');
	if (email) email = XId.id(email);
		const stripeKey = (window.location.host.startsWith('test') || window.location.host.startsWith('local')) ?
		'pk_test_RyG0ezFZmvNSP5CWjpl5JQnd' // test
		: 'pk_live_InKkluBNjhUO4XN1QAkCPEGY'; // live
		
	return (
		<div className='stripe-checkout'>
			<StripeCheckout name="SoGive" description="Donate with impact tracking"
				image="http://local.sogive.org/img/SoGive-Light-64px.png"
				email={email}
				panelLabel="Donate"
				amount={amount}
				currency="GBP"
				stripeKey={stripeKey}
				bitcoin
				allowRememberMe
				token={onToken}
			>
				<center>
					<Button bsStyle="primary" className='sogive-donate-btn'>Donate</Button>
				</center>
			</StripeCheckout>
		</div>
	);
};


/**
 */
const DonationAmounts = ({options, charity, project, outputs, amount, handleChange}) => {
	// FIXME switch to using outputs
	let damounts = _.map(options, price => (
		<span key={'donate_'+price}>
			<DonationAmount
				price={price}
				selected={price === amount}
				handleChange={handleChange}
			/>
			&nbsp;
		</span>
	));

	let fgcol = (options.indexOf(amount) === -1) ? 'white' : null;
	let bgcol = (options.indexOf(amount) === -1) ? '#337ab7' : null;

	return(
		<div className='full-width'>
			<form>
				<div className="form-group col-md-1 col-xs-2">
					{damounts}
				</div>
				<div className="form-group col-md-8 col-xs-10">
					<InputGroup>
						<InputGroup.Addon style={{color: fgcol, backgroundColor: bgcol}}>£</InputGroup.Addon>
						<FormControl
							type="number"
							min="1"
							max="100000"
							step="1"
							placeholder="Enter donation amount"
							onChange={({ target }) => { handleChange('amount', target.value); }}
							value={amount}
						/>
					</InputGroup>
				</div>
				<div className="form-group col-md-2">
					<Misc.ImpactDesc charity={charity} project={project} outputs={outputs} amount={amount} />
				</div>
			</form>
		</div>
	);
};

const DonationAmount = function({selected, price, handleChange}) {
	return (
			<div className=''>
				<Button
					bsStyle={selected? 'primary' : null}
					bsSize="sm"
					className='amount-btn'
					onClick={() => handleChange('amount', price)}
				>
					£ {price}
				</Button>
			</div>
	);
};


const DonationList = ({donations}) => {
	let ddivs = _.map(donations, d => <li key={uid()}>{d}</li>);
	return <ul>{ddivs}</ul>;
};

const mapStateToProps = (state, ownProps) => ({
	...ownProps,
	donationForm: state.donationForm[ownProps.charity['@id']],
});

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleChange: (field, value) => dispatch(updateForm(ownProps.charity['@id'], field, value)),
	sendDonation: (charity, donationForm, stripeResponse) => dispatch(donate(dispatch, charity, donationForm, stripeResponse)),
	initDonation: () => dispatch(initDonationForm(ownProps.charity['@id'])),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonationForm);
