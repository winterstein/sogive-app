
import Enum from 'easy-enums';
import Roles from './base/Roles';

// share the base C object
import C from './base/CBase';

export default C;

/**
 * app config
 */
C.app = {
	name: "SoGive",
	service: "sogive",
	logo: "/img/SoGive-Light-70px.png",
	website: "https://sogive.org",
	homeLogo: "/img/logo-white-sm.png",
	facebookAppId: "1847521215521290",
	version: {app: '1.0.0'}
};

C.TYPES = new Enum("NGO User Donation RepeatDonation Project Event FundRaiser Basket Ticket Money Transfer");

C.ROLES = new Enum("editor admin company goodlooper");
C.CAN = new Enum("edit publish admin editEvent test uploadCredit goodloop manageDonations");
// setup roles
Roles.defineRole(C.ROLES.editor, [C.CAN.publish, C.CAN.editEvent]);
Roles.defineRole(C.ROLES.company, [C.CAN.uploadCredit]);
Roles.defineRole(C.ROLES.admin, C.CAN.values);
Roles.defineRole(C.ROLES.goodlooper, [C.CAN.edit, C.CAN.publish, C.CAN.goodloop]);

// Taken from: http://emailregex.com/
C.emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
