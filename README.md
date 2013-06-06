underscore-async-templates
===========
AJAX-loaded underscore templates with added include functionality
-----------------------------------------------------------------
I am developing a big webapp and got tired of including all my templates inline. This module enables loading of EJS templates using AJAX, and adds `<% include %>` functionality on top.

### Dependencies
This module requires jQuery > 1.5 (for Deferreds) and Underscore

### Including
* **Classic**: include `underscore-async-templates.js` in a `<script>` tag after jQuery and Underscore have been loaded
* **AMD**: this module is compatible with requirejs. It depends on the jquery and underscore
* In both cases you will get a singleton UAT object that acts more like a namespace

### API
* `setOptions(new_opts)`
 Change the default module options. Only include the options you want to change from the defaults.

 Default options:

 ```javascript
{
    extension: 'ejs',
    root: '/views/',
    open_tag: '<%',
    close_tag: '%>'
}
```

* `setAjaxOptions(new_opts)`
 Change the options passed to `jQuery.ajax`. Only include the options you want to change from the defaults or that you want to add to jQuery.ajax.

 Default AJAX options:

 ```javascript
{
    cache: true,
    dataType: 'text'
}
```

* `getTemplate(view)`
 Get the compiled Underscore template located at `root/view.ejs`. Returns a jQuery promise that will resolve when the template is loaded. Once the promise resolves, you will receive the compiled template. Additionally, the template's original text will be set as the `tpl_text` property of the template.

 If your views are located in the `/views` directory of your site and the template is at `/views/product/list.ejs` then `getTemplate('product/list')` will get you what you need.
 If your views are located on another subdomain, you can make sure they get loaded properly by having CORS enabled between your two domains.

* `getRenderedView(view [, data])`
 Render the view located at `root/view.ejs`, optionally passing it a data object. Returns a jQuery promise that will resolve when the template is loaded and rendered. Once the promise resolves, you will receive the rendered HTML.

* `renderViewTo(view, data, element)`
 Render the view located at `root/view.ejs` inside the HTML element referred to by `element`. Returns a jQuery promise that will resolve when the rendering is completed. The promise does not bear any data with it.

 The `element` argument will be jQuery-wrapped, so you can pass a CSS selector, a DOM element or a jQuery object.


### Includes
In addition to the regular EJS templating provided by Underscore, UAT gives you the possibility to include sub-views as follows:

```html
<h1>Title</h1>
<% include modules/top-bar %>
<p>Here is some more content</p>
```

Includes are always resolved using the root path of your views, and included templates can themselves include other templates, to infinity.

`include` tags will simply be replaced with the text of the included view before compiling the final template. This means they get access to all the scope of the top view.

Note however that there is no cyclic dependency detection, so it's up to you to manage that.