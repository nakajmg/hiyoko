var emosa = require("emosa");
(function() {
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  var PouchDB = require("pouchdb");
  db = new PouchDB("mydb");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
  var Qs = require("qs");
  var moment = require("moment-timezone");
  var _ = require("lodash");
  var token = require("./token");

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
    name: "New Post",
    body_md: "( ⁰⊖⁰)",
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
      isLoading: false,
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

    /* computed */
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
      },
      isPosts() {
        return this.posts.length !== 0;
      }
    },

    /* watch */
    watch: {
      "current": "_onChangeCurrent",
        "config.editor": "_refreshEditor",
        "isLoading": "_onChangeLoading"
    },

    /* methods */
    methods: {
      changePost($index) {
        this.current = $index;
      },
      toggleMenu(name) {
        this.config[name] = !this.config[name];
      },
      createNewPost() {
        var defaults = _.assign({}, DEFAULTS_POST, {user: this.env.user, created_at: moment().tz("Asia/Tokyo").format()});
        this.posts.$set(this.posts.length, defaults);
        this.current = this.posts.length - 1;
        this.config.editor = true;
        this.config.preview = true;
      },
      removePost($index) {
        if ($index === this.current) this.current = null;
        this.posts.splice($index, 1);
      },
      publish(wip) {
        var post = toJSON(this.currentPost);
        post.message = "API publish";
        post.wip = wip;
        var method = _.isUndefined(post.number) ? "POST" : "PATCH";

        this[method]("posts", post)
          .then((json) => {
            console.log(json);
            this.posts.$set(this.current, json);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      deletePost($index) {
        var post = toJSON(this.posts[$index]);
        this.DELETE(post)
          .then(() => {
            this.removePost($index);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      openUrl(url) {
        if (_.isString(url)) {
          require("shell").openExternal(url);
        }
        else if (this.currentPost && this.currentPost.url) {
          require("shell").openExternal(this.currentPost.url);
        }
      },
      PATCH(endpoint, post) {
        var body = {
          name: post.name,
          body_md: post.body_md,
          tags: post.tags,
          category: post.category,
          wip: post.wip,
          message: post.message,
          original_revision: {
            number: post.revision_number,
            user: post.updated_by.screen_name
          }
        };
        return this.POST(`${endpoint}/${post.number}`, body, "patch")
      },
      POST(endpoint, post, method) {
        this.isLoading = true;

        return new Promise((resolve, reject) => {
          fetch(`${this.baseUrl}${endpoint}`, {
            method: method ? method : "post",
            headers: {
              "Authorization": `Bearer ${this.env.token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(post)
          })
          .then((res) => {
            resolve(res.json());
          })
          .catch(reject);
        });
      },
      DELETE(post) {
        this.isLoading = true;

        return new Promise((resolve, reject) => {
          if (!post.number) {
            resolve();
          }
          fetch(`${this.baseUrl}posts/${post.number}`, {
            method: 'delete',
            headers: {
              "Authorization": `Bearer ${this.env.token}`,
              "Content-Type": "application/json"
            }
          })
          .then(resolve)
          .catch(reject);
        });
      },
      _refreshEditor() {
        if (this.config.editor) {
          _.defer(() => {
            this.editor.refresh();
          });
        }
      },
      _showLoader() {
        if (this.$els.dialog.getAttribute("open") === null) {
          this.$els.dialog.showModal();
        }
      },
      _hideLoader() {
        if (this.$els.dialog.getAttribute("open") !== null) {
          this.$els.dialog.close();
        }
      },
      _onChangeLoading() {
        if (this.isLoading) {
          this._showLoader();
        }
        else {
          this._hideLoader();
        }
      },
      _onChangeCurrent() {
        this.editor.setValue(this.currentBody);
        this._refreshEditor();
      },
      _setupCodeMirror() {
        var value = this.currentBody;
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
      },
      _setupDB() {
        db.get("posts")
          .then((posts) => {
            var _id = "posts";
            this.$set(_id, posts.posts);

            this.$watch(_id, (value) => {
              var _posts = { posts: toJSON(this.posts) };
              db.get(_id)
                .then((doc) => {
                  return db.put(_posts, _id, doc._rev)
                });
            }, {deep: true});
          });
      }
    },

    /* lifecycle */
    ready(){
      this._setupCodeMirror();
      this._setupDB();
    }
  });

})();
