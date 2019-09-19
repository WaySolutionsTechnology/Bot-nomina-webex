var request = require('request');
const config = require('../config.json')

module.exports = {
    getUsuario(email) {
        return new Promise((resolve, reject) => {
            request.get('http://localhost:' + config.Port + '/api/user?email=' + email, function(err, res, body, req) {
                if (err) {
                    console.log(err);
                    reject(null)
                }
                resolve(body)
            });
        });
    }
}