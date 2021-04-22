const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
require("dotenv/config");
app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

//Routers
const categoriesRouter = require("./routers/categories");
const productsRouter = require("./routers/products");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");

const api = process.env.API_URL;

app.use(`${api}+/products`, productsRouter);
app.use(`${api}+/categories`, categoriesRouter);
app.use(`${api}+/users`, usersRouter);
app.use(`${api}+/orders`, ordersRouter);

//const Product = require('./models/product');

mongoose
	.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		dbName: "eshop-database",
	})
	.then(() => {
		console.log("database connection is ready...");
	})
	.catch((err) => {
		console.log(err);
	});

//Developen
/* app.listen(3000, () => {
   console.log(api);
   console.log('server is running http://localhost:3000')
}) */

//Production
var server = app.listen(process.env.PORT || 3000, function () {
	var port = server.address().port;
	console.log("Express is working on port" + port);
});
