$(document).ready(function () {
  init();
});

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
    };

    // Triggers animation of content (subtle fade-in/up)
    var _fadeInContent = function() {
      if(!$('.home-page').length) $('.internal-page').addClass('show');
    };

    // Animate page scroll to target element
    var animateScrollToElement = function(target, speed, offsetTop) {
      if(target.length){
        var page = $('body, html');
        var scrollTo = target.offset().top;
        if(typeof offsetTop !== 'undefined') scrollTo -= offsetTop;

        // Stop animation on page element when scrolling manually:
        page.on("scroll mousedown wheel DOMMouseScroll mousewheel touchmove", function(){
         page.stop();
        });

        // Animate page scroll to target element, remove above listener on complete:
        page.animate({ scrollTop: scrollTo+'px' }, speed, function(){
         page.off("scroll mousedown wheel DOMMouseScroll mousewheel touchmove");
        });
      }
    };

    var _initSmoothScroll = function() {
      $('.js-scroll-to').click(function(e){
        e.preventDefault();
        var target = $($(this).attr('href'));
        if(target.length) animateScrollToElement(target, 1200, 0);
      });
    };

    var _svgFallbacks = function() {
      if (!Modernizr.svg) {
        $("img[src$='.svg']").each(function(){
          var t = $(this);
          if(t.data('fallback').length) {
            t.attr("src", t.data('fallback'));
          }
        });
      }
    };

    // Initialise all site-wide JS:
    var init = function () {
      _initPlugins();
      _initMenu();
      _svgFallbacks();
      _initSmoothScroll();
      _fadeInContent();
    };

    return {
      init: init,
      animateScrollToElement: animateScrollToElement
    };

    // Removes double tap on links with hover state on ios
    
    $('a.touch').on('click touchend', function(e) {
      var el = $(this);
      var link = el.attr('href');
      window.location = link;
    });

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
      if(parallaxText.length && !$('.lt-ie9').length) parallaxText.parallax();
    };

    /*
      Cover video on home page (must fire before $(document).ready()):
      https://github.com/stefanerickson/covervid
    */
    var _initCoverVideo = function() {
      var video = $('.js-covervid-video');
      if(video.length && !video.parent().hasClass('video-loaded') && !$('.lt-ie9').length)  video.coverVid(1920, 1080);
    };

    /*
      Functions using waypoints.js (detects when elements enter/leave viewport)
    */
    var _initWaypoints = function() {
      _initSideNavControl();
      _initFadeInAnimation();
    };

    /*
      When panel scrolled into view, activate fade in animation
    */
    var _initFadeInAnimation = function() {
      var faderInnerers = $('.home-page').find('.js-fade-in-up');
      faderInnerers.each(function(){
        var section = $(this);
        var waypoint = new Waypoint({
          element: section,
          handler: function(direction) {
            if(!section.hasClass('show')) {
              section.addClass('show');
            }
          },
          offset: '50%'
        });
      });
    }

    // Waypoints used to update active panel in side nav
    var _initSideNavControl = function() {
      var waypointUp = new Waypoint({
        element: $('#banner-panel'),
        handler: function(direction) {
          if(direction == 'up') {
            // Slide in top navigation after page scrolled past first slide:
            $('#page-header').removeClass('on');
          } else {
            // Remove navigation bar when viewing first slide (alt version in slide):
            $('#page-header').addClass('on');
          }
        },
        offset: '-100%'
      });
    };

    // Return side nav link element given the panel it links to
    var _getSideNavLink = function(section) {
      return $('.js-goto-panel[href="#'+section.attr('id')+'"]');
    };


    // Click handler for side nav links
    var _initSideNav = function () {
      $('.js-goto-panel').click(function(e){
        e.preventDefault();
        var t = $(this);
        var target = $($(this).attr('href'));
        SiteWide.animateScrollToElement(target, 1000, 0);
        _turnPanelLinkOff($('.js-goto-panel.active'));
        _turnPanelLinkOn(t);
      });

      // Update nav as user scrolls through panels
      var interval;
      var intervalSet = false;
      $(window).on('scrollstop', function(){
        var curPanel = _getCurrentPanel();
        if(curPanel) {
          var panelLink = _getSideNavLink(curPanel);
          if(!panelLink.hasClass('active')){
            _turnPanelLinkOff($('.js-goto-panel.active'));
            _turnPanelLinkOn(panelLink);
          }
        }
      });
    };

    var _turnPanelLinkOff = function (link) {
      link.removeClass('active');
      var circle = link.find('.side-nav-circle');
      var num = link.find('.side-nav-num');
      num.addClass('num-off');
      setTimeout(function(){
        num.addClass('num-off');
        circle.removeClass('circle-off');
      }, 850);
    };

    var _turnPanelLinkOn = function (link) {
      link.addClass('active');
      var circle = link.find('.side-nav-circle');
      var num = link.find('.side-nav-num');
      circle.addClass('circle-off');
      setTimeout(function(){
        circle.addClass('circle-off');
        num.removeClass('num-off');
      }, 350);
    };

    var _getCurrentPanel = function (){
      var sections = $('.home-page').children('section');
      var curScrollPos = $(window).scrollTop();
      var activePanel = false;
      // Loop through all panels/sections to find one currently in view
      sections.each(function(){
        var s = $(this);
        // Returns object with panel top and bottom offsets
        var offsets = _getSectionOffsets(s);
        // If current scroll position is within this panel, continue:
        if(curScrollPos >= offsets.top && curScrollPos <= offsets.bottom) {
          activePanel = s;
        }
      });
      return activePanel;
    };

    // Snap to nearest panel when scrolling stops
    var _initPanelSnap = function() {
      // Page position before scrolling:
      var initialScrollPos = $(window).scrollTop();
      // Once scrolling has stopped, snap to nearest panel:
      $(window).on('scrollstop', function(){
        var curScrollPos = $(window).scrollTop();
        // Loop through all panels/sections to find one currently in view
        var s = _getCurrentPanel();
        // If screen is big enough to fit panel contents in viewport, enable snapping:
        if(s.length && Modernizr.mq('(min-height: 795px) and (min-width: 1300px)')){
          var offsets = _getSectionOffsets(s);
          var animationSpeed = 500;
          var bottomThreshold = offsets.bottom - (s.height() * .35);
          if(curScrollPos >= bottomThreshold) {
            var nextSection = s.next();
            SiteWide.animateScrollToElement(nextSection, animationSpeed);
          } else {
            var topThreshold = offsets.top + (s.height() * .35);
            if(curScrollPos <= topThreshold) {
              SiteWide.animateScrollToElement(s, animationSpeed);
            }
          }
        }

        // Reset initial scroll position value to new position:
        initialScrollPos = curScrollPos;
      });
    };

    // Returns object containing top and bottom offset of given section
    var _getSectionOffsets = function(section){
      var topOffset = section.offset().top;
      var bottomOffset = topOffset + section.height();
      return {
        top : topOffset,
        bottom : bottomOffset
      }
    };

    /*
      On video load, fade out first frame image and fade in video (silky smooth)
      Prevents flash of black that you get with poster image attr.
    */
    var _videoLoadListener = function() {
      // Wait until banner image is loaded before animating text
      $('.covervid-wrapper').imagesLoaded( function() {
        _initBannerTitleAnimation();
      });
      // Check screen size and load in video if at least 768px wide
      if(Modernizr.mq('(min-width: 768px)')) {
        if(!$('.js-covervid-video source').length) {
          $('.js-covervid-video').append('<source src="https://85d137da1e54f786fead-53b266e97c0af9c711d72e69e4af35ea.ssl.cf4.rackcdn.com/looped.mp4" type="video/mp4">');
        }
        // Attach listener for video load
        var v = document.getElementsByTagName("video")[0];
        v.addEventListener('loadeddata', function() {
          // CSS tied to 'video-loaded' class makes image fade out to video smoothly:
          $('.covervid-wrapper').addClass('video-loaded');
        });
      }

    };

    // Function calculates the current CSS rotation of the given element
    var _getCurrentRotation = function(el) {
      var st = window.getComputedStyle(el, null);
      var tr = st.getPropertyValue("-webkit-transform") ||
               st.getPropertyValue("-moz-transform") ||
               st.getPropertyValue("-ms-transform") ||
               st.getPropertyValue("-o-transform") ||
               st.getPropertyValue("transform") ||
               "FAIL";

      var values = tr.split('(')[1].split(')')[0].split(',');
      var a = values[0];
      var b = values[1];
      var c = values[2];
      var d = values[3];

      var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

      return angle;
    };

    // Animate value segment to rotate to top position when clicked
    var _initValueWheelAnimations = function(){
      var valueWheel = $('#value-wheel');
      // Timeout used to reset animation on mouseout (after small delay):
      var resetRotationTimeout;
      // used to create unique animation name each iteration:
      var animIteration = 1;
      // Segment click handler:
      $('.segment').click(function(e){
        e.preventDefault();
        clearTimeout(resetRotationTimeout);
        valueWheel.resumeKeyframe();
        // Current rotation (in degrees) of value wheel SVG:
        var curRotation = _getCurrentRotation(document.getElementById('value-wheel'));
        // Rotation of segment clicked on (stored in data attr on element):
        var rotateTo = parseInt($(this).data('rotation'));
        // If rotateTo value is valid, create animation:
        if(!isNaN(rotateTo)){
          // Define animation:
          $.keyframe.define([{
            name: 'rotate-to-this-segment-'+animIteration, // append unique number
            '0%':   { 'transform': 'rotate('+ curRotation +'deg)' },
            '100%': { 'transform': 'rotate('+ rotateTo +'deg)' }
          }]);
          // Play animation:
          valueWheel.playKeyframe([{
            name: 'rotate-to-this-segment-'+animIteration,
            duration: '600ms',
            timingFunction: 'cubic-bezier(0.65, -0.39, 0.32, 1.34)',
            iterationCount: 1
          }]);
          // Iterate unique number for append to animation names:
          animIteration++;
        }
      });

      // Pause value wheel rotation on mouse enter, resume on mouse leave:
      valueWheel.mouseenter(function(){
        valueWheel.pauseKeyframe();
      }).mouseleave(function(){
        resetRotationTimeout = setTimeout(function(){
          // Define animation:
          $.keyframe.define([{
            name: 'rotate-wheel-'+animIteration, // append unique number
            '0%':   { 'transform': 'rotate('+ _getCurrentRotation(document.getElementById('value-wheel')) +'deg)' },
            '100%': { 'transform': 'rotate('+ (_getCurrentRotation(document.getElementById('value-wheel'))+360) +'deg)' }
          }]);
          // Play animation:
          valueWheel.playKeyframe([{
            name: 'rotate-wheel-'+animIteration,
            duration: '60s',
            timingFunction: 'linear',
            iterationCount: 'infinite'
          }]);
          // Iterate unique number for append to animation names:
          animIteration++;
        }, 500);
      });
    };

    // Controls animation of banner text on home page
    var _initBannerTitleAnimation = function () {
      var bannerTitle = $('.js-accordion-text');
      bannerTitle.each(function () {
        var t = $(this);
        // Workaround for instantclick bug when clicking back/forwards:
        var styles = t.attr('style');
        if(typeof styles !== 'undefined') {
          $('.banner-title, .banner-title *').removeAttr('style').removeClass('active');
        }
        // Start banner title animation:
        _animateTitleIn(t, 0, t.find('.js-text').eq(0), true);
      });
    };

    // Animate each title word in from the right
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

    // Controls animation of each alternate word at end of banner text
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

    // Animate in/out each variant of the last word in, stopping on final one
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
          } else {
            $('.banner-cta').addClass('show');
          }
        }, 500);
      }, 500);
    };

    // Initialise home page plugins:
    var _initPlugins = function () {
      _initCoverVideo();
      _initParallax();
      _initWaypoints();
    };

    // Initialise Home Page JS:
    var init = function () {
      _videoLoadListener();
      _initPlugins();
      _initValueWheelAnimations();
      _initPanelSnap();
      _initSideNav();
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
          columnWidth: '.grid-sizer',
          isFitWidth: true
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

    // Element contains people "tiles"
    var _isoContainer = $('.js-isotope');

    // Setup people tiles and initialise plugin
    var _initPeopleTiles = function () {
      if(_isoContainer.length){

        // Wait until all images are loaded before initialising plugin
        _isoContainer.imagesLoaded( function() {
          // Hide loaders, make images visible (still opaque)
          $('.loader').addClass('off');
          _fadeInTiles(_isoContainer.find('img'));
          _initIsotope(_isoContainer);
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
          setTimeout(function(){
            SiteWide.animateScrollToElement(parentEl, 1000, 100);
          }, 300);
        }
        // Trigger isotope to redraw layout after tile expansion:
        $('.js-isotope').isotope('layout');
      });
    };

    // Controls various sort filters for people tiles (most cats, commits etc)
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

    var init = function () {
      _initPeopleTiles();
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
    if(main.hasClass('people-page')) PeoplePage.init();

  }

};
