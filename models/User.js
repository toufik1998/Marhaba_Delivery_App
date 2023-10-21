const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },

    password: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: Number,
        required: true,
        trim: true
    },

    address: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
    },

    active: {
        type: Boolean,
        default: false
    }
});


const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;