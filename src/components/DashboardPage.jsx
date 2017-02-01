import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';
import ChartWidget from './ChartWidget.jsx';

class DashboardPage extends React.Component {

    render() {
        console.log('PAGE RENDER');
        return (
            <div className='page DashboardPage'>
                <h2>My Dashboard</h2>

                <DashboardWidget title='News Feed'>
                    Updates from projects you support and people you follow.
                </DashboardWidget>

                <DashboardWidget title='Your Donations over Time'>
                    <ChartWidget type='line' />
                </DashboardWidget>

                <DashboardWidget title='Donations by Category'>
                    Pie chart of what you give to
                </DashboardWidget>

                <DashboardWidget title='Your Badges'>
                    Badges (encouraging use of all features, and repeated use -- but not extra £s)
                </DashboardWidget>

                <DashboardWidget title='Recent Donations'>
                    List of recent donations and impacts, with a link to the full history
                </DashboardWidget>
            </div>
        );
    }

}; // ./Dashboard

export default DashboardPage;

class DashboardWidget extends React.Component {
	render() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<h3 className="panel-title"><DashTitleIcon iconClass={this.props.iconClass} /> {this.props.title || ''}</h3>
				</div>
				<div className="panel-body">
					{this.props.children}
				</div>
			</div>);
	}
} // ./DashboardWidget

const DashTitleIcon = ({iconClass}) => (<i className={iconClass} aria-hidden="true"></i>)

