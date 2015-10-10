var _ = require("lodash");

module.exports = {
  props: ["current", "posts", "delay"],
  template: `
    <div class="m-editor">
      <input
        placeholder="category1/category2/Input document title #tag1 #tag2"
        v-el:input
        @keyup="onChangeName"
      >
      <textarea class="m-editor__textarea"
        placeholder="# Input with Markdown"
        v-el:textarea
        @keyup="onChangeBody"
      >
      </textarea>
    </div>
  `,
  methods: {
    changeBody() {
      this.posts[this.current].body_md = this.$els.textarea.value;
    },
    changeName() {
      this.posts[this.current].name = this.$els.input.value;
    }
  },

  created() {
    this.onChangeName = _.debounce(() => {
      this.changeName();
    }, this.delay);

    this.onChangeBody = _.debounce(() => {
      this.changeBody();
    }, this.delay);
  },

  watch: {
    current() {
      if (this.current === null || this.current === undefined) {
        this.$els.input.value = "";
        this.$els.textarea.value = "";
      }
      else {
        this.$els.input.value = this.posts[this.current].name;
        this.$els.textarea.value = this.posts[this.current].body_md;
      }
    }
  }
};
