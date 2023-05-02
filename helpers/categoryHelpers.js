const categoryDB = require('../model/categoryModel')

module.exports = {
    addCategory: (prodDatas)=>{
        try {
            return new Promise(async (resolve, reject) => {
                await categoryDB.create({
                    name: prodDatas.catName,
                    description:prodDatas.catDescription,
                })
                .then((category)=>{
                    resolve(category)
                })
                .catch((error)=>{
                    console.log(error);
                })
            })
        } catch (error) {
            console.log(error);
        }
    },
    getAllCategory:()=>{
        let catList = []
        return new Promise(async (resolve, reject) => {
            try {
                await categoryDB.find()
                .then((result)=>{
                    catList = result
                    resolve(catList)
                })
            } catch (error) {
                console.log(error);
            }
        })
    },
    deleteCategory:(cat_id)=>{
        return new Promise(async (resolve, reject) => {
            await categoryDB.deleteOne({_id:cat_id})
            .then((response)=>{
                resolve(response)
            })
        })
    }
}
