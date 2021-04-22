const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


//Get All Users
router.get(`/`, async (req, res) => {
	// hide password// .select('-passwordHash');
	// display only fields//await User.find().select('name phone email')
	const userList = await User.find().select("-passwordHash");

	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

//Get user By Id
router.get(`/:id`, async (req, res) => {
	const user = await User.findById(req.params.id).select("-passwordHash");

	if (!user) {
		res.status(500).json({
			success: "The user with the given ID was not found",
		});
	}
	res.status(200).send(user);
});

//Create User
router.post(`/register`, async (req, res) => {
	let user = new User({
		name: req.body.name,
		email: req.body.email,
		passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
		phone: req.body.phone,
		isAdmin: req.body.isAdmin,
		street: req.body.street,
		apartment: req.body.apartment,
		zip: req.body.zip,
		city: req.body.city,
		country: req.body.country,
	});

	user = await user.save();

	if (!user)
		return res.status(404).send("the user cannot be creates!");

	res.send(user);
});

//Login User
router.post('/login', async (req, res) => {
   const user =await User.findOne({email: req.body.email})
   const secret = process.env.secret;
  
   if (!user) {
      return res.status(500).send('The user not found');
   }
   if (user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
      const token = jwt.sign(
			{
				userId: user.id,
				isAdmin:user.isAdmin
			},
         secret,
         {expiresIn:'1d'}
		);
      res.status(200).send({user:user.email,token:token})
   } else {
      
      return res.status(400).send('Password is wrong!')
   }
   
})



//Delete User By Id
router.delete("/:id", (req, res) => {	
	User.findByIdAndRemove(req.params.id)
		.then((user) => {
			if (user) {
				return res
					.status(200)
					.json({ success: true, message: "the user is deleted!" });
			} else {
				return res
					.status(404)
					.json({ success: false, message: "user not found!" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});



//Count Of Users
router.get(`/get/count`, async (req, res) => {
	const userCount = await User.countDocuments((count)=>count)
	//const product = await Product.findById(req.params.id).populate('category');//Display the category in response
	if (!userCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		userCount: userCount,
	});
});


module.exports = router;
