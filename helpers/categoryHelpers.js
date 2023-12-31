const { response } = require('../app')
const categoryDB = require('../model/categoryModel')

module.exports = {
    //adding category
    addCategory: async (prodDatas) => {

        return new Promise(async (resolve, reject) => {
            try {
                let response = {}
                let existingCat = await categoryDB.findOne({ name: { $regex: new RegExp('^' + prodDatas.catName + '$', 'i') } })
                if (existingCat) {
                    response.exists = true
                    resolve(response)
                } else {
                    await categoryDB.create({
                        name: prodDatas.catName,
                        description: prodDatas.catDescription,
                    }).then((category) => {
                        resolve(category)
                    })
                }
            } catch (error) {
                reject(error)
            }
        })

    },
    //getting all category & displaying in table
    getAllCategory: () => {
        let catList = []
        return new Promise(async (resolve, reject) => {
            try {
                await categoryDB.find()
                    .then((result) => {
                        catList = result
                        resolve(catList)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },
    //deleting the category from DB
    deleteCategory: (cat_id) => {
        return new Promise(async (resolve, reject) => {
            try {  
            await categoryDB.deleteOne({ _id: cat_id })
            .then((response) => {
                resolve(response)
            })
            } catch (error) {
                reject(error)
            }
        })
    },
    //getting the edit product page
    getEditCategory: async (catId) => {
        try {
            let findResult = await categoryDB.findById({ _id: catId })
            return findResult
        } catch (error) {
            throw new Error('Error getting order Address: ' + error);
        }

    },
    //updating the category and passing the category with id
    postEditCategory: (catId, catBody) => {
        return new Promise(async (resolve, reject) => {
            try {
                
            await categoryDB.findByIdAndUpdate(
                { _id: catId },
                {
                    name: catBody.catName,
                    description: catBody.catDescription
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}
