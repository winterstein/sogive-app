
import {assert, assMatch} from 'sjtest';
import Login from '../you-again';
import PV from 'promise-value';
import _ from 'lodash';
import md5 from 'md5';

import C from '../C';

import ServerIO from './ServerIO';
import DataStore from '../base/plumbing/DataStore';
import {getId, getType} from '../base/data/DataClass';
import NGO from '../data/charity/NGO2';
import FundRaiser from '../data/charity/FundRaiser';
import Donation from '../data/charity/Donation';
import Project from '../data/charity/Project';
import Money from '../base/data/Money';
import Ticket from '../data/charity/Ticket';
import Basket from '../data/Basket';
import Output from '../data/charity/Output';
import Citation from '../data/charity/Citation';
import XId from '../base/data/XId';
import ActionMan from '../base/plumbing/ActionManBase';


/**
 * @param {?NGO} charity
 */
ActionMan.addCharity = (charity) => {
	// TODO search the database for potential matches, and confirm with the user
	// get the info (just the name)
	if ( ! charity) charity = DataStore.appstate.widget.AddCharityWidget.form;
	assert(charity.name, "ActionMan.addCharity() No name!",charity);
	// add to the DB (as draft)	
	ServerIO.addCharity(charity)
		.then(res => {
			console.log("AddCharity", res);
			let rCharity = res.cargo;
			DataStore.setValue(['widget','AddCharityWidget','result','id'], NGO.id(rCharity));
		});
	// optimistic add to local, using (hopefully the same as the server) canonicalised name	
	if ( ! charity.id) charity.id = charity.name.toLowerCase().replace(/\s+/g, "-");	
	charity = new NGO(charity);
	DataStore.setValue(DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.NGO, id:charity.id}), charity);	
};


ActionMan.addProject = ({charity, isOverall}) => {
	assert(NGO.isa(charity));
	let item = DataStore.getValue(['widget', 'AddProject', 'form']);
	if (isOverall) item.name = Project.overall;
	let proj = new Project(item);
	// add to the charity	
	if ( ! charity.projects) charity.projects = [];
	charity.projects.push(proj);
	// clear the form
	DataStore.setValue(['widget', 'AddProject', 'form'], {});
};

ActionMan.removeProject = ({charity, project}) => {
	assert(NGO.isa(charity));
	let i = charity.projects.indexOf(project);
	charity.projects.splice(i,1);
	// update
	DataStore.update();
};

ActionMan.addInputOrOutput = ({list, ioPath, formPath}) => {
	assert(_.isArray(list), list);
	let item = DataStore.getValue(formPath);
	// Copy the form value to be safe against shared state? Not needed now setValue {} works.
	// item = Object.assign({}, item);
	// add to the list
	list.push(item);
	// clear the form
	DataStore.setValue(formPath, {});
};

ActionMan.addDataSource = ({list, srcPath, formPath}) => {
	assert(_.isArray(list), list);
	let citation = new Citation(DataStore.getValue(formPath));
	
	list.push(citation);
	DataStore.setValue(srcPath, list);
	
	// clear the form
	DataStore.setValue(formPath, {});
};

