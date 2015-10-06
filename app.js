var emosa = require("emosa");
(function() {
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
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
      notifications: [],
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

    /*  */
    events: {
      "notify": "_onNotify",
      "update:current:body": "_onUpdateCurrentBody"
    },

    /* methods */
    methods: {
      _onNotify(notify) {
        this._showNotify();
        this.notifications.push(notify);
        setTimeout(() => {
          this.notifications.splice(0, 1);
        }, 2000)
      },
      closeNotify($index) {
        this.notifications.splice($index, 1);
      },
      _onUpdateCurrentBody() {
        this.posts[this.current].body_md = this.editor.getValue();
      },
      changePost($index) {
        this.current = $index;
      },
      toggleMenu(name) {
        this.config[name] = !this.config[name];
      },
      createNewPost() {
        var defaults = _.assign({}, DEFAULTS_POST, {user: this.env.user, created_at: moment().tz("Asia/Tokyo").format()});
        this.save(this.posts.length, defaults);
        this.current = this.posts.length - 1;
        this.config.editor = true;
        this.config.preview = true;
      },
      removePost($index) {
        if ($index === this.current) {
          this.current = null;
        }
        else if($index < this.current) {
          this.current = this.current - 1;
        }
        this.posts.splice($index, 1);
        this.$emit("notify", {
          message: "記事を削除しました。"
        });
      },
      publish(wip) {
        var post = toJSON(this.currentPost);
        // コミットメッセージを入力させる
        post.message = "";
        post.wip = wip;
        var method = _.isUndefined(post.number) ? "POST" : "PATCH";

        return this[method]("posts", post)
          .then((json) => {
            if (json.error === "not_found") {
              // 投稿が削除されてるから再投稿するか確認する
              this.currentPost.$delete("number");
              this.currentPost.$delete("url");
              this.currentPost.$delete("revision_number");
              this.$emit("notify", {
                message: "記事の更新に失敗しました。記事が見つかりません。",
                error: true
              });
              return;
            }
            this.save(this.current, json);
            var notify = "";
            switch(method) {
              case "POST":
                notify += "記事を作成しました。";
                break;
              case "PATCH":
                notify += "記事を更新しました。";
                break;
            }
            this.$emit("notify", {
              message: notify,
              wip: json.wip
            });
          })
          .catch((err) => {
            this.$emit("notify", {
              message: "記事の作成・更新に失敗しました。",
              error: true
            });
            console.log(err);
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      deletePost($index) {
        var post = toJSON(this.posts[$index]);

        return this.DELETE(post)
          .then(() => {
            this.removePost($index);
          })
          .catch((err) => {
            this.$emit("notify", {
              message: "記事の削除に失敗しました。",
              error: true
            });
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
      sync() {
        var post = toJSON(this.currentPost);
        if (post.number) {
          return this.GET(`posts/${post.number}`)
            .then((json) => {
              console.log(json);
              if (!json) {
                debugger
                return this.$emit("notify", {
                  message: "記事の同期に失敗しました。",
                  error: true
                });
              }
              if (json.revision_number > post.revision_number) {
                this.save(this.current, json);
                this.$emit("notify", {
                  message: "記事を同期しました。"
                });
              }else {
                console.log(post.updated_at, json.updated_at);
                var p = moment(post.updated_at).tz("Asia/Tokyo").unix();
                var j = moment(json.updated_at).tz("Asia/Tokyo").unix();
                if (p > j) {
                  // remoteをupdateするか確認出す
                  return this.publish(post.wip)
                }
              }
            })
            .catch((err) => {
              console.log(err);
              if (err.status === 404) {
                this.currentPost.$delete("number");
                this.currentPost.$delete("url");
                this.currentPost.$delete("revision_number");

                this.$emit("notify", {
                  message: "記事の同期に失敗しました。記事が見つかりません。",
                  error: true
                });
              }
              else{
                this.$emit("notify", {
                  message: "記事の同期に失敗しました。",
                  error: true
                });
              }
            })
            .finally(()=> {
              this.isLoading = false;
            });
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
        if(!post.message && !method) {
          post.message = "Create post.";
        }
        if(!post.message && method) {
          post.message = "Update post."
        }
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
      GET(endpoint) {
        this.isLoading = true;

        return new Promise((resolve, reject) => {
          fetch(`${this.baseUrl}${endpoint}`, {
            method: "get",
            headers: {
              "Authorization": `Bearer ${this.env.token}`,
              "Content-Type": "application/json"
            }
          })
          .then((res) => {
            if (res.status === 404) {
              reject(res);
            }
            resolve(res.json());
          })
          .catch(reject);
        });
      },

      save($index, post) {
        post.updated_at = moment().tz("Asia/Tokyo").format();
        this.posts.$set($index, post);
      },
      _refreshEditor() {
        if (this.config.editor) {
          _.defer(() => {
            this.editor.refresh();
          });
        }
      },
      _showLoader() {
        if (this.$els.loader.getAttribute("open") === null) {
          this.$els.loader.showModal();
        }
      },
      _hideLoader() {
        if (this.$els.loader.getAttribute("open") !== null) {
          this.$els.loader.close();
        }
      },
      _showNotify() {
        this.$els.notify.show();
      },
      _hideNotify() {
        this.$els.notify.close();
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
            this.$emit("update:current:body");
          }
        });
        this.editor = editor;
      },
      _setupDB() {
        var _id = "posts";
        db.get(_id)
          .then((posts) => {
            this.$set(_id, posts.posts);
            this.$watch(_id, (value) => {
              var _posts = { posts: toJSON(this.posts) };
              db.get(_id)
                .then((doc) => {
                  return db.put(_posts, _id, doc._rev)
                });
            }, {deep: true});
          })
          .catch((err) => {
            db.put({_id: _id, posts: []})
              .then((doc) => {
                this._setupDB();
              });
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
