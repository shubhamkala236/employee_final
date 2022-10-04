const { EmployeeModel, UserModel, DummyModel, SalaryDetailsModel } = require("../models");

const { APIError, STATUS_CODES, DBAPIError } = require("../../utils/app-errors");
const { Error_Hander } = require("../../utils/app-errors");
const ApiFeatures = require("../../utils/apifeatures");
// const { APP_SECRET} = require('../config');
// const jwt  = require('jsonwebtoken');

//Dealing with data base operations
class EmployeeRepository {
	//create employee
	// async CreateEmployee({ name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber }){

	//     try {
	//         const employee = new EmployeeModel({
	//             name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber
	//         })

	//         const employeeResult = await employee.save();
	//         return employeeResult;

	//     } catch (err) {
	//         throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Employee')
	//     }

	// }
	// const employee = new EmployeeModel({
	//     name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber,role,designation,password
	// })
	// //check if only email is present in dummy Model
	// //check id also if present in dummy model
	// const checkEmail = await DummyModel.findOne({email:email});
	// const checkId = await DummyModel.findById({id:id})

	// if(checkEmail && checkId){

	//             const employeeResult = await employee.save();
	//             return employeeResult;

	// }

	// ---------------------REGISTER EMPLOYEEE------------------------
	//check in dummy schema if unique id and email present then create Employee/ register Employee
	async CreateEmployee({
		name,
		email,
		dateOfBirth,
		phoneNumber,
		current_address,
		perma_address,
		adhaarNumber,
		panNumber,
		bankAccountNumber,
		ifsc,
		role,
		designation,
		password,
		id,
		salt,
		imageUrl,
	}) {
		//avatar,cloudinary_id

		try {
			//check if only email is present in dummy Model
			//check id also if present in dummy model
			const check = await DummyModel.findOne({ email: email, _id: id });
			// const checkId = await DummyModel.findById({_id:id})
			console.log({ check });

			if (check) {
				const employee = new EmployeeModel({
					name,
					email,
					dateOfBirth,
					phoneNumber,
					current_address,
					perma_address,
					adhaarNumber,
					panNumber,
					bankAccountNumber,
					ifsc,
					role,
					designation,
					password,
					salt,
					imageUrl,
				});

				const employeeResult = await employee.save();
				return employeeResult;
			}
		} catch (err) {
			console.log(err);
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Create Employee");
		}
	}

	//read or get all employees from database
	//     async Employees(){
	//         try{
	//             return await EmployeeModel.find();
	//         }catch(err){
	//            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Get Employees')
	//         }
	//    }
	async Employees(queryStr) {
		const resultPerPage = 1000;
		const pageNumber = queryStr.page;
		try {
			const apiFeatures = new ApiFeatures(
				EmployeeModel.find({}).where("role").equals("user"),
				queryStr
			)
				.pagination(resultPerPage, pageNumber)
				.search();
			// return await EmployeeModel.find();
			const empl = await apiFeatures.query;
			return empl;
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Get Employees");
		}
	}

