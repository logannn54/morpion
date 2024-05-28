const express = require('express');
const app = express();
const port = 3000;

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
