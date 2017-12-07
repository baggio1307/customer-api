var logger = require('./../lib/logger');
var Mongoose = require('mongoose');
var moment = require('moment');
var mongoose_delete = require('mongoose-delete');

var customerSchema = new Mongoose.Schema({
    code: String,
    name: String,
    address: String,
    dateOfbirth: Date,
},
{
    timestamps: true
});

customerSchema.plugin(mongoose_delete, { deletedAt : true });

var Customer = Mongoose.model('Customer', customerSchema);

module.exports = Customer;
