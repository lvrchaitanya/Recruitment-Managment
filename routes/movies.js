var express = require("express"),
	router	= express.Router(),
	middleware=require("../middleware"),
	Movie 	= require("../models/movies");
	const conn = require('../dbConfig');
   Feedback = require("../models/feedback");
	
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
					'INSERT INTO offer(offerDisc,coCgpa,lastDate,logo,cId,role) VALUES (?,?,?,?,?,?)',[body.offerDisc,body.coCgpa,body.lastDate,body.logo,request.user.username,body.role],
					function(err, results, fields) {
						if(err)
						console.log(err);
						else
						console.log(results); 
					  }
				);
			}
          }
    );
	request.flash("success","Job Added");
	respond.redirect("/movies");
});

// New Page
router.get("/new",middleware.isLoggedIn,(request,respond)=>{
	respond.render("movies/new",{ currentUser:request.user});
});

router.get("/register/:offerID",middleware.isLoggedIn,(request,respond)=>{
	
	
	
	conn.query(
		'SELECT * FROM student WHERE userName=?',[request.user.username],
        function(err, Sresult, fields) {
			if(err)
			console.log(err);
            else{

				conn.query(
					'INSERT INTO registration(offerID,usn) values(?,?)',[request.params.offerID,Sresult[0].usn],
					function(err, results, fields) {
						if(err)
						console.log(err);
						else
						{
							
	                       console.log(results);
						}
						 
					  }
				);
			}
          }
	);
	
	request.flash("success","Registered Sucessfully");
	respond.redirect("/movies");
	
});
router.post("/register",middleware.isLoggedIn,(request,respond)=>{

	 console.log("posted");
	 respond.redirect("/movies");

});

// Show Page
router.get("/:offerId",(request,respond)=>{

	conn.query(
		'SELECT * FROM offer WHERE offerID=?',[request.params.offerId],
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
							// stat
							
							//statend
							Comment.find({offerID:request.params.offerId},function(err,result){
								if(err)
								console.log(err);
								else{
									respond.render("movies/show",{movie:results[0],comp:cresults[0],comments:result ,currentUser:request.user});
								}
							});
						
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

// RESULT

router.get("/company/result/:offerID",middleware.isLoggedIn,(request,respond)=>{

	
	respond.render("movies/results",{ currentUser:request.user, offerID:request.params.offerID});
	

});

router.post("/company/result/:offerID",middleware.isLoggedIn,(request,respond)=>{

	var res=0;
	conn.query(
		'UPDATE registration set roundNo= ? ,status =? WHERE usn= ? AND offerID=?',[request.body.roundNo,request.body.status,request.body.usn,request.params.offerID],
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

	respond.redirect(`/movies/company/result/${request.params.offerID}`);
});
//Update offer
router.get("/update/offer/:offerID",(request,respond)=>{
	
	
		conn.query(
			'SELECT * FROM offer WHERE offerID=?',[request.params.offerID],
			function(err, results, fields) {
				if(err)
				console.log(err);
				respond.render("movies/offerEdit",{data:results[0],currentUser:request.user});
			  }
		);
	
		
});

router.post("/update/offer/:offerID",(request,respond)=>{
	const body=request.body;
	conn.query(
		'UPDATE offer SET  offerDisc=?,coCgpa=?, logo=?,role=? WHERE offerID=?',[body.offerDisc,body.coCgpa,body.logo,body.role,request.params.offerID],
		function(err, results, fields) {
			if(err)
			console.log(err);
			else
			console.log(results);
		  }
	);
	respond.redirect(`/movies/update/offer/${request.params.offerID}`);
});

// Delete The offer
router.get("/company/delete/:offerID",middleware.isLoggedIn,(request,respond)=>{

	conn.query(
		'DELETE FROM offer where offerID=? ',[request.params.offerID],
        function(err, results, fields) {
			if(err)
			console.log(err);
			else
			{
				console.log(results);
			}
			
          }
	);
respond.redirect("/movies");
	
});

//FEEDBACK
router.get("/feedback/:offerID",(request,respond)=>{
		
	respond.render("feedback",{currentUser:request.user,offerID:request.params.offerID});
});

router.post("/feedback/:offerID",(request,respond)=>{
	
	console.log(request.body);
	Feedback.create(request.body,(err,newComment)=>{
		if(err){
			console.log(err);
		}else{
			newComment.offerID=request.params.offerID;

			conn.query(
				'SELECT cId FROM offer where offerID=? ',[request.params.offerID],
				function(err, results, fields) {
					if(err)
					{console.log(err);
						newComment.save();
					}
					else
					{
						newComment.cId=results[0].cId;
						newComment.save();
					}
					
				  }
			);
		}
	});
	respond.redirect(`/movies/${request.params.offerID}`)
});


router.get("/feedback/:offerID",(request,respond)=>{
		
	respond.render("feedback",{currentUser:request.user,offerID:request.params.offerID});
});






module.exports = router;