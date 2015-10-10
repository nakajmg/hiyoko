var emosa = require("emosa");
var marked = require("marked");
marked.setOptions(require("../markedOptions"));
module.exports = {
  props: ["post", "state"],
  computed: {
    name() {
      return this.post && this.post.name || "";
    },
    body_md() {
      return this.post && this.post.body_md ? this._renderMarkdown(this.post.body_md) : "";
    },
    isEmpty() {
      return !(this.post && this.post.name) && !(this.post && this.body_md);
    },
    tags() {
      return ["#tag1", "#tag2"];
    },
    categories() {
      return ["category1", "category2"];
    }
  },

  template: `
    <div class="m-preview" v-show="!isEmpty">
      <h2 class="m-preview__title">
        <div>
          <span>{{name}}</span>
        </div>
      </h2>
      {{{body_md}}}
    </div>

    <div class="m-preview state-empty" v-show="isEmpty">
      <div>
        <span class="m-preview__category">category1</span>
        <span class="m-preview__category">category2</span>
      </div>
      <h2 class="m-preview__title">Preview Title
        <span class="m-preview__tag">#tag1</span>
        <span class="m-preview__tag">#tag2</span>
        <!--<span v-for="tag in tags" class="m-preview__tag">{{tag}}</span>-->
      </h2>
      <div class="m-preview__empty">
        <div class="m-preview__icon">
          <div class="c1"></div>
          <div class="c2">
            <div class="c3"></div>
          </div>
          <div class="c1"></div>
        </div>
        Markdown Preview
      </div>
    </div>
  `,

  methods: {
    _renderMarkdown(md) {
      var html = this._marked(md);
      return this._emosa(html);
    },
    _marked(md) {
      return marked(md);
    },
    _emosa(html) {
      return emosa.replaceToUnicode(html);
    }
  }
};
