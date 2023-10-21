const mongoose = require("mongoose")

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`Connection with the DB seccuss: ${connect.connection.host}, ${connect.connection.name}`);
    } catch (error) {
        console.log(err);
        process.exit(1);
    }
    

}
module.exports = connectDb;

