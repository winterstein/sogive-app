/** Data model functions for the NGO data-type */

import _ from 'lodash';
import {isa} from '../DataClass.js'

const NGO = {};
export default NGO;


NGO.isa = (ngo) => isa(ngo, 'NGO');
NGO.name = (ngo) => isa(ngo, 'NGO') && ngo.name;
NGO.description = (ngo) => isa(ngo, 'NGO') && ngo.description;