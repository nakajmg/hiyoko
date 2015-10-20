(function() {
  "use strict";
  var emosa = require("emosa");
  var Vue = require("vue");
  var marked = require("marked");
  var db = new PouchDB("hiyoko");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
  var moment = require("moment-timezone");
  var _ = require("lodash");
  marked.setOptions(require("./js/markedOptions"));
  var ipc = require("ipc");

  /* registration component */
  Vue.component("dialog-input", require("./js/component/dialog-input"));
  Vue.component("dialog-confirm", require("./js/component/dialog-confirm"));
  Vue.component("dialog-loader", require("./js/component/dialog-loader"));
  Vue.component("dialog-notify", require("./js/component/dialog-notify"));
  Vue.component("list-menu", require("./js/component/list-menu"));
  Vue.component("list-post", require("./js/component/list-post"));
  Vue.component("hiyoko-editor", require("./js/component/hiyoko-editor"));
  Vue.component("hiyoko-preview", require("./js/component/hiyoko-preview"));
  Vue.component("hiyoko-toolbar", require("./js/component/hiyoko-toolbar"));
  Vue.component("list-heading", require("./js/component/list-heading"));
  Vue.component("hiyoko-settings", require("./js/component/hiyoko-settings"));
  Vue.config.debug = true;

  /* create vm */
  window.vm = new Vue({
    el: "#app",
    data: {
      current: null,
      currentPost: null,
      posts: [
//        { _uid: 1444669079594, name: "hoge", category: "hoge/fuga", tags: ["tag1", "tag2"], full_name: "hoge/fuga/hoge #tag1 #tag2", wip: true, body_md: "hogehoge"},
//        { _uid: 1444669079595, name: "おんぎゃー", category: "定例/10/31/", tags: ["定例", "tag2"], full_name: "定例/10/31/おんぎゃー #定例 #tag2", wip: false, body_md: "おぎゃあおぎゃあ"},
      ],
      config: {
        delay: 100,
        editor: true,
        preview: true
      },
      menuState: {
        newPost: true,
        posts: true,
        heading: false,
        settings: false
      }
    },

    watch: {
      current() {
        this.currentPost = _.find(this.posts, {_uid: this.current});
      }
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
      "show:dialog:loader"() {
        this.$refs.dialogloader.$emit("show");
      },
      "close:dialog:loader"() {
        this.$refs.dialogloader.$emit("close");
      },
      "add:dialog:notify"(notify) {
        this.$refs.dialognotify.$emit("add", notify);
      },

      "add:newpost"() {
        var post = _.assign({}, require("./js/NEW_POST"));
        post._uid = Date.now();
        post.created_at = this._getDate();
        post._modified_at = this._getDate();
        this.posts.splice(0,0, post);
        this.current = post._uid;
        this.config.editor = true;
        this.config.preview = true;
        this.menuState.heading = false;
      },

      "change:menu:toggle"(type) {
        this.menuState[type] = !this.menuState[type];
      },

      "change:posts:current"(post) {
        this.current = post._uid;
      },
      "remove:posts"(post) {
        this.$once("close:dialog:confirm", (confirm) => {
          if (confirm) {
            this.current = post._uid === this.current ? null : this.current;
            this.posts.splice(this._getPostIndex(post), 1);
            this.addDialogNotify({ message: "記事を削除しました。" });
          }
        });
        this.$emit("show:dialog:confirm", { message: "記事を削除しますか？" })
      },

      "open:editor"(post) {
        ipc.send("open:editor", JSON.parse(JSON.stringify(post)));
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
      },
      addDialogNotify(notify) {
        this.$emit("add:dialog:notify", notify);
      },

      _getDate() {
        return moment().tz("Asia/Tokyo").format();
      },
      _getUnixTime(JST) {
        return moment(JST).tz("Asia/Tokyo").unix()
      },
      _getPostIndex(post) {
        return _.findIndex(this.posts, {_uid: post._uid});
      }
    },

    created() {
      let posts = require("./dummy_posts.json");
      _.each(posts, (post, index) => {
        post._uid = Date.now() + index;
        post._modified_at = "";
        this.posts.$set(this.posts.length, post);
      });
      ipc.on("post-update", (post) => {
        var index = this._getPostIndex(post);
        _.assign(this.posts[index], post);
      });
    },

    ready() {

    }
  });

})();
