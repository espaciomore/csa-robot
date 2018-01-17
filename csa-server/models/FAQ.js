var mongoose = require('mongoose');
 
var FAQ_Schema = new mongoose.Schema({
    question: String,
    answer  : { type: String, default: '' },
    date    : { type: Date, default: Date.now }
});

FAQ_Schema.path('question').set(function (v) {
  return v.toLowerCase();
});

FAQ_Schema.path('answer').set(function (v) {
  return v.toLowerCase(v);
});

module.exports = mongoose.model('FAQ', FAQ_Schema);