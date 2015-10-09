(function() {
  var emosa = require("emosa");
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  db = new PouchDB("hiyoko");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
  var moment = require("moment-timezone");
  var _ = require("lodash");
  marked.setOptions(require("./js/markedOptions"));

  /* registration component */
  Vue.component("dialog-input", require("./js/component/dialog-input"));
  Vue.component("dialog-confirm", require("./js/component/dialog-confirm"));
  Vue.component("dialog-loader", require("./js/component/dialog-loader"));
  Vue.component("dialog-notify", require("./js/component/dialog-notify"));

  Vue.component("menu-list", require("./js/component/menu-list"));
  Vue.component("post-list", require("./js/component/post-list"));

  /* create vm */
  vm = new Vue({
    el: "#app",
    data: {
    },

    /* events */
    events: {
      "show:dialog:input"(options) {
        this.$refs.dialoginput.$emit("show", options);
      },
      "close:dialog:input"(value) {
        this.input = value;
      },
      "show:dialog:confirm"(options) {
        this.$refs.dialogconfirm.$emit("show", options);
      },
      "close:dialog:confirm"(value) {
        this.confirm = value;
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

    /* methods */
    methods: {
      showDialogInput() {
        this.$emit("show:dialog:input", {
          message: "入力してください。"
        });
      },
      showDialogConfirm() {
        this.$emit("show:dialog:confirm", {
          message: "送信しますか？"
        });
      },
      showDialogLoader() {
        this.$emit("show:dialog:loader");

        setTimeout(() => {
          this.$emit("close:dialog:loader");
        }, 1000)
      },
      addDialogNotify() {
        this.$emit("add:dialog:notify", {
          message: "通知テスト"
        });
        this.$emit("add:dialog:notify", {
          message: "通知テスト",
          error: true
        });
        this.$emit("add:dialog:notify", {
          message: "通知テスト",
          warning: true
        });
        this.$emit("add:dialog:notify", {
          message: "通知テスト",
          wip: true
        });
      }
    }
  });

})();
