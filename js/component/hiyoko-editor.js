var _ = require("lodash");
var moment = require("moment-timezone");

module.exports = {
  props: ["delay", "post"],
  template: `
    <div class="m-editor">
      <input
        placeholder="category1/category2/Input document title #tag1 #tag2"
        v-el:name
        @keyup="onChangeName"
        autofocus
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
      this.update({body_md: this.$els.body.value})
    },
    changeName() {
      this.update(this.parseName(this.$els.name.value));
    },
    update(params) {
      _.each(params, (value, key) => {
        if (_.isString(value)) {
          this.post[key] = value;
        }
        else if(_.isArray(value)) {
          this.post[key] = value.concat();
        }
        else if(_.isObject(value)) {
          this.post[key] = _.assign({}, value);
        }
        else {
          this.post[key] = value;
        }
      });
      this.post._modified_at = moment().tz("Asia/Tokyo").format();
      this.$dispatch("update:editor");
    },
    parseName(full_name) {
      var name, main, tags, category, full_name, slash;
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
        category = main.substring(0, slash);
      }
      else {
        name = main;
        category = "";
      }

      full_name = category ? `${category}/${name}` : name;

      if (tags.length !== 0) {
        full_name = `${full_name} #${tags.join(" #")}`;
      }

      return {
        name: name,
        category: category,
        tags: tags,
        full_name: full_name
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

  ready() {
    this.$els.name.value = this.post.full_name;
    this.$els.body.value = this.post.body_md;
  }
};