ActionMan.donate = ({charity, formPath, formData, stripeResponse}) => {
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
	Money.assIsa(donationParams);

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
ActionMan.getBasketPV = (uxid) => {
	if ( ! uxid) {
		uxid = Login.getId() || Login.getTempId();
	}
	const bid = Basket.idForUxid(uxid);
	// Basket is normally DRAFT (PUBLISHED = paid for)
	let pvbasket = ActionMan.getDataItem({type:C.TYPES.Basket, id:bid, status: C.KStatus.DRAFT, swallow:true});
	if (pvbasket.value) return pvbasket;
	// loading - or maybe we have to make a new basket
	let pGetMake = pvbasket.promise.catch(err => {
		let basket = null;
		// Use temp basket??
		let currentBasket = DataStore.getValue(['transient','basket']);
		if (currentBasket) {
			if ( ! currentBasket.id || XId.service(currentBasket.id)==='temp' || currentBasket.id.endsWith(uxid)) {
				console.log("transfer basket (change id) "+currentBasket.id+" -> "+bid);
				basket = currentBasket;
				basket.id = bid;
				basket.oxid = uxid;
			}
		}
		if ( ! basket) {
			console.log("make a new basket", bid);
			basket = new Basket({id: bid, oxid:uxid});
		}
		// stash and return
		DataStore.setData(C.KStatus.DRAFT, basket);
		// set as the current basket
		DataStore.setValue(['transient','basket'], basket);
		return basket;
	});
	return new PV(pGetMake);
};

/**
 * 
 * @param {!Basket} basket 
 * @param {!Ticket} item 
 */
ActionMan.addToBasket = (basket, item) => {
	console.log("addFromBasket",basket, item);
	assert(item, basket);
	Basket.assIsa(basket);
	assert(item.id, item); // need an ID
	// copy so we can safely modify elsewhere
	// copy a ticket
	if (Ticket.isa(item)) {
		item = new Ticket(item);
	} else {
		console.log("addToBasket - not a Ticket", item);
		item = _.cloneDeep(item);
	}
	basket.items = (basket.items || []).concat(item);
	DataStore.setData(C.KStatus.DRAFT, basket);
	return basket;
};

ActionMan.removeFromBasket = (basket, item) => {
	console.log("removeFromBasket",basket, item);
	assert(item);
	Basket.assIsa(basket);
	// remove the first matching item (Note: items can share an ID)	
	const i = basket.items.findIndex(itm => getId(itm) === getId(item));
	if (i === -1) {
		return;
	}
	basket.items.splice(i, 1);
	DataStore.setData(C.KStatus.DRAFT, basket);
	return basket;
};

ActionMan.getBasketPath = (uxid) => {
	if ( ! uxid) {
		uxid = Login.getId() || Login.getTempId();		
	}
	const bid = Basket.idForUxid(uxid);
	return DataStore.getDataPath({status:C.KStatus.DRAFT, type:C.TYPES.Basket, id:bid});
};


/**
 * TODO due to bugs (April 2018) 
 * the load-from-server core of this feature was switched off!
 * 
 * NB: uses a pseudo id of `draft-to:X`
 * NB: The pseudo-ID system was causing SUCH bugs. Torn out.
 * Think very carefully about reimplementing.
 * 
 * {
 * 	item: {?NGO|FundRaiser},
 * 	charity: {?String} id
 * 	fundRaiser: {?String} id
 * 	noNew: {Boolean} true = don't create a new draft if none found
 * }
 */
ActionMan.getDonationDraft = ({item, charity, fundRaiser}) => {
	assMatch(charity, "?String");
	assMatch(fundRaiser, "?String");
	// ID info from item
	if (item) {
		if (NGO.isa(item)) charity = getId(item);
		if (FundRaiser.isa(item)) {
			fundRaiser = getId(item);
			// can we get a charity?
			let fCharity = FundRaiser.charityId(item);
			if ( ! charity) charity = fCharity;
			assert(charity === fCharity);
		}
	}
	// for fundraiser if known, or charity
	const forId = fundRaiser || charity;
	assMatch(forId, String, "getDonationDraft() expects an id string");
	// use a pseudo id to keep it in the local DataStore
	const from = Login.getId();

	// HACK, KIND OF: We were getting some SERIOUSLY fussy bugs based around the fact that the
	// donation was stored under a to/from non-ID AND under a "real" nonce()-generated ID.
	// Some components would read/write the ['draft', 'Donation', 'from:x', 'to:y'] copy,
	// some the ['draft', 'Donation', 'sdkjw4398'] copy - and they'd fall out of sync.
	// Example: Feb 2020, our difficulties with the receipt page showing the suggested donation
	// (root cause: prematurely deleting the draft because the 2 copies broke our "if paid, delete on widget close" logic)
	// Example: Feb 2020, the payment page intermittently not respecting the "tip/no tip" checkbox
	// (root cause: checkbox writing to one copy, payment total display reading the other)
	// ...
	// SO!!!!!! Let's only ever store a Donation under its ID, but we maintain a mapping between to/froms
	// and IDs, allowing us to find an already-made donation for a user/cause combination if it exists.

	// Is there a draft donation for this to/from already? Return it!
	const draftIdPath = ['misc', 'donationDraftIds', 'from:'+from, 'draft-to:'+forId];
	const draftId = DataStore.getValue(draftIdPath);
	const existingDraft = draftId && DataStore.getValue(['draft', C.TYPES.Donation, draftId]);
	if (existingDraft) return new PV(existingDraft);

	// OK, it didn't exist. So let's create it.
	const donation = new Donation({
		to: charity,
		fundRaiser: fundRaiser,
		via: FundRaiser.isa(item)? FundRaiser.oxid(item) : null,
		from: from,
		// amount: new Money({ value: 10 }),
		coverCosts: true,
	});
	console.warn('donationDraft-new', donation);
	// Store it in its canonical location...
	DataStore.setData({status: C.KStatus.DRAFT, item: donation, update: false});
	// ...and store its ID so we can find it again by from/to.
	DataStore.setValue(draftIdPath, getId(donation), false);

	// Not calling fetch any more but make a PV to maintain API
	return new PV(donation);

/*
	// REMOVED - IF YOU WANT TO REINSTATE THE SERVER CALL FOR DONATION DRAFT CREATION,
	// THINK VERY CAREFULLY ABOUT HOW TO AVOID HAVING MULTIPLE OUT-OF-SYNC COPIES ON THE CLIENT SIDE

	return DataStore.fetch(['draft', C.TYPES.Donation, 'from:'+from, 'draft-to:'+forId], () => {
		// no load from server - it caused bugs
		// return ServerIO.getDonationDraft({from, charity, fundRaiser})
		// 	.then(res => {
		// 		console.warn("getDonationDraft", res, 'NB: take cargo.hits.0');
		// 		let cargo = res.cargo;
		// 		let dontn = cargo.hits && cargo.hits[0];
		// 		if ( ! dontn) {
		// make a new draft donation
		let dontn = new Donation({
			to: charity,
			fundRaiser: fundRaiser,
			via: FundRaiser.isa(item)? FundRaiser.oxid(item) : null,
			from: from,
			// amount: new Money({ value: 10 }),
			coverCosts: true,
		});
		console.warn('donationDraft-new', dontn);
		// }
		// store in data by ID (the fetch stores under draft-to)
		DataStore.setData(C.KStatus.DRAFT, dontn, false);
		return dontn;
		// }); // ./then()
	}); // ./fetch()
*/
};

/**
 * Clears donation draft held in ActionMan Datastore
 * Hacky fix to deal with seperate donations in the same session overriding each other
 */
ActionMan.clearDonationDraft = ({donation}) => {
	let from = Login.getId();
	let charity = donation.to;
	let fundRaiser = donation.fundRaiser;
	const forId = fundRaiser || charity;

	const draftIdPath = ['misc', 'donationDraftIds', 'from:'+from, 'draft-to:'+forId];
	const draftId = DataStore.getValue(draftIdPath);
	if (draftId) {
		const draftPath = ['draft', C.TYPES.Donation, draftId];
		DataStore.setValue(draftIdPath, null, false); // there isn't a donation for this from/to any more
		console.warn("Values before deletion", DataStore.getValue(draftPath));
		DataStore.setValue(draftPath, null);
	} else {
		DataStore.update(); // No draft somehow? No-op but redraw
	}
};

export default ActionMan;
