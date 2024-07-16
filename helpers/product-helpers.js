var db = require('../config/connection');
var collection = require('../config/collections');
var objectId=require('mongodb').ObjectId
const { response } = require('../app');
module.exports = {
    addProduct: (product, callback) => {
      product.createdAt = new Date(); // Add createdAt field
        db.get().collection('product').insertOne(product).then((data) => {

            callback(data.ops[0]._id)// Return the inserted product ID
        })
            .catch(err => {
                console.error('Error inserting product:', err);
                callback(false); // Handle error, possibly inform callback about failure
            });
    },
     getAllProducts:(category) => {
      return new Promise((resolve, reject) => {
          let query = {};
          if (category) {
              query.category = category;
          }
          db.get().collection(collection.PRODUCT_COLLECTION).find(query).toArray()
              .then(products => {
                  resolve(products);
              })
              .catch(error => {
                  reject(error);
              });
      });
  },
  getProductSuggestions: (query) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).find({
        name: { $regex: query, $options: 'i' }
      }).limit(10).distinct('name')
        .then(suggestions => {
          resolve(suggestions);
        })
        .catch(error => {
          reject(error);
        });
    });
  },

  searchProductsByName: (query) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).find({
        name: { $regex: query, $options: 'i' }
      }).toArray()
        .then(products => {
          resolve(products);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  
    // In product-helpers.js

    getAllCategories: () => {
      return new Promise((resolve, reject) => {
          db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                  $group: {
                      _id: "$category"
                  }
              },
              {
                  $project: {
                      _id: 0,
                      category: "$_id"
                  }
              }
          ]).toArray()
          .then(categories => {
              const categoryNames = categories.map(c => c.category);
              resolve(categoryNames);
          })
          .catch(error => {
              reject(error);
          });
      });
  }
  
  ,



    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
         db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
           // console.log(response);
            resolve(response)
         }) 
        })
    },
    getProductDetails: (prodId)=>{
      return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product)=>{
           
           resolve(product) 
        })
      })  
    },
    updateProduct: (proId, proDetails) => {
      return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne(
          { _id: objectId(proId) },
          {
            $set: {
              name: proDetails.name,
              description: proDetails.description,
              price: proDetails.price,
              category: proDetails.category
            }
          }
        )
        .then(response => {
          console.log('Product updated:', response);
          resolve();
        })
        .catch(error => {
          console.error('Failed to update product:', error);
          reject(error);
        });
      });
    },
    
    getAllOrderProducts: () => {
        return new Promise(async (resolve, reject) => {
          try {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $unwind: '$products'
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: 'products.item',
                  foreignField: '_id',
                  as: 'productDetails'
                }
              },
              {
                $unwind: '$productDetails'
              },
              {
                $group: {
                  _id: '$_id',
                  deliveryDetails: { $first: '$deliveryDetails' },
                  paymentStatus: { $first: '$status' },
                  totalAmount: { $first: '$totalAmount' },
                  paymentMethod: { $first: '$paymentMethod' },
                  date: { $first: '$deliveryDetails.date' },
                  products: { $push: { item: '$products.item', quantity: '$products.quantity', productName: '$productDetails.name' } }
                }
              },
              { $sort: { date: -1 } } // Sort by date in descending order
            ]).toArray();
            resolve(orders);
          } catch (error) {
            reject(error);
          }
        })
      }
    
      , 
      updateOrderStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: objectId(orderId) }, { $set: { status } })
            .then(result => resolve(result))
            .catch(error => reject(error));
        });
      },
      getAllUsers:() => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION) // Ensure you have the correct collection name for users
                .find({}, { projection: { _id: 1, name: 1, email: 1 } })
                .toArray()
                .then(users => resolve(users))
                .catch(error => {
                    console.error('Error fetching users from the database:', error);
                    reject(error);
                });
        });
    },
   
    
      
    
};
