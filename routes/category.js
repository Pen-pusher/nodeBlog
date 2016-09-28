var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var db = require("monk")("localhost/nodeblog");

// Add Categories
router.get("/add", function(req, res, next) {
  res.render("category", {
    "title": "Add Category"
  });
});

router.post("/add", function(req, res, next) {
  // Get Fields
  var title = req.body.title;
  // console.log(title);

  //form Validation
  req.checkBody("title", "Title Required").notEmpty();

  //Check Errors
  var errors = req.validationErrors();
 //  console.log(errors);

  if(errors) {
    res.render("category", {
      "errors": errors,
      "title": title
    });
  } else {
    var categories = db.get("categories");

   // Add to database
    categories.insert({
      "title": title
    }, function(err, category) {
      if(err){
        console.log(err);
        res.send("there was issue adding categories");
      } else {
        req.flash("success", "Category added");
        res.location("/");
        res.redirect("/");
      }
    });
  }
});

module.exports = router;