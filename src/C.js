
import Enum from 'easy-enums';

const C = {};
export default C;
// also for debug
window.C = C;

/**
 * app config
 */
C.app = {
	name: "SoGive",
	service: "sogive",
	logo: "/img/SoGive-Light-70x70.png"
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

