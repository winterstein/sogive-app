import React from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';

export const LearnAboutRatings = ({isButton}) => {
	const [ratingsModalOpen, setRatingsModalOpen] = React.useState(false);
	const toggle = () => setRatingsModalOpen(!ratingsModalOpen)

	return (
		<>
			{isButton ? <Button outline onClick={toggle} color="primary">Learn about our ratings</Button>:<button onClick={toggle} className="ratings-button">Learn about our ratings</button>}
			<Modal isOpen={ratingsModalOpen} toggle={toggle}>
				<ModalHeader toggle={toggle}>Our ratings</ModalHeader>
				<ModalBody>
					<ul>
						<li>Gold means we have high confidence and strong evidence that the charity’s work is effective, and that its cost-effectiveness outperforms the Gold Standard.</li>
						<li>Silver means that we have high confidence that the charity’s work is effective, though its cost-effectiveness likely falls behind the Gold Standard.</li>
						<li>Bronze means that we have high confidence that the charity’s work is effective, though its cost-effectiveness likely falls well behind the Gold Standard.</li>
						<li>Not recommended means that we do not have good evidence that the charity’s work is effective, and that we do have confidence that its cost-effectiveness underperforms the Gold Standard.</li>
						<li>Too Rich means we believe the charity already has lots of money, so donations will likely have minimal impact for some time.</li>
						<li>More info needed means we do not have good evidence that the charity’s work is effective, nor do we have an indication of its cost-effectiveness.</li> 
					</ul>
				</ModalBody>
			</Modal>
		</>
	)
}