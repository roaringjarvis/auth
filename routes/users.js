var express = require('express');
var router = express.Router();
var multer=require('multer');
var upload=multer({dest:'./uploads'});
var User=require('../models/user');
var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register');
});
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Incorrect Username or Password'}),
  function(req, res) {
    req.flash('success','You are now logged in');
    res.redirect('/');
   
   
  });
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });
 passport.use(new LocalStrategy(function(username,password,done){
      User.getUserByUsername(username,function(err,user){
          if(err) throw err;
          if(!user)
          {
            return done(null,false,{message:'Unknown User'});
          }
       User.comparePassword(password,user.password,function(err,isMatch){
          if(err) return done(err);
          if(isMatch){
            return done(null,user);
          }
          else{
            return done(null,false,{message:'Invalid Password'});
          }
       });   
      });
 })); 

router.post('/register', upload.single('profileimage'),function(req, res, next) {
  var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password2=req.body.password2;

  if(req.file)
  {
    console.log("File Uploaded");
    var profileimage=req.file.filename+Date.now()+'.jpg';
  }
  else{
    console.log("File not uploded");
    var profileimage="nofile.jpg";
  }

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Invalid email').isEmail();
  req.checkBody('username','Username is required').notEmpty();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Confirm Password is required').notEmpty();
  req.checkBody('password2','Password doesnot match' ).equals(req.body.password);
 
  var errors=req.validationErrors();

    if(errors){
      res.render('register',{
        errors:errors
      });
    }
    else{
      var newUser=new User({
        name:name,
        email:email,
        username:username,
        password:password,
        profileimage:profileimage
      });
    
      User.createUser(newUser,function(err,user){
          if(err) throw err;
          console.log(user);
      });
    
      req.flash('success','You are Registered Successfully and can now Login');
      res.location('/');
      res.redirect('/');
    }

});

router.get('/logout',function(req,res){
    req.logout();
    req.flash('success','You are now logged Out');
    res.redirect('/users/login');
});
module.exports = router;
