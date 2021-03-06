(function() {
  var emosa = require("emosa");
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  var db = new PouchDB("mydb");
  var fetch = require("isomorphic-fetch");
  var Promise = require("bluebird");
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

  var DELAY = 300;

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
        user: "",
        team: "",
        api: "https://api.esa.io/v1/teams/",
        token: "",
        url: "",
        isValidToken: false
      },
      config: {
        editor: true,
        preview: true,
        posts: false,
        settings: false,
        toolbarPos: 'bottom'
      },
      posts: [],
      current: null,
      preview: '',
      currentPost: {}
    },

    /* computed */
    computed: {
      baseUrl() {
        return `${this.env.api}${this.env.team}/`;
      },
      isCurrent() {
        return this.current === undefined || this.current === null || this.current === '' ? false : true;
      },
      currentBody() {
        return this.isCurrent ? this.posts[this.current].body_md : "";
      },
      currentName() {
        return this.isCurrent ? this.posts[this.current].name : "";
      },
      isPosts() {
        return this.posts.length !== 0;
      }
    },

    /* watch */
    watch: {
      "isLoading": "_onChangeLoading",
      "current": "_onChangeCurrent"
    },

    /* events */
    events: {
      "refresh": "refresh",
      "notify": "_onNotify",
      "save": "_onSave"
    },

    /* methods */
    methods: {
      refresh() {
        this.currentPost = this.isCurrent ? this.posts[this.current] : {};
        this._setPreview();
      },
      save() {
        var _id = "posts";
        var _posts = { posts: toJSON(this.posts) };
        db.get(_id)
          .then((doc) => {
            return db.put(_posts, _id, doc._rev)
          });
      },

      /* display */
      _setPreview() {
        this.preview = this._renderMarkdown(this.currentBody);
      },
      toggleMenu(name) {
        this.config[name] = !this.config[name];
      },
      closeNotify($index) {
        this.notifications.splice($index, 1);
      },
      changePost($index) {
        this.current = $index;
      },


      /* post */
      createNewPost() {
        var defaults = _.assign({}, DEFAULTS_POST, {user: this.env.user, created_at: moment().tz("Asia/Tokyo").format()});
        this.posts.$set(this.posts.length, defaults);
        this.current = this.posts.length - 1;
        this.config.editor = true;
        this.config.preview = true;
      },
      publishPost(wip) {
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
            this.posts.$set(this.current, json);
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
            this.$emit("refresh");
          });
      },
      deletePost($index) {
        var post = toJSON(this.posts[$index]);

        // リモートから削除するか選択させる
        return this.DELETE(post)
          .then(() => {
            this._removePost($index);
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
            this.$emit("refresh");
          });
      },
      _removePost($index) {
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
      syncPost() {
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
                this.posts.$set(this.current, json);
                this.$emit("notify", {
                  message: "記事を同期しました。"
                });
              }else {
                console.log(post.updated_at, json.updated_at);
                var p = moment(post.updated_at).tz("Asia/Tokyo").unix();
                var j = moment(json.updated_at).tz("Asia/Tokyo").unix();
                if (p > j) {
                  // remoteをupdateするか確認出す
                  return this.publishPost(post.wip)
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
              this.$emit("refresh");
            });
        }
      },


      /* request */
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
            return res.json();
          })
          .then((json) => {
            if (json.error) {
              reject(json);
            }
            else {
              resolve(json);
            }
          })
          .catch(reject);
        });
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


      /* util */
      _renderMarkdown(md) {
        var html = this._marked(md);
        return this._emosa(html);
      },
      _marked(md) {
        return marked(md);
      },
      _emosa(html) {
        return emosa.replaceToUnicode(html);
      },
      openUrl(url) {
        if (_.isString(url)) {
          require("shell").openExternal(url);
        }
        else if (this.currentPost && this.currentPost.url) {
          require("shell").openExternal(this.currentPost.url);
        }
      },

      _showSettings() {
        this.$els.env.show();
      },
      _hideSettings() {
        this.$els.env.close();
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


      /* event handler */
      _onChangeLoading() {
        this.isLoading ? this._showLoader() : this._hideLoader();
      },
      _onSave() {
        this.save();
      },
      _onNotify(notify) {
        this._showNotify();
        this.notifications.push(notify);

        if (notify.autoClose !== false) {
          setTimeout(() => {
            this.notifications.splice(0, 1);
          }, 2000)
        }
      },
      _onChangeCurrent() {
        this.currentPost = this.isCurrent ? this.posts[this.current] : {};
        this._setPreview();
      },

      checkAccessToken() {
        this.GET("")
          .then((json) => {
            this.env.isValidToken = true;
            this.env.url = json.url;
            this.env.icon = json.icon;
            this.saveEnv()
              .then(() => {
                this.$emit("notify", {
                  message: "トークンを保存しました。"
                });
              });
          })
          .catch((err) => {
            this.env.isValidToken = false;
            this.env.url = "";
            this.env.icon = "json.icon";
            this.$emit("notify", {
              message: "トークン・チーム名が正しくありません。",
              error: true,
              autoClose: false
            });
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      saveEnv() {
        var _id = "env";
        return new Promise((resolve, reject) => {
          return db.get(_id)
            .then((env) => {
              return db.put(toJSON(this.env), _id, env._rev)
                .then(resolve);
            })
            .catch(reject)
        });
      },

      /* initialize */
      _watchify() {
        var _id = "posts";
        var setPreview = _.debounce(()=> {
            this._setPreview();
          }, DELAY);

        var save = _.debounce(()=> {
            this.save();
          }, DELAY);

        this.$watch(_id, () => {
          save();
          setPreview();
        }, {deep: true});
      },
      _domfy() {
        $("textarea").esarea();
      },
      _initDB() {
        return new Promise((resolve, reject) => {
          var _id = "posts";
          db.get(_id)
            .then((posts) => {
              this.$set(_id, posts.posts);
              resolve();
            })
            .catch((err) => {
              return db.put({_id: _id, posts: []})
                .then((doc) => {
                  this._initDB();
                });
            });
        });
      },
      _initEnv() {
        return new Promise((resolve, reject) => {
          var _id = "env";
          db.get(_id)
            .then((env) => {
              this.$set(_id, env);
              resolve();
            })
            .catch(() => {
              var data = _.assign({}, {_id: _id}, toJSON(this.env));
              return db.put(data)
                .then(resolve);
            })
        });
      },
      _initialize() {
        return Promise.all([
            this._initDB(),
            this._initEnv()
          ]);
      }
    },

    /* lifecycle */
    ready() {
      this.isLoading = true;
      this._initialize()
        .then(this._watchify)
        .then(this._domfy)
        .then(() => {
          console.log("initilize succeed");
        })
        .catch((err) => {
          console.log(err);
          this.$emit("notify", {
            message: "初期化に失敗しました。",
            error: true,
            autoClose: false
          })
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  });

})();
