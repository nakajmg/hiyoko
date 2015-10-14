var hljs = require("highlight.js");
module.exports = {
  highlight: function(code, lang, callback) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, code).value;
    }
    else {
      return hljs.highlightAuto(code).value;
    }
  }
};
