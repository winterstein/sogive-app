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
						<li>When we describe an organisation as <b>Gold</b>-rated, we mean that the organisation's work likely outperforms that of a Silver-rated organisation, and likely outperforms a Bronze-rated organisation by a substantial margin, as assessed considering cost-effectiveness and evidence of effectiveness. A gold charity is an outperformer.</li>
						<li>When we describe an organisation as <b>Silver</b>-rated, we mean that the organisation's work likely outperforms that of a Bronze-rated organisation, typically by a substantial margin, but underperforms compared to a Gold-rated organisation. A silver charity is an outperformer.</li>
						<li>When we describe an organisation as <b>Bronze</b>-rated, we mean that that the organisation's work likely has a positive impact, but underperforms compared to a Silver or Gold-rated charity. A Bronze-rated organisation may underperform a silver charity by a substantial margin. By assigning a charity or organisation a Bronze rating, we are not guaranteeing that the organisation does have net positive impact, however we are expressing confidence that the charity's impact underperforms our Gold Standard Benchmarks</li>
					</ul>
				</ModalBody>
			</Modal>
		</>
	)
}