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
  var getCategoryTree = require("./js/tree");


  /* registration component */
  Vue.component("dialog-input", require("./js/component/dialog-input"));
  Vue.component("dialog-confirm", require("./js/component/dialog-confirm"));
  Vue.component("dialog-loader", require("./js/component/dialog-loader"));
  Vue.component("dialog-notify", require("./js/component/dialog-notify"));
  Vue.component("list-menu", require("./js/component/list-menu"));
  Vue.component("hiyoko-editor", require("./js/component/hiyoko-editor"));
  Vue.component("hiyoko-preview", require("./js/component/hiyoko-preview"));
  Vue.component("hiyoko-toolbar", require("./js/component/hiyoko-toolbar"));
  Vue.component("list-post", require("./js/component/list-post"));
  Vue.component("list-category", require("./js/component/list-category"));
  Vue.component("hiyoko-settings", require("./js/component/hiyoko-settings"));
  Vue.component("hiyoko-header", require("./js/component/hiyoko-header"));
  Vue.filter("esa-filter", require("./js/filter/esa"));
  Vue.config.debug = true;

  /* create vm */
  window.vm = new Vue({
    el: "#app",
    data: {
      current: null,
      currentPost: null,
      search: "",
      posts: [],
      config: {
        delay: 100,
        editor: true,
        preview: true
      },
      menuState: {
        newPost: true,
        category: true,
        posts: true,
        settings: false
      }
    },

    watch: {
      current() {
        if (this.current !== null) {
          this.currentPost = _.find(this.posts, {_uid: this.current});
        }
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

      "add:newpost"(options) {
        var post = _.assign({}, require("./js/NEW_POST"));
        post._uid = Date.now();
        post.created_at = this._getDate();
        post._modified_at = this._getDate();
        if (options && _.keys(options).length) {
          _.assign(post, options);
          console.log(options, post);
        }
        this.posts.splice(0,0, post);
        this.current = post._uid;
        _.defer(() => {
          this.$emit("open:editor", this.currentPost);
        });
//        this.config.editor = true;
//        this.config.preview = true;
//        this.menuState.heading = false;
      },

      "change:menu:toggle"(type) {
        this.menuState[type] = !this.menuState[type];
      },

      "change:posts:current"(post) {
        if (post) {
          this.current = post._uid;
          this.config.preview = true;
        }
        else {
          this.current = null;
        }
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
      },

      "set:keyword"(keyword) {
        this.$broadcast("set:keyword", keyword);
        this._postsScrollTop();
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
      },
      _postsScrollTop() {
        this.$els.posts.scrollTop = 0;
      }
    },

    computed: {
      categories() {
        var categories = _.uniq(_.compact(_.pluck(this.posts, "category")));
        var tree = getCategoryTree(categories);
        return tree;
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
    }
  });

})();
