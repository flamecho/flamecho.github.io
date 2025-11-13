document.addEventListener('DOMContentLoaded', function() {
  initSwiper();
});

$(document).on('pjax:complete', function() {
  initSwiper();
});

function initSwiper() {
  if (window.mySwiper) {
    window.mySwiper.destroy(true, true);
    window.mySwiper = null;
  }

  var swiperContainer = document.querySelector('.swiper-container');
  if (swiperContainer) {
    window.mySwiper = new Swiper('.swiper-container', {
      loop: false,
      autoplay: {
        delay: 3000,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
}
