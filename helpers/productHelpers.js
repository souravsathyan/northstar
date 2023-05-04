const { response } = require("../app");
const products = require("../model/productModel");
const ObjectId = require("mongoose").Types.ObjectId;
// const fs = require('fs')

module.exports = {
  getProducts: () => {
    try {
      return new Promise(async (resolve, reject) => {
        //using lookup for adding category to products
        await products
          .aggregate([
            {
              $lookup: {
                from: "categories",
                localField: "prodCategory",
                foreignField: "_id",
                as: "category",
              },
            },
          ])
          .then((result) => {
            resolve(result);
          });
      });
    } catch (error) {
      console.log(error);
    }
  },
  //adding the prodct to dataBase
  addProduct: (productData, image) => {
    return new Promise(async (resolve, reject) => {
      //ceating product
      await products
        .create({
          prodName: productData.prodName,
          prodDescription: productData.prodDescription,
          prodBrand: productData.prodBrand,
          prodPrice: productData.prodPrice,
          prodPromoPrice: productData.proPromoPrice,
          prodQuantity: productData.prodQty,
          prodColor: productData.prodColor,
          prodSize: productData.prodSize,
          prodImage: image.filename,
          prodCategory: productData.prodCategory,
        })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  },
  //updating the product
  postEditProduct: async (prodBody, prodId, newImg) => {
    let updatedProduct;
    if (newImg) {
      updatedProduct = await products.findByIdAndUpdate(
        { _id: prodId },
        {
          prodName: prodBody.prodName,
          prodDescription: prodBody.prodDescription,
          prodBrand: prodBody.prodBrand,
          prodPrice: prodBody.prodPrice,
          prodPromoPrice: prodBody.proPromoPrice,
          prodQuantity: prodBody.prodQty,
          prodColor: prodBody.prodColor,
          prodSize: prodBody.prodSize,
          prodImage: newImg.filename,
          prodCategory: prodBody.prodCategory,
        }
      );
    } else {
      //if no product image then update the project with no image
      updatedProduct = await products.findByIdAndUpdate(
        { _id: prodId },
        {
          prodName: prodBody.prodName,
          prodDescription: prodBody.prodDescription,
          prodBrand: prodBody.prodBrand,
          prodPrice: prodBody.prodPrice,
          prodPromoPrice: prodBody.proPromoPrice,
          prodQuantity: prodBody.prodQty,
          prodColor: prodBody.prodColor,
          prodSize: prodBody.prodSize,
          prodCategory: prodBody.prodCategory,
        }
      );
    }
    return updatedProduct
  },
  
  getProductByCategory:  (catId) => {  
      return new Promise(async(resolve, reject) => {
        await products.aggregate([{ $match: { prodCategory: new ObjectId(catId) } }])
        .then((response)=>{
          console.log(response);
          resolve(response)
        })
      })  
    // let filteredProducts = []
      // filteredProducts =  await products.aggregate([{ $match: { prodCategory: new ObjectId(catId) } }])
      // console.log(filteredProducts+'ooooooooooooooooooo');
      // return filteredProducts 
}

  // //deleteing the product from list
  // deleteProduct:(prodId)=>{
  //     return new Promise(async (resolve, reject) => {
  //         await products.deleteOne({_id:prodId})
  //         .then((result)=>{
  //             resolve(result)
  //         })
  //     })
  // }
};
