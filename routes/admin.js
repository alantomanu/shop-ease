var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers.js');
var userHelpers = require('../helpers/user-helpers.js');

// Set up a basic admin username and password
const adminCredentials = {
  username: 'Thecreator',  // Set your admin username
  password: 'fi^D!t|fu<@|'  // Set your admin password
};

// Middleware to check if the admin is logged in
const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// Admin login page
router.get('/login', (req, res) => {
  res.render('admin/login', {admin: true});
});

// Handle admin login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username && password === adminCredentials.password) {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', {admin: true, error: 'Invalid Username or Password'});
  }
});

// Admin dashboard
router.get('/', verifyLogin, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products, helpers });
  }).catch(error => {
    console.error('Failed to retrieve products:', error);
  });
});

// Add product page
router.get('/add-product', verifyLogin, (req, res) => {
  res.render('admin/add-product', {admin: true});
});

// Add product handling
router.post('/add-product', verifyLogin, (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render("admin/add-product", {admin: true});
      } else {
        console.log(err);
      }
    });
  });
});

// Delete product
router.get('/delete-product/', verifyLogin, (req, res) => {
  let prodId = req.query.id;
  productHelpers.deleteProduct(prodId).then(() => {
    res.redirect('/admin');
  });
});

// Edit product page
router.get('/edit-product/', verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.query.id);
  res.render('admin/edit-product', {admin: true, product});
});

// Handle product update
router.post('/edit-product/', verifyLogin, (req, res) => {
  let id = req.query.id;
  console.log("id=" + id);

  productHelpers.updateProduct(id, req.body).then(() => {
    if (req.files && req.files.image) {
      let image = req.files.image;
      image.mv('./public/product-images/' + id + '.jpg', (err) => {
        if (err) {
          console.error('Failed to move image:', err);
        } else {
          console.log("Image upload completed");
        }
      });
    }
    res.redirect('/admin');
  }).catch((error) => {
    console.error('Failed to update product:', error);
    res.redirect('/admin');
  });
});


// View all orders
router.get('/all-orders', verifyLogin, async (req, res) => {
  try {
    let orders = await productHelpers.getAllOrderProducts();
    res.render('admin/all-orders', { admin: true, orders, helpers });
  } catch (error) {
    console.error('Failed to retrieve orders:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update order status
router.post('/update-order-status', verifyLogin, (req, res) => {
  const { id, status } = req.body;
  productHelpers.updateOrderStatus(id, status)
    .then(() => res.json({ success: true }))
    .catch(error => {
      console.error('Failed to update status:', error);
      res.status(500).json({ success: false });
    });
});

// View all users
router.get('/all-users', verifyLogin, async (req, res) => {
  try {
    const users = await productHelpers.getAllUsers();
    res.render('admin/all-users', { admin: true, users, helpers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.admin = null;
  res.redirect('/admin/login');
});

let helpers = {
  increment(num) {
    return num + 1;
  }
};

module.exports = router;

