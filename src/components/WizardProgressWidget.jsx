import React from 'react';
import DataStore from '../plumbing/DataStore';
import Misc from './Misc';
import {assMatch, assert} from 'sjtest';

// TODO refactor a la Misc.CardAccordion

const WizardProgressWidget = ({stageNum, completed, stages, stagePath}) => {
	if ( ! stageNum) stageNum = 0;
	return (<div className='WizardProgressWidget'>
		{stages.map((stage, i) => <Stage key={i} stage={stage} stageNum={stageNum} i={i} completed={completed} stagePath={stagePath} />)}
	</div>);
};

const Stage = ({i, stage, stageNum, stagePath, completed}) => {
	// NB: if no completed info, assume all before stageNum are fine
	const complete = completed? completed[i] : i < stageNum;
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

const WizardStage = ({stageKey, stageNum, children}) => {
	if ( ! stageNum) stageNum=0;
	if (stageKey != stageNum) { // allow "1" == 1		
		return null; //<p>k:{stageKey} n:{stageNum}</p>;
	}
	return <div className='WizardStage'>{children}</div>;
};


/**
 * 
 * @param {
 * 	maxStage: {Number}
 * }
 */
const NextButton = ({completed, stagePath, ...rest}) => {
	const bsClass = completed ? 'primary' : null;
	return <NextPrevTab stagePath={stagePath} bsClass={bsClass} diff={1} text={<span>Next <Misc.Icon glyph='menu-right' /></span>} {...rest} />;
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
		// HACK: put it in the url?
		if (stagePath.length===3 && stagePath[0]==='location' && stagePath[1]==='params') {
			DataStore.setUrlValue(stagePath[2], n);	
		} else {
			DataStore.setValue(stagePath, n);
		}
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
	let stages = children.map( (kid, i) => {
		return {title: kid.props && kid.props.title? kid.props.title : 'Step '+i};	
	});
	const kids = React.Children.map(children, (Kid, i) => {
		// clone with stageNum
		return React.cloneElement(Kid, {stageNum, stageKey:i});
	});
	return (<div className='Wizard'>
		<WizardProgressWidget stages={stages} stagePath={stagePath} stageNum={stageNum} />
		{kids}
	</div>);
};

export {Wizard, WizardStage, WizardProgressWidget, NextButton, PrevButton};
export default Wizard;
