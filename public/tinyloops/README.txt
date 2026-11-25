TINY LOOPS 3D — INSTALLABLE PWA

DEPLOY
1. Copy the complete tiny-loops-pwa folder into your website's public directory.
2. Rename the folder to the URL you want, for example:
   public/tinyloops/
3. Deploy the site over HTTPS.
4. Open https://your-domain.example/tinyloops/ on a phone.

ANDROID
Open the game in Chrome. Use the INSTALL GAME button when Chrome offers installation, or choose Install app / Add to Home screen from the browser menu.

IPHONE / IPAD
Open the game in Safari, tap Share, then choose Add to Home Screen. The INSTALL GAME button displays these instructions because iOS does not expose the same install prompt as Android.

OFFLINE
The service worker caches the game shell and icons after the first successful visit. The game can then reopen offline. A later deployment updates the service worker cache version in sw.js (CACHE_NAME) if you need to force an immediate cache refresh.

IMPORTANT
A PWA must be served from HTTPS (localhost is also supported for development). Opening index.html directly as a file will not enable installation or offline caching.


Offline support note: open https://www.shhdesign.co.uk/tinyloops/ once while online and allow the page to finish loading before installing the home-screen app. The manifest and service worker use absolute /tinyloops/ paths so the no-trailing-slash URL cannot accidentally register the worker at the site root.
