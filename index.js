const express = require('express');
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('hospitology server')

})

app.listen(port, () => {
    console.log('server running', port)
})
