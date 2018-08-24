/*
 * Copyright © 2018 Denis Vadimov aka BloodyAltair
 * This file is part of UnsplashBackgroundUpdater.
 *
 * UnsplashBackgroundUpdater is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * UnsplashBackgroundUpdater is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with UnsplashBackgroundUpdater.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
    UnsplashBgUpdater 'class'.
 */

var unsplashBgUpdater = {
    "init": function (interval, insert, type, url, url_postfix) {
        if (typeof window.fetch === "function") {
            /*
                Getting Parameters
             */
            unsplashBgUpdater.url = url || unsplashBgUpdater.url;
            unsplashBgUpdater.url_postfix = url_postfix || unsplashBgUpdater.url_postfix;
            unsplashBgUpdater.interval = interval || unsplashBgUpdater.interval;
            unsplashBgUpdater.insert = insert || unsplashBgUpdater.insert;
            unsplashBgUpdater.type = type || unsplashBgUpdater.type;

            /*
                Setting Main Element
             */

            switch (unsplashBgUpdater.type) {

                case 'tag':
                    var mainElement = document.getElementsByTagName(unsplashBgUpdater.insert)[0];
                    break;
                case 'id':
                    var mainElement = document.getElementById(unsplashBgUpdater.insert);
                    break;
                case 'class':
                    var mainElement = document.getElementsByClassName(unsplashBgUpdater.insert)[0];
                    break;
                default:
                    console.log('Unable to update Unsplash BG. Error: Invalid element to insert BG: ', unsplashBgUpdater);
                    clearInterval(unsplashBgUpdater.timer);
                    return 1;
            }


            unsplashBgUpdater.mainElement = document.createElement('div');
            unsplashBgUpdater.mainElement.id = "unsplash_bg_updater_main_element";
            unsplashBgUpdater.mainElement.className = mainElement.className;
            unsplashBgUpdater.mainElement.style = mainElement.style;
            unsplashBgUpdater.mainElement.attributes = mainElement.attributes;
            document.body.appendChild(unsplashBgUpdater.mainElement);

            /*
                Setting CSS
             */
            var zindex = Number.isInteger(getComputedStyle(mainElement).zIndex) ? getComputedStyle(mainElement).zIndex : -1000;
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            var style = document.createElement('style');
            var anime = document.createElement('script');
            anime.src = "https://cdnjs.cloudflare.com/ajax/libs/animejs/2.2.0/anime.min.js";
            anime.integrity = "sha256-BuxrUdr/4YoztQLxT6xmdO6hSQw2d6BtBUY1pteGds4=";
            anime.crossOrigin = "anonymous";
            anime.defer = true;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = 'https://fonts.googleapis.com/css?family=Nanum+Brush+Script';
            link.media = 'all';
            head.appendChild(link);
            head.appendChild(anime);

            style.type = 'text/css';

            switch (unsplashBgUpdater.type) {

                case 'tag':
                    var tag_insert = unsplashBgUpdater.insert;
                    break;
                case 'id':
                    var tag_insert = "#" + unsplashBgUpdater.insert;
                    break;
                case 'class':
                    var tag_insert = "." + unsplashBgUpdater.insert;
                    break;
                default:
                    console.log('Unable to update Unsplash BG. Error: Unable to get css selector type: ', unsplashBgUpdater);
                    return 1;
            }

            unsplashBgUpdater.css = unsplashBgUpdater.css.replace("tag_insert", tag_insert);
            unsplashBgUpdater.css = unsplashBgUpdater.css.replace(/interval/gi, unsplashBgUpdater.interval);
            unsplashBgUpdater.css = unsplashBgUpdater.css.replace(/zindexbg/gi, (zindex));

            if (style.styleSheet) {
                style.styleSheet.cssText = unsplashBgUpdater.css;
            } else {
                style.appendChild(document.createTextNode(unsplashBgUpdater.css));
            }
            head.appendChild(style);


            /*
                Resetting insert options
             */
            unsplashBgUpdater.tag_insert = 'unsplash_bg_updater_main_element';
            unsplashBgUpdater.type = 'id';

            /*
                Insert Fake Element
             */

            unsplashBgUpdater.fakeElement = document.createElement('div');
            unsplashBgUpdater.fakeElement.id = "unsplash_bg_updater_fake_element";
            unsplashBgUpdater.fakeElement.className = unsplashBgUpdater.mainElement.className;
            unsplashBgUpdater.fakeElement.style = unsplashBgUpdater.mainElement.style;
            unsplashBgUpdater.fakeElement.attributes = unsplashBgUpdater.mainElement.attributes;

            if (document.all) {
                unsplashBgUpdater.fakeElement.style.setAttribute('cssText', 'background: transparent !important');
            } else {
                unsplashBgUpdater.fakeElement.setAttribute('style', 'background: transparent !important');
            }

            document.body.appendChild(unsplashBgUpdater.fakeElement);

            /*
                Setting correct Z-Indexes
             */

            if (document.all) {
                mainElement.style.setAttribute('cssText', "z-index: " + (zindex - 1) + ";");
            } else {
                mainElement.setAttribute('style', "z-index: " + (zindex - 1) + ";");
            }

            /*
                Setting tab focus/unfocus handler
             */
            unsplashBgUpdater.check_tab_active(function () {
                console.log((unsplashBgUpdater.check_tab_active() ? 'Tab is visible now, script will continue updates' : 'Tab is not visible, skipping updates'));
            });

            /*
                First Run and timer
             */
            unsplashBgUpdater.updater();
            unsplashBgUpdater.timer = setInterval(function () {
                unsplashBgUpdater.updater();
            }, unsplashBgUpdater.interval * 1000);

        } else {
            console.log("window.fetch() is absent, updater will exit");
        }
    },
    "updater": function () {
        if (unsplashBgUpdater.check_tab_active() == true) {
            fetch(unsplashBgUpdater.url, unsplashBgUpdater.fetch_opts)
                .then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    if (json.success.toString() == 'true') {
                        unsplashBgUpdater._image = new Image();
                        unsplashBgUpdater._image.crossOrigin = 'anonymous';
                        unsplashBgUpdater._image.onload = function () {
                            var brightness = unsplashBgUpdater.get_image_brightness(this);
                            unsplashBgUpdater.update_bg(json.url + unsplashBgUpdater.url_postfix, brightness);
                            unsplashBgUpdater.update_copyright(json.image_user_name, json.image_user_url + unsplashBgUpdater.url_postfix);
                        };
                        unsplashBgUpdater._image.src = json.url + unsplashBgUpdater.url_postfix;
                    } else {
                        console.log('Unable to update Unsplash BG. Response was not successful: ', json.error.toString());
                        clearInterval(unsplashBgUpdater.timer);
                    }
                })
                .catch(function (reason) {
                    console.log('Unable to update Unsplash BG. Error: ', reason);
                    clearInterval(unsplashBgUpdater.timer);
                });
        }
    },
    "update_bg": function (url, brightness) {
        if (unsplashBgUpdater.roll == 0) {
            if (document.all) {
                unsplashBgUpdater.fakeElement.style.setAttribute('cssText', 'background: linear-gradient(rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + '), rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + ')),rgba(34, 45, 50, 0.7) url("' + url + '") no-repeat center fixed !important;background-size: cover !important;');
            } else {
                unsplashBgUpdater.fakeElement.setAttribute('style', 'background: linear-gradient(rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + '), rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + ')), rgba(34, 45, 50, 0.7) url("' + url + '") no-repeat center fixed !important;background-size: cover !important;');
            }
            anime({
                targets: '#unsplash_bg_updater_fake_element',
                opacity: [0, 1],
                duration: 4000,
                easing: 'easeInOutQuart'
            });
            anime({
                targets: '#unsplash_bg_updater_main_element',
                opacity: [1, 0],
                duration: 4000,
                easing: 'easeInOutQuart'
            });
            unsplashBgUpdater.roll = 1;
        } else {
            if (document.all) {
                unsplashBgUpdater.mainElement.style.setAttribute('cssText', 'background: linear-gradient(rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + '), rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + ')),rgba(34, 45, 50, 0.7) url("' + url + '") no-repeat center fixed !important;background-size: cover !important;');
            } else {
                unsplashBgUpdater.mainElement.setAttribute('style', 'background: linear-gradient(rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + '), rgba(0, 0, 0, ' + (brightness / 255).toFixed(4).toString() + ')), rgba(34, 45, 50, 0.7) url("' + url + '") no-repeat center fixed !important;background-size: cover !important;');
            }
            anime({
                targets: '#unsplash_bg_updater_main_element',
                opacity: [0, 1],
                duration: 4000,
                easing: 'easeInOutQuart'
            });
            anime({
                targets: '#unsplash_bg_updater_fake_element',
                opacity: [1, 0],
                duration: 4000,
                easing: 'easeInOutQuart'
            });
            unsplashBgUpdater.roll = 0;
        }
    },
    "update_copyright": function (username, url) {
        var copyright = document.getElementsByClassName('unsplash_bg_updater_copyright');
        var body = document.getElementsByTagName('body')[0];
        if (Object.values(copyright).length == 0) {
            copyright = document.createElement('div');
            unsplashBgUpdater.copyright = copyright;
            copyright.addEventListener("click", function () {
                unsplashBgUpdater.hide_copyright();
            });
        } else {
            copyright = copyright[0];
        }
        copyright.innerHTML = 'Background by <strong><span><a href="' + url + '">@' + username + '</a></span></strong> from <span><a href="https://unsplash.com">Unsplash.com</a></span>';
        copyright.className = 'unsplash_bg_updater_copyright';
        if (Object.values(copyright).length == 0) {
            body.appendChild(copyright);
        }
    },
    "hide_copyright": function () {
        unsplashBgUpdater.copyright.className += ' unsplash_bg_updater_copyright_hidden';
    },
    "check_tab_active": (function () {
        var stateKey, eventKey, keys = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };
        for (stateKey in keys) {
            if (stateKey in document) {
                eventKey = keys[stateKey];
                break;
            }
        }
        return function (c) {
            if (c) document.addEventListener(eventKey, c);
            return !document[stateKey];
        }
    })(),
    "get_image_brightness": function (image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var r, g, b, avg;

        var colorSum = 0;
        for (var x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];

            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        return Math.floor(colorSum / (image.width * image.height));
    },
    "fetch_opts": {
        "method": "GET",
        "mode": "cors",
        "credentials": "omit",
        "cache": "no-cache",
        "redirect": "error"
    },
    "interval": 5,
    "url": "https://example.com",
    "url_postfix": '&utm_source=<YOUR_APP_NAME>&utm_medium=referral',
    "css": "* {" +
        "          background-blend-mode: initial;" +
        "}" +
        "body { " +
        "          background: rgba(34, 45, 50, 0.9) !important;" +
        "          pointer-events: all;" +
        "}" +
        ".unsplash_bg_updater_copyright {" +
        "          background-color: rgba(0,0,0,0.78);" +
        "          max-height: 20%;" +
        "          position: fixed;" +
        "          z-index: 10000000000000;" +
        "          border-radius: 10px;" +
        "          padding: 0.5%;" +
        "/*          font-family: 'Nanum Brush Script', cursive;*/" +
        "          font-family: 'Hack', monospace;" +
        "          overflow: visible;" +
        "          bottom: 0;" +
        "          right: 0;" +
        "          color: #e6daba;" +
        "/*          font-size: 18px;*/" +
        "          font-size: 14px;" +
        "}" +
        ".unsplash_bg_updater_copyright > strong > span > a,.unsplash_bg_updater_copyright > strong > span > a:link,.unsplash_bg_updater_copyright > strong > span > a:visited,.unsplash_bg_updater_copyright > strong > span > a:hover,.unsplash_bg_updater_copyright > strong > span > a:active,.unsplash_bg_updater_copyright > strong > span > a:focus {" +
        "          text-decoration:none !important;" +
        "          color:#3db930;" +
        "          border-bottom: 1px dashed #e6daba;" +
        "          padding-bottom: 2px;" +
        "}" +
        ".unsplash_bg_updater_copyright > strong > span > a, .unsplash_bg_updater_copyright > strong > span > a:focus, .unsplash_bg_updater_copyright > strong > span > a:hover, .unsplash_bg_updater_copyright > strong > span > a:active {" +
        "          border-bottom: 1px dashed #e6daba;" +
        "          padding-bottom: 2px;" +
        "          color:#93620d;" +
        "}" +
        ".unsplash_bg_updater_copyright > strong > span > a:visited {" +
        "          border-bottom: initial !important;" +
        "          padding-bottom: initial !important;" +
        "          color:#93620d;" +
        "}" +
        "#unsplash_bg_updater_main_element {" +
        "          background-repeat: no-repeat !important;" +
        "          background-size: 100% !important;" +
        "          background-position: center !important;" +
        "          background-clip: border-box !important;" +
        "          background: rgba(34, 45, 50, 0.7);" +
        "          backface-visibility: hidden;" +
        "          opacity: 1;" +
        "          position: absolute;" +
        "          pointer-events: all;" +
        "          top: 0;" +
        "          left: 0;" +
        "          bottom: 0;" +
        "          right: 0;" +
        "          z-index: calc(zindexbg - 1) !important;" +
        "}" +
        ".unsplash_bg_updater_copyright_hidden {" +
        "          visibility: hidden;" +
        "          opacity: 0;" +
        "}" +
        "#unsplash_bg_updater_fake_element {" +
        "          background-repeat: no-repeat !important;" +
        "          background-size: 100% !important;" +
        "          background-position: center !important;" +
        "          background-clip: border-box !important;" +
        "          background: rgba(34, 45, 50, 0.7);" +
        "          backface-visibility: hidden;" +
        "          opacity: 0;" +
        "          position: absolute;" +
        "          top: 0;" +
        "          bottom: 0;" +
        "          left: 0;" +
        "          right: 0;" +
        "          pointer-events: all;" +
        "          z-index: zindexbg !important;" +
        "}",
    "insert": 'body',
    "type": 'tag',
    "roll": 0
};

/*
    ES6 isInteger() polyfill
 */
Number.isInteger = Number.isInteger || function (value) {
    return typeof value === 'number' &&
        Number.isFinite(value) &&
        !(value % 1);
};
