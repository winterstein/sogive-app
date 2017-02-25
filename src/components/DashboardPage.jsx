import React, { Component, PropTypes } from 'react';
import SJTest from 'sjtest';
import Login from 'hooru';
// import printer from '../utils/printer';
// import C from '../C';
import ChartWidget from './ChartWidget';

const assert = SJTest.assert;

const DashboardPage = () => {
	if ( ! Login.isLoggedIn()) {
		return (<div className="page DashboardPage">
		<h2>My Dashboard: Login or Register</h2>
		</div>);
	}
	return (
	<div className="page DashboardPage">
		<h2>My Dashboard</h2>
		
		<DashboardWidget title="Donation History">
			<ul><li>TODO list your donations with impact</li></ul>
		</DashboardWidget>
	</div>);
};// ./Dashboard


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