	//Admin find and update
	async FindAndUpdate(Id, userData) {
		try {
			return await EmployeeModel.findByIdAndUpdate(Id, userData);
		} catch (err) {
			console.log(err);
			throw new APIError(
				"API Error",
				STATUS_CODES.INTERNAL_ERROR,
				"Unable to Find and update Employee"
			);
		}
	}
	//Admin find and update Status
	async FindAndUpdateStatus(Id, userData) {
		try {
			const updated = await EmployeeModel.findByIdAndUpdate(Id, userData, {
				new: true,
				runValidators: true,
				useFindAndModify: false,
			});

			if (updated) {
				return updated;
			}
		} catch (err) {
			throw new APIError(
				"API Error",
				STATUS_CODES.INTERNAL_ERROR,
				"Unable to Find and update Employee"
			);
		}
	}
	//Admin find and Delete
	async Delete(Id) {
		try {
			return await EmployeeModel.deleteOne({ _id: Id });

			// if(user)
			// {
			//     await user.remove();
			// }
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}

	//find by id employee
	async FindById(id) {
		try {
			return await EmployeeModel.findById(id);
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}
	//find by id employee and update ---------admin
	async FindByIdUpdate(id, updatedData) {
		try {
			return await EmployeeModel.findByIdAndUpdate(id, updatedData);
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}

	//User updates own password
	async UserUpdatePass(Id, encryptedPass, newsalt) {
		const update = { password: encryptedPass, salt: newsalt };
		try {
			return await EmployeeModel.findByIdAndUpdate(Id, update);
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}

	//User update own details
	async UserUpdateDetails(Id, newUserData) {
		try {
			return await EmployeeModel.findByIdAndUpdate(Id, newUserData);
		} catch (err) {
			console.log(err);
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Update Employee");
		}
	}

	// //create signed up user
	// async CreateUser({ email, password, details, role, salt }){
	//     try{
	//         const user = new UserModel({
	//             email,
	//             password,
	//             details,
	//             role,
	//             salt,
	//         })
	//         const userResult = await user.save();
	//         return userResult;
	//     }catch(err){
	//         throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create user')
	//     }
	// }

	// EMPLOYEE login
	async FindEmployee({ email }) {
		try {
			const existingUser = await EmployeeModel.findOne({ email: email });
			return existingUser;
		} catch (err) {
			console.log(err);
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Customer");
		}
	}

	//create dummy employee
	async CreateDumEmployee({ email }) {
		try {
			const employee = new DummyModel({ email });

			const employeeResult = await employee.save();
			return employeeResult;
		} catch (err) {
			// console.log(err);
			throw new DBAPIError(
				"Database Error",
				STATUS_CODES.DUPLICATE_KEY,
				"Unable to Create Dummy Employee user may be already added"
			);
			// throw new Error_Hander('User already added',1100);
		}
	}

	//storing identities during time of creation of employee
	// async CreateIdentity({idName,value,countryCode }){

	//     try {
	//         const employee = new EmployeeModel({
	//             name, email, dateOfBirth, phoneNumber,current_address, perma_address, adhaarNumber, panNumber,bankAccountNumber,ifsc,passBookNumber
	//         })

	//         const employeeResult = await employee.save();
	//         return employeeResult;

	//     } catch (err) {
	//         throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Create Employee')
	//     }

	// }

	//find and reset password
	// async FindAndReset(id,token){
	//     const secret = APP_SECRET + employee.password
	//     try{
	//         return await EmployeeModel.findByIdAndUpdate(id,token);

	//     }catch(err){
	//         throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Employee')
	//     }

	// }

	//saving new password after reset
	async newResetPass(payload, salt, newpassword) {
		const { id } = payload;
		const updateObj = {
			salt: salt,
			password: newpassword,
		};

		try {
			return await EmployeeModel.findByIdAndUpdate(id, updateObj);
		} catch (err) {
			throw APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}
	//Add salary Structure of Employee--------Admin
	async AddSalary({
		Basic,
		HRA,
		Convince,
		LTA,
		SPL,
		PF_Employee,
		PF_Employer,
		Id,
		ESIC_Employer,
		ESIC_Employee,
		TDS,
		MEDICAL,
		PF_NUMBER,
		ESIC_NUMBER,
		LWF_Employer,
	}) {
		try {
			console.log("data");
			const existingUser = await SalaryDetailsModel.findOne({ Employee_id: Id });
			const updateobj = {
				Basic: Basic,
				HRA: HRA,
				Convince: Convince,
				LTA: LTA,
				SPL: SPL,
				PF_Employee: PF_Employee,
				PF_Employer: PF_Employer,
				Employee_id: Id,
				ESIC_Employer: ESIC_Employer,
				ESIC_Employee: ESIC_Employee,
				TDS: TDS,
				MEDICAL: MEDICAL,
				PF_NUMBER: PF_NUMBER,
				ESIC_NUMBER: ESIC_NUMBER,
				LWF_Employer: LWF_Employer,
			};

			if (existingUser) {
				const updateUser = await SalaryDetailsModel.findOneAndUpdate(
					{ Employee_id: Id },
					updateobj
				);
				return updateUser;
			}

			const salary = new SalaryDetailsModel({
				Basic,
				HRA,
				Convince,
				LTA,
				SPL,
				PF_Employee,
				PF_Employer,
				Employee_id: Id,
				ESIC_Employer,
				ESIC_Employee,
				TDS,
				MEDICAL,
				PF_NUMBER,
				ESIC_NUMBER,
				LWF_Employer,
			});

			const result = await salary.save();
			return result;
		} catch (err) {
			throw new APIError(
				"API Error",
				STATUS_CODES.INTERNAL_ERROR,
				"Unable to Create Employee Salary"
			);
		}
	}

	//get single employee salary structure-----------Admin
	//find by id employee
	async FindSalaryById(id) {
		try {
			const salaryDetails = await SalaryDetailsModel.findOne({ Employee_id: id });
			return salaryDetails;
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}
	//find by id employee user details
	async FindUserById(id) {
		try {
			const employee = await EmployeeModel.findOne({ _id: id });
			return employee;
		} catch (err) {
			throw new APIError("API Error", STATUS_CODES.INTERNAL_ERROR, "Unable to Find Employee");
		}
	}
}

module.exports = EmployeeRepository;
