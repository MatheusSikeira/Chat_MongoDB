const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const mongoose = require('mongoose');

const ejs = require('ejs');
const path = require('path');

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do motor de visualização EJS para arquivos .html
app.set('views', path.join(__dirname, 'public'));      // Pasta onde estão os arquivos HTML/EJS
app.set('view engine', 'html');                        // Extensão dos arquivos
app.engine('html', ejs.renderFile);                    // Usar EJS para renderizar .html

// Rota principal
app.get('/', (req, res) => {
    res.render('index'); // Isso vai buscar ./public/index.html com EJS
});

function connectDB() {

    //let dbURL = 'Colocar link do banco de dados mongoDB, nome de usuario e senha.'

    mongoose.connect(dbURL);
    
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    mongoose.connection.once('open', function(){
        console.log('ATLAS MONGODB CONECTADO COM SUCESSO!');
    })
}

connectDB();

let Message = mongoose.model('Message', {usuario:String, data_hora:String, message:String});

// Array que simula o banco de dados
let messages = [];

Message.find({})
    .then(docs => {
        messages = docs
    }).catch(error=>{
        console.log(error);
    });
io.on('connection', socket => {
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);

    // Envia as mensagens anteriores ao novo cliente
    socket.emit('previousMessage', messages);

    // Lógica de recepção de mensagens
    socket.on('sendMessage', data => {
        // messages.push(data);
        let message = new Message(data);
        message.save()
            .then()
            .catch(error => {
                console.log(error);
            })
        socket.broadcast.emit('receivedMessage', data);
        console.log('Quantidade De Mensagens: ' + messages.length);
    });
});

server.listen(3000, () => {
    console.log('CHAT RODANDO EM - http://localhost:3000');
});