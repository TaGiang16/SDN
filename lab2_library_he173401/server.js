const express = require('express');
const app = express();
const morgan = require('morgan');
const connectDB = require('./config/db');

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes'));

app.get('/', async(req, res)=>{
    try {
        res.send({message: 'Welcome to Practical Exam!'});
    } catch (error) {
        res.send({error: error.message});
    }
});


app.listen(process.env.PORT || 9999, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 9999}`);
    connectDB();
});