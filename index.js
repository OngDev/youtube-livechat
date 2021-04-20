import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

import {fetchMessages, getAuthors, getMessages} from "./services.js";

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

(async () => {
    try {
        await fetchMessages();
    } catch (e) {
        console.error(e.message)
    }
})();
app.get('/messages', async (req, res) => {
    res.send(getMessages());
});
app.get('/authors', async (req, res) => {
    res.send(getAuthors());
});
app.get('/messages/:id/archive', async (req, res) => {
    const {id} = req.params;
    await archiveMessage(id);
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