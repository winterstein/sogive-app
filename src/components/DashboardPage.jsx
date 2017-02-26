import React, { Component, PropTypes } from 'react';
import SJTest from 'sjtest';
import _ from 'lodash';
import Login from 'hooru';
import printer from '../utils/printer';
// import C from '../C';
import ServerIO from '../plumbing/ServerIO';
// import ChartWidget from './ChartWidget';
import Misc from './Misc.jsx';
import {XId} from 'wwutils';

const assert = SJTest.assert;

class DashboardPage extends React.Component {

	componentWillMount() {
	}

	render() {
		if ( ! Login.isLoggedIn()) {
			return (<div className="page DashboardPage">
			<h2>My Dashboard: Login or Register</h2>
			</div>);
		}
		let donations = this.state && this.state.donations;
		// loaded?
		if ( ! donations) {
			ServerIO.getDonations()
			.then(function(result) {
				let dons = result.cargo.hits;
				this.setState({donations: dons});
			}.bind(this));
			return <Misc.Loading />;
		}
		// display...
		return (
		<div className="page DashboardPage">
			<h2>My Dashboard</h2>
			
			<DashboardWidget title="Donation History">
				<DonationList donations={this.state.donations} />
			</DashboardWidget>
		</div>);
	}
}// ./DashboardPage


const DonationList = ({donations}) => {
	return <div>{ _.map(donations, d => <Donation key={'d'+d.id} donation={d} />) }</div>;
};

const Donation = ({donation}) => {
	return (<div>
		Charity: {printer.str(donation.to)} <br/>
		Impact: {donation.impact} <br/>
		Amount: <Misc.Money precision={false} amount={donation.total} /> <br/>
		GiftAid? {donation.giftAid? 'yes' : 'no'} <br/>
		Date: <Misc.Time time={donation.time} /> <br/>
		<small>payment-id: {donation.paymentId}</small>
	</div>);
};

		/*<h2>Version 2+...</h2>
		<DashboardWidget title="News Feed">
			Updates from projects you support and people you follow.
		</DashboardWidget>

		<DashboardWidget title="Your Donations over Time">
			<ChartWidget type="line" />
		</DashboardWidget>

		<DashboardWidget title="Donations by Category">
			Pie chart of what you give to
		</DashboardWidget>

		<DashboardWidget title="Your Badges">
			Badges (encouraging use of all features, and repeated use -- but not extra £s)
		</DashboardWidget>

		<DashboardWidget title="Recent Donations">
			List of recent donations and impacts, with a link to the full history
		</DashboardWidget>*/


export default DashboardPage;

const DashboardWidget = ({ children, iconClass, title }) =>
	<div className="panel panel-default">
		<div className="panel-heading">
			<h3 className="panel-title"><DashTitleIcon iconClass={iconClass} /> {title || ''}</h3>
		</div>
		<div className="panel-body">
			{children}
		</div>
	</div>;
// ./DashboardWidget

DashboardWidget.propTypes = {
	children: PropTypes.element,
	iconClass: PropTypes.string,
	title: PropTypes.string,
};

const DashTitleIcon = ({ iconClass }) =>
	<i className={iconClass} aria-hidden="true" />;

DashTitleIcon.propTypes = {
	iconClass: PropTypes.string,
};
