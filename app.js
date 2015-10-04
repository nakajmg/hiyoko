(function() {
  var Vue = require("vue");
  var hljs = require("highlight.js");
  var marked = require("marked");
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


  var posts = [
    {
      wip: false,
      title: "post1",
      content: "# post1\n* hoge\n* hoge2"
    },
    {
      wip: true,
      title: "post2",
      content: `
|aaa|ggg|
|---|---|
|hoge|hoge|
|hoge|hoge|

# heading1

## heading2

### heading3

#### heading4

##### heading5

* list
* list

\`\`\`js
var code = "code";
\`\`\`

![hoge](https://img.esa.io/uploads/production/users/4496/icon/thumb_ms_edcc7dc6067a5af2bf0ad8c40a0ea809.jpg)

[hogehoge](https://img.esa.io/uploads/production/users/4496/icon/thumb_ms_edcc7dc6067a5af2bf0ad8c40a0ea809.jpg)

      `
    }
  ];

  var vm = new Vue({
    el: "#app",
    data: {
      config: {
        editor: true,
        preview: true
      },
      posts: [],
      current: 0
    },
    computed: {
      preview: function() {
        if (this.current === undefined || this.current === null || this.current === '') {
          return '';
        }
        var html = marked(this.posts[this.current].content);
        return html;
      }
    },
    beforeCompile() {
      this.$set('posts', posts);
    },
    methods: {
      changePost($index) {
        if (this.current === $index) {
          this.current = null;
        }
        else {
          this.current = $index;
        }
      }
    }
  });

})();
