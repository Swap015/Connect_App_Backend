import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.mjs';

const app = express();
const PORT = process.env.PORT || 7000;
app.use(express.json());
app.use(cors());


// connection to database
connectDB();

//routes
app.get('/', (req, res) => {
    res.send("API is working properly ✅");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});