import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';


const DOnateToCampaign = React.createClass({

    render: function() {
        console.log('PAGE RENDER');
        return (
            <div className='campaign'>
                <h2>Alice's Sponsored Marathon for Kiddy Shoes</h2>

                <div class='panel'>
                    About the charity
                </div>

                <div class='panel'>
                    Donate!
                    <div>£10 will pay for 5 pairs of Shoes.</div>
                    <div>Amongst other benefits, that means 0.1 less snake bite victims.</div>
                    more info...
                </div>

                <div class='panel'>
                    Campaign Info: 823 shoes funded
                    Target: 1000 shoes

                    Donations by: ALice, Bob, Carol... (no value given)

                </div>

                <div class='panel'>
                </div>
            </div>
        );
    }

}); // ./Dashboard

export default Dashboard;