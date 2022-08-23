const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SalaryDetailsSchema = new Schema({

    Employee_id:{
        type: Number,
        required: true,
        unique:true,
    },
    Basic:{
        type: Number,
        required: true,
    },
    HRA:{
        type: Number,
        required: true,
    },
    Convince:{
        type: Number,
        required: true,
    },
    LTA:{
        type: Number,
        required: true,
    },
    SPL:{
        type: Number,
        required: true,
    },
    PF_Employee:{
        type: Number,
        required: true,
    },
    PF_Employer:{
        type: Number,
        required: true,
    },
    ESIC_Employer:{
        type: Number,
        required: true,
    },
    ESIC_Employee:{
        type: Number,
        required: true,
    },
    TDS:{
        type: Number,
        required: true,
    },
    MEDICAL:{
        type: Number,
        required: true,
    },
    PF_NUMBER:{
        type: Number,
        required: true,
    },
    ESIC_NUMBER:{
        type: Number,
        required: true,
    },
    LWF_Employer:{
        type: Number,
        required: true,
    },

});
        
  

module.exports =  mongoose.model('salaryDetails',SalaryDetailsSchema);