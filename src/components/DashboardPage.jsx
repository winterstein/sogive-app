import { React, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import SJTest from 'sjtest';

import printer from '../utils/printer';
import C from '../C';
import ChartWidget from './ChartWidget';

const assert = SJTest.assert;

class DashboardPage extends React.Component {
	render() {
		console.log('PAGE RENDER');
		return (
			<div className="page DashboardPage">
				<h2>My Dashboard</h2>

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
				</DashboardWidget>
			</div>
		);
	}
} // ./Dashboard

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
	iconClass: PropTypes.string.isRequired,
	title: PropTypes.string,
};

const DashTitleIcon = ({ iconClass }) =>
	<i className={iconClass} aria-hidden="true" />;

DashTitleIcon.propTypes = {
	iconClass: PropTypes.string.isRequired,
};
