const express = require("express")
const connectDb = require("./config/connectDb")
const dotenv = require("dotenv").config();
const cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express();
const port = process.env.PORT || 6666

// connect with DB
connectDb();

app.use(express.json());
app.use(cookieParser());

// CORS POLICY
app.use(cors());


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})