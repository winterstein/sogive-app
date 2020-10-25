import React from 'react';
import Login from 'you-again';
import _ from 'lodash';
import {encURI} from '../../base/utils/miscutils';


import printer from '../../base/utils/printer';
// import C from '../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
// import ChartWidget from './../base/components/ChartWidget';
import Misc from '../../base/components/Misc';
import {notifyUser} from '../../base/plumbing/Messaging';


const EditorDashboardPage = () => (
	<div className="page EditorDashboardPage">
		<h2>Editorial Dashboard</h2>
		<h3>In development...</h3>
		<AddCharityWidget />
		<AddEditorWidget />
		<UploadEditorialsWidget />
		<p><a href='/#manageDonations'>Manage Donations</a></p>
	</div>
); // ./EditorDashboardPage


const AddCharityWidget = () => {
	let id = DataStore.getValue(['widget','AddCharityWidget','result','id']);
	if (id) {
		return <a href={'/#edit?charityId='+encURI(id)}>Edit {DataStore.getValue(['widget','AddCharityWidget','form','name'])}</a>;
	}
	return (<Misc.Card title='Add Charity'>
		<div className='alert alert-warning'>
			ALWAYS <a href={'#search?status=ALL_BAR_TRASH'}>search</a> first to check the charity isn't already in the database.
			Otherwise we will have ugly merge problems.</div>
		<Misc.PropControl prop='name' label='Name' path={['widget','AddCharityWidget', 'form']} />
		<button className='btn btn-warning' onClick={() => ActionMan.addCharity()}>Add Charity</button>
	</Misc.Card>);
};

const doAddEditor = function() {
	let email = DataStore.appstate.widget.AddEditorWidget.form.email;
	if ( ! email) return;
	Login.shareThing('role:editor', email);
	DataStore.setValue(['widget', 'AddEditorWidget', 'form'], {});
};

const AddEditorWidget = () => {
	return (<Misc.Card title='Add a new Editor' >
		<p>Use this form to add someone to the editors team. Anyone can make edits, but only approved editors can publish them.</p>
		<Misc.PropControl prop='email' label='Email' path={['widget','AddEditorWidget', 'form']} />
		<button className='btn btn-warning' onClick={doAddEditor}>Add Them</button>
	</Misc.Card>);
};

const doUploadEditorials = function() {
	let googleDocUrl = DataStore.appstate.widget.UploadEditorialsWidget.form.publishedEditorialsDoc;
	if ( ! googleDocUrl) return;
	notifyUser("Successfully imported editorials.");
	ServerIO.importEditorials(googleDocUrl);
	DataStore.setValue(['widget', 'UploadEditorialsWidget', 'form'], {});
};

const UploadEditorialsWidget = () => {
	return (<Misc.Card title='Upload Editorials' >
		<p>Use this form to upload SoGive editorials from a published Google Doc.</p>
		<Misc.PropControl prop='publishedEditorialsDoc' name='editorialsUrl' label='Published google doc webpage URL:' path={['widget','UploadEditorialsWidget', 'form']} />
		<button className='btn btn-warning' onClick={doUploadEditorials} name='uploadEditorials'>Upload Editorials</button>
	</Misc.Card>);
};


export default EditorDashboardPage;
