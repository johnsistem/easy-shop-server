const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const FILE_TYPE_MAP = {
	'image/png':'png',
	'image/jpeg':'jpeg',
	'image/jpg':'jpg'
}

//Uploads Images
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const isValid = FILE_TYPE_MAP[file.mimetype];
		let uploadError = new Error('invalid image type');

		if (isValid) {
			uploadError=null
		}
		cb(uploadError, "public/uploads");
	},
	filename: function (req, file, cb) {
		//const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const fileName = file.originalname;
		//cb(null,fileName + "-" + Date.now());
		const extension = FILE_TYPE_MAP[file.mimetype];
		cb(null,`${fileName}-${Date.now()}.${extension}`);
	},
});

const uploadOptions = multer({ storage: storage });




//Get All Products and filter by category Id's
router.get(`/`, async (req, res) => {	
	// if you want to find by category Id localhost:3000/api/v1/products?categories=23152,1564
	 let filter = {};
	if (req.query.categories) {
		filter = { category: req.query.categories.split(',') }
	}

	const productList = await Product.find(filter).populate('category'); 
	//const productList = await Product.find();
	//const productList = await Product.find().select('name image -_id');//consulta SQL
	if (!productList) {
		res.status(500).json({ success: false });
	}
	res.send(productList);
});


//Get Product By Id
router.get(`/:id`,async (req, res) => {
   const product = await Product.findById(req.params.id);
   //const product = await Product.findById(req.params.id).populate('category');//Display the category in response
   if (!product) {
      res.status(500).json({success:false})
   }
   res.send(product);
});


//Create Product
router.post(`/`,uploadOptions.single('image'), async (req, res) => {
   const category = await Category.findById(req.body.category);
	if (!category) return res.status(400).send('Invalid Category')

	const file = req.file;
	if (!file) return res.status(400).send("No Image in the request");
	const fileName = req.file.filename
	
	const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
   const product = new Product({
		name: req.body.name,
		description: req.body.description,
		richDescription: req.body.richDescription,
		image: `${basePath}${fileName}`, //"http://localhost:3000/public/upload/image-2323232"
		brand: req.body.brand,
		price: req.body.price,
		category: req.body.category,
		countInStock: req.body.countInStock,
		rating: req.body.rating,
		numReviews: req.body.numReviews,
		isFeatured: req.body.isFeatured,
	});
   
   //OJO...CHEKAR DESPUES product2
    product2 = await product.save();
  
   if (!product)
      return res.status(500).send('The product cannon be created');

   res.send(product);
   /* product.save().then((createdProduct => {
      res.status(201).json(createdProduct)
   })).catch((err) => {
      res.status(500).json({
         error: err,
         success:false
      })
   }) */
 
});


//Update by id
router.put("/:id", async (req, res) => {
	//validar Id params
	if (!mongoose.isValidObjectId(req.params.id)) {
	 res.status(400).send("Invalid Product Id");
 }

 const category = await Category.findById(req.body.category);
 if (!category) return res.status(400).send("Invalid Category");

	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{
			name: req.body.name,
			description: req.body.description,
			richDescription: req.body.richDescription,
			image: req.body.image, // "http://localhost:3000/public/upload/image-2323232"
			brand: req.body.brand,
			price: req.body.price,
			category: req.body.category,
			countInStock: req.body.countInStock,
			rating: req.body.rating,
			numReviews: req.body.numReviews,
			isFeatured: req.body.isFeatured,
		},
		{ new: true }
	);

	if (!product)
		return res.status(500).send("the product cannot be Updated!");

	res.send(product);
});


//Delete Product By Id
router.delete("/:id", (req, res) => {	
	Product.findByIdAndRemove(req.params.id)
		.then((product) => {
			if (product) {
				return res
					.status(200)
					.json({ success: true, message: "the product is deleted!" });
			} else {
				return res
					.status(404)
					.json({ success: false, message: "product not found!" });
			}
		})
		.catch((err) => {
			return res.status(400).json({ success: false, error: err });
		});
});


//Count Of Products
router.get(`/get/count`, async (req, res) => {
	const productCount = await Product.countDocuments((count)=>count)
	//const product = await Product.findById(req.params.id).populate('category');//Display the category in response
	if (!productCount) {
		res.status(500).json({ success: false });
	}
	res.send({
		productCount: productCount,
	});
});

//Get Products by Featured('/get/featured) and cout of Featured (`/get/featured/:count`)
router.get(`/get/featured/:count`, async (req, res) => {
	const count=req.params.count ? req.params.count :0
	const products = await Product.find({ isFeatured: true }).limit(+count);
	//const product = await Product.findById(req.params.id).populate('category');//Display the category in response
	if (!products) {
		res.status(500).json({ success: false });
	}
	res.send(products)
});


router.put(
	"/gallery-images/:id",
	uploadOptions.array('images', 10),
	async (req, res) => {
		if (!mongoose.isValidObjectId(req.params.id)) {
			res.status(400).send("Invalid Product Id");
		}

		const files = req.files
		const imagesPaths = [];
		const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
		
		if (files) {
			files.map(file => {
				imagesPaths.push(`${basePath}${file.filename}`);
			})
	

			 const product = await Product.findByIdAndUpdate(
					req.params.id,
					{
						images: imagesPaths
					},
					{ new: true }
			)
			
			if (!product)
			  	return res.status(500).send("the product cannot be Updated!");

		    	res.send(product);
			
		}
	})



module.exports = router;