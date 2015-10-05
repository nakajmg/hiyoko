var emosa = require("emosa");
(function() {
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  var PouchDB = require("pouchdb");
  var db = new PouchDB("mydb");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
  var Qs = require("qs");
  var moment = require("moment-timezone");
  var _ = require("lodash");

  marked.setOptions({
    highlight:function(code, lang, callback) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, code).value;
      }
      else {
        return hljs.highlightAuto(code).value;
      }
    }
  });

  var DEFAULTS_POST = {
    name: "(\\( ⁰⊖⁰)/)",
    body_md: "",
    tags: [],
    category: "",
    wip: true,
    message: "",
    user: ""
  };
  var toJSON = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  vm = new Vue({
    el: "#app",
    data: {
      env: {
        user: "nakajmg",
        team: "pxgrid",
        api: "https://api.esa.io/v1/teams/",
        token: require("./token")
      },
      config: {
        editor: false,
        preview: true,
        posts: true,
        toolbarPos: 'bottom'
      },
      posts: [],
      current: null
    },
    computed: {
      baseUrl() {
        return `${this.env.api}${this.env.team}/`;
      },
      preview() {
        if (!this.isCurrent) {
          return ''
        }
        var html = marked(this.posts[this.current].body_md);

        return emosa.replaceToUnicode(html);
      },
      isCurrent() {
        return this.current === undefined || this.current === null || this.current === '' ? false : true;
      },
      currentPost() {
        if (!this.isCurrent) {
          return DEFAULTS_POST;
        }
        return this.posts[this.current];
      },
      currentBody() {
        if (!this.isCurrent) {
          return '';
        }
        return this.posts[this.current].body_md;
      },
      currentTitle() {
        if (!this.isCurrent) {
          return '';
        }
        return this.posts[this.current].title;
      }
    },
    beforeCompile() {
//      db.get("posts")
//        .then((posts) => {
//          this.$set("posts", posts.posts);
//        });
    },
    methods: {
      changePost($index) {
        if (this.current === $index) {
          this.current = null;
        }
        else {
          this.current = $index;
        }
      },
      toggleMenu(name) {
        this.config[name] = !this.config[name];
      },
      refreshEditor() {
        if (this.config.editor) {
          _.defer(() => {
            this.editor.refresh();
          });
        }
      },
      createNewPost() {
        var defaults = Object.assign(DEFAULTS_POST, {user: this.env.user, created_at: moment().tz("Asia/Tokyo").format()});
        this.posts.push(defaults);
        this.current = this.posts.length - 1;
        this.config.editor = true;
        this.config.preview = true;
      },
      deletePost($index) {
        if ($index === this.current) {
          this.current = null;
        }
        this.posts.splice($index, 1);
      },
      _onChangeCurrent() {
        this.editor.setValue(this.currentBody);
        this.refreshEditor();
      },
      _onUpdatePosts() {
        console.log("update");
      },
      toJSON(prop) {
        return JSON.parse(JSON.stringify(this[prop]));
      },
      shipit() {
        var post = toJSON(this.currentPost);
        post.message = "API no test!!";
        post.wip = false;

        this.POST("posts", post)
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            console.log(json);
            this.posts.$set(this.current, json);
          });
      },
      wip() {
        var post = toJSON(this.currentPost);
        post.message = "WIP no test!!";
        post.wip = true;

        this.POST("posts", post)
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            console.log(json);
            this.posts.$set(this.current, json);
          });
      },
      POST(endpoint, post) {
        return fetch(`${this.baseUrl}${endpoint}`, {
          method: "post",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(post)
        });
      },
      openUrl(url) {
        if (_.isString(url)) {
          require("shell").openExternal(url);
        }
        else if (this.currentPost && this.currentPost.url) {
          require("shell").openExternal(this.currentPost.url);
        }
      }
    },
    ready(){
      var value;
      value = this.isCurrent && this.posts[this.isCurrent] ? this.currentBody : '';

      var editor = CodeMirror(this.$els.codemirror, {
        value: value
      });
      editor.addKeyMap({
        "Enter": function(cm) { return cm.execCommand("newlineAndIndentContinueMarkdownList"); }
      });

      editor.on("change", (cm) => {
        if (this.isCurrent) {
          this.posts[this.current].body_md = cm.getValue();
        }
      });

      this.editor = editor;

      db.get("posts")
        .then((posts) => {
          this.$set("posts", posts.posts);
          var _id = "posts";

          this.$watch("posts", (value) => {
            var _posts = {
              posts: this.toJSON("posts")
            };
            db.get(_id)
              .then((doc) => {
                return db.put(_posts, _id, doc._rev)
              })
              .then((res) => {
//                console.log(res);
              });
          }, {deep: true});
        });
    },
    watch: {
      "current": "_onChangeCurrent",
      "config.editor": "refreshEditor"
    }

  });

})();
