## Unsplash Bg Updater

This script is needed to update the background of the page to which it is connected by with a random image from the [Unsplash](https://unsplash.com/)
#### Features:

 - Auto pause if tab is not active/focus
 - It will auto stop and exit in case of any API error(like exhausted requests limit)

----------


Before you start using it, you will need to configure several settings.

 1. __config.json__ must be in the same web directory with the __getUnsplashBg.php__
 2. You need to configure __config.json__ with your parameters:


----------


```json
{  
  "allowed_domain": "example.com",
  "accessToken": "1111111111111111111111111111111111111111111111111111111111111111",  
  "query": "",  
  "width": 1920,  
  "height": 1080,  
  "orientation": "landscape"  
}
```
|Setting name|Value description|
|---|---|
|allowed_domain| Any FQDN for `Access-Control-Allow-Origin` returned by __getUnsplashBg.php__  |
|accessToken | You can get it after registering the application on [Unsplash API](https://unsplash.com/developers)|
|query| Query to API for better search |
|width|Preferred image width|
|height|Preferred image height|
|orientation| landscape / portarait / squarish |


----------


 3. Now you should connect script to your page
There are two ways connecting script to the page:
	- __Javascript Injection__:
	```javascript
        function inject_unsplash(text, s_URL, funcToRun, runOnLoad) {
            var D = document;
            var scriptNode = D.createElement('script');
            if (runOnLoad) {
                scriptNode.addEventListener("load", runOnLoad, false);
            }
            scriptNode.type = "text/javascript";
            scriptNode.defer = true;
            if (text) scriptNode.textContent = text;
            if (s_URL) scriptNode.src = s_URL;
            if (funcToRun) scriptNode.textContent = '(' + funcToRun.toString() + ')()';

            var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
            targ.appendChild(scriptNode);
        }(null, "https://example.com/unsplashbg.min.js", null, goUnsplash);
	```
This script will load `https://example.com/unsplashbg.min.js` and, when script is loaded, run the function `goUnsplash`(a bit later about it, ok?)

  - __Simple script tag:__
	```html
		<script src="https://example.com/unsplashbg.min.js" type="text/javascript" integrity="%INTEGRITY%" defer></script>
		<script type="text/javascript">
			...
			///	Call updater here
			...
		</script>
	```
	


----------


4. And finally you need to call updater init :)

	If you chose __JS Injection__, we need to setup a callback function for injector:
	```javascript
	function goUnsplash() {
     console.log("UnsplashBGUpdater loaded!");
      unsplashBgUpdater.init(...);
     }
	```
If you chose a simple script - we only need one call
```html
		<script type="text/javascript">
	      unsplashBgUpdater.init(...);
		</script>
```


----------


### Params table: 
```javascript
unsplashBgUpdater.init(interval, selector, selector_type, url, url_postfix);
```
|Param name|Type|Param description|
|---|---|---|
|interval|Integer|Refresh interval, seconds; e.g: __5__|
|selector|String|Current background selector; e.g: __body__, __rl-bg__|
|selector_type|String|Current background selector type; May be: __tag__( e.g for body), __class__, __id__
|url|String \| async function|Full URL to __getUnsplashBg.php OR__ async function returning something like [#Async function return object](#async-function-return-object)|
|url_postfix|String|In accordance with Unsplash API rules, in all links to pictures from the service you must specify the UTM parameters to identify your application; e.g __"&utm\_source=My%20Awesome%20Application&utm\_medium=referral"__|

#### Async function return object
```js
{
	"success": true,
	"url": "https://url/to/image",
	"image_user_name": "John Doe",
	"image_user_url": "https://url/to/John%20Doe/profile"
}
```
