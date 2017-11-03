
import Login from 'you-again';
import ServerIO from './ServerIO';
import DataStore from './DataStore';
import {assert} from 'sjtest';

import {getId, getType} from '../data/DataClass';
import NGO from '../data/charity/NGO';
import Project from '../data/charity/Project';
import MonetaryAmount from '../data/charity/MonetaryAmount';
import Basket from '../data/Basket';
import Output from '../data/charity/Output';
import Citation from '../data/charity/Citation';
import _ from 'lodash';
import C from '../C';
import PV from 'promise-value';


const addCharity = () => {
	// TODO search the database for potential matches, and confirm with the user
	// get the info (just the name)
	let item = DataStore.appstate.widget.AddCharityWidget.form;
	assert(item.name);
	// TODO message the user!
	ServerIO.addCharity(item)
	.then(res => {
		console.log("AddCharity", res);
		let charity = res.cargo;
		DataStore.setValue(['widget','AddCharityWidget','result','id'], NGO.id(charity));
	});
};


const addProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity));
	let item = DataStore.appstate.widget.AddProject.form;
	if (isOverall) item.name = Project.overall;
	let proj = Project.make(item);
	// add to the charity	
	if ( ! charity.projects) charity.projects = [];
	charity.projects.push(proj);
	// clear the form
	DataStore.setValue(['widget', 'AddProject', 'form'], {});
};

const removeProject = ({charity, project}) => {
	assert(NGO.isa(charity));
	let i = charity.projects.indexOf(project);
	charity.projects.splice(i,1);
	// update
	DataStore.update();
};

const addInputOrOutput = ({list, ioPath, formPath}) => {
	assert(_.isArray(list), list);
	let item = DataStore.getValue(formPath);
	// Copy the form value to be safe against shared state? Not needed now setValue {} works.
	// item = Object.assign({}, item);
	// add to the list
	list.push(item);
	// clear the form
	DataStore.setValue(formPath, {});
};

const addDataSource = ({list, srcPath, formPath}) => {
	assert(_.isArray(list), list);
	let citation = Citation.make(DataStore.getValue(formPath));
	
	list.push(citation);
	DataStore.setValue(srcPath, list);
	
	// clear the form
	DataStore.setValue(formPath, {});
};

const donate = ({charity, formPath, formData, stripeResponse}) => {
	const donationParams = {
		action: 'donate',
		charityId: NGO.id(charity),
		currency: formData.amount.currency,
		value: formData.amount.value,
		value100: Math.floor(formData.amount.value * 100),
		giftAid: formData.giftAid,
		name: formData.name,
		address: formData.address,
		postcode: formData.postcode,
		stripeToken: stripeResponse.id,
		stripeTokenType: stripeResponse.type,
		stripeEmail: stripeResponse.email,
	};
	MonetaryAmount.assIsa(donationParams);

	// Add impact to submitted data
	const project = NGO.getProject(charity);
	if (project && project.outputs) {		
		let donationImpacts = project.outputs.map(output => Output.scaleByDonation(output, donationParams));
		donationParams.impacts = JSON.stringify(donationImpacts);
	}

	ServerIO.donate(donationParams)
	.then(function(response) {
		DataStore.setValue(formPath, {
			...formData,
			pending: false,
			complete: true,
		});
	}, function(error) {});

	DataStore.setValue(formPath, {
		...formData,
		pending: true,
	});
};


/**
 * id=for{user.id}, becuase a user only has one basket
 */
const getBasketPV = (uxid) => {
	if ( ! uxid) {
		uxid = Login.getId() || Login.getTempId();		
	}
	const bid = 'for'+uxid;
	// FIXME we want to say "dont show errors from this"
	let pvbasket = ActionMan.getDataItem({type:C.TYPES.Basket, id:bid});
	if (pvbasket.value) return pvbasket;
	// loading - or maybe we have to make a new basket
	let pGetMake = pvbasket.promise.fail(err => {
		console.log("make a new basket");
		let basket = {'@type': Basket.type, id: bid};
		DataStore.setData(basket);
		return basket;
	});
	return PV(pGetMake);
};
const addToBasket = (basket, item) => {
	console.log("addFromBasket",basket, item);
	assert(item, basket);
	Basket.assIsa(basket);
	assert(item.id, item); // need an ID
	item = _.cloneDeep(item); // copy so we can modify
	basket.items = (basket.items || []).concat(item);
	DataStore.update();
	return basket;
};
const removeFromBasket = (basket, item) => {
	console.log("removeFromBasket",basket, item);
	assert(item);
	Basket.assIsa(basket);
	basket.items = basket.items.filter(itm => getId(itm) !== getId(item));
	DataStore.update();
	return basket;
};

const ActionMan = {
	addCharity,
	addProject, removeProject,
	addInputOrOutput,
	addDataSource,
	donate,
	getBasketPV,
	addToBasket, 
	removeFromBasket
};

export default ActionMan;
