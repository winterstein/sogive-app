import React from 'react';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';

import Misc from '../base/components/Misc';
import DataStore from '../base/plumbing/DataStore';

import ActionMan from '../plumbing/ActionMan';
import C from '../C';

/** Hack: a debounced auto-save function for the save/publish widget */
const saveDraftFn = _.debounce(
	({type, id}) => {
		ActionMan.saveEdits(type, id);
		return true;
	}, 5000);

/**
 * save buttons
 * TODO auto-save on edit -- copy from sogive
 */
Misc.SavePublishDiscard = ({type, id, hidden, cannotPublish, cannotDelete }) => {
	assert(C.TYPES.has(type), 'Misc.SavePublishDiscard');
	assMatch(id, String);
	let localStatus = DataStore.getLocalEditsStatus(type, id);
	let isSaving = C.STATUS.issaving(localStatus);	
	let item = DataStore.getData(type, id);
	// request a save?
	if (C.STATUS.isdirty(localStatus) && ! isSaving) {
		saveDraftFn({type,id});
	}
	// if nothing has been edited, then we can't publish, save, or discard
	// NB: modified is a persistent marker, managed by the server, for draft != published
	let noEdits = item && C.KStatus.isPUBLISHED(item.status) && C.STATUS.isclean(localStatus) && ! item.modified;

	let disablePublish = isSaving || noEdits || cannotPublish;
	let publishTooltip = cannotPublish? 'Your account cannot publish this.' : (noEdits? 'Nothing to publish' : 'Publish your edits!');
	let disableDelete = isSaving || cannotDelete;
	// Sometimes we just want to autosave drafts!
	if (hidden) return <span />;
	const vis ={visibility: isSaving? 'visible' : 'hidden'};

	return (<div className='SavePublishDiscard' title={item && item.status}>
		<div><small>Status: {item && item.status}, Modified: {localStatus} {isSaving? "saving...":null}</small></div>
		<button className='btn btn-default' disabled={isSaving || C.STATUS.isclean(localStatus)} onClick={() => ActionMan.saveEdits(type, id)}>
			Save Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-primary' disabled={disablePublish} title={publishTooltip} onClick={() => ActionMan.publishEdits(type, id)}>
			Publish Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-warning' disabled={isSaving || noEdits} onClick={() => ActionMan.discardEdits(type, id)}>
			Discard Edits <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
		&nbsp;
		<button className='btn btn-danger' disabled={disableDelete} onClick={() => ActionMan.delete(type, id)} >
			Delete <span className="glyphicon glyphicon-cd spinning" style={vis} />
		</button>
	</div>);
};

export default Misc;
