'use strict';

const { WebhookClient } = require('dialogflow-fulfillment');
const express = require('express');
const app = express();
var localtunnel = require('localtunnel');
const config = require('./config.json');
const cors = require('cors');
const bodyParser = require('body-parser');
let mongoose = require('./config/conexion');
const usuarioRotes = require('./Routes/usuario');
const { getUsuario } = require('./Services/servicesUsuario');


const ciscospark = require(`ciscospark`);
const teams = ciscospark.init({
    credentials: {
        access_token: config.access_token
    }
});

if (mongoose.STATES[mongoose.connection.readyState] == 'connecting') {
    app.listen(config.Port, function() {
        console.info(`Webhook listening on port ${config.Port}!`)
    });
} else {
    console.log("Base de datos no disponible");
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// routes
app.use('/api', usuarioRotes);


function messages(agent, fileUrl, mns) {
    return new Promise((resolve, reject) => {
        resolve(true);
        teams.messages.create({
            markdown: `**${mns}**`,
            files: fileUrl,
            roomId: agent.originalRequest.payload.data.data.roomId
        }).then(() =>
            teams.messages.create({
                text: `¿Puedo ayudarte con algo más? solo di consultar`,
                roomId: agent.originalRequest.payload.data.data.roomId
            })
        )

    });
}

function generateTunnel() {
    return new Promise((resolve, reject) => {
        localtunnel(config.Port, { subdomain: config.subDomine }, function(err, tunnel) {
            if (err) {
                console.log(err);
                reject(err)
            }
            tunnel.url;
            resolve(tunnel.url);
        });
    });
}
async function localTunnel() {
    let response = await generateTunnel();
    console.log(response);
}
// localTunnel();


async function consultarInspeccionNumero(agent) {
    try {
        console.log(agent);

        var data = await getUsuario(agent.originalRequest.payload.data.data.personEmail);
        if (data == 'false') {
            agent.add('No existe registro con ese número. ¿Puedo ayudarte con algo más? solo di consultar');

        } else {
            let email = agent.originalRequest.payload.data.data.personEmail;
            email = email.substring(0, email.lastIndexOf("@"));

            agent.add('Por favor espere un momento');
            let fileUrl = config.ngGrok + config.path + email;
            // let fileUrl = config.Tunnel + config.path + email;



            if (agent.contexts[0].parameters.Evento == 'Desprendible de nómina') {

                fileUrl = fileUrl + 'Nomina.pdf';
                await messages(agent, fileUrl, 'Desprendible de nómina');

            } else if (agent.contexts[0].parameters.Evento == 'Certificación laboral') {
                fileUrl = fileUrl + 'CertiLaboral.pdf';
                await messages(agent, fileUrl, 'Certificación laboral');

            } else if (agent.contexts[0].parameters.Evento == 'Certificado de retención') {
                fileUrl = fileUrl + 'CertiRetenciones.pdf';
                await messages(agent, fileUrl, 'Certificado de retención');

            }
        }
    } catch (error) {
        console.log(error);
    }
}

function WebhookProcessing(req, res) {
    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();
    intentMap.set('Actividad', consultarInspeccionNumero);
    agent.handleRequest(intentMap);
}


// Webhook
app.post('/', function(req, res) {
    WebhookProcessing(req, res);
});