/*==============================================================================
  Initialise JS modules on page change (https://github.com/dieulot/instantclick)
  - triggered by instantclick.js, replaces .ready() functionality
==============================================================================*/

function onChange () {
  init();
}

/*==============================================================================
  MODULES:
==============================================================================*/
function init () {

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
      // If home page, add relevant styles for one page scroll plugin:
      if(_isHomePage()){
        $('body, html').addClass('one-pager');
      // Otherwise, destroy plugin and remove specific styles:
      } else {
        $('#page-header').addClass('on');
        $('body, html').removeClass('one-pager');
        _destroyOnePageScroll();
      }
    };

    var _isHomePage = function () {
      return window.location.pathname == '/' || window.location.pathname == '/meowmeowmeow/';
    }

    /*
      One Page Scroll: can be initialised by any page module that requires it.
      Custom options passed in (see here: https://github.com/peachananr/onepage-scroll)
    */
    var _initOnePageScroll = function (options) {
      // Destroy any lingering effects of previously initialised instances:
      _destroyOnePageScroll();
      var onePageScroll = $('.js-one-page-scroll');
      if(onePageScroll.length) {
        onePageScroll.onepage_scroll(options);
        $('.js-next-panel').click(function(e){
          if(!$('.disabled-onepage-scroll').length) {
            e.preventDefault();
            onePageScroll.moveDown();
          }
        });
      }
    };

    /*
      One Page Scroll plugin lacks a destory function - needed for re-initialising
      feature after navigating away and back to home page:
    */
    var _destroyOnePageScroll = function () {
      $('.js-one-page-scroll').unbind();
      $(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll keydown');
    };

    // Initialise all site-wide JS:
    var init = function () {
      _initPlugins();
      _initMenu();
    };

    return {
      init: init,
      initOnePageScroll: _initOnePageScroll
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

    var _initOnePageScroll = function () {
      SiteWide.initOnePageScroll({
        beforeMove: _beforePanelMove,
        afterMove: _afterPanelMove,
        easing: 'ease',
        loop: false,
        animationTime: 500,
        responsiveFallback : function() {
          var doDisable = $(window).width() < 768 || $(window).height() < 700;
          if(doDisable){
            $('.js-fade-in-up').addClass('show');
            $('#page-header').removeClass('on');
          } else if($('.disabled-onepage-scroll').length) {
            $('.disabled-onepage-scroll').removeClass('disabled-onepage-scroll');
            var scrollContainer = $('.js-one-page-scroll');
            scrollContainer.css('transition-duration', '500ms');
            scrollContainer.css('opacity', '0');
            setTimeout(function(){
              scrollContainer.css('height', 'auto');
              setTimeout(function(){
                scrollContainer.css('height', '100%');
                // trigger cover video resize:
                window.dispatchEvent(new Event('resize'));
                scrollContainer.css('opacity', '1');
              }, 500);
            }, 500);
          }
          return doDisable;
        }
      });
    };

    var _beforePanelMove = function (index) {
      var menuBar = $('#page-header');
      if(index == 1) {
        menuBar.removeClass('on');
      }else{
        $('.naaw-its-mattie').addClass('hide');
        var curPanelContent = $('.section.active').find('.js-fade-in-up');
        if(curPanelContent.length) curPanelContent.addClass('show');
      }
    };

    var _afterPanelMove = function (index) {
      var menuBar = $('#page-header');
      if(index > 1) {
        menuBar.addClass('on');
      } else {
        menuBar.removeClass('on');
        $('.naaw-its-mattie').removeClass('hide');
      }
    };

    // Initialise home page plugins:
    var _initPlugins = function () {
      _initCoverVideo();
      _initOnePageScroll();
      _initParallax();
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
    Work Page Module:
  ===========================================================================*/

  var WorkPage = (function () {

    var init = function () {
      console.log('work work');
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

  // Home page initialisation:
  if(window.location.pathname == '/' || window.location.pathname == '/meowmeowmeow/' || window.location.pathname == '/media-suite-site/') HomePage.init();

  // Work page initialisation:
  if(window.location.pathname == '/our-work/' || window.location.pathname == '/meowmeowmeow/our-work/' || window.location.pathname == '/media-suite-site/our-work/') WorkPage.init();

};
