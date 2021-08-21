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
						<li><b>Gold</b> means we have high confidence and strong evidence that the charity’s work is effective, and that its cost-effectiveness outperforms the Gold Standard.</li>
						<li><b>Silver</b> means that we have high confidence that the charity’s work is effective, though its cost-effectiveness likely falls behind the Gold Standard.</li>
						<li><b>Bronze</b> means that we have high confidence that the charity’s work is effective, though its cost-effectiveness likely falls well behind the Gold Standard.</li>
						<li><b>Not recommended</b> means that we do not have good evidence that the charity’s work is effective, and that we do have confidence that its cost-effectiveness underperforms the Gold Standard.</li>
						<li><b>Too rich</b> means we believe the charity already has lots of money, so donations will likely have minimal impact for some time.</li>
						<li><b>More info needed</b> means we do not have good evidence that the charity’s work is effective, nor do we have an indication of its cost-effectiveness.</li>
						<li><b>More info needed (promising)</b> means we do not have sufficient evidence that the charity’s work is effective, nor do we have sufficient indication of its cost-effectiveness. However, we have some reason to think the charity’s efficacy might be promising, pending additional information.</li>
					</ul>
				</ModalBody>
			</Modal>
		</>
	)
}