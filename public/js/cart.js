function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: function() {
            // Simply increment the count in the UI
            let cartCountElements = document.querySelectorAll('#cart-count');
            cartCountElements.forEach(element => {
                let currentCount = parseInt(element.textContent || '0');
                element.textContent = currentCount + 1;
            });
        }
    });
}