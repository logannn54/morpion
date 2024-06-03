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



app.post('/newgame', (req, res) => {
    pool.query('INSERT INTO games (state, player) VALUES ($1, $2) RETURNING id', ['.........', 'X'], (err, result) => {
        if (err) {
            console.error('Erreur lors de la création d\'une nouvelle partie : ', err);
            res.sendStatus(500);
        } else {
            res.redirect(`/game/${result.rows[0].id}`);
        }
    });
});




app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    pool.query('SELECT state FROM games WHERE id = $1', [gameId], (err, result) => {
        if (err) {
            console.error('Erreur lors de la récupération de l\'état de la partie : ', err);
            res.sendStatus(500);
        } else {
            const gameState = result.rows[0].state;
            res.render('game', { gameState, gameId });
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
