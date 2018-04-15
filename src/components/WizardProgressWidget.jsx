import React from 'react';
import DataStore from '../base/plumbing/DataStore';
import Misc from './Misc';
import {assMatch, assert} from 'sjtest';
import {is} from 'wwutils';

// TODO refactor a la Misc.CardAccordion

const WizardProgressWidget = ({stageNum, stages, stagePath}) => {
	if ( ! stageNum) stageNum = 0;
	return (<div className='WizardProgressWidget'>
		{stages.map((stage, i) => <Stage key={i} stage={stage} stageNum={stageNum} i={i} stagePath={stagePath} />)}
	</div>);
};

const Stage = ({i, stage, stageNum, stagePath}) => {
	// Display in progress as complete if left of the current page
	let complete = i < stageNum;
	// if (stage.complete === false) complete = false; TODO stage.error/warning?
	let c = ''; 
	if (i == stageNum) {
		c = 'active';
	} else if (complete) {
		c = 'complete';
	}

	const maybeSetStage = () => complete && stagePath && DataStore.setValue(stagePath, i);

	return (
		<div className={'Stage '+c} onClick={maybeSetStage}>
			<h5 className='text-center above'>{stage.title}</h5>
			<center>
				<span className='marker'>&#11044;</span>
			</center>
			<hr className='line' />
			<h5 className='text-center below'>{stage.title}</h5>
		</div>	
	);
};

/**
 * title
 * next, previous, sufficient, complete
 *
 * NB: these are used by the surrounding widgets - progress & next/prev buttons
 * 
 * Also for convenient lazy setting of sufficient/complete, a function is passed
 * to all children:
 * setNavStatus {sufficient, complete}
 */
const WizardStage = ({stageKey, stageNum, stagePath, maxStage, next, previous, sufficient, complete, title, children}) => 
{
	assert(stageNum !==null && stageNum !== undefined);
	assMatch(maxStage, Number);
	if (stageKey != stageNum) { // allow "1" == 1		
		return null; //<p>k:{stageKey} n:{stageNum}</p>;
	}

	// allow sections to set sufficient, complete, next, previous
	const navStatus = {next, previous, sufficient, complete};
	const setNavStatus = (newStatus) => {
		Object.assign(navStatus, newStatus);
	};
	// pass in setNavStatus	
	if (children) {
		// array of elements (or just one)?
		if (children.filter) children = children.filter(x => !! x);
		children = React.Children.map(children, (Kid, i) => {
			// clone with setNavStatus?
			let sns = Kid.props && Kid.props.setNavStatus;
			return sns? React.cloneElement(Kid, {setNavStatus}) : Kid;
		});
	}
	return (<div className='WizardStage'>
		{children}
		<WizardNavButtons stagePath={stagePath} 
			navStatus={navStatus} 
			maxStage={maxStage} 
		/>
	</div>);
};


/**
 * 
 * @param {
 * 	maxStage: {Number}
 * }
 */
const NextButton = ({complete, stagePath, maxStage, ...rest}) => {
	const bsClass = complete ? 'primary' : null;
	assMatch(maxStage, Number);
	return (<NextPrevTab stagePath={stagePath} bsClass={bsClass} diff={1} 
		text={<span>Next <Misc.Icon glyph='menu-right' /></span>} 
		maxStage={maxStage} {...rest} />);
};
const PrevButton = ({stagePath, ...rest}) => {
	return <NextPrevTab stagePath={stagePath} diff={-1} text={<span><Misc.Icon glyph='menu-left' /> Previous</span>} {...rest} />;
};

const NextPrevTab = ({stagePath, diff, text, bsClass='default', maxStage, ...rest}) => {

	assMatch(stagePath, 'String[]');
	assMatch(diff, Number);	
	assert(text, 'WizardProgressWidget.js - no button text');
	const stage = parseInt(DataStore.getValue(stagePath) || 0);

	if (stage === 0 && diff < 0) return null; // no previous on start
	if (maxStage && stage >= maxStage && diff > 0) return null; // no next on end

	const changeTab = () => {
		let n = stage + diff;
		DataStore.setValue(stagePath, n);	
	};
	
	// use Bootstrap pull class to left/right float
	const pull = diff > 0? 'pull-right' : 'pull-left';

	return (
		<button className={`btn btn-${bsClass} btn-lg ${pull}`} onClick={changeTab} {...rest} >
			{text}
		</button>
	);
};

const Wizard = ({widgetName, stagePath, children}) => {
	// NB: React-BS provides Accordion, but it does not work with modular panel code. So sod that.
	// TODO manage state
	const wcpath = stagePath || ['widget', widgetName || 'Wizard', 'stage'];
	let stageNum = DataStore.getValue(wcpath);
	if ( ! stageNum) stageNum = 0; // default to first kid open
	if ( ! children) {
		return (<div className='Wizard'></div>);
	}
	// filter null, undefined
	children = children.filter(x => !! x);
	// get stage info for the progress bar
	let stages = children.map( (kid, i) => {
		let props = Object.assign({}, kid.props);
		if ( ! props.title) props.title = 'Step '+i;
		return props;
	});
	// so next can recognise the end
	const maxStage = stages.length - 1;
	// add overview stage info to the stages
	let kids = React.Children.map(children, (Kid, i) => {
		// active?
		if (i != stageNum) {
			return null;
		}
		// clone with stageNum/path/key
		return React.cloneElement(Kid, {stageNum, stagePath, stageKey:i, maxStage});
	});
	// filter null again (we should now only have the active stage)
	kids = kids.filter(x => !! x);
	let activeStage = kids[0];

	return (<div className='Wizard'>
		<WizardProgressWidget stages={stages} stagePath={stagePath} stageNum={stageNum} />
		{kids}
	</div>);
};

const WizardNavButtons = ({stagePath, maxStage, navStatus}) => {
	assert(stagePath, "WizardProgressWidget.jsx - WizardNavButtons: no stagePath");
	let {next, previous, sufficient, complete} = navStatus;
	// read from WizardStage props if set, or setNavStatus
	// navStatus;
	if (complete) sufficient = true;
	let msg = sufficient===false? 'Please fill in more of the form' : null;
	return (<div className='nav-buttons clearfix'>
		{previous===false? null : <PrevButton stagePath={stagePath} /> }
		{next===false? null : <NextButton stagePath={stagePath} maxStage={maxStage}
			disabled={sufficient===false} complete={complete} title={msg} /> }
	</div>);
};

export {Wizard, WizardStage};
export default Wizard;
