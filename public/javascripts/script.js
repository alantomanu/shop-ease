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
            if (response.redirect) {
                window.location.href = response.redirect;
            } else {
                let cartCountElements = document.querySelectorAll('#cart-count');
                cartCountElements.forEach(element => {
                    let currentCount = parseInt(element.textContent || '0');
                    element.textContent = currentCount + 1;
                });
            }
        },
        error: (xhr, status, error) => {
            console.error('Error:', status, error);
        }
    });
}


