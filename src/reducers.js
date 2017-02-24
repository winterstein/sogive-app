import { combineReducers } from 'redux';
import donationForm from './components/DonationForm-reducer';
import login from './components/LoginWidget/LoginWidget-reducer';

export default combineReducers({
	donationForm,
	login,
});

