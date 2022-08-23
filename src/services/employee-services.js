const { EmployeeRepository } = require("../database");


const {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");
const { APIError, ErrorHander } = require("../utils/app-errors");
const { sendMail, sendResetMail,sendStatusMail } = require("../utils/sendEmail");
const cloudinary = require("../utils/cloudinary");
const { APP_SECRET } = require("../config");
const jwt = require("jsonwebtoken");

// All Business logic will be here

class EmployeeService {
  constructor() {
    this.repository = new EmployeeRepository();
  }

  // ---------------------REGISTER/CREATE EMPLOYEEE------------------------
  async CreateEmployee(employeeInputs) {
    const {
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
      passBookNumber,
      role,
      designation,
      password,
      id,
      file,
    } = employeeInputs; //path
    // cloudinary upload
    const uploaded = await cloudinary.uploader.upload(file.tempFilePath);

    const url = uploaded.url;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    try {
      const employeeResult = await this.repository.CreateEmployee({
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
        passBookNumber,
        role,
        designation,
        password: userPassword,
        id,
        salt,
        imageUrl: url,
      });
      return FormateData(employeeResult);
    } catch (err) {
      console.log(err);
      throw new APIError("Unable to create Employee");
    }
  }

  //Admin Update User status from dash board
  async UpdateUserStatus(Id, status) {
    
    try {
      const updatedData = {
        status: status,
      };
    
      const existingUser = await this.repository.FindAndUpdateStatus(Id, updatedData);
      if (existingUser) {
        // const id = existingUser._id;
        const email = existingUser.email;
        const Status = existingUser.status;
        await sendStatusMail(email,Status);
        return FormateData(existingUser);
      }

      // return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Cannot Update");
    }
  }

  //Admin Update User/id:
  async UpdateUserDetail(Id, userData) {
    const {
      // photo,
      // password,
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
      passBookNumber,
      role,
      designation,
      status,
      dateOfJoining,
      department
    } = userData;
    // const uploaded = await cloudinary.uploader.upload(photo.tempFilePath);
    // const newUrl = uploaded.url;
    //create new salt by admin
    // let salt = await GenerateSalt();

    // let userPassword = await GeneratePassword(password, salt);

    const updatedData = {
      name: name,
      email: email,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumber,
      current_address: current_address,
      perma_address: perma_address,
      dateOfJoining: dateOfJoining,
      adhaarNumber: adhaarNumber,
      panNumber: panNumber,
      bankAccountNumber: bankAccountNumber,
      ifsc: ifsc,
      passBookNumber: passBookNumber,
      designation: designation,
      // password: userPassword,
      // salt: salt,
      status: status,
      // imageUrl: newUrl,
      role: role,
      department:department,
    };

    try {
      const existingUser = await this.repository.FindAndUpdate(Id, updatedData);
      if (existingUser) {
        return FormateData(existingUser);
      }

      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //Admin Delete User/id:
  async DeleteEmployee(Id) {
    try {
      const existingUser = await this.repository.Delete(Id);
      const res = "user Deleted Successfully";
      if (existingUser) {
        return FormateData(res);
      }

      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //Employee login
  async LoginIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingUser = await this.repository.FindEmployee({ email });
      // console.log(existingUser);
      if (existingUser) {
        const validPassword = await ValidatePassword(
          password,
          existingUser.password,
          existingUser.salt
        );
        const id = existingUser._id
        console.log(id);

        if (validPassword) {
          const token = await GenerateSignature({
            email: existingUser.email,
            _id: existingUser._id,
            role:existingUser.role
          });
          return FormateData({
            id: existingUser._id,
            token,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            dateOfBirth: existingUser.dateOfBirth,
            phoneNumber: existingUser.phoneNumber,
            current_address: existingUser.current_address,
            perma_address: existingUser.perma_address,
            adhaarNumber: existingUser.adhaarNumber,
            panNumber: existingUser.panNumber,
            bankAccountNumber: existingUser.bankAccountNumber,
            ifsc: existingUser.ifsc,
            passBookNumber: existingUser.passBookNumber,
            designation: existingUser.designation,
            imageUrl: existingUser.imageUrl,
            status: existingUser.status,
            dateOfJoining: existingUser.dateOfJoining,
            department: existingUser.department,
          });
        }
      }

      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //forgotPassword
  async ForgotPassword(userInputs) {
    const { email } = userInputs;

    try {
      const user = await this.repository.FindEmployee({ email });

      //create link to reset password using tokens
      if (user) {
        const secret = APP_SECRET + user.password;
        const payload = {
          email: user.email,
          id: user._id,
        };
        const resetToken = jwt.sign(payload, secret, { expiresIn: "15m" });

        sendResetMail(user.email, user._id, resetToken);
      }

      return user;
    } catch (err) {
      console.log(err);
      throw next(new ErrorHander("No user found ", 401));
    }
  }

  //Reset token auth -- GET Form
  async ResetTokenAuth(id, token) {
    try {
      const employee = await this.repository.FindById(id);
      // console.log(employee);

      if (employee) {
        const secret = APP_SECRET + employee.password;
        //payload has email and id of user
        const payload = jwt.verify(token, secret);
        
      }

      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //Reset token auth ---POST
  async ResetPass(id, token, password) {
    // create salt

    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    try {
      const employee = await this.repository.FindById(id);
      // console.log(employee);

      if (employee) {
        const secret = APP_SECRET + employee.password;
        //payload has email and id of user
        const payload = jwt.verify(token, secret);

        const setNewPass = await this.repository.newResetPass(
          payload,
          salt,
          userPassword
        );

        if (setNewPass) {
          return;
        }
      }
      // return FormateData(employee)
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  async GetAllEmployees(queryStr) {
    try {
      const employee = await this.repository.Employees(queryStr);

      return FormateData({
        employee,
      });
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  async GetEmployeeById(employeeId) {
    try {
      const employee = await this.repository.FindById(employeeId);
      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }
  //admin update users pic only
  async UpdatebyAdminPic(employeeId,pic) {
    try {
    const uploaded = await cloudinary.uploader.upload(pic.tempFilePath);
    const newUrl = uploaded.url;
    const updatedData = {
      imageUrl: newUrl,
    };
      const employee = await this.repository.FindByIdUpdate(employeeId,updatedData);
      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //user signup
  async UserSignUp(userInputs) {
    const { email, password, details, role } = userInputs;

    try {
      // create salt
      let salt = await GenerateSalt();

      let userPassword = await GeneratePassword(password, salt);

      const existingUser = await this.repository.CreateUser({
        email,
        password: userPassword,
        details,
        role,
        salt,
      });

      const token = await GenerateSignature({
        email: email,
        _id: existingUser._id,
      });

      return FormateData({ id: existingUser._id, token });
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //user login
  async SignIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingUser = await this.repository.FindUser({ email });

      if (existingUser) {
        const validPassword = await ValidatePassword(
          password,
          existingUser.password,
          existingUser.salt
        );

        if (validPassword) {
          const token = await GenerateSignature({
            email: existingUser.email,
            _id: existingUser._id,
          });
          return FormateData({ id: existingUser._id, token });
        }
      }

      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //user own password update
  async UpdateMyPassword(Id, newPassword) {
    let salt = await GenerateSalt();

    let encryptedPass = await GeneratePassword(newPassword, salt);
    try {
      const existingUser = await this.repository.UserUpdatePass(
        Id,
        encryptedPass,
        salt
      );
      if (existingUser) {
        return FormateData(existingUser);
      }

      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }
  //user update own details
  async UpdateMyDetails(Id, newUserData) {
   
    try {
      const {
      // imageUrl,
      name,
      email,
      dateOfBirth,
      phoneNumber,
      current_address,
      perma_address,
      adhaarNumber,
      panNumber,
      bankAccountNumber,
      dateOfJoining,
      ifsc,
      passBookNumber,
      }=newUserData;

    // const uploaded = await cloudinary.uploader.upload(imageUrl.tempFilePath);
    // const newUrl = uploaded.url;
    const updatedData = {
      name: name,
      email: email,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumber,
      current_address: current_address,
      perma_address: perma_address,
      adhaarNumber: adhaarNumber,
      panNumber: panNumber,
      bankAccountNumber: bankAccountNumber,
      dateOfJoining:dateOfJoining,
      ifsc:ifsc,
      passBookNumber:passBookNumber,
      // imageUrl: newUrl,
    };

      const existingUser = await this.repository.UserUpdateDetails(
        Id,
        updatedData
      );

      if (existingUser) {
        return FormateData(existingUser);
      }

      // return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //----------update my pic only--------------
  async UpdateMyPic(Id, pic) {
   
    try {
      
    const uploaded = await cloudinary.uploader.upload(pic.tempFilePath);
    const newUrl = uploaded.url;
    const updatedData = {
      imageUrl: newUrl,
    };

      const existingUser = await this.repository.UserUpdateDetails(
        Id,
        updatedData
      );

      if (existingUser) {
        return FormateData(existingUser);
      }

      // return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }

  //create dummy employee
  async CreateDummyEmployee(employeeInputs) {
    // const {email} = employeeInputs;
    try {
      const employeeResult = await this.repository.CreateDumEmployee(
        employeeInputs
      );
      //send mail after storing in dummydB
      if (employeeResult) {
        const email = employeeResult.email;
        const id = employeeResult._id;
        await sendMail(email, id);
      }

      return FormateData(employeeResult);
    } catch (err) {
      console.log(err);
      throw new APIError("Email could not be added");
    }
  }

  //Add Salary By admin
  async Salary({
    Basic,
    HRA,
    Convince,
    LTA,
    SPL,
    PF_Employee,
    PF_Employer,
    Id,ESIC_Employer,ESIC_Employee,TDS,MEDICAL,PF_NUMBER,ESIC_NUMBER,LWF_Employer
  }) {
    try {
      const data = await this.repository.AddSalary({
        Basic,
        HRA,
        Convince,
        LTA,
        SPL,
        PF_Employee,
        PF_Employer,
        Id,ESIC_Employer,ESIC_Employee,TDS,MEDICAL,PF_NUMBER,ESIC_NUMBER,LWF_Employer
      });
      if (data) {
        return FormateData(data);
      }
      return FormateData(null);
    } catch (err) {
      console.log(err);
      throw new APIError("Salary could not be added");
    }
  }

  //get single person salary ---admin
  async GetSalaryById(employeeId) {
    try {
      const employee = await this.repository.FindSalaryById(employeeId);
      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }
  async GetSalaryByIdForAttendance(employeeId) {
    try {
      const employee = await this.repository.FindSalaryById(employeeId);
      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }
  //get user payload for salary slip
  async UserDetailsForSalarySlip(employeeId) {
    try {
      const employee = await this.repository.FindUserById(employeeId);
      return FormateData(employee);
    } catch (err) {
      console.log(err);
      throw new APIError("Data Not found");
    }
  }
  
  //get payload to access other service
  async getPayloadAttendance(userId,event){
      const user = await this.repository.FindById(userId);

      if(user){
        const payload = {
          event:event,
          data:{userId}
        }
        return FormateData(payload);

      }
      else{
        return FormateData({error:'No user found in database'})
      }
  }

  //get payload to access payroll service
  async getPayloadPayroll(employeeId,salaryDetail,month,year,event){
    try {
      const user = await this.repository.FindById(employeeId);
      if(user){

        const payload = {
          event:event,
          data:{employeeId,salaryDetail,month,year}
        }
        return FormateData(payload);
      }
      else{
        return FormateData({error:'No user found in database'});
      }
      
    } catch (error) {
      throw new APIError("Data Not found");
    }
  }

  //get payload to access payroll service
  async getPayloadSalarySlip(employeeId,salaryDetail,userDetail,month,year,event){
    try {
      const user = await this.repository.FindById(employeeId);
      if(user){
        const payload = {
          event:event,
          data:{employeeId,salaryDetail,userDetail,month,year}
        }

        return FormateData(payload);
      }
      else{
        return FormateData({error:'No user found in database'});
      }
      
    } catch (error) {
      throw new APIError("Data Not found");
    }
  }
  //get payload to access pdf service
  async getPayloadPdfSlip(employeeId,salaryDetail,userDetail,month,year,event){
    try {
      const user = await this.repository.FindById(employeeId);
      if(user){
        const payload = {
          event:event,
          data:{employeeId,salaryDetail,userDetail,month,year}
        }

        return FormateData(payload);
      }
      else{
        return FormateData({error:'No user found in database'});
      }
      
    } catch (error) {
      throw new APIError("Data Not found");
    }
  }

  //microservice to get user info
  async getUserInfo(employeeId,month,year){
    try {
      const user = await this.repository.FindById(employeeId);
     
      
    } catch (error) {
      throw new APIError("Data Not found");
    }
  }

    
    

//employee services to others
    //Events/services provided by employee to other apis
    async SubscribeEvents(payload){
 
      const { event, data } =  payload;

      const { employeeId,month,year } = data;


      switch(event){
          case 'TEST':
              console.log("WORKING FROM Employee");
              break;
          case 'GetSalaryById':
              this.getAttendance(userId); 
              break;
          case 'getUserInfo':
              this.getUserInfo(employeeId,month,year); 
              break;
      
          default:
              break;
      }

  }


}

module.exports = EmployeeService;
