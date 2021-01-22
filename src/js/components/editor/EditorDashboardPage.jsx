import React from 'react';
import Login from '../../base/youagain';
import _ from 'lodash';
import {encURI} from '../../base/utils/miscutils';


import printer from '../../base/utils/printer';
// import C from '../C';
import ServerIO from '../../plumbing/ServerIO';
import DataStore from '../../base/plumbing/DataStore';
import ActionMan from '../../plumbing/ActionMan';
import { LoginLink } from '../../base/components/LoginWidget';
// import ChartWidget from './../base/components/ChartWidget';
import Misc from '../../base/components/Misc';
import {notifyUser} from '../../base/plumbing/Messaging';


const EditorDashboardPage = () => {
	if ( ! Login.isLoggedIn()) {
		return <LoginLink />;
	}
	return (<div className="page EditorDashboardPage">
		<h2>Editorial Dashboard</h2>
		<h3>In development...</h3>
		<AddCharityWidget />
		<AddEditorWidget />
		<ImportEditorialsWidget />
		<p><a href='/#manageDonations'>Manage Donations</a></p>
	</div>);
}; // ./EditorDashboardPage


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

const doImportEditorials = function() {
	const googleDocUrl = DataStore.appstate.widget.ImportEditorialsWidget.form.publishedEditorialsDoc;
	if ( ! googleDocUrl ) return;
	if ( googleDocUrl.slice(-4) !== '/pub') {
		DataStore.setValue(['widget', 'ImportEditorialsWidget', 'form'], {});
		notifyUser(new Error("Link given *must* end in /pub - Please read instructions!"))
		return;
	}
	ServerIO.importEditorials(googleDocUrl)
		.then(importResult => {
			const totalImported = importResult.cargo.totalImported;
			if (totalImported > 0) {
				notifyUser("Successfully imported " + totalImported + " editorials.");
			}
			const rejectedIds = importResult.cargo.rejectedIds;
			if (rejectedIds && rejectedIds.length > 0) {
				let errorMessage = `Rejected ${rejectedIds.length} charities not in database:\n`;
				errorMessage += rejectedIds.join(", ");
				notifyUser(new Error(errorMessage))
			}
		})
		.catch(errorResponse => {
			console.log("Error importing editorials: ", errorResponse);
			DataStore.setValue(['widget', 'ImportEditorialsWidget', 'form'], {});
		});
	DataStore.setValue(['widget', 'ImportEditorialsWidget', 'form'], {});
};

const ImportEditorialsWidget = () => {
	return (<Misc.Card title='Import Editorials' >
		<p>Use this form to import SoGive editorials from a Google Doc. Editorials in the doc must be in the following format:</p>
		<br/>
		<p><b>charity-id-1</b> (styled as Heading 1)</p>
		<p>Editorial One (styled as Normal text or subheadings, may be multiple paragraphs)</p>
		<p><b>charity-id-2</b> (styled as Heading 1)</p>
		<p>Editorial Two (styled as Normal text or subheadings, may be multiple paragraphs)</p>
		<p>etc.</p>
		<br/>
		<p>Import Instructions:</p>
		<ol>
			<li>Open the Google Doc</li>
			<li>Open the document outline (View &gt; Show document outline, or click on the icon on the left-hand side) and check that all the charity-ids are styled as Heading 1s.</li>
			<li>In the Docs menu, select <b>File</b> &gt; <b>Publish to the web</b>, and click <b>[Publish]</b>.</li>
			<li>Copy the link from that dialog.</li>
		</ol>
		<Misc.PropControl prop='publishedEditorialsDoc' name='editorialsUrl' label="Published link: (should end in '/pub')" path={['widget','ImportEditorialsWidget', 'form']} />
		<button className='btn btn-warning' onClick={doImportEditorials} name='importEditorials'>Import Editorials</button>
	</Misc.Card>);
};


export default EditorDashboardPage;
