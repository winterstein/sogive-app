
import Enum from 'easy-enums';

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
/**
 * app config
 */
C.app = {
	name: "SoGive",
	service: "sogive",
	logo: "/img/SoGive-Light-70px.png"
};

/**
 * Special ID for things which dont yet have an ID
 */
C.newId = 'new';

C.TYPES = new Enum("Charity User Donation Project");

/** dialogs you can show/hide.*/
C.show = new Enum('LoginWidget');

C.KStatus = new Enum('DRAFT PUBLISHED MODIFIED REQUEST_PUBLISH PENDING ARCHIVED TRASH');

C.STATUS = new Enum("DRAFT PUBLISHED");

