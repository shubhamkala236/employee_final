// const { Error_Hander } = require('../../utils/newErrorhandler');
// const {ErrorHander} = require('../../utils/error-handler');
const { Errors } = require("../../utils/app-errors");
const jwt = require("jsonwebtoken");
const { EmployeeModel } = require("../../database/models");
const { ValidateSignature } = require("../../utils");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

//
// exports.isAuthenticatedUser =  async(req,res,next)=>{
//     //just getting token value without json object
//     const {token} = req.cookies;

//     if(!token){
//         return next(new Errors("Please login to access this resource",401));
//     }

//     //if have  token then
//     const decodedData = jwt.verify(token, process.env.APP_SECRET);

//     //id is that which we created when creating jwt token
//    req.user =  await EmployeeModel.findById(decodedData._id);
//     console.log(req.user);
//     next();

// };
// exports.isAuthenticatedUser =  async(req,res,next)=>{
//     //jus {token} = req.cookies;
//     t getting token value without json object
//     const
//     if(!token){
//         return next(new Errors("Please login to access this resource",401));
//     }

//     //if have  token then
//     const decodedData = jwt.verify(token, process.env.APP_SECRET);

//     //id is that which we created when creating jwt token
//    req.user =  await EmployeeModel.findById(decodedData._id);
//     // console.log(req.user);
//     next();

// };

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	//just getting token value without json object
	// const {token} = req.cookies;

	// let token;
	// if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){

	//         token = req.headers.authorization.split(" ")[1];
	//         if(!token){
	//             return next(new Errors("Please login to access this resource",401));
	//         }
	//         const decoded = jwt.verify(token, process.env.APP_SECRET);
	//         console.log(decoded);

	//         req.user =  await EmployeeModel.findById(decoded._id);
	//         // console.log(req.user);
	//         next();

	// }
	// else{
	//     res.status(401);
	//     throw new Errors("Not authorized , token failed",401);
	// }

	const isAuthorized = await ValidateSignature(req);
	// console.log(req.user);
	if (isAuthorized) {
		return next();
	}
	return res.status(403).json({ message: "Not Authorized" });
});

exports.authorizeRoles = (...roles) => {
	return (req, res, next) => {
		// console.log(req.user.role);
		if (!roles.includes(req.user.role)) {
			return next(new Errors("You are not admin", 403));
		}
		next();
	};
};
