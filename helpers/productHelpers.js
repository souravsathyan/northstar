const products = require('../model/productModel')
const ObjectId = require('mongoose').Types.ObjectId
const fs = require('fs')

module.exports = {
    getProducts: () => {
        try {
            
            return new Promise(async (resolve, reject) => {
                //using lookup for adding category to products
                await products.aggregate([
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'prodCategory',
                            foreignField: '_id',
                            as: 'category'
                        }
                    }
                ]).then((result) => {
                    resolve(result)
                })
            })
        } catch (error) {
            console.log(error);
        }
    },
    //adding the prodct to dataBase
    addProduct: (productData, image) => {
        return new Promise(async (resolve, reject) => {
            //ceating product 
            await products.create({
                prodName: productData.prodName,
                prodDescription: productData.prodDescription,
                prodBrand: productData.prodBrand,
                prodPrice: productData.prodPrice,
                prodPromoPrice: productData.proPromoPrice,
                prodQuantity: productData.prodQty,
                prodColor: productData.prodColor,
                prodSize: productData.prodSize,
                prodImage: image.filename,
                prodCategory: productData.prodCategory
            }).then((response) => {
                resolve(response)
            }).catch((error) => {
                console.log(error);
            })
        })
    }
}