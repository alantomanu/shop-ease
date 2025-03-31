var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers.js');
var userHelpers = require('../helpers/user-helpers.js');
const Razorpay = require('razorpay');

/* GET home page. */
const verifyLogin=(req,res,next)=>{
  if(req.session.userloggedIn){
    next()
  }else{
    res.redirect('/login')
  }
  }
  router.get('/', async function (req, res, next) {
    let user = req.session.user;
    console.log(user);
    let cartCount = null;
    let categories = await productHelpers.getAllCategories(); // Fetch categories

    if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
    }

    try {
        let products = await productHelpers.getAllProducts();
        let recentProducts = await userHelpers.getRecentProducts();
        res.render('user/home', { products, recentProducts, user, cartCount, categories, admin: false }); // Pass categories to the template
    } catch (error) {
        console.error('Failed to fetch products:', error);
        res.render('user/home', { products: [], recentProducts: [], user, cartCount, categories: [], admin: false }); // Handle error case
    }
});

router.get('/products', async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  let categories = await productHelpers.getAllCategories();
  if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  // Get the category from the query parameters
  let category = req.query.category;

  try {
      // Fetch products filtered by the category
      let products = await productHelpers.getAllProducts(category);
      res.render('user/view-products', { products, user, cartCount,categories, admin: false });
  } catch (error) {
      console.error('Failed to fetch products:', error);
      res.render('user/view-products', { products: [], user,categories: [], cartCount, admin: false });
  }
});
// Route for search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const query = req.query.query || '';
    const suggestions = await productHelpers.getProductSuggestions(query);
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';
    const products = await productHelpers.searchProductsByName(query);
    let user = req.session.user;
    let cartCount = null;
    let categories = await productHelpers.getAllCategories();

    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }

    // Pass the noResults flag to the template if no products are found
    const noResults = products.length === 0;

    res.render('user/search-results', { products, query, user, cartCount, categories, admin: false, noResults });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.set('Cache-Control', 'no-store');
    res.render('user/login',{"loginerr":req.session.userloginerr});
    req.session.userloginerr=false;
  }
});

router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup', async (req, res) => {
  try {
      const userData = req.body;
      const response = await userHelpers.doSignup(userData);
      console.log(response);
      
      req.session.user=response
      req.session.userloggedIn=true
      res.redirect('/')
  } catch (error) {
      console.error("Error in signup route:", error);
      res.status(400).json({ status: 'error', message: error.message });
  }
});
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
     
      req.session.user=response.user
      req.session.userloggedIn=true
      res.redirect('/')
    }else{
      req.session.userloginerr="Invalid Username or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.user=null;
  req.session.userloggedIn=false;
  res.redirect('/')

})
router.get('/cart', verifyLogin, async (req, res) => {
  try {
    let categories = await productHelpers.getAllCategories();
      let products = await userHelpers.getCartProducts(req.session.user._id);
      console.log(products);
      let cartLength = products.length;
      let totalAmount = 0;

      if (cartLength > 0) {
          totalAmount = await userHelpers.getTotalAmount(req.session.user._id);
      }
      
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }

      res.render('user/cart', { products, cartLength,cartCount, totalAmount,categories, user: req.session.user });
  } catch (error) {
      console.error("Error in /cart route:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.get('/add-to-cart/:id', verifyLogin, async (req, res) => {
    try {
        const response = await userHelpers.addToCart(req.params.id, req.session.user._id);
        res.json({ status: true, count: response.count });
    } catch (error) {
        res.json({ status: false, error: error.message });
    }
});

router.post('/change-product-quantity', (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async(response) => {
    response.total=await userHelpers.getTotalAmount(req.body.user)
      res.json(response);
  }).catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Something went wrong' });
  });
});

router.post('/remove-from-cart', (req, res, next) => {
  userHelpers.removeProductFromCart(req.body.cart, req.body.product).then((response) => {
      res.json(response);
  }).catch((error) => {
      console.error('Error:', error);
      res.status(500).json({ error: 'Something went wrong' });
  });
});
router.get('/place-order', verifyLogin, async (req, res) => {
  try {
      let categories = await productHelpers.getAllCategories();
      let userId = req.session.user._id;
      let products = await userHelpers.getCartProducts(userId);
      let productTotals = await userHelpers.getIndividualProductTotals(userId);
      let user = req.session.user;
      let cartLength = products.length;
      let total = 0;

      if (cartLength > 0) {
          total = await userHelpers.getTotalAmount(userId);
      } if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }


      // Merge product totals with products array
      products = products.map(product => {
          let productTotal = productTotals.find(pt => pt.item.equals(product.item));
          if (productTotal) {
              product.totalPrice = productTotal.totalPrice;
          }
          return product;
      });

      res.render('user/place-order', {
        categories,
        cartCount,
          user,
          products,
          total,
          user: req.session.user
      });
  } catch (error) {
      console.error("Error in place-order route:", error);
      res.status(500).send("Internal Server Error");
  }
});
router.post('/place-order', async (req, res) => {
  try {
      // Retrieve products and total price from the cart
      let products = await userHelpers.getCartProductList(req.body.userId);
      let totalPrice = await userHelpers.getTotalAmount(req.body.userId);

      // Check if there are no products in the cart
      if (!products || products.length === 0) {
          return res.status(400).json({ status: false, message: "No products in the cart" });
      }

      // Place the order and handle the payment method
      userHelpers.placeOrder(req.body, products, totalPrice)
          .then((orderId) => {
              if (req.body.paymentMethod === 'Cash on Delivery') { // Use paymentMethod for consistency
                  res.json({ codSuccess: true });
              } else {
                  userHelpers.generateRazorpay(orderId, totalPrice)
                      .then((response) => {
                          res.json(response);
                      })
                      .catch((err) => {
                          console.error("Error generating Razorpay order:", err);
                          res.status(500).json({ status: false, message: "Failed to generate Razorpay order" });
                      });
              }
          })
          .catch((err) => {
              console.error("Error placing order:", err);
              res.status(500).json({ status: false, message: "Failed to place order" });
          });
  } catch (err) {
      console.error("Error processing order:", err);
      res.status(500).json({ status: false, message: "An error occurred" });
  }
});






