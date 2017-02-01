import ServerIO from '../src/plumbing/ServerIO.js';
import C from '../src/C.js';

describe('ServerIO', function() {
    this.timeout(5000);

	 it('get charity', function(done) {
        ServerIO.getCharity('solar-aid')
            .then(function(results) {
                let charity = results.cargo;
                console.log("done", results);
                done();
            });
    });

});

