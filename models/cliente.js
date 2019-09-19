let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let usuario = new Schema({
    celular: { type: Number }
}, { versionKey: false });

let Usuario = mongoose.model('Usuarios', usuario);

module.exports = Usuario;