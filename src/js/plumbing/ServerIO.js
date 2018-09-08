/** 
 * Wrapper for server calls.
 *
 */
import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import {XId, encURI} from 'wwutils';
import C from '../C.js';

import Login from 'you-again';

// Try to avoid using this for modularity!
import DataStore from '../base/plumbing/DataStore';
import Messaging, {notifyUser} from '../base/plumbing/Messaging';

import ServerIO from '../base/plumbing/ServerIOBase';

ServerIO.APIBASE = '';
// ServerIO.APIBASE = 'https://test.sogive.org';
// ServerIO.APIBASE = 'https://test.sogive.org';
// ServerIO.APIBASE = 'https://app.sogive.org';

window.wtf = 'foo';

ServerIO.checkBase();

export default ServerIO;
