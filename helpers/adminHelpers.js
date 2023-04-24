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



// await userDatas
// .find()
// .exec()
// .then((result)=>{
//     userDatas = result
// })
// console.log(userDatas);
// resolve(userDatas)
// })


// blockUser: (user_id)=>{
//     try {
//         return new Promise( async (resolve, reject) => {
//             swal({
//                 title:'Confirm User Blocking',
//                 text:'Are You sure want to block this user',
//                 icon:'warning',
//                 buttons:true,
//                 dangerMode:true
//             }).then(async (confirmed)=>{
//                 if(confirmed){
//                     //update user data
//                     await usersData
//                     .updateOne({_id:user_id},{$set:{blocked:true}})
//                     resolve()
//                 }else{
//                     //cancelled do nothing
//                     resolve()
//                 }
//             }).catch((error)=>{
//                 reject(error)
//             })
//         })
//     } catch (error) {
//         console.error(error);
//         reject(error)
//     }
// },