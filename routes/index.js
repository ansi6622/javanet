var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Javascript kNN Exercise' });
});
router.get('/img', function(req, res, next) {
  res.render('img', { title: 'Javascript kNN Exercise with an image!!!!' });
});

module.exports = router;
