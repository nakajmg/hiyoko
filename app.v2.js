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
  Vue.component("list-menu", require("./js/component/list-menu"));
  Vue.component("list-post", require("./js/component/list-post"));
  Vue.component("hiyoko-editor", require("./js/component/hiyoko-editor"));
  Vue.component("hiyoko-preview", require("./js/component/hiyoko-preview"));

  /* create vm */
  vm = new Vue({
    el: "#app",
    data: {
      current: null,
      currentPost: null,
      posts: [
        { _uid: 1444669079594, name: "hoge", category: "hoge/fuga", tags: ["tag1", "tag2"], full_name: "hoge/fuga/hoge #tag1 #tag2", wip: true, body_md: "hogehoge"}
      ],
      config: {
        delay: 100,
        editor: true,
        preview: true
      },
      menuState: {
        newPost: true,
        posts: true,
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
      },

      "add:newpost"() {
        var post = _.assign({}, require("./js/NEW_POST"));
        post._uid = Date.now();
        post.created_at = this._getDate();
        this.posts.$set(this.posts.length, post);
        this.current = post._uid;
        this.config.editor = true;
        this.config.preview = true;
      },

      "change:menu:toggle"(type) {
        this.menuState[type] = !this.menuState[type];
      },

      "change:posts:current"(post) {
        this.current = post._uid;
      },
      "remove:posts"(post) {
        if (post._uid === this.current) {
          this.current = null;
        }
        var index = this._getPostIndex(post);
        this.posts.splice(index, 1);
        this.addDialogNotify({
          message: "記事を削除しました。"
        });
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
      _getPostIndex(post) {
        return _.findIndex(this.posts, {_uid: post._uid});
      }
    }
  });

})();
