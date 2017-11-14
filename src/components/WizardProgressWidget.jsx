import React from 'react';
import DataStore from '../plumbing/DataStore';
import Misc from './Misc';
import {assMatch, assert} from 'sjtest';

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
	if (i === stageNum) {
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
		return null;
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
	if (stage===0 && diff < 0) return null; // no previous on start
	if (maxStage && stage===maxStage && diff > 0) return null; // no next on end
	return (
		<button className={`btn btn-${bsClass} btn-lg ${pull}`} onClick={changeTab} {...rest} >
			{text}
		</button>
	);
};

export {WizardStage, NextButton, PrevButton};
export default WizardProgressWidget;
