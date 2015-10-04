(function() {
  var Vue = require("vue");
  var marked = require("marked");
  var vm = new Vue({
    el: "#app",
    data: {
      input: "# hoge",
      config: {
        preview: true
      }
    },
    computed: {
      preview: function() {
        return marked(this.input);
      }
    }
  });

})();