const express = require("express");
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
const { PORT } = require('./config');
const { databaseConnection } = require('./database/index');


// const { employee } = require('./api');
const expressApp = require("./express-app");
const { CreateChannel } = require("./utils");

const StartServer = async() => {
    
    const app = express();
    
    await databaseConnection();

    const channel =  await CreateChannel()
    
    await expressApp(app,channel);
    //Handling uncaught Error
    process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception promise rejection`);
    process.exit(1);

})

	app
		.listen(PORT || 8001, () => {
			console.log(`App is running on port ${PORT}`);
		})
		.on("error", (err) => {
			console.log(err);
			process.exit();
		});
};

StartServer();

