import React from 'react';
import DataStore from '../plumbing/DataStore';


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
	if (stageKey !== stageNum) return null;
	return <div className='WizardStage'>{children}</div>;
};

export {WizardStage};
export default WizardProgressWidget;
