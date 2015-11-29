/*==============================================================================
  Initialise JS modules on page change (https://github.com/dieulot/instantclick)
  - triggered by instantclick.js, replaces .ready() functionality
==============================================================================*/

function onChange (isInitialLoad) {
  init(isInitialLoad);
}

/*==============================================================================
  MODULES:
==============================================================================*/
function init (isInitialLoad) {

  'use strict';

  /*===========================================================================
    Site Wide Module:
  ===========================================================================*/

  var SiteWide = (function () {

    // https://github.com/karacas/imgLiquid
    var _initImageFill = function () {
      $('.js-image-fill').imgLiquid();
    };

    // Initialise all site-wide plugins:
    var _initPlugins = function () {
      _initImageFill();
    };

    // Initialise menu hide/show functionality:
    var _initMenu = function () {
      var menu = $('#main-menu');
      if(menu.length){
        $('body').on('click', '.js-menu-trigger', function(e){
          e.preventDefault();
          if(menu.hasClass('on')) menu.removeClass('on');
          else menu.addClass('on');
        });
      }
    };

    // Initialise all site-wide JS:
    var init = function () {
      _initPlugins();
      _initMenu();
    };

    return {
      init: init
    };

  })();

  /*===========================================================================
    Home Page Module:
  ===========================================================================*/

  var HomePage = (function () {

    /*
      Parallax used on Our Work panel ("xx years experience" text)
      https://github.com/wagerfield/parallax
    */
    var _initParallax = function () {
      var parallaxText = $('.js-parallax');
      if(parallaxText.length) parallaxText.parallax();
    };

    /*
      Cover video on home page (must fire before $(document).ready()):
      https://github.com/stefanerickson/covervid
    */
    var _initCoverVideo = function() {
      var video = $('.js-covervid-video');
      if(video.length) {
        _sizeVideo(video);
        video.coverVid(1920, 1080);
      }
    };

    var _initWaypoints = function() {
      var waypoint = new Waypoint({
        element: $('#clients-panel'),
        handler: function(direction) {
          if(direction == 'down') $('#page-header').addClass('on');
          else if(direction == 'up' && $('.home-page-container').length) $('#page-header').removeClass('on');
        }
      });
    };

    var _sizeVideo = function (elem) {
      var wrapper = $('.covervid-wrapper')
      if(elem.length) {
  			// Get parent element height and width
  			var parentHeight = wrapper.height();
  			var parentWidth = wrapper.width();

  			// Get native video width and height
  			var nativeWidth = 1920;
  			var nativeHeight = 1080;

  			// Get the scale factors
  			var heightScaleFactor = parentHeight / nativeHeight;
  			var widthScaleFactor = parentWidth / nativeWidth;

  			// Based on highest scale factor set width and height
  			if (widthScaleFactor > heightScaleFactor) {
  				elem.css({
            'height':'auto',
            'width': parentWidth+'px'
          });
  			} else {
          elem.css({
            'height': parentHeight+'px',
            'width': 'auto'
          });
  			}
  		}
    };

    // Initialise home page plugins:
    var _initPlugins = function () {
      _initCoverVideo();
      _initParallax();
      _initWaypoints();
    };

    var _initBannerTitleAnimation = function () {
      var bannerTitle = $('.js-accordion-text');
      if(bannerTitle.length) {
        bannerTitle.each(function () {
          var t = $(this);
          _animateTitleIn(t, 0, t.find('.js-text').eq(0), true);
        });
      }
    };

    var _animateTitleIn = function (bannerEl, curBannerWidth, titleSectionEl, doIterate) {
      var sectionWidth = titleSectionEl.outerWidth(true) + 30;
      var newBannerWidth = curBannerWidth + sectionWidth;
      bannerEl.css('width', newBannerWidth + 'px');
      setTimeout(function(){
        titleSectionEl.css('opacity', '1');
      }, 600);
      if(doIterate) {
        var nextSection = titleSectionEl.next();
        if(nextSection.length) {
          setTimeout(function(){
            _animateTitleIn(bannerEl, newBannerWidth, nextSection, true);
          }, 600);
        } else {
          _initAltTitlesAnimation(bannerEl);
        }
      }
    };

    var _initAltTitlesAnimation = function (bannerEl) {
      var titleAlts = $('.js-has-variations');
      if(titleAlts.length) {
        bannerEl.css('overflow', 'visible');
        titleAlts.each(function(){
          var alts = $(this).find('.js-text-alt');
          if(alts.length > 1) {
            setTimeout(function(){
              var activeAlt = alts.filter('.active');
              _animateAltTitleIn(alts.eq(1), activeAlt);
            },800);
          }
        });
      }
    };

    var _animateAltTitleIn = function (alt, activeAlt) {
      setTimeout(function(){
        if(activeAlt.length){
          activeAlt.css({
            'transform': 'translateY(-60px)',
            'opacity' : '0'
          });
          setTimeout(function(){
            activeAlt.removeClass('active');
          }, 500);
        }
        alt.css({
          'transform': 'translateY(0)',
          'opacity' : '1'
        });
        setTimeout(function(){
          alt.addClass('active');
          var nextAlt = alt.next();
          if(nextAlt.length){
            _animateAltTitleIn(alt.next(), alt);
          }
        }, 500);
      }, 500);
    };

    // Handle contact panel expand on hover:
    var _initContactPanel = function(){
      var willExpand = $('.js-expand-trigger');
      willExpand.each(function(){
        var t = $(this);
        var expandOuter = t.find('.js-expand-outer');
        var expandInner = t.find('.js-expand-inner');
        if(expandOuter.length && expandInner.length){
          t.mouseenter(function(){
            t.addClass('on');
            expandOuter.css('height', (expandOuter.height() + expandInner.height()) + 'px');
          }).mouseleave(function(){
            t.removeClass('on');
            expandOuter.css('height', '0px');
          });
        }
      });
    };

    // Initialise Home Page JS:
    var init = function () {
      _initPlugins();
      _initBannerTitleAnimation();
      _initContactPanel();
    };

    return {
      init: init
    };

  })();

  /*===========================================================================
    People Page Module:
  ===========================================================================*/

  var PeoplePage = (function () {

    // Initialise Isotope plugin with correct settings
    var _initIsotope = function (_isoContainer) {
      _isoContainer.isotope({
        itemSelector: '.js-iso-element',
        transitionDuration: '0.8s',
        layoutMode: 'masonry',
        masonry: {
          columnWidth: '.grid-sizer'
        },
        getSortData: {
          coffees: '[data-coffees] parseInt',
          commits: '[data-commits] parseInt',
          cats: '[data-cats] parseInt'
        }
      });
    };

    // Loops through each image and fades it in/up with an increasing delay
    var _fadeInTiles = function (imgs) {
      imgs.css('visibility', 'visible');
      setTimeout(function(){
        var interval = 0;
        imgs.each(function(){
          var img = $(this);
          interval += 50;
          setTimeout(function(){
            img.parent('.person').addClass('loaded');
          }, interval);
        });
      }, 100);
    };

    var _isoContainer = $('.js-isotope');

    // Setup people tiles and initialise plugin
    var _initPeopleTiles = function (isInitialLoad) {
      if(_isoContainer.length){

        // Wait until all images are loaded before initialising plugin
        _isoContainer.imagesLoaded( function() {
          // Hide loaders, make images visible (still opaque)
          $('.loader').addClass('off');

          if(isInitialLoad){
            _fadeInTiles(_isoContainer.find('img'));
            _initIsotope(_isoContainer);
          /*
            If coming back to page after initial load, destroy/reinit plugin.
            This is a work around for conflicts with instantclick.js behaviour
          */
          } else {
            _initIsotope(_isoContainer);
            setTimeout(function(){
              // _isoContainer.isotope('destroy');
              // _isoContainer.find('.js-iso-element').removeAttr('style');
              _isoContainer.isotope('layout');
              _fadeInTiles(_isoContainer.find('img'));
            }, 400);
          }
        });
      }
    };

    // Show/hide person's bio when illustration clicked
    var _initBioClickHandler = function () {
      $('.js-show-bio').click(function(e){
        e.preventDefault();
        var parentEl = $(this).parent('.person-wrap');
        if(parentEl.hasClass('on')) {
          parentEl.removeClass('on');
        } else {
          $('.person-wrap.on').removeClass('on');
          parentEl.addClass('on');
        }
        // Trigger isotope to redraw layout after tile expansion:
        $('.js-isotope').isotope('layout');
      });
    };


    var _initSortControls = function () {
      var sortBtns = $('.sort-btn');
      sortBtns.click(function(e){
        e.preventDefault();
        var t = $(this);
        // If current sort filter not active:
        if(!t.hasClass('active')) {
          sortBtns.removeClass('active');
          t.addClass('active');
          var sortByAttr = t.data('sort');
          _isoContainer.isotope({
            sortBy : sortByAttr,
            sortAscending: false
          }).isotope('updateSortData').isotope();
        // Otherwise, deactivate sort button and revert to random order:
        } else {
          t.removeClass('active');
          _isoContainer.isotope({ sortBy : 'random' }).isotope('updateSortData').isotope();
        }
      });
    }

    var init = function (isInitialLoad) {
      _initPeopleTiles(isInitialLoad);
      _initBioClickHandler();
      _initSortControls();
    };

    return {
      init: init
    };

  })();


  /*===========================================================================
    Initialise Relevant Modules (based on current pathname):
  ===========================================================================*/

  // Always fire:
  SiteWide.init();

  var main = $('#main-wrap');

  if(main.length) {

    // Home page initialisation:
    if(main.hasClass('home-page')) HomePage.init();

    // People page initialisation:
    if(main.hasClass('people-page')) PeoplePage.init(isInitialLoad);

  }

};
