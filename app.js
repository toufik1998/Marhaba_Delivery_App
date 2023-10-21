const express = require("express")
const connectDb = require("./config/connectDb")
const dotenv = require("dotenv").config();
const cors = require("cors")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/authRoutes")
const clientRoutes = require("./routes/clientRoutes")
const deliveryRoutes = require("./routes/deliveryRoutes")
const managerRoutes = require("./routes/managerRoutes")

const app = express();
const port = process.env.PORT || 6666

// connect with DB
connectDb();

app.use(express.json());
app.use(cookieParser());

// CORS POLICY
app.use(cors());


// Load routes
app.use("/api/auth", authRoutes)
app.use("/api/user", clientRoutes);
app.use("/api/user", deliveryRoutes);
app.use("/api/user", managerRoutes)


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})