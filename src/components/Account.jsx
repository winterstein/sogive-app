import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';


const Account = React.createClass({

    render: function() {
        return (
            <div className=''>
                <h2>My Account</h2>
            </div>
        );
    }

});

export default Account;