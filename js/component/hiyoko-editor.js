var _ = require("lodash");

module.exports = {
  props: ["current", "posts", "delay", "post"],
  template: `
    <div class="m-editor">
      <input
        placeholder="category1/category2/Input document title #tag1 #tag2"
        v-el:name
        @keyup="onChangeName"
      >
      <textarea class="m-editor__textarea"
        placeholder="# Input with Markdown"
        v-el:body
        @keyup="onChangeBody"
      >
      </textarea>
    </div>
  `,
  methods: {
    changeBody() {
      this.post.body_md = this.$els.body.value;
    },
    changeName() {
      var parsed = this.parseName(this.$els.name.value);
      this.post.name = parsed.name;
      this.post.category = parsed.category;
      this.post.tags = parsed.tags;
      this.post.full_name = this.post.category + this.post.name;
      if (this.post.tags.length !== 0) {
        this.post.full_name += " #" + this.post.tags.join(" #");
      }
    },
    parseName(full_name) {
      var name, main, tags, category, slash;
      var sharp = full_name.indexOf("#");

      if (sharp !== -1) {
        main = full_name.substring(0, sharp);
        tags = full_name.substring(sharp).split(" ");
        tags = _(tags)
          .filter((tag) => {
            return tag.charAt(0) === "#" && tag.length >= 2;
          })
          .map((tag) => {
            return tag.substring(1);
          })
          .uniq()
          .compact()
          .value();
      }
      else {
        main = full_name;
        tags = [];
      }

      slash = main.lastIndexOf("/");

      if (slash !== -1) {
        name = main.substring(slash + 1).trim();
        category = main.substring(0, slash).trim();
      }
      else {
        name = main;
        category = "";
      }

      return {
        name: name,
        category: category,
        tags: tags
      }
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
        this.$els.name.value = "";
        this.$els.body.value = "";
      }
      else {
        this.$els.name.value = this.post.full_name;
        this.$els.body.value = this.post.body_md;
      }
    }
  }
};
