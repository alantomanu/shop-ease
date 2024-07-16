function removeFromCart(cartId, proId) {
  $.ajax({
      url: '/remove-from-cart',
      data: {
          cart: cartId,
          product: proId
      },
      method: 'POST',
      success: (response) => {
          if (response.status) {
              alert("Product removed from cart");
              location.reload();
          } else {
              alert("Failed to remove product: " + response.message);
          }
      },
      error: (xhr, status, error) => {
          console.error('Error:', status, error);
          alert("Failed to remove product: " + error);
      }
  });
}

function changeQuantity(cartId, proId,userId, count) {
  let quantityElement = document.getElementById(proId);
  let quantity = parseInt(quantityElement.innerHTML);
  count = parseInt(count);

  $.ajax({
      url: '/change-product-quantity',
      data: {
        user:userId,
          cart: cartId,
          product: proId,
          count: count,
          quantity: quantity
      },
      method: 'POST',
      success: (response) => {
          console.log('Server response:', response);
          try {
              if (response.removeProduct) {
                  alert("Product Removed From Cart");
                  location.reload();
              } else {
                console.log(response)
                  quantityElement.innerHTML = quantity + count;
                  document.getElementById('total').innerHTML=response.total;
              }
          } catch (e) {
              console.error('Error processing response:', e);
              alert("Failed to change quantity: Invalid server response.");
          }
      },
      error: (xhr, status, error) => {
          console.error('Error:', status, error);
          alert("Failed to change quantity: " + error);
      }
  });
}

function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'GET',
        success: (response) => {
            console.log(response);  // Debugging line to see the response object
            if (response.status) {
                let count = $('#cart-count').html();
                count = parseInt(count) + 1;
                $('#cart-count').html(count);
            } else if (response.redirect) {
                window.location.href = response.redirect;
            } else {
                alert("Failed to add to cart: " + response.message);
            }
        },
        error: (xhr, status, error) => {
            console.error('Error:', status, error);
            alert("Failed to add to cart: " + error);
        }
    });
}


