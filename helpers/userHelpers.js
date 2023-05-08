const connection = require('../config/connection');
const bcrypt = require('bcrypt');
const usersData = require('../model/userModel');
const twilio = require('../api/twilio');
const { response } = require('../app');
const mongoose = require('mongoose');
const productData = require('../model/productModel');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
    //user sign up 
    doSignUp: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            const isUserExists = await usersData.findOne({ $or: [{ email: userData.Email }, { phone: userData.Mobile }, { name: userData.name }] })            
            try {
                if (!isUserExists) {
                    userData.Password = await bcrypt.hash(userData.Password, 10)  
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
            //finds user by the email
            let user = await usersData.findOne({ email: userData.Email })
            console.log(user);
            let response = {}
            try {
                if (user) {
                    //comparing the entered password 
                    bcrypt.compare(userData.Password, user.password).then((status) => {
                        //if user is blocked 
                        if (user.blocked) {
                            response.blocked = true
                            resolve({
                                response
                            })
                        }
                        //if compared success assiging user and status to an empty object
                        //and resolving it 

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
                    console.log('non-existing user');
                    resolve(response);
                } //if yes resolve it with true status also with user
                else {
                    twilio.sendOTP(phoneNo)
                    response.status = true
                    response.user = existingUser
                    console.log('OTP sent');
                    resolve(response)
                }
            } catch (error) {
                console.log(error);
                reject(error);
            }
        })
    },

    //verifying otp
    otpVerification: (phoneNo, otpValues) => {
        try {
            let response = {}
            return new Promise(async (resolve, reject) => {
                let verifiedOtp = await twilio.verifyOtp(phoneNo, otpValues)
                if (verifiedOtp) {
                    response.status = true
                    resolve(response)
                } else {
                    response.stats = false
                    resolve(response)
                }
            })
        } catch (error) {
            console.log(error);
        }
    },

    //updating password
    newPassword: (newPwd, userID) => {
        return new Promise(async (resolve, reject) => {
            try {
                // const objectId = new ObjectId(userID);
                //bycrypting the new password
                let hashedPassword = await bcrypt.hash(newPwd, 10)
                console.log(hashedPassword+'   ------pwd hashed');
                //updating the user password
                await usersData.updateOne(
                    {_id:userID},
                    {$set : { password: hashedPassword }})
                    .then((response) => {
                        resolve()
                    })
                console.log('password updated');
            } catch (error) {
                console.log(error);
            }
        })
    },
    //getting the product
    getProductView:(prodId)=>{
        return new Promise(async (resolve, reject) => {
            await productData.findById({_id:prodId})
            .then((response)=>{
                console.log(response+'got product');
                resolve(response)
            })
            .catch((error)=>{
                console.log(error);
            })
            
        })
    }
}

