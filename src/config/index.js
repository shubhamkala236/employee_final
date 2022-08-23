const dotEnv  = require("dotenv");
dotEnv.config();

// if (process.env.NODE_ENV !== 'employee') {
//     const configFile =  `./.env.${process.env.NODE_ENV}`;
//     dotEnv.config({ path:  configFile });
// } else {

//     dotEnv.config();
// }


module.exports = {
    PORT: process.env.PORT,
    DB_URL: process.env.MONGODB_URI,
    APP_SECRET: process.env.APP_SECRET,
    API_KEY: process.env.API_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET,
    MESSAGE_BROKER_URL:process.env.MESSAGE_BROKER_URL,
    EXCHANGE_NAME:'HRMS',
    Salary_BINDING_KEY:'Employee_Key',
    Attendance_BINDING_KEY:'Attendance_Key',
    QUEUE_NAME:'HRMS_QUEUE'




}
 