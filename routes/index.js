var express = require("express"),
	router	= express.Router(),
	passport	= require("passport"),
	User			= require('../models/user.js'),
	LocalStrategy	= require('passport-local'),
	Movie 	= require("../models/movies"),
	Comment	= require("../models/comment");
	const mysql = require('mysql2');
	middleware=require("../middleware");
	const conn = require('../dbConfig');
	
//Root Route
router.get("/",function(request,respond){
	
	respond.render("landing");
});

//Register Form
router.get("/register",(request,respond)=>{
	console.log("Registraion");
	console.log(request.user);
	respond.render("register",{currentUser:request.user});
});

//Sign Up Logic
router.post("/register",(request,respond)=>{
	var newUser;
	if(request.body.Role)
	{
		 newUser = new User({username:request.body.username,role:"recruiter"});
	}
	else
	newUser = new User({username:request.body.username,role:"student"});
	User.register(newUser,request.body.password,(err,createdUser)=>{
		if(err){
			console.log(err);
			console.log(err.message);
			request.flash("error",err.message);
			return respond.redirect("register");
		}
		console.log(createdUser.username);
		request.flash("success","You Have created a account");
		
		var renderFileLoc;
		if(request.body.Role)
		renderFileLoc="register/company";
		else
		renderFileLoc="register/student";
		 
	    passport.authenticate("local")(request,respond,()=>{respond.redirect(renderFileLoc);});
	}); 
});

// signup details from student
router.get("/register/student",middleware.isLoggedIn,(request,respond)=>{
	respond.render("signup/student");
	
});

router.post("/register/student",middleware.isLoggedIn,(request,respond)=>{

	console.log("posted");
	respond.redirect("/movies");
	const un=1233;
	console.log(request.user);
	console.log(request.body);
	const body=request.body;
	conn.query(
		'INSERT INTO student VALUES (?,?,?,?,?,?,?)',[request.user.username,body.sName,body.sUsn,body.sDepartment,body.sAddress,body.sContactNo,body.sCGPA],
        function(err, results, fields) {
			if(err)
			console.log(err);
            console.log(results); // results contains rows returned by server
            // console.log(fields); // fields contains extra meta data about results, if available
          }
    );
});

// signup details from company
router.get("/register/company",(request,respond)=>{
	respond.render("signup/company");
	
});

router.post("/register/company",middleware.isLoggedIn,(request,respond)=>{

	console.log("posted");
	respond.redirect("/movies");

});

//LOgin Form 
router.get("/login",(request,respond)=>{
	console.log(request.flash("error"));
	respond.render("login");
});


//apk.post("/login", middleware,callback)
router.post("/login",passport.authenticate(
	"local",{ successRedirect:"/movies",failureRedirect:"/login"}),(request,respond)=>{});

//LogOut Route
router.get("/logout",(request,respond)=>{
	request.flash("success","loged you out");
	request.logout();
	respond.redirect("/movies");
});

//result
router.get("/result",(request,respond)=>{
	request.logout();
	respond.render("results");
});

//MyAcc
// router.get("/myAcc",(request,respond)=>{

// 	// console.log(currentUser);
// 	respond.render("signup/student");

// });

router.get("/myAcc",middleware.isLoggedIn,(request,respond)=>{
	
	if(request.user.role=='student')
	{
		conn.query(
			'SELECT * FROM student WHERE userName=?',[request.user.username],
			function(err, results, fields) {
				if(err)
				console.log(err);
				respond.render("signup/studentEdit",{data:results[0]});
			  }
		);
		
	}
	else
	respond.render("signup/company");
	
});

router.post("/myAcc",middleware.isLoggedIn,(request,respond)=>{
	
	console.log("posted");
	respond.redirect("/movies");
	const un=1233;
	console.log(request.user);
	console.log(request.body);
	const body=request.body;
	
	
	if(request.user.role=='student')
	{
		conn.query(
			'UPDATE student SET userName=?, sname=?,usn=?, department=?,address=?,contactNo=?,cgpa=? WHERE userName=?',[request.user.username,body.sName,body.sUsn,body.sDepartment,body.sAddress,body.sContactNo,body.sCGPA,request.user.username],
			function(err, results, fields) {
				if(err)
				console.log(err);
				console.log(results); // results contains rows returned by server
				// console.log(fields); // fields contains extra meta data about results, if available
			  }
		);
		
	}
	else
	respond.render("signup/company");
	
});

//middleware
function isLoggedIn( request,respond,next){
	if(request.isAuthenticated()){
		return next();
	}
	respond.render("login");
}

module.exports = router;
