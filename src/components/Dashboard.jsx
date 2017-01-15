import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';


const Dashboard = React.createClass({

    render: function() {
        console.log('PAGE RENDER');
        return (
            <div className='dashboard'>
                <h2>My Dashboard</h2>
            </div>
        );
    }

}); // ./Dashboard

export default Dashboard;