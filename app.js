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
      title: "(\\( ⁰⊖⁰)/) 1",
      content: "# post1\n* hoge\n* hoge2"
    },
    {
      wip: true,
      title: "(\\( ⁰⊖⁰)/) 2",
      content: `# heading1

## heading2

### heading3

\`\`\`js
var code = "code";
\`\`\`

|aaa|ggg|
|---|---|
|hoge|hoge|
|hoge|hoge|
`
    },
    {
      wip: false,
      title: "(\\( ⁰⊖⁰)/) 3",
      content: `hoge`
    }
  ];

  var vm = new Vue({
    el: "#app",
    data: {
      config: {
        editor: true,
        preview: true,
        posts: true,
      },
      posts: [],
      current: 1
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
      },
      toggleMenu(name) {
        this.config[name] = !this.config[name];
      }
    }
  });

})();
