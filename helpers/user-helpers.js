var db = require('../config/connection');
var collection = require('../config/collections');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId
const crypto = require('crypto');

const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: 'rzp_test_qyirRzk9B6hlNz',
    key_secret: 'mGUwOF74I7Bcls6gWxfolM9K'
});
module.exports = {
    doSignup: async (userData) => {
        try {
            console.log("User data received:", userData);
            if (!userData || !userData.Password || typeof userData.Password !== 'string' ||
                !userData.repeatPassword || typeof userData.repeatPassword !== 'string') {
                throw new Error('Invalid password format');
            }

        
            if (userData.Password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }


            if (userData.Password !== userData.repeatPassword) {
                throw new Error('Passwords do not match');
            }


            userData.Password = await bcrypt.hash(userData.Password, 10); 
            delete userData.repeatPassword; 

            
            const data = await db.get().collection(collection.USER_COLLECTION).insertOne(userData);

           
            return data.ops[0];
        } catch (error) {
            console.error("Error in doSignup:", error);
            throw error; 
        }
        
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ 'products.item': objectId(proId), user: objectId(userId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve()
                            })

                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'

                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray();
                console.log(cartItems);

                resolve(cartItems)
            } catch (error) {
                console.error("Error in getCartProducts:", error);
                reject(error);
            }
        });
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count);
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);

        return new Promise((resolve, reject) => {
            if (details.count === -1 && details.quantity === 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        { _id: objectId(details.cart) },
                        { $pull: { products: { item: objectId(details.product) } } }
                    ).then((response) => {
                        resolve({ removeProduct: true });
                    }).catch((error) => {
                        reject(error);
                    });
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne(
                        { _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        { $inc: { 'products.$.quantity': details.count } }
                    ).then((response) => {
                        resolve({ status: true });
                    }).catch((error) => {
                        reject(error);
                    });
            }
        });
    }, removeProductFromCart: (cartId, productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne(
                    { _id: objectId(cartId) },
                    { $pull: { products: { item: objectId(productId) } } }
                )
                .then((response) => {
                    resolve({ status: true });
                })
                .catch((error) => {
                    reject({ status: false, message: error.message });
                });
        });
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            price: {
                                $convert: {
                                    input: { $replaceAll: { input: '$product.price', find: ',', replacement: '' } },
                                    to: 'double',
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$price'] } }
                        }
                    }
                ]).toArray();
                console.log(total);
                if (total.length === 0) {
                    resolve(0);
                } else {
                    resolve(total[0].total);
                }
            } catch (error) {
                console.error("Error in getTotalAmount:", error);
                reject(error);
            }
        });
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order.paymentMethod === 'Cash on Delivery' ? 'placed' : 'pending'; 
            let orderObj = {
                deliveryDetails: {
                    mobile: order.phone,
                    address: order.address,
                    pincode: order.pincode,
                    name: order.name,
                    email: order.email,
                    country: order.country,
                    city: order.city,
                    date: new Date()
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod, 
                products: products,
                totalAmount: total,
                status: status
            };
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(order.userId) });
                resolve(response.insertedId);
            }).catch((error) => {
                reject(error);
            });
        });
    },
    repeatOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order.paymentMethod === 'Cash on Delivery' ? 'placed' : 'pending'; 
            let orderObj = {
                deliveryDetails: {
                    mobile: order.phone,
                    address: order.address,
                    pincode: order.pincode,
                    name: order.name,
                    email: order.email,
                    country: order.country,
                    city: order.city,
                    date: new Date()
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod, 
                products: products,
                totalAmount: total,
                status: status
            };
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
              
                resolve(response.insertedId); 
            }).catch((error) => {
                reject(error);
            });
        });
    }
    ,
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) });

                if (!cart || !cart.products) {
                    return reject(new Error('Cart not found or has no products'));
                }

                resolve(cart.products);  
            } catch (error) {
                reject(error); 
            }
        });
    }
    , getIndividualProductTotals: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let productTotals = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            price: {
                                $convert: {
                                    input: { $replaceAll: { input: '$product.price', find: ',', replacement: '' } },
                                    to: 'double',
                                    onError: 0,
                                    onNull: 0
                                }
                            },
                            totalPrice: {
                                $multiply: [
                                    { $convert: { input: { $replaceAll: { input: '$product.price', find: ',', replacement: '' } }, to: 'double', onError: 0, onNull: 0 } },
                                    '$quantity'
                                ]
                            }
                        }
                    }
                ]).toArray();
                resolve(productTotals);
            } catch (error) {
                console.error("Error in getIndividualProductTotals:", error);
                reject(error);
            }
        });
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                
                let orders = await db.get().collection(collection.ORDER_COLLECTION)
                    .find({ userId: new objectId(userId) })
                    .sort({ date: -1 }) 
                    
                    .toArray();
                
                console.log('Fetched Orders:', orders); 
                
                
                orders = orders.map(order => {
                    return {
                        ...order,
                        products: order.products.map(product => ({
                            productId: product.item, 
                            quantity: product.quantity
                        }))
                    };
                });
                
    
               
                console.log('Orders with Product IDs:', orders); 
    
                resolve(orders);
            } catch (error) {
                console.error('Error fetching orders:', error); 
                reject(error);
            }
        });
    }
    

      
      ,
      

    getOrderProducts: (orderId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'

                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }

                ]).toArray();
                console.log(orderItems);

                resolve(orderItems)
            } catch (error) {
                console.error("Error in getCartProducts:", error);
                reject(error);
            }
        });
    },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: orderId,
                notes: {
                    key1: "value1",
                    key2: "value2"
                }
            }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("new order: ", order);
                    resolve(order);
                }
            });
        });
    },
    
    verifyPayment:(details) => {
        return new Promise((resolve, reject) => {
            let hmac = crypto.createHmac('sha256', 'mGUwOF74I7Bcls6gWxfolM9K');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex');
            if (hmac === details['payment[razorpay_signature]']) {
                resolve();
            } else {
                reject();
            }
        });
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) }, {
                    $set: { status: 'placed' }
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },
    addAllProductsToCart: (products, userId) => {
        return new Promise(async (resolve, reject) => {
          let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      
          if (userCart) {
            products.forEach((product) => {
              let proObj = {
                item: objectId(product._id),
                quantity: 1
              }
              let proExist = userCart.products.findIndex((prod) => prod.item == product._id)
      
              if (proExist != -1) {
                db.get().collection(collection.CART_COLLECTION)
                  .updateOne({ 'products.item': objectId(product._id), user: objectId(userId) },
                    {
                      $inc: { 'products.$.quantity': 1 }
                    }).then(() => {
                 
                  })
              } else {
                db.get().collection(collection.CART_COLLECTION)
                  .updateOne({ user: objectId(userId) },
                    {
                      $push: { products: proObj }
                    }
                  ).then((response) => {
               
                  })
              }
            })
            resolve()
          } else {
            let cartObj = {
              user: objectId(userId),
              products: products.map((product) => {
                return {
                  item: objectId(product._id),
                  quantity: 1
                }
              })
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
              resolve()
            })
          }
        })
      },
      getUserOrderDetails: (orderId) => {
        console.log("Function called with orderId:", orderId);
        return new Promise(async (resolve, reject) => {
          try {
            const orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) });
            console.log("Order details retrieved from database:", orderDetails);
            resolve(orderDetails);
          } catch (error) {
            console.error("Error fetching order details:", error);
            reject(error);
          }
        });
      },
      getOrderProductList: (orderId) => {
        return new Promise(async (resolve, reject) => {
          try {
            
            const orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) });
            if (orderDetails) {
              resolve(orderDetails.products);
            } else {
              reject(new Error('Order not found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      },
      
      getTotalAmountOfOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
          try {
            
            const orderDetails = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) });
            if (orderDetails) {
              resolve(orderDetails.totalAmount);
            } else {
              reject(new Error('Order not found'));
            }
          } catch (error) {
            reject(error);
          }
        });
      },
      removeOrderById: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .deleteOne({ _id: objectId(orderId) })
                .then((result) => {
                    if (result.deletedCount === 1) {
                        resolve('Order removed successfully');
                    } else {
                        reject(new Error('Order not found or not deleted'));
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    },
     getRecentProducts:() => {
        return new Promise(async (resolve, reject) => {
          try {
            let recentproducts = await db.get().collection(collection.PRODUCT_COLLECTION)
              .find()
              .sort({ createdAt: -1 }) 
              .limit(5) 
              .toArray();
            resolve(recentproducts);
          } catch (error) {
            reject(error);
          }
        });
      }
      
     
    




};
