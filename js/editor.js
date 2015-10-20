(function() {
  var Vue = require("vue");
  var ipc = require("ipc");
  var vm;

  Vue.component("hiyoko-editor", require("./js/component/hiyoko-editor"));
  Vue.component("hiyoko-preview", require("./js/component/hiyoko-preview"));
  Vue.component("hiyoko-toolbar", require("./js/component/hiyoko-toolbar"));

  function init(currentPost) {
    vm = new Vue({
      el: "#app",
      data: {
        currentPost: currentPost,
        config: {
          editor: true,
          preview: true,
          delay: 300,
          editable: true
        }
      },

      events: {
        "update:editor"() {
          this.update();
        }
      },

      methods: {
        update() {
          ipc.send("editor-update", JSON.parse(JSON.stringify(this.currentPost)));
        }
      }
    });
  }

  ipc.on("initialize-editor", (currentPost) => {
    init(currentPost);
  });
})();
