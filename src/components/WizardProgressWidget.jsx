import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, { assert, assMatch } from 'sjtest';
import Login from 'you-again';
import printer from '../utils/printer.js';
import {modifyHash} from 'wwutils';
import C from '../C';
import Roles from '../Roles';
import Misc from './Misc';
import DataStore from '../plumbing/DataStore';
import ServerIO from '../plumbing/ServerIO';
import {getType, getId, nonce} from '../data/DataClass';

const WizardProgressWidget = ({stageNum, completed, stages, stagePath}) => {
	if ( ! stageNum) stageNum = 0;
	return (<div className='WizardProgressWidget'>
		{stages.map((stage, i) => <Stage key={i} stage={stage} stageNum={stageNum} i={i} completed={completed} stagePath={stagePath} />)}
	</div>);
};

const Stage = ({i, stage, stageNum, stagePath, completed}) => {
	// NB: if no completed info, assume all before stageNum are fine
	const complete = completed? completed[i] : i < stageNum;
	let c = i===stageNum? 'active' : (complete? 'complete' : '');
	return (<div className={'Stage '+c} 
		onClick={() => {
			if (complete && stagePath) DataStore.setValue(stagePath, i);
	}}>
		<h5 className='text-center above'>{stage.title}</h5>
		<center>
			<span className='marker'>&#11044;</span>
		</center>
		<hr className='line' />
		<h5 className='text-center below'>{stage.title}</h5>
	</div>);
};

const WizardStage = ({stageKey, stageNum, children}) => {
	if (stageKey !== stageNum) return null;
	return <div className='WizardStage'>{children}</div>;
};

export {WizardStage};
export default WizardProgressWidget;
