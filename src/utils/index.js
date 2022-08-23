const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
// const Sib = require('sib-api-v3-sdk');
const amqplib = require('amqplib');
const {EmployeeModel} = require("../database/models");



// const nodeMailer = require('nodemailer');

// const axios = require('axios');

const { APP_SECRET,MESSAGE_BROKER_URL,EXCHANGE_NAME,QUEUE_NAME} = require('../config');

//Utility functions
module.exports.GenerateSalt = async() => {
        return await bcrypt.genSalt()    
},

module.exports.GeneratePassword = async (password, salt) => {
        return await bcrypt.hash(password, salt);
};


module.exports.ValidatePassword = async (enteredPassword, savedPassword, salt) => {
        return await this.GeneratePassword(enteredPassword, salt) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
        return await jwt.sign(payload, APP_SECRET, { expiresIn: '1d'} )
}, 

module.exports.ValidateSignature  = async(req) => {

        const signature = req.get('Authorization');

        // console.log(signature);
        
        if(signature){
            const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
            req.user =  await EmployeeModel.findById(payload._id);
            console.log(payload);
            return true;
        }

        return false
};

module.exports.FormateData = (data) => {
        if(data){
            return { data }
        }else{
            throw new Error('Data Not found!')
        }
    }


    //Message broker to publish events and send payload 

    //create channel
    module.exports.CreateChannel = async() => {

        try {
                const connection = await amqplib.connect(MESSAGE_BROKER_URL);
                const channel = await connection.createChannel()
                await channel.assertExchange(EXCHANGE_NAME,'direct',false)
                return channel  

        } catch (error) {
                throw error;
        }
        
    }

    //publish events/messages/payload send

    module.exports.PublishMessage = async(channel,binding_Key,message) => {

        try {
                await channel.publish(EXCHANGE_NAME,binding_Key,Buffer.from(message))
                console.log("Message has been send"+message);

        } catch (error) {
                throw error;
        }
        
    }
    

    //subscribe messages

    module.exports.SubscribeMessage = async(channel,service,binding_Key) => {

        try {
                const appQueue = await channel.assertQueue(QUEUE_NAME);

                channel.bindQueue(appQueue.queue,EXCHANGE_NAME,binding_Key)

                channel.consume(appQueue.queue,data=>{
                        console.log("Received data");
                        console.log(data.content.toString())
                
                        channel.ack(data);
                })

        } catch (error) {
                throw error;
        }
        
    }




 