const connectToMongo = require('./db');
const express = require('express')
const cors = require('cors')
const path = require('path')
const commonRoutes = require('./routes/commonRoutes');

connectToMongo();

const app = express()
const port = 5000

app.use(cors())
app.use(express.json());

app.use('/', commonRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactions'));

app.get('/', (req, res) => {
    res.send(`Server Started on port ${port}.`);
})

app.listen(port, () => {
    console.log(`Elevate-financials listening at http://localhost:${port}`)
})