const { response } = require("../app");
const adminHelpers = require("../helpers/adminHelpers");
const usersData = require("../model/userModel");
const categoryHelpers = require("../helpers/categoryHelpers");
const productHelpers = require("../helpers/productHelpers");
const products = require("../model/productModel");
const uploads = require("../middlewares/multer");
const orderModel = require("../model/orderModel");
const userHelpers = require("../helpers/userHelpers");

const adminCredentials = {
  name: "Admin",
  email: "admin@gmail.com",
  password: "123",
};

module.exports = {
  getAdminLogin: (req, res, next) => {
    if (req.session.admin) {
      res.render("admin/adminLogin", {
        admin: true,
      });
    } else {
      res.render("admin/adminLogin", {
        admin: false,
      });
    }
  },

  getAdminDashboard: (req, res, next) => {
    res.render("admin/index");
  },

  postAdminLogin: (req, res) => {
    console.log(req.body);
    try {
      if (
        req.body.email == adminCredentials.email &&
        req.body.password == adminCredentials.password
      ) {
        req.session.admin = true;
        res.redirect("/admin");
      } else {
        res.redirect("/admin/login");
      }
    } catch (error) {
      console.error(error);
    }
  },

  getAdminLogout: (req, res) => {
    req.session.admin = false;
    res.redirect("/admin");
  },


  //*********USER MANAGEMENT */
  //GETTING THE USER LIST
  //getting the users data from the users collection and rendereing
  getUsersList: async (req, res) => {
    try {
      adminHelpers.getUsers().then((users) => {
        res.render("admin/usersList", { users });
      });
    } catch (error) {
      console.error(error);
    }
  },
  //BLOCKING USER
  //updating the user document field of blocked status to true
  getBlockUser: (req, res) => {
    try {
      adminHelpers
        .blockUser(req.params.id)
        .then((response) => {
          res.redirect("/admin/usersList");
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  },
  //UNBLOCKING THE USER
  //updating the user document field of blocked status to true
  getUnblockUser: (req, res) => {
    try {
      adminHelpers.unblockUser(req.params.id).then((response) => {
        res.redirect("/admin/usersList");
      });
    } catch (error) { }
  },

  //***********CATEGORY MANAGEMENT*****
  //getting category
  //finding the all category from the category collection
  //also asiging the to be edit prod.Details if edit button is clicked :> to the editCat inorder to view in the editform as values
  getCategory: (req, res) => {
    try {
      categoryHelpers.getAllCategory().then((category) => {

        res.render("admin/categories", {
          category,
          message: req.flash('message')

        });
      }
      )
    } catch (error) {
      console.log(error);
    }
  },
  //creating category
  createCategory: (req, res) => {
    console.log(req.body);
    categoryHelpers.addCategory(req.body).then((response) => {
      if (response.exists) {
        req.flash('message', 'It is an Exisiting Product')
        res.redirect('/admin/getCategories')
      } else {
        res.redirect('/admin/getCategories')
      }
    }).catch((error) => {
      console.log(error);
    })
  },
  //deleting category
  getDeleteCategory: (req, res) => {
    categoryHelpers.deleteCategory(req.params.id).then((response) => {
      res.json({ status: true })
    });
  },

  //**********PRODUCT MANAGEMENT ******/
  //getting product listing page
  getProductList: (req, res) => {
    productHelpers.getProducts().then((products) => {
      res.render("admin/productsList", {
        products: products,
      });
    });
  },
  //getting add product page
  getAddProduct: (req, res) => {
    categoryHelpers.getAllCategory().then((category) => {
      res.render("admin/addProduct", {
        category: category,
      });
    });
  },
  //creating product
  postAddProduct: (req, res) => {
    let image = req.files
    console.log(image + 'in controoooooooooler');
    productHelpers.addProduct(req.body, image).then((response) => {
      res.redirect("/admin/addProduct");
      // res.json({ status: 'success', message: 'Your product has been added!' });
    })
  },
  //deleteing the product from list
  DeleteProduct: async (req, res) => {
    console.log(req.params.id);
    await products.deleteOne({ _id: req.params.id });
    res.redirect("/admin/getProducts");
  },
  //editing the porduct
  getEditProduct: async (req, res) => {
    try {
      console.log("in edit prodyct******");
      let product = await products.findById({ _id: req.params.id });
      console.log(product);
      let category = await categoryHelpers.getAllCategory();
      console.log(product);
      if (product) {
        res.render("admin/editProduct", {
          product: product,
          category: category,
        });
      } else {
        res.send("error");
      }
    } catch (error) {
      console.log(error);
    }
  },
  //POSTING THE UPDATED PRODUCT
  postEditProduct: (req, res) => {
    const body = req.body;
    const prodId = req.params.id;
    const file = req.file;
    const updatedProduct = productHelpers.postEditProduct(body, prodId, file);
    res.redirect("/admin/getProducts");

  },


  //ORDERlIST
  getOrderList: (req, res) => {
    adminHelpers.getAllOrder()
      .then((orderDetails) => {
        res.render("admin/orderList",{
          orderDetails
        })
      }).catch((error)=>{
        console.log(error);
      })
  },
  getOrderDetails: async(req,res)=>{
    let orderId = req.params.id 
    let addressDetails = await adminHelpers.getOrderAddressDetails(orderId)
    let itemDetails = await adminHelpers.getOrderItemDetails(orderId)
    console.log(addressDetails[0].totalAmount);
      res.render('admin/orderDetails',{
        addressDetails, 
        itemDetails,
      })
  },
  getChangeStatus:(req,res)=>{
    console.log(req.body, req.params.id);
     adminHelpers.getChangeStatus(req.body,req.params.id)
     .then((response)=>{
       res.json({status:true})
     })
     .catch((error)=>{
      res.json({status:false})
     })
    
  }


}
