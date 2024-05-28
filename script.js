const express = require('express');
const app = express();
const port = 3000;
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'morpion',
    password: 'test54200',
    port: 5432,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    state TEXT,
    player TEXT
);
`;

pool.query(createTableQuery, (err, result) => {
    if (err) {
        console.error('Erreur lors de la création de la table : ', err);
    } else {
        console.log('La table games a été créée avec succès !');
    }
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit', (req, res) => {
    console.log(req.body);
    res.render('index');
});


app.get('/victory', (req, res) => {
    res.render('victory');
});


app.get('/newgame', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
