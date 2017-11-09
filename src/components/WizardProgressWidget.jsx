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

const WizardProgressWidget = ({stageNum, completed, stages}) => {
	if ( ! stageNum) stageNum = 0;
	return (<div className='WizardProgressWidget'>
		{stages.map((stage, i) => <Stage key={i} stage={stage} stageNum={stageNum} i={i} completed={completed} />)}
	</div>);
};

const Stage = ({i, stage, stageNum, completed}) => {
	// NB: if no completed info, assume all before stageNum are fine
	const complete = completed? completed[i] : i < stageNum;
	let c = i===stageNum? 'active' : (complete? 'complete' : '');
	return (<div className={'Stage '+c} >
		{stage.title}
	</div>);
};

export default WizardProgressWidget;
