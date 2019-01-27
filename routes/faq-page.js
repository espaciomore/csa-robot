var FAQ = require('../models/FAQ');

exports.find = function(req, res) {

    FAQ.find({'question': { $regex : new RegExp(req.body.question, "i") }}, function(err, items) {
        if(err) {
            console.log(err);
        } else {
            var len = items.length;
            if( len === 0 ) {
                res.send({});
            }
            else {
                var rand = Math.floor(Math.random() * len) % len;
                var answer = {
                    "_id": items[rand]._id,
                    "question": items[rand].question,
                    "answer": items[rand].answer
                };
                res.send(answer);
            }
        }
    });
};

exports.getOne = function(req, res) {

    FAQ.findOne({'_id': req.params.id}, function(err, item) {
        if(err) {
            console.log(err);
        } else {
            var answer = {
                "_id": item._id,
                "question": item.question,
                "answer": item.answer
            };
            res.send(answer);
        }
    });
};

exports.getAll = function(req, res) {

    FAQ.find({}, function(err, items) {
        if(err) {
            console.log(err);
        } else {
            var answers = [];
            for(var i=0; i < items.length; i++) {
                answers.push({
                    "_id": items[i]._id,
                    "question": items[i].question,
                    "answer": items[i].answer
                });
            }
            res.send(answers);
        }
    });
};

exports.addNew = function(req, res) {

	if(!Array.isArray(req.body)) {
		res.send(400);
	}

	for(var i=0; i < req.body.length; i++) {
        FAQ.create(req.body[i], function(err, result) {
    		if(err) {
        		console.log(err);
        	}
        });
	}

    res.send(201);
};

exports.updateAll = function(req, res) {

    if(!Array.isArray(req.body)) {
        res.send(400);
    }

    for(var i=0; i < req.body.length; i++) {
        FAQ.update(req.body[i], function(err, result) {
            if(err) {
                console.log(err);
            }
        });
    }

    res.send(202);
};

exports.updateOne = function(req, res) {

    FAQ.update({'_id': req.params.id}, req.body, function(err, result) {
        if(err) {
            console.log(err);
            res.send(500);
        } else {
            res.send(202);
        }
    });
};

exports.deleteOne = function(req, res) {

    FAQ.remove({'_id': req.params.id}, function(err, result) {
        if(err) {
            console.log(err);
            res.send(500);
        } else {
            res.send(202);
        }
    });
};