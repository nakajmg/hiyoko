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

  Vue.component("dialog-input", require("./js/component/dialog-input"));
  Vue.component("dialog-confirm", require("./js/component/dialog-confirm"));

  vm = new Vue({
    el: "#app",
    data: {
      test:"test",
      hoge: [
        {name: "hoge1"},
        {name: "hoge2"}
      ]
    },
    events: {
      closeDialogInput(value) {
        console.log(value);
      },
      closeDialogConfirm(value) {
        console.log(value);
      }
    },
    methods: {
      showDialogInput() {
        this.$refs.dialoginput.$emit("show");
      },
      showDialogConfirm() {
        this.$refs.dialogconfirm.$emit("show");
      }
    }
  });

})();
