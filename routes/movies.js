var express = require("express"),
	router	= express.Router(),
	middleware=require("../middleware"),
	Movie 	= require("../models/movies");
	const conn = require('../dbConfig');
// Index Page 
router.get("/",(request,respond)=>{

	conn.query(
		'SELECT * FROM offer',
        function(err, results, fields) {
			if(err)
			console.log(err);
            respond.render("movies/index",{ list:results, currentUser:request.user});
          }
    );
			
});
		
// Create offer
router.post("/",middleware.isLoggedIn,(request,respond)=>{
	
	const body=request.body;
	conn.query(
		'SELECT * from offer',
        function(err, offers, fields) {
			if(err)
			console.log(err);
            else{
				console.log(request.user.username);
				conn.query(
					'INSERT INTO offer VALUES (?,?,?,?,?,?,?)',[offers.length+1,body.offerDisc,body.coCgpa,body.lastDate,body.instructions,request.user.username,body.role],
					function(err, results, fields) {
						if(err)
						console.log(err);
						console.log(results); 
					  }
				);
			}
          }
    );
	request.flash("success","Movie Added");
	respond.redirect("/movies");
});

// New Page
router.get("/new",middleware.isLoggedIn,(request,respond)=>{
	respond.render("movies/new",{ currentUser:request.user});
});

router.get("/register/:cId",middleware.isLoggedIn,(request,respond)=>{
	request.flash("success","Movie Added");
	respond.redirect("/movies");
	
	conn.query(
		'SELECT * FROM student WHERE userName=?',[request.user.username],
        function(err, Sresult, fields) {
			if(err)
			console.log(err);
            else{

				conn.query(
					'INSERT INTO registration(cId,usn) values(?,?)',[request.params.cId,Sresult[0].usn],
					function(err, results, fields) {
						if(err)
						console.log(err);
						else
						{
							request.flash("success","Movie Added");
	                       console.log(results);
						}
						 
					  }
				);
			}
          }
	);
	
	request.flash("success","REGISTRATION FAILED");
	
	
});
router.post("/register",middleware.isLoggedIn,(request,respond)=>{

	 console.log("posted");
	 respond.redirect("/movies");

});

// Show Page
router.get("/:offerId",(request,respond)=>{
	// Movie.findById(request.params.movieId).populate("comments").exec(function(err,foundMovie){
	// 	if (err){
	// 	console.log(err);
	// }else{
	// 	respond.render("movies/show",{movie:foundMovie, currentUser:request.user});
	// }
	// });
	console.log(request.params);
	conn.query(
		'SELECT * FROM offer WHERE offerid= ?',[request.params.offerId],
        function(err, results, fields) {
			if(err)
			console.log(err);
			else
			{
				console.log(results +"hi");
				conn.query(
					'SELECT * FROM company WHERE cId= ?',[results[0].cId],
					function(err, cresults, fields) {
						if(err)
						console.log(err);
						else
						{
							console.log(cresults);
							
						respond.render("movies/show",{movie:results[0],comp:cresults[0], currentUser:request.user});
						}
					  }
				);
			
			}
          }
    );


});
// Edit Details
router.get("/:id/edit",middleware.checkMovieOwnership,(request,respond)=>{
	Movie.findById(request.params.id,(err,foundMovie)=>{
		respond.render("movies/edit",{movie:foundMovie});
	} );
});
//Backend
router.put("/:id",middleware.checkMovieOwnership,(request,respond)=>{
	Movie.findByIdAndUpdate(request.params.id,request.body.m,(err,updatedMovie)=>{
		if(err){
			respond.redirect("/movies");
		}else{
			// console.log(request.body.m);
			// console.log(updatedMovie);
			request.flash("success","Movie Edited");
			respond.redirect("/movies/"+updatedMovie._id);
		}
	});
});

// RESULT

router.get("/company/result",middleware.isLoggedIn,(request,respond)=>{

	
	respond.render("movies/results",{ currentUser:request.user});
	

});

router.post("/company/result",middleware.isLoggedIn,(request,respond)=>{

	var res=0;
	conn.query(
		'UPDATE registration set roundNo= ? ,status =? WHERE usn= ? AND cId=?',[request.body.roundNo,request.body.status,request.body.usn,request.user.username],
        function(err, results, fields) {
			if(err)
			console.log(err);
			else
			{
				res=results.affectedRows;
				console.log(results);
			}
			
          }
	);
	
	request.flash("success",` ${request.body.usn} Results UPDATED`);

	respond.redirect("/movies/company/result");
});

// Delete The Movie
router.delete("/:id",middleware.checkMovieOwnership,(request,respond)=>{
	Movie.findByIdAndRemove(request.params.id,(err)=>{
		if(err){
			respond.redirect("/movies");
			console.log(err);
		}else{
			request.flash("success","Deleted");
			respond.redirect("/movies");
		}
	});
	// respond.send("you are trying to delete");
});


module.exports = router;