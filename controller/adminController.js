const { response } = require("../app");
const adminHelpers = require("../helpers/adminHelpers");
const usersData = require("../model/userModel");
const categoryHelpers = require("../helpers/categoryHelpers");
const productHelpers = require("../helpers/productHelpers");
const products = require("../model/productModel");
const uploads = require("../middlewares/multer");

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
  getUsersList: async (req, res) => {
    try {
      adminHelpers.getUsers().then((users) => {
        res.render("admin/usersList", { users });
      });
    } catch (error) {
      console.error(error);
    }
  },
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
  getUnblockUser: (req, res) => {
    try {
      adminHelpers.unblockUser(req.params.id).then((response) => {
        res.redirect("/admin/usersList");
      });
    } catch (error) { }
  },

  //***********CATEGORY MANAGEMENT*****
  //getting category
  getCategory: (req, res) => {
    try {
      categoryHelpers.getAllCategory().then((category) => {
        if (req.session.updated) {
          let editCat = req.session.tempCat
          res.render("admin/categories", {
            category: category,
            editCat: editCat,
            updated: true
          });
        } else {
          res.render("admin/categories", { category });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },
  //creating category
  createCategory: (req, res) => {
    console.log(req.body);
    try {
      categoryHelpers.addCategory(req.body).then((response) => {
        console.log(response);
        res.redirect("/admin/getCategories");
      });
    } catch (error) {
      console.log(error);
    }
  },
  //deleting category
  getDeleteCategory: (req, res) => {
    categoryHelpers.deleteCategory(req.params.id).then((response) => {
      res.redirect("/admin/getCategories");
    });
  },
  //editing category
  getEditCategory: async (req, res) => {
    let catId = req.params.id;
    let findResult = await categoryHelpers.getEditCategory(catId)
    console.log(findResult);
    req.session.tempCat = findResult;
    req.session.updated = true
    res.redirect('/admin/getCategories')

  },
  //Posting the updated details of category
  postEditCategory: (req, res) => {
    const catId = req.params.id
    const catBody = req.body
    categoryHelpers.postEditCategory(catId, catBody).then((response) => {
      req.session.updated = false
      res.redirect('/admin/getCategories')
    })

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
    console.log(image+'in controoooooooooler');
    productHelpers.addProduct(req.body, image).then((response) => {
      res.redirect("/admin/addProduct");
    });
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
  postEditProduct: (req, res) => {
    const body = req.body;
    const prodId = req.params.id;
    const file = req.file;
    const updatedProduct = productHelpers.postEditProduct(body, prodId, file);
    res.redirect("/admin/getProducts");

  },
};
