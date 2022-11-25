const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        const doctorsCollection = client.db("hospitology").collection("doctors");
        const bookingsCollection = client.db("hospitology").collection("bookings");
        const usersCollection = client.db("hospitology").collection("users");
        console.log('db connected');

        app.get('/doctors', async (req, res) => {
            const result = await doctorsCollection.find({}).toArray()
            res.send(result)
        })

        app.get('/searchdoctors', async (req, res) => {
            const branch = req.query.branch;
            const department = req.query.department;
            if (department === '' || branch === '') {
                return
            }
            const result = await doctorsCollection.find({ branch: { $regex: branch, $options: 'i' }, department: { $regex: department, $options: 'i' } }).toArray()
            res.send(result)
        })

        app.get('/doctors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await doctorsCollection.findOne(query)
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const query = { date: booking.date, doctor: booking.doctor, slot: booking.slot, name: booking.name }
            const exist = await bookingsCollection.findOne(query)
            if (exist) {
                return res.send({ success: false, booking: booking })
            } else {
                const result = await bookingsCollection.insertOne(req.body)
                return res.send({ success: true, result: result })
            }
        })

        app.get('/bookings', async (req, res) => {
            const query = req.query;
            const result = await bookingsCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const updatedUser = {
                $set: user,
            }
            const result = await usersCollection.findOne(filter, updatedUser, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            res.send({ result, token })
        })


        // app.get('/available', async (req, res) => {
        //     const date = req.query.date;
        //     const doctor = req.query.doctor;
        //     const query = { date: date, doctor: doctor }
        //     const doctors = await doctorsCollection.find().toArray()
        //     const bookings = await bookingsCollection.find(query).toArray()
        //     doctors.forEach(doc => {
        //         const servicebooked = bookings.filter(book => book.doctor === doc.name)
        //         const bookslot = servicebooked.map(book => book.slot)
        //         const available = doc.visithour.filter(slot => !bookslot.includes(slot))
        //         doc.visithour = available
        //     })
        //     res.send(doctors)
        // })

    } finally {

    }
}

run().catch(console.dir)
