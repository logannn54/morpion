const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'morpion',
  password: 'test54200',
  port: 5432,
});

const corsOption = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT'],  
  allowedHeaders: ['Content-Type'],
};

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOption));


pool.query(`
  CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    state TEXT NOT NULL,
    player CHAR(1) NOT NULL
  );
`);
app.get('/', async (req, res) => {
  res.render('index');
});

app.post('/newgame', async (req, res) => {
  try {
    await pool.query('INSERT INTO games(state, player) VALUES($1, $2)', [JSON.stringify([["", "", ""], ["", "", ""], ["", "", ""]]), 'X']);
    res.redirect('/game');
  } catch (error) {
    console.error('Error initializing new game:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/games', async (req, res) => {
  try {
    const newState = JSON.stringify([["", "", ""], ["", "", ""], ["", "", ""]]);
    const newPlayer = 'X';

    const result = await pool.query('INSERT INTO games(state, player) VALUES($1, $2) RETURNING id', [newState, newPlayer]);

    res.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating new game:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/api/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const { cell } = req.body;

    if (!cell) {
      res.status(400).json({ error: 'Cell not selected' });
      return;
    }

    const [i, j] = cell.split('-').map(Number);

    const result = await pool.query('SELECT state, player FROM games WHERE id = $1', [gameId]);
    const { state, player } = result.rows[0];
    let boardState = JSON.parse(state);

    if (boardState[i][j] !== '') {
      res.status(400).json({ error: 'Cell already filled' });
      return;
    }

    boardState[i][j] = player;

    const winner = checkWinner(boardState);
    if (winner) {
      await endGame(gameId, boardState, res);
    } else {
      const nextPlayer = player === 'X' ? 'O' : 'X';
      await pool.query('UPDATE games SET state = $1, player = $2 WHERE id = $3', [JSON.stringify(boardState), nextPlayer, gameId]);
      res.json({ state: boardState, player: nextPlayer });
    }

  } catch (error) {
    console.error('Error playing move:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/games/:id', async (req, res) => {
  try {
    const gameId = req.params.id;

    const result = await pool.query('SELECT state, player FROM games WHERE id = $1', [gameId]);
    const { state, player } = result.rows[0];
    const boardState = JSON.parse(state);

    res.json({ id: gameId, state: boardState, player });
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/game', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT state, player FROM games ORDER BY id DESC LIMIT 1');
    const { state, player } = result.rows[0] || { state: '[[ "", "", ""], ["", "", ""], ["", "", ""]]', player: 'X' };

    const boardState = JSON.parse(state);

    res.render('game', { currentPlayer: player, boardState });

    client.release();
  } catch (error) {
    console.error('Error fetching game state:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/submit', async (req, res) => {
  try {
    const { cell } = req.body;
    if (!cell) {
      res.redirect('/game');
      return;
    }

    const [i, j] = cell.split('-').map(Number);

    const client = await pool.connect();
    const result = await client.query('SELECT state, player FROM games ORDER BY id DESC LIMIT 1');
    const { state, player } = result.rows[0] || { state: '[[ "", "", ""], ["", "", ""], ["", "", ""]]', player: 'X' };

    let boardState = JSON.parse(state);
    if (boardState[i][j] !== '') {
      res.redirect('/game');
      return;
    }
    boardState[i][j] = player;

    const winner = checkWinner(boardState);
    if (winner) {
      let message;
      if (winner === 'draw') {
        message = 'Match nul.';
      } else {
        message = `Le joueur ${winner}, à gagné !`;
      }
      await client.query('INSERT INTO games(state, player) VALUES($1, $2)', [JSON.stringify([["", "", ""], ["", "", ""], ["", "", ""]]), 'X']);
      res.render('victory', { message, newGameRedirect: true });
      return;
    }

    const nextPlayer = player === 'X' ? 'O' : 'X';
    await client.query('INSERT INTO games(state, player) VALUES($1, $2)', [JSON.stringify(boardState), nextPlayer]);

    res.redirect('/game');

    client.release();
  } catch (error) {
    console.error('Error submitting move:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function endGame(gameId, boardState, res) {
  await pool.query('UPDATE games SET state = $1, player = $2 WHERE id = $3', [JSON.stringify([["", "", ""], ["", "", ""], ["", "", ""]]), 'X', gameId]);
  const winner = checkWinner(boardState);
  let message;
  if (winner === 'draw') {
    message = 'Match nul.';
  } else {
    message = `Le joueur ${winner}, à gagné !`;
  }
  res.render('victory', { message, newGameRedirect: true });
}

function checkWinner(morpion) {
  for (let i = 0; i < 3; i++) {
    if (morpion[i][0] !== '' && morpion[i][0] === morpion[i][1] && morpion[i][1] === morpion[i][2]) {
      return morpion[i][0];
    }
    if (morpion[0][i] !== '' && morpion[0][i] === morpion[1][i] && morpion[1][i] === morpion[2][i]) {
      return morpion[0][i];
    }
  }

  if (morpion[0][0] !== '' && morpion[0][0] === morpion[1][1] && morpion[1][1] === morpion[2][2]) {
    return morpion[0][0];
  }
  if (morpion[0][2] !== '' && morpion[0][2] === morpion[1][1] && morpion[1][1] === morpion[2][0]) {
    return morpion[0][2];
  }

  let isDraw = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (morpion[i][j] === '') {
        isDraw = false;
        break;
      }
    }
    if (!isDraw) {
      break;
    }
  }
  
  if (isDraw) {
    return 'draw';
  }

  return null;
}

app.listen(port, () => console.log(`Server listening on port ${port}`));