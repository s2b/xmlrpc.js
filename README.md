xmlrpc.js
=========

This is a tiny JavaScript library that allows you to connect to XML-RPC services (e. g. WordPress) from within the browser using AJAX requests. Due to the AJAX functionality and isArray checks the library requires a jQuery-style library that implements $.ajax() and $.isArray().

Same-Origin-Policy
------------------

[(Wikipedia)](http://en.wikipedia.org/wiki/Same_origin_policy)

Please note that due to reasonable security measures of modern web browsers (Same-Origin-Policy) this library only works in some edge cases:

* Browser extensions (e. g. Google Chrome)
* Hybrid Apps (e. g. [PhoneGap](http://phonegap.com/), [BlackBerry WebWorks](http://developer.blackberry.com/html5/))
* [PhantomJS](http://phantomjs.org/)
* … and similar environments

In all those cases you probably have to white-list the domains you want to access.