(function() {
  var Vue = require("vue");
  var ipc = require("ipc");
  var vm;

  Vue.component("hiyoko-editor", require("./js/component/hiyoko-editor"));
  Vue.component("hiyoko-preview", require("./js/component/hiyoko-preview"));
  Vue.component("hiyoko-toolbar", require("./js/component/hiyoko-toolbar"));
  Vue.component("dialog-notify", require("./js/component/dialog-notify"));
  Vue.component("dialog-loader", require("./js/component/dialog-loader"));
  Vue.component("dialog-input", require("./js/component/dialog-input"));
  Vue.component("dialog-confirm", require("./js/component/dialog-confirm"));

  function init(currentPost) {
    window.vm = new Vue({
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
        },
        "show:dialog:input"(options) {
          this.$refs.dialoginput.$emit("show", options);
        },
        "close:dialog:input"(value) {
          this.input = value;
        },
        "show:dialog:confirm"(options) {
          this.$refs.dialogconfirm.$emit("show", options);
        },
        "show:dialog:loader"() {
          this.$refs.dialogloader.$emit("show");
        },
        "close:dialog:loader"() {
          this.$refs.dialogloader.$emit("close");
        },
        "add:dialog:notify"(notify) {
          this.$refs.dialognotify.$emit("add", notify);
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
