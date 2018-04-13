
import Enum from 'easy-enums';
import Roles from './base/Roles';

const C = {};
export default C;
// also for debug
window.C = C;

/**
 * hack: local, test, or ''
 */
C.SERVER_TYPE = ''; // production
if (window.location.host.indexOf("test")===0) C.SERVER_TYPE = 'test';
else if (window.location.host.indexOf("local")===0) C.SERVER_TYPE = 'local';
// local servers dont have https
C.HTTPS = C.SERVER_TYPE==='local'? 'http' : 'https';
C.isProduction = () => C.SERVER_TYPE!=='local' && C.SERVER_TYPE!=='test';

/**
 * app config
 */
C.app = {
	name: "SoGive",
	service: "sogive",
	logo: "/img/SoGive-Light-70px.png",
	facebookAppId: "1847521215521290"
};

/**
 * Special ID for things which dont yet have an ID
 */
C.newId = 'new';

C.TYPES = new Enum("NGO User Donation Project Event FundRaiser Basket Ticket Money Transfer");

/** dialogs you can show/hide.*/
C.show = new Enum('LoginWidget');

C.KStatus = new Enum('DRAFT PUBLISHED MODIFIED REQUEST_PUBLISH PENDING ARCHIVED TRASH ALL_BAR_TRASH');

C.STATUS = new Enum('loading clean dirty saving');

C.CRUDACTION = new Enum('new save publish discard-edits delete');

C.ROLES = new Enum("editor admin company goodlooper");
C.CAN = new Enum("edit publish admin editEvent test uploadCredit goodloop manageDonations");
// setup roles
Roles.defineRole(C.ROLES.editor, [C.CAN.publish, C.CAN.editEvent]);
Roles.defineRole(C.ROLES.company, [C.CAN.uploadCredit]);
Roles.defineRole(C.ROLES.admin, C.CAN.values);
Roles.defineRole(C.ROLES.goodlooper, [C.CAN.edit, C.CAN.publish, C.CAN.goodloop]);
