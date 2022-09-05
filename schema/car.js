const mongoose = require('mongoose')

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    nrDoors: {
        type: Number,
        required: true
    },
    fuel: {
        type: String,
        required: true,
    },
    bootCapacity: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Car', carSchema)