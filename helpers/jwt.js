const expressJwt = require("express-jwt");

function authJwt() {
	const secret = process.env.secret;
	const api = process.env.API_URL; 
   return expressJwt({
			secret,
		algorithms: ["HS256"],
	   //Se comento esta linea de codigo para que le de pase a la autorizacion de los isAdmin=false
			//isRevoked:isRevoked
		}).unless({
			path: [
				{ url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
				{ url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
				{ url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
				`${api}/users/login`,
				`${api}/users/register`,
			],
		});
}

//Users and Admins-verific who have "isAdmin": true o "isAdmin": false, 
async function isRevoked(req, payload, done) {
	if (!payload.isAdmin) {
		done(null, true);
	}

	done();
}

module.exports = authJwt;
