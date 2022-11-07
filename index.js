const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hospitology server')
})

app.listen(port, () => {
    console.log('server running', port)
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6e9yqor.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        console.log('db connected');
        const doctorsCollection = client.db("hospitology").collection("doctors");

        app.get('/doctors', async (req, res) => {
            const result = await doctorsCollection.find({}).toArray()
            res.send(result)
        })


    } finally {

    }
}

run().catch(console.dir)

