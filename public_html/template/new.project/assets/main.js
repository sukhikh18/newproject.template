/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./public_html/template/new.project/assets/_source/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public_html/template/new.project/assets/_source/main.js":
/*!*****************************************************************!*\
  !*** ./public_html/template/new.project/assets/_source/main.js ***!
  \*****************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _module_scrollTo_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./module/_scrollTo.js */ "./public_html/template/new.project/assets/_source/module/_scrollTo.js");
/* harmony import */ var _module_preloader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/_preloader.js */ "./public_html/template/new.project/assets/_source/module/_preloader.js");



jQuery(document).ready(function($) {
    /**
     * Phone formatter for RU phone numbers.
     */
    const $phones = $('[type="tel"]');
    if (typeof Cleave && $phones.length) {
        $phones.each(function(i, phoneInput) {
            new Cleave(phoneInput, {
                phone: true,
                phoneRegionCode: 'RU'
            });
        });
    }

    /**
     * Smooth scroll window to target when link href start from a hash.
     */
    $(document).on('click', '[href^="#"]', function(event) {
        event.preventDefault();
        Object(_module_scrollTo_js__WEBPACK_IMPORTED_MODULE_0__["default"])(this.getAttribute("href"));
    });

    /**
     * Example form submit event.
     */
    if (typeof $.fancybox) {
        $('.modal form').on('submit', function(event) {
            event.preventDefault();
            _module_preloader_js__WEBPACK_IMPORTED_MODULE_1__["default"].show('Загрузка..');

            // Disable retry by 120 seconds
            const $submit = $(this).find('[type="submit"]');
            $submit.attr('disabled', 'disabled');
            setTimeout(() => { $submit.removeAttr('disabled'); }, 120000);

            // Show success
            setTimeout(() => {
                _module_preloader_js__WEBPACK_IMPORTED_MODULE_1__["default"].hide();
                $.fancybox.open({
                    content: '<h1>Отлично!</h1><p>Ваша заявка принята, ожидайте звонка.</p>',
                    type: 'html',
                });
            }, 5000);
        });
    }
});

/***/ }),

/***/ "./public_html/template/new.project/assets/_source/module/_preloader.js":
/*!******************************************************************************!*\
  !*** ./public_html/template/new.project/assets/_source/module/_preloader.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const preloadClass = 'fancy-preloading';

const preloader = {
    show: (message = '') => {
        let $preload = $('<p>' + message + '</p>').css({
            'margin-top': '50px',
            'margin-bottom': '-40px',
            'padding-bottom': '',
            'color': '#ddd'
        });

        $.fancybox.open({
            closeExisting: true,
            content: $preload,
            type: 'html',
            smallBtn: false,
            afterLoad: function(instance, current) {
                current.$content.css('background', 'none');
            },
            afterShow: function(instance, current) {
                $('body').addClass(preloadClass);
                instance.showLoading(current);
            },
            afterClose: function(instance, current) {
                $('body').removeClass(preloadClass);
                instance.hideLoading(current);
            }
        });
    },
    hide: () => {
        if ($('body').hasClass(preloadClass)) {
            $.fancybox.getInstance().close();
        }
    }
}

/* harmony default export */ __webpack_exports__["default"] = (preloader);

/***/ }),

/***/ "./public_html/template/new.project/assets/_source/module/_scrollTo.js":
/*!*****************************************************************************!*\
  !*** ./public_html/template/new.project/assets/_source/module/_scrollTo.js ***!
  \*****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const scrollTo = (target, topOffset = 30, delay = 400) => {
    if( !target || target.length <= 1 ) return false
    let $target;

    if( target instanceof jQuery ) {
        $target = target.first()
    }
    else {
        $target = $(target).length ? $(target).first() : $('a[name='+target.slice(1)+']').first()
    }

    if( $target.offset().top ) {
        // for call from dropdown
        setTimeout(() => {
            return $('html, body').animate({ scrollTop: $target.offset().top - topOffset }, delay)
        }, 100)
        return true
    }

    return console.log('Element not found.')
}

/* harmony default export */ __webpack_exports__["default"] = (scrollTo);

/***/ })

/******/ });
//# sourceMappingURL=main.js.map