/////////////////////////// SCROLL ///////////////////////////////
$(document).ready(function () {
  let header = $(".header"),
    btnMenu = $(".header__btnmenu"),
    mobile,
    tablet,
    screen = {
      mobile: 767,
      tablet: 991,
      desktop: 1199,
    };

  // DETECT DEVICE
  function mobileDetect() {
    let md = new MobileDetect(window.navigator.userAgent);
    if (md.mobile() != null || md.tablet() != null) {
      mobile = true;
      tablet = true;
    } else {
      mobile = false;
      tablet = false;
    }
  }
  mobileDetect();

  // BANNER SLIDER HOME

  function bannerSliderHome() {
    let slider = $(".homepage .banner.slider .slider__wrap"),
      progressBar = $(".homepage .banner.slider .line__scroll"),
      arrowNext = $(".banner.slider .slider__bottom .arrow .arrow__right"),
      arrowPrev = arrowNext.siblings(".arrow__left"),
      countSlide = $(".banner.slider .slider__bottom .number .count");

    options = {
      cellAlign: "center",
      pageDots: false,
      wrapAround: true,
      dragThreshold: 0,
      prevNextButtons: false,
    };
    slider.flickity(options);

    slider.on("scroll.flickity", function (event, progress) {
      progress = Math.max(0, Math.min(1, progress));
      progressBar.width(progress * 100 + "%");
    });

    slider.on("change.flickity", function (event, idx) {
      const current = idx + 1;
      countSlide.html("0" + current);
    });

    arrowNext.on("click", function () {
      slider.flickity("next");
    });
    arrowPrev.on("click", function () {
      slider.flickity("previous");
    });
  }
  bannerSliderHome();

  // INIT
  function init() {
    $("body")
      .imagesLoaded()
      .progress({ background: true }, function (instance, image) {})
      .always(function (instance) {
        // setTimeout(() => {
        //     $('.loading').addClass('--hide')
        // }, 150)
      })
      .fail(function () {
        // console.log('all images loaded, at least one is broken');
      })
      .done(function (instance) {
        // console.log('all images successfully loaded');
      });
  }
  init();
});
