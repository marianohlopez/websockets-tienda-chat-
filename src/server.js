import express, { json, urlencoded } from 'express';
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import router from "./routes/index.js";
import { Server as IOServer } from 'socket.io';
import moment from 'moment'
import Contenedor from './api.js';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(json());

app.use(urlencoded({ extended: true }));

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main.html',
    layoutsDir: join(__dirname, '/views/layouts'),
    partialsDir: join(__dirname, '/views/partials')
}));

app.set('view engine', 'hbs');
app.set('views', join(__dirname, '/views'));

app.use('/', router)

const expressServer = app.listen('3000', () => {
    console.log("server listening port 3000");
})

const io = new IOServer(expressServer);

const api = new Contenedor('./src/productos.txt')

const messages = [];

const save = async (message) => {
    await fs.promises.writeFile('./src/chat.txt', JSON.stringify(message, null, 2))
}

app.use(express.static(__dirname + "/views/layouts"));

const time = moment().format('DD MM YYYY hh:mm:ss')
io.on("connection", async (socket) => {
    console.log(`New connection, socket ID: ${socket.id}`);

    socket.emit("server:message", messages);

    socket.emit("server:product", await api.getAll());

    socket.on("client:message", async (messageInfo) => {
        messages.push({ ...messageInfo, time });
        await save(messages)
        io.emit("server:message", messages);
    });

    socket.on("client:product", async (product) => {
        await api.save(product.title, product.price, product.thumbnail)
        io.emit("server:product", await api.getAll());
    })
});

app.on('error', (err) => {
    console.log(err);
})

