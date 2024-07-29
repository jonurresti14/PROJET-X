const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlFilePath = process.env.IFRAME_URL_PATH;
const notesFilePath = process.env.NOTES_PATH;
const usersFilePath = process.env.USERS_PATH;

app.post('/verify-password', (req, res) => {
    const { password, username } = req.body;
    if (password === process.env.SECRET_PASSWORD) {
        addUser(username);
        res.cookie('username', username, { httpOnly: true });
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get('/get-url', (req, res) => {
    fs.readFile(urlFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error leyendo la URL');
            return;
        }
        res.send(data);
    });
});

app.post('/save-url', (req, res) => {
    const url = req.body.url;
    fs.writeFile(urlFilePath, url, (err) => {
        if (err) {
            res.status(500).send('Error guardando la URL');
            return;
        }
        res.send('URL guardada');
    });
});

app.get('/get-notes', (req, res) => {
    fs.readFile(notesFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error leyendo las notas');
            return;
        }
        res.send(data);
    });
});

app.post('/save-notes', (req, res) => {
    const notes = req.body.notes;
    fs.writeFile(notesFilePath, notes, (err) => {
        if (err) {
            res.status(500).send('Error guardando las notas');
            return;
        }
        res.send('Notas guardadas');
    });
});

app.get('/get-users', (req, res) => {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error leyendo los usuarios');
            return;
        }
        res.send(data);
    });
});

app.post('/remove-user', (req, res) => {
    const username = req.body.username;
    removeUser(username);
    res.send('Usuario desverificado');
});

function addUser(username) {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error leyendo los usuarios');
            return;
        }
        const users = data ? data.split('\n').filter(u => u) : [];
        if (!users.includes(username)) {
            users.push(username);
            fs.writeFile(usersFilePath, users.join('\n'), (err) => {
                if (err) console.error('Error guardando el usuario');
            });
        }
    });
}

function removeUser(username) {
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error leyendo los usuarios');
            return;
        }
        let users = data ? data.split('\n').filter(u => u) : [];
        users = users.filter(u => u !== username);
        fs.writeFile(usersFilePath, users.join('\n'), (err) => {
            if (err) console.error('Error eliminando el usuario');
        });
    });
}

app.listen(port, () => {
    console.log(`App escuchando en http://localhost:${port}`);
});
