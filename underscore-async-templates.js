(function() {
  var deffn = function(jQuery, _) {
    var options = {
      extension: 'ejs',
      root: '/views/',
      open_tag: '<%',
      close_tag: '%>'
    };
    var ajax_options = {
      cache: true,
      dataType: 'text'
    };
    var templates = {};

    var include_regex;
    var buildIncludeRegex = function() {
      include_regex = new RegExp(options.open_tag + '\\s*include ([^\\s]+?)\\s*' + options.close_tag, 'g');
    };
    buildIncludeRegex();

    var UAT = {
      setOptions: function(new_opts) {
        options = jQuery.extend({}, options, new_opts);
        // add a trailing / to options.root
        options.root = options.root.replace(/([^/])$/, '$1/');
        buildIncludeRegex();
      },
      setAjaxOptions: function(new_opts) {
        ajax_options = jQuery.extend({}, ajax_options, new_opts);
      },
      getTemplate: function(view) {
        if (templates[view]) {
          return templates[view];
        }
        else {
          var def = jQuery.Deferred();
          var req = jQuery.ajax(options.root + view + '.' + options.extension, ajax_options);
          req.done(function(tpl_text) {
            // before resolving the template promise, find all include blocks
            var includes = [];
            var match;
            while (match = include_regex.exec(tpl_text)) {
              includes.push(match);
            }
            var include_promises = _.map(includes, function(include) {
              var def = jQuery.Deferred();
              var include_tpl = UAT.getTemplate(include[1]);
              include_tpl.done(function(inc_tpl) {
                tpl_text = tpl_text.replace(include[0], inc_tpl.tpl_text);
                def.resolve();
              });
              include_tpl.fail(function(err) {
                def.reject(err);
              });

              return def.promise();
            });

            var all_includes = jQuery.when.apply(jQuery, include_promises);
            all_includes.done(function() {
              var tpl = _.template(tpl_text);
              tpl.tpl_text = tpl_text;
              def.resolve(tpl);
            });
            all_includes.fail(function(err) {
              def.reject(err);
            });
          });

          req.fail(function() {
            def.reject({err: 'Template [' + view + '] could not be loaded'});
          });

          return templates[view] = def.promise();
        }
      },
      getRenderedView: function(view, data) {
        var tpl_promise = this.getTemplate(view);
        var def = jQuery.Deferred();
        tpl_promise.done(function(tpl) {
          try {
            def.resolve(tpl(data));
          }
          catch (e) {
            def.reject({err: e});
          }
        });
        tpl_promise.fail(function(err) {
          def.reject(err);
        });

        return def.promise();
      },
      renderViewTo: function(view, data, el) {
        var render_promise = this.getRenderedView(view, data);
        var def = jQuery.Deferred();
        render_promise.done(function(html) {
          jQuery(el).html(html);
          def.resolve();
        });
        render_promise.fail(function(err) {
          def.reject(err);
        });

        return def.promise();
      }
    };

    return UAT;
  };

  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'underscore'], deffn);
  }
  else if ((window.jQuery || window.$) && window._) {
    window.UAT = deffn(window.jQuery || window.$, window._);
  }
  else {
    console.warn('underscore-async-templates requires jQuery and Underscore');
  }
})();