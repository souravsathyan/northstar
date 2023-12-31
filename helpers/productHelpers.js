const { response } = require("../app");
const products = require("../model/productModel");
const ObjectId = require("mongoose").Types.ObjectId;
const slugify = require('slugify')

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
      reject(error)
    }
  },
  //adding the prodct to dataBase
  addProduct: (productData, image) => {
    return new Promise(async (resolve, reject) => {
      try {
        const slug = slugify(productData.prodName)
        console.log(slug);
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
            prodImage: image.map(file => file.filename),
            prodCategory: productData.prodCategory,
            slug:slug
          })
          .then((response) => {
            resolve(response);
          })
      } catch (error) {
        reject(error)
      }
    });
  },
  //updating the product
  postEditProduct: async (prodBody, prodId, newImg) => {
    console.log('in the edit product')
    console.log(newImg)
    try {
       const slug = slugify(prodBody.prodName)
      let updatedProduct;
      if (newImg.length !== 0) {
        console.log('in the new image if');
        updatedProduct = await products.findByIdAndUpdate(
          prodId,
          {
            prodName: prodBody.prodName,
            prodDescription: prodBody.prodDescription,
            prodBrand: prodBody.prodBrand,
            prodPrice: prodBody.prodPrice,
            prodPromoPrice: prodBody.proPromoPrice,
            prodQuantity: prodBody.prodQty,
            prodColor: prodBody.prodColor,
            prodSize: prodBody.prodSize,
            prodImage: newImg.map(file => file.filename),
            prodCategory: prodBody.prodCategory,
            slug:slug
          }
        );
      } else {
        //if no product image then update the project with no image
        console.log('its in not image')
        updatedProduct = await products.findByIdAndUpdate(
          prodId,
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
            slug:slug
          }
        );
      }
      return updatedProduct
    } catch (error) {
      console.log(error);
      throw new Error('Error: ' + error);
    }
  },
  //getting product by category
  getProductByCategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await products.aggregate([{ $match: { prodCategory: new ObjectId(catId) } }])
          .then((response) => {
            resolve(response)
          })
      } catch (error) {
        reject(error)
      }
    })
  },

  decreaseStock:(cartProducts)=>{
    return new Promise(async (resolve, reject) => {
   
      for (let i = 0; i < cartProducts.length; i++) {
          let product = await products.findById({ _id: cartProducts[i].productId });
          const isProductAvailableInStock = (product.prodQuantity - cartProducts[i].quantity) > 0 ? true : false;
          if (isProductAvailableInStock) {
              product.prodQuantity = product.prodQuantity - cartProducts[i].quantity;
          }
          await product.save();
      }
      resolve(true)
  })
  }

};
