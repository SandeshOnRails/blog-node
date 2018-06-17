    //app configuration

var express = require("express");
app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

//mongoose configuration

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://sandesh:sandesh1@ds163510.mlab.com:63510/bloggist", {
    useMongoClient:true
});

//Passport configuration

app.use(require("express-session")({
    secret:"password",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var blog = mongoose.model("blog", blogSchema);
//testing blog model
//blog.create({title:"test blog post", image:"noImage.jpg", body:"This is a test // blog"});


//RESTFUL ROUTING
//home
app.get("/", isLoggedIn, function(req, res){
    res.redirect("/login");
})
app.get("/blogs",isLoggedIn,  function(req, res){
    blog.find({}, function(err, blogs){
        if(err)
            console.log("ERROR")
        else
            res.render("index.ejs", {blogs: blogs});
    })
});

//new post

app.get("/blogs/new",isLoggedIn, function(req, res){
    res.render("new.ejs");
});

// post new blog

 app.post("/blogs", isLoggedIn, function(req, res){
     blog.create(req.body.blog, function(err, newBlog){
         if(err)
             console.log("Error creating blog")
         else
             res.redirect("/blogs");
     })
 });

// readmore functionality
app.get("/blogs/:id", isLoggedIn, function(req, res){
    blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show.ejs", {blog: foundBlog});
        }
    })
})





// Authentication Routes
app.get("/register", function(req, res){
    res.render("register.ejs");
});
//sign up logic

app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register.ejs");
        }
    passport.authenticate("local")(req, res, function(){
        res.redirect("/blogs");
    });
    });
});



//login form

app.get("/login", function(req, res){
    res.render("login.ejs");
})
 //login logic

app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"

}), function(req, res){
});

//logout

app.get("/logout", function(req, res){
        req.logout();
        req.session.destroy();
        res.redirect("/");

});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login"); 
}


app.listen(process.env.PORT || 3000 , function(){
    console.log("Server Running");
})