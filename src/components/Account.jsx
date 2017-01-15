import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest'
const assert = SJTest.assert;
import printer from '../utils/printer.js';
import C from '../C.js';


const Account = React.createClass({

    render: function() {
        return (
            <div className='Search'>
                <h2>Search</h2>
            </div>
        );
    }

});

export default Account;