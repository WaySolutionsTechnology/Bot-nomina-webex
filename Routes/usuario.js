const router = require('express').Router();
let mongoose = require('../config/conexion');
let Usuario = require('../models/cliente');


router.get('/user', (req, res, next) => {
    const email = req.query.email;
    Usuario.findOne({ email: email }, (err, usuario) => {
        if (err) return next(err);
        if (usuario) {
            res.send(true);
        } else {
            res.send(false);
        }
    });
});

module.exports = router;