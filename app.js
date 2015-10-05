var emosa = require("emosa");
(function() {
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
  var PouchDB = require("pouchdb");
  db = new PouchDB("mydb");

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

  var vm = new Vue({
    el: "#app",
    data: {
      config: {
        editor: true,
        preview: true,
        posts: true,
      },
      posts: [],
      current: null
    },
    computed: {
      preview() {
        if (!this.isCurrent) {
          return ''
        }
        var html = marked(this.posts[this.current].content);

        return emosa.replaceToUnicode(html);
      },
      isCurrent() {
        return this.current === undefined || this.current === null || this.current === '' ? false : true;
      },
      currentPost() {
        if (!this.isCurrent) {
          return {
            wip: false,
            title: '',
            content: ''
          };
        }
        return this.posts[this.current];
      },
      currentContent() {
        if (!this.isCurrent) {
          return '';
        }
        return this.posts[this.current].content;
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
      _onChangeCurrent() {
        this.editor.setValue(this.currentContent);
      },
      _onUpdatePosts() {
        console.log("update");
      },
      toJSON(prop) {
        return JSON.parse(JSON.stringify(this[prop]));
      }
    },
    ready(){
      var value;
      value = this.isCurrent && this.posts[this.isCurrent] ? this.currentContent : '';

      var editor = CodeMirror(this.$els.codemirror, {
        value: value
      });
      editor.addKeyMap({
        "Enter": function(cm) { return cm.execCommand("newlineAndIndentContinueMarkdownList"); }
      });

      editor.on("change", (cm) => {
        if (this.isCurrent) {
          this.posts[this.current].content = cm.getValue();
        }
      });

      this.editor = editor;

      db.get("posts")
        .then((posts) => {
          this.$set("posts", posts.posts);
          this.$watch("posts", () => {
            var posts = {
              _id: "posts",
              posts: this.toJSON("posts")
            };
            console.log(posts);
          }, {deep: true});
        });
    },
    watch: {
      "current": "_onChangeCurrent",
    }

  });

})();
