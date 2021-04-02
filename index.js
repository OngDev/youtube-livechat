import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import {fetchMessages, getMessages} from "./services.js";

const app = express()

app.use(helmet())
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
app.get('/messages/:id', async (req, res) => {
    const {id} = req.params;
    archiveMessage(id);
    res.send();
});
app.use('/', (req, res) => {
    res.send("Hế lô hế lô, Ông Dev đây!");
})

app.use((err, req, res) => {
    res.status(404).send("chán")
})

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})