router.get('/order-successfull',verifyLogin,async(req,res)=>{
  let categories = await productHelpers.getAllCategories();
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
res.render('user/order-successfull',{user:req.session.user,orders,categories,cartCount})
})
router.get('/orders', verifyLogin, async (req, res) => {

  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  let orders;

  try {
      // Fetch user orders with the appropriate sort option
      let categories = await productHelpers.getAllCategories();
      orders = await userHelpers.getUserOrders(req.session.user._id,);
      let cartCount=await userHelpers.getCartCount(req.session.user._id)

      // Render the orders page, passing the sort option and orders to the view
      res.render('user/orders', { user: req.session.user, orders, helpers,cartCount ,categories});
  } catch (error) {
      res.status(500).send(error.message);  // Send the error message in case of failure
  }
});





router.get('/products-orderd',verifyLogin,async(req,res)=>{
  let productId = req.query.id
  let categories = await productHelpers.getAllCategories();
  let products=await userHelpers.getOrderProducts(productId)
  let totalproducts = products.length;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  res.render('user/products-orderd',{user:req.session.user,products,totalproducts,categories,cartCount})
})

let helpers = {
  increment(num) {
    return num + 1;
  }
}
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body)
      .then(() => {
          userHelpers.changePaymentStatus(req.body['order[receipt]'])
              .then(() => {
                  console.log("Payment successful");
                  res.json({ status: true });
              })
              .catch((err) => {
                  console.error("Error updating payment status:", err);
                  res.json({ status: false, errMsg: 'Failed to update payment status.' });
              });
      })
      .catch((err) => {
          console.error("Payment verification failed:", err);
          res.json({ status: false, errMsg: 'Payment verification failed.' });
      });
});
router.get('/repeat-order', verifyLogin, async (req, res) => {
  try {
    let categories = await productHelpers.getAllCategories();
    const orderId = req.query.id;
    console.log("Received orderId:", orderId);
    
    const products = await userHelpers.getOrderProducts(orderId);
    const orders = await userHelpers.getUserOrderDetails(orderId);
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    console.log("Products:", products);
    console.log("Order Details:", orders);

    res.render('user/repeat-order', {
      user: req.session.user,
      categories,
      cartCount,
      products,
      orders
    });
  } catch (error) {
    console.error("Error in repeat-order route:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.post('/repeat-order', async (req, res) => {
  try {
    const orderId = req.body.orderId;
    console.log("Received orderId repeat:", orderId);

    // Retrieve products and total price for the order
    const products = await userHelpers.getOrderProductList(orderId);
    const totalPrice = await userHelpers.getTotalAmountOfOrder(orderId);

    // Check if there are no products in the cart
    if (!products || products.length === 0) {
      return res.status(400).json({ status: false, message: "No products in the cart" });
    }

    // Prepare order data from request body
    const orderData = {
      userId: req.session.user._id, // Get userId from session
      paymentMethod: req.body.paymentMethod, // Payment method chosen
      phone: req.body.phone,
      address: req.body.address,
      pincode: req.body.pincode,
      name: req.body.name,
      email: req.body.email,
      country: req.body.country,
      city: req.body.city
    };

    // Place the new order
    const newOrderId = await userHelpers.repeatOrder(orderData, products, totalPrice);

    // Remove the old order
    await userHelpers.removeOrderById(orderId);

    // Handle the payment method
    if (req.body.paymentMethod === 'Cash on Delivery') { // If payment method is COD
      res.json({ codSuccess: true });
    } else {
      // Generate Razorpay order
      const razorpayResponse = await userHelpers.generateRazorpay(newOrderId, totalPrice);
      res.json(razorpayResponse); // Return Razorpay order details
    }
  } catch (err) {
    console.error("Error processing order:", err);
    res.status(500).json({ status: false, message: "An error occurred" });
  }
});






module.exports = router;
