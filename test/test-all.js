
import testServerIO from './test.ServerIO.js';

import $ from 'jquery';
import Login from 'hooru';

$(function(){

    $('#loginstatus').html("Login status: "+Login.getId());
    Login.verify().then(function(){
        $('#loginstatus').html("Login status: "+Login.getId());
    });

});