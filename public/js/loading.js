// public/js/loading.js
document.addEventListener("DOMContentLoaded", function () {
    const loadingSpinner = document.getElementById('loading-spinner');
  
    function showLoadingSpinner() {
      loadingSpinner.style.display = 'flex';
    }
  
    function hideLoadingSpinner() {
      loadingSpinner.style.display = 'none';
    }
  
   
    $(document).ajaxStart(function () {
      showLoadingSpinner();
    });
  
    $(document).ajaxComplete(function () {
      hideLoadingSpinner();
    });
  
  
    window.addEventListener('load', function () {
      hideLoadingSpinner();
    });
  
    showLoadingSpinner();
  });
  