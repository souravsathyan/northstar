// const { Result } = require("express-validator");
const usersData = require("../model/userModel");
const swal = require("sweetalert");


module.exports = {
    getUsers: () => {
        let usersList = []
        return new Promise(async (resolve, reject) => {
            await usersData
                .find()
                // .exec()
                .then((result) => {
                    usersList = result
                })
            
            resolve(usersList)
        })
    },
    blockUser: (user_id)=>{
        try {
            return new Promise( async (resolve, reject) => {
                await usersData
                .updateOne({_id:user_id},{$set:{blocked:true}})
                .then((data)=>{
                    resolve()
                })
            })
        } catch (error) {
            console.error(error);
        }
    },
    unblockUser:(user_id)=>{
        try {
            return new Promise(async (resolve, reject) => {
                await usersData
                .updateOne({_id:user_id},{$set:{blocked:false}})
                .then((data)=>{
                    resolve()
                })
            })
        } catch (error) {
            console.error(error);
        }
    }
}


