const connection = require('../config/connection');
const bcrypt = require('bcrypt');
const usersData = require('../model/userModel');
const twilio = require('../api/twilio')

module.exports = {
    //user sign up 
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            const isUserExists = await usersData.findOne({ $or: [{ email: userData.Email }, { phone: userData.Mobile }, { name: userData.name }] })
            console.log(isUserExists + '-------------');
            try {
                if (!isUserExists) {
                    userData.Password = await bcrypt.hash(userData.Password, 10)
                    console.log('jiiiii');
                    console.log(userData);
                    usersData.create({
                        name: userData.Name,
                        email: userData.Email,
                        phone: userData.Mobile,
                        password: userData.Password
                    }).then((data) => {
                        resolve(data)
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    resolve({ isUserExists: true })
                }
            } catch (error) {
                console.error(error.message);
            }

        })
    },

    //user login
    doLogin: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            let user = await usersData.findOne({ email: userData.Email })
            console.log(user);
            let response = {}
            try {
                if (user) {
                    bcrypt.compare(userData.Password, user.password).then((status) => {
                        if (user.blocked) {

                            resolve({
                                blocked: true
                            })
                        }
                        else if (status) {
                            response.user = user
                            response.status = true
                            console.log('login success');
                            resolve(response)
                        } else {
                            console.log('login failure1');
                            resolve({ status: false })
                        }
                    })
                } else {
                    console.log('login failure2');
                    resolve({ status: false })
                }
            } catch (error) {
                console.error(error);
            }

        })
    },

    //sending Otp
    sendOtp: (phoneNo) => {

        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                //finding the user by the phone no.
                const existingUser = await usersData.findOne({ phone: phoneNo });
                //if no resolve it with false status
                if (!existingUser) {
                    response.status = false
                    resolve(response);
                } //if yes resolve it with true status also with user
                else {
                    twilio.sendOTP(phoneNo)
                    response.status = true
                    response.user = existingUser
                    resolve(response)
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    },

    otpVerification: (phoneNo, otpValues) => {
        try {
            let response = {}
            return new Promise(async (resolve, reject) => {
                let verifiedOtp = await twilio.verifyOtp(phoneNo, otpValues)
                if (verifiedOtp) {
                    response.status = true
                    resolve(response)
                }else{
                    response.stats=false
                    resolve(response)
                }
                // .then((status) => {
                //     response.status = true
                //     resolve(response)
                // })
                // .catch((error) => {
                //     reject()
                // })
            })
        } catch (error) {
            console.log(error);
        }
    }
}

