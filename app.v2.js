(function() {
  var emosa = require("emosa");
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  var db = new PouchDB("mydb");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
  var moment = require("moment-timezone");
  var _ = require("lodash");

  marked.setOptions({
    highlight: function(code, lang, callback) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, code).value;
      }
      else {
        return hljs.highlightAuto(code).value;
      }
    }
  });
})();
