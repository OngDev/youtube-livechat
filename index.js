import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

import {getAuthors, getMessages, archiveMessage, initialize, stopFetching} from "./services.js";

const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://unpkg.com/vue@next'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/css', 'https://use.fontawesome.com/releases/v5.12.0/css/all.css'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }));
app.use(morgan('tiny'))
app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static('./public'));

app.get('/messages', async (req, res) => {// messages?type=...
    const {type} = req.query;
    res.send(getMessages(type));
});
app.get('/authors', async (req, res) => {
    res.send(getAuthors());
});
app.get('/init', async(req, res) => {
    res.send(await initialize());
})
app.get('/stop', (req, res) => {
    stopFetching();
    res.status(200).end();
})
app.get('/messages/:id/archive', (req, res) => {
    const {id} = req.params;
    archiveMessage(id);
    res.status(200).end();
});
app.use('/', (req, res) => {
    res.send("Hế lô hế lô, Ông Dev đây!");
})

app.use((err, req, res) => {
    res.status(404).send("chán")
})

const PORT = process.env.PORT || 3333;
httpServer.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
});

export default io;