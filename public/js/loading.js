// public/js/loading.js
document.addEventListener("DOMContentLoaded", function () {
    const loadingSpinner = document.getElementById('loading-spinner');
  
    function showLoadingSpinner() {
      loadingSpinner.style.display = 'flex';
    }
  
    function hideLoadingSpinner() {
      loadingSpinner.style.display = 'none';
    }
  
    // Example of showing the spinner during AJAX calls (if using jQuery)
    $(document).ajaxStart(function () {
      showLoadingSpinner();
    });
  
    $(document).ajaxComplete(function () {
      hideLoadingSpinner();
    });
  
    // Example of showing the spinner during page load (if not using AJAX)
    window.addEventListener('load', function () {
      hideLoadingSpinner();
    });
  
    showLoadingSpinner();
  });
  