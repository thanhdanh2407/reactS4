var express = require('express');
var router = express.Router();
var bookModel = require('../schemas/book')
var ResHelper = require('../helper/ResponseHelper');

router.get('/', async function (req, res, next) {
  let limit = req.query.limit ? req.query.limit : 5;
  let page = req.query.page ? req.query.page : 1;
  let sortQuery = {};
  if (req.query.sort) {
    if (req.query.sort.startsWith('-')) {
      let field = req.query.sort.substring(1, req.query.sort.length);
      sortQuery[field] = -1;
    } else {
      sortQuery[req.query.sort] = 1;
    }
  }
  var queryName = req.query.name.replace(',', "|");
  let books = await bookModel.find(
    {
      isDeleted: false,
      name: new RegExp(queryName, 'i')
    })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort(sortQuery)
    .exec();
  ResHelper.RenderRes(res, true, books)
});

router.get('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.find({ _id: req.params.id }).exec();
    ResHelper.RenderRes(res, true, book)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

router.post('/', async function (req, res, next) {
  try {
    var newbook = new bookModel({
      name: req.body.name,
      year: req.body.year,
      author: req.body.author
    })
    await newbook.save();
    ResHelper.RenderRes(res, true, newbook)
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});
router.put('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.findByIdAndUpdate
      (req.params.id, req.body, {
        new: true
      }).exec()
    ResHelper.RenderRes(res, true, book);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});


router.delete('/:id', async function (req, res, next) {
  try {
    let book = await bookModel.findByIdAndUpdate
      (req.params.id, {
        isDeleted: true
      }, {
        new: true
      }).exec()
    ResHelper.RenderRes(res, true, book);
  } catch (error) {
    ResHelper.RenderRes(res, false, error)
  }
});

module.exports = router;
