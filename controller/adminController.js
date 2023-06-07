const { response } = require("../app");
const adminHelpers = require("../helpers/adminHelpers");
const usersData = require("../model/userModel");
const categoryHelpers = require("../helpers/categoryHelpers");
const productHelpers = require("../helpers/productHelpers");
const products = require("../model/productModel");
const orderData = require("../model/orderModel");
const userHelpers = require("../helpers/userHelpers");
const ObjectId = require("mongoose").Types.ObjectId;
const excelJs = require('exceljs');
const couponData = require('../model/couponModel')
const vocherGenerator = require('voucher-code-generator')
const bannersData = require('../model/banner')

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

  getAdminDashboard: async (req, res, next) => {
    const orderDetails = await adminHelpers.getAllOrder()
    const totalRevenue = await adminHelpers.totalSales()
    const productCount = await adminHelpers.productCount()
    const orderCount = await adminHelpers.orderCount()
    const chartDetails = await adminHelpers.getSalesDEtails()
    res.render("admin/index", {
      totalRevenue,
      orderDetails,
      productCount,
      orderCount,
      chartDetails
    });
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
  getDeleteCategory: async (req, res) => {
    const isCatExists = await products.aggregate([
      { $match: { prodCategory: req.params.id } }
    ])
    console.log(isCatExists);
    if (isCatExists.length > 0) {
      res.json({ status: false })
    } else {
      categoryHelpers.deleteCategory(req.params.id).then((response) => {
        res.json({ status: true })
      });
    }
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
    }).catch((error) => {
      res.status(500).render('error', { error });
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
      let product = await products.findById({ _id: req.params.id });
      let category = await categoryHelpers.getAllCategory();
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
  postEditProduct: async (req, res) => {
    try {
      const body = req.body;
      const prodId = req.params.id;
      const files = req.files;
      await productHelpers.postEditProduct(body, prodId, files);
      res.redirect("/admin/getProducts");
    } catch (error) {
      console.log(error);
      res.status(500).render('error', { error });

    }

  },
  deleteImage: async (req, res) => {
    const { fileName, prodId } = req.body
    await products.updateOne(
      { _id: new ObjectId(prodId) },
      {
        $pull: { prodImage:fileName } 
      })

      res.json({status:true})
  },


  //ORDERlIST
  getOrderList: (req, res) => {
    adminHelpers.getAllOrder()
      .then((orderDetails) => {
        orderDetails.sort((a, b) => b.orderDate - a.orderDate);
        res.render("admin/orderList", {
          orderDetails
        })
      }).catch((error) => {
        console.log(error);
      })
  },
  getOrderDetails: async (req, res) => {
    let orderId = req.params.id
    let addressDetails = await adminHelpers.getOrderAddressDetails(orderId)
    let itemDetails = await adminHelpers.getOrderItemDetails(orderId)
    console.log(addressDetails[0].totalAmount);
    res.render('admin/orderDetails', {
      addressDetails,
      itemDetails,
    })
  },
  getChangeStatus: (req, res) => {
    console.log(req.body, req.params.id);
    adminHelpers.getChangeStatus(req.body, req.params.id)
      .then((response) => {
        res.json({ status: true })
      })
      .catch((error) => {
        res.json({ status: false })
      })

  },
  getCancelOrder: async (req, res) => {
    try {
      console.log(req.params.id);
      const orderId = req.params.id
      await orderData.updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            orderStatus: "cancelled"
          }
        }
      )
      res.json({ status: true })
    } catch (error) {
      console.log(error);
      res.status(500).render('error', { error });
    }
  },

  getSalesData: async (req, res) => {
    try {
      const sales = await adminHelpers.getAllDeliveredOrder()
      console.log(sales)
      res.render('admin/salesReport', {
        sales
      })
    } catch (error) {
      console.log(error)
      res.status(500).render('error', { error });
    }
  },
  //getting orders by date
  postSalesData: async (req, res) => {
    try {
      let { startDate, endDate } = req.body;
      startDate = new Date(startDate)
      endDate = new Date(endDate)
      const salesReport = await adminHelpers.getDeliveredOrders(startDate, endDate)
      res.json({ sales: salesReport })
    } catch (error) {
      console.log(error)
      res.status(500).render('error', { error });
    }
  },

  //coupons
  getCoupons: async (req, res) => {
    try {
      let allCoupons = await adminHelpers.getAllCoupons();
      res.render('admin/coupon', {
        allCoupons
      })
    } catch (error) {
      console.log(error)
      res.status(500).render('error', { error });
    }
  },
  postCouponData: (req, res) => {
    console.log(req.body)
    adminHelpers.makeCoupon(req.body)
      .then((response) => {
        res.json({ status: true })
      })
      .catch((error) => {
        console.log(error)
        res.status(500).render('error', { error });
      })
  },
  getBanner: async (req, res) => {
    try {
      const bannerList = await bannersData.find({})
      res.render('admin/banner', {
        bannerList
      })
    } catch (error) {
      console.log(error)
      res.status(500).render('error', { error });
    }
  },
  addBanner: async (req, res) => {
    try {
      const { Description } = req.body
      const Image = req.file
      const name = req.body.name
      const newBanner = new bannersData({
        name: name,
        Image: Image.filename,
        Description: Description,
      })
      const banner = await newBanner.save()
      if (banner) {
        res.send({ message: "banner added" })
      } else {
        res.send({ message: "something went worng" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).render('error', { error });
    }
  }


}
