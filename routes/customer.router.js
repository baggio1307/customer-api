var express = require('express');
var logger = require('./../lib/logger');
var router = express.Router();
var Customer = require('../models/customer.model.js');
const uuid = require('uuid/v4');


router.get('/:id*?', function (req, res) {
    console.log("params: ", req.query);
    if (req.params.id) {
        Customer.find({
            id: req.params.id
        }, function (err, result) {
            res.json(result);
        });
    } else {

        var reservedWords = ['order', 'page', 'pageSize'];

        var reqParams = req.query;

        //order, page, pageSize
        var page = parseInt(reqParams.page) || 1;
        var pageSize = parseInt(reqParams.pageSize) || 20;

        //FILTERS
        var objectKeys = Object.getOwnPropertyNames(reqParams);
        var mongoFilterObj = {};
        objectKeys.forEach(function (el) {
            if (reservedWords.indexOf(el) == -1) {
                mongoFilterObj[el] = reqParams[el];
            }
        });
        var query = Customer.find(mongoFilterObj);
        Customer.count(mongoFilterObj, function (err, totalCount) {
            console.log("Count total: ", totalCount);
            var pages = Math.ceil(totalCount / pageSize);
            console.log("Count total: ", totalCount);
            console.log("Pages: ", pages);
            //ORDER
            if (reqParams.order) {
                var mongoOrderObj = {};
                var orders = reqParams.order.split(",");
                orders.forEach(function (el) {
                    mongoOrderObj[el.startsWith("-") ? el.substr(1) : el] = el.startsWith("-") ? -1 : 1;
                });
                query.sort(mongoOrderObj);
            }
            query.limit(pageSize);
            query.skip(pageSize * (page - 1));
            query.exec(
                function (err, result) {
                    res.json({
                        hasNext: page < pages, //ou false
                        items: result
                    });
                }
            );

        });
    }
});


router.post('/', function (req, res, next) {
    var customer = req.body;
    if (!customer.id) {
        customer.id = uuid();
    }
    Customer.create(customer, function (err, item) {
        res.status(200).send(customer.id);
        if (next) next();
    });
});

router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    if (id) {
        Customer.remove({
            id: id
        }, function (err, result) {
            if (err)
                res.send(err);
            else {
                res.status(200).send();
                if (next) next();
            }
        });
    }
});

router.put('/:id', function (req, res, next) {
    var customer = req.body;
    var id = req.params.id;
    Customer.update({
        id: id
    }, customer, function (err, result) {
        res.status(200).send();
        if (next) next();
    });
});

module.exports = router;