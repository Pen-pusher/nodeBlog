var express = require('express');
var router = express.Router();
var mongo = require("mongodb");
var db = require("monk")("localhost/nodeblog");

router.get("/add", function(req, res, next){
  var categories = db.get("categories");
  categories.find({},{}, function(err, categories) {
    res.render("addpost", {
    "title": "Add post",
    "categories": categories
    });
  });
});

router.get("/show/:id", function(req, res, next){
  var posts = db.get("posts");
  posts.findById(req.params.id, function(err, post){
    res.render("show", {
      post: post
    });
  });
});

router.post("/add", function(req, res, next){
  //Get Field Values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var auther = req.body.auther;
  var date = new Date();
   
  if(req.files && req.files.mainimage) {
    var mainImageOriginalName = req.files.mainimage.originalname;
    var mainImageName = req.files.mainimage.name;
    var mainImageMime = req.files.mainimage.mimetype;
    var mainImageExt = req.files.mainimage.extension;
    var mainImageSize = req.files.mainimage.size;
    var mainImagePath = req.files.mainimage.path;
  } else {
    var mainImageName = "noimage.png";
  }
  

  //Form Validation
  req.checkBody("title", "Title Required").notEmpty();
  req.checkBody("body", "Body Required").notEmpty();

  // Check Errors
  var errors = req.validationErrors();

  if(errors) {
    res.render("addpost", {
      "errors": errors,
      "title": title,
      "body": body
    });
  } else {
    var posts = db.get("posts");

    // Store in Database
    posts.insert({
      "title": title,
      "category":category,
      "body": body,
      "auther": auther,
      "date": date,
      "mainimage": mainImageName
    }, function(err, post) {
      if(err) {
        res.send("There was some issue submitting post");
      } else{
        req.flash("success", "Post Submitted");
        res.location("/");
        res.redirect("/");
      }
    });
  }

});

//Add Comment routes
router.post("/addcomment", function(req, res, next){
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var postid = req.body.postid;
  var commentDate = new Date();

  //Form Validation
  req.checkBody("name", "Name Required").notEmpty();
  req.checkBody("body", "Body Required").notEmpty();
  req.checkBody("email", "Email Required").notEmpty();
  req.checkBody("email", "Email not Valid").isEmail();

  //Check Errors
  var errors = req.validationErrors();

  if (errors) {
    var posts = db.get("posts");
    posts.findById(postid, function(err, post) {
      res.render("show", {
        "errors": errors,
        "post": post
      });
    });
  } else {
    var comments = {
      "name": name,
      "email": email,
      "body": body,
      "commentDate": commentDate
    }
    var posts = db.get("posts");
    posts.update({
      "_id": postid
          }, 
          {
            $push: {
        "comments": comments
          }
        }, function(err, doc) {
      if(err) {
        throw err;
      } else {
        req.flash("success", "Comment Added");
        res.location("/posts/show/"+postid);
        res.redirect("/posts/show/"+postid);
      }
    });
  }

});


module.exports = router;
