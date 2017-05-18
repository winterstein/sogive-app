
import ServerIO from './ServerIO';
import DataStore from './DataStore';
import {assert} from 'sjtest';
import NGO from '../data/charity/NGO';

const addCharity = () => {
	// TODO search the database for potential matches, and confirm with the user
	// get the info (just the name)
	let item = DataStore.appstate.widget.AddCharityWidget.form;
	assert(item.name);
	// TODO message the user!
	ServerIO.addCharity(item)
	.then(res => {
		alert("Success! Charity added");
		console.log("AddCharity", res);
		let charity = res.cargo;
		DataStore.setValue(['widget','AddCharityWidget','result','id'], NGO.id(charity));
	});
};

const ActionMan = {
	addCharity
};


export default ActionMan;
