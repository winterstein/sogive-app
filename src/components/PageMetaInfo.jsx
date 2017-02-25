
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import SJTest, {assert} from 'sjtest';
import ServerIO from '../plumbing/ServerIO';
import printer from '../utils/printer.js';
import C from '../C.js';
import NGO from '../data/charity/NGO';
import Misc from './Misc.jsx';
import Login from 'hooru';
import StripeCheckout from 'react-stripe-checkout';
import {XId,uid} from 'wwutils';
import {Text} from 'react-bootstrap';
import Helmet from "react-helmet";

class PageMetaInfo extends React.Component {	

	componentWillMount() {
// 		// insert into head
// 		const props = {
// 			url: window.location,
// 			type: 
// 		}
// 		<meta property="og:url" content="http://www.your-domain.com/your-page.html"},
//   <meta property="og:type" content="website"},
//   <meta property="og:title" content="Your Website Title"},
//   <meta property="og:description" content="Your description"},
//   <meta property="og:image" content="http://www.your-domain.com/path/image.jpg"},
//   </div>
// 	);

	}

	render() {				
		let url = ""+window.location;
		let title = 'SoGive';
		let description = 'See the impact of your donations';
		let image = this.props.image || 'https://app.sogive.org/img/SoGive-Light-70px.png';
		// chop the ? - we keep page info in # + slug
		// if (url.indexOf('?')) url = url.substr(0, url.indexOf('?'));
		return(<div><Helmet 
			title={title}
			meta={[
				{name: "description", content: description },
				{property: "og:description", content: description },
				{property: "og:url", content: url },
				{property: "og:title", content: title },
				{property: "og:image", content: title },
				{property: "twitter:card", content: "summary" },
				{property: "twitter:site", content: "@sogivecharity" },
				{property: "twitter:title", content: title },
				{property: "twitter:description", content: description },
				{property: "twitter:image", content: image},
			]}
			link={[
				{rel: "canonical", href: url},
			]}
		></Helmet>where is my page info?</div>);
	}

}

export default PageMetaInfo;
