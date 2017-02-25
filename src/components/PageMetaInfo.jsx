
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
import {Title,Meta,Link} from "../utils/reacthead.jsx";

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
		const charity = this.props.charity || {};
		let title = charity.name? 'SoGive: '+charity.name : 'SoGive';
		let description = charity.description || 'See the impact of your donations';
		let image = charity.image || charity.logo || 'https://app.sogive.org/img/SoGive-Light-70px.png';
		// chop the ? - we keep page info in # + slug
		// if (url.indexOf('?')) url = url.substr(0, url.indexOf('?'));
		return(<div>
			<Title title={title} />
			<Meta name='description' content={description} />
			<Meta property="og:description" content={description }/>
			<Meta property="og:url" content={url }/>
			<Meta property="og:title" content={title}/>
			<Meta property="og:image" content={image}/>
			<Meta property="twitter:card" content={"summary" }/>
			<Meta property="twitter:site" content={"@sogivecharity" }/>
			<Meta property="twitter:title" content={title}/>
			<Meta property="twitter:description" content={description}/>
			<Meta property="twitter:image" content={image}/>
			<Link rel="canonical" href="url" />
		</div>);
	}

}

export default PageMetaInfo;
