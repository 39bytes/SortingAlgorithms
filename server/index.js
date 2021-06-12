const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const dir = path.join(__dirname, '..', 'public');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(dir));

app.get('/', (req, res) => {
	res.sendFile(path.join(dir, 'index.html'));
});

app.listen(3000, () => { // Listen on port 3000
    console.log('Listening!') // Log when listen success
})

