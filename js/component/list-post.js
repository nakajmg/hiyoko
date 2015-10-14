var _ = require("lodash");
module.exports = {
  props: ["posts", "state", "current", "currentPost"],
  data() {
    return {
      search: "",
      listedLength: 1
    }
  },
  computed: {
    isPosts() {
      return this.posts.length !== 0;
    },
    isList() {
      if (this.isPosts) {
        return false
      }
      return this.listedLength !== 0;
    }
  },
  template: `
    <div class="m-postList" v-show="state" transition="m-postList">
      <div class="m-postList__empty" v-if="!isPosts"><a>(\\( ⁰⊖⁰)/)  NO POST</a></div>
      <ul class="m-postList__list" v-el:list>
        <li class="m-postList__item"
          v-for="post in posts | filterBy search in 'name' 'full_name' 'body_md'"
          :class="{'m-postList__item--current': post._uid === current}"
          @click="select(post)"
          track-by="_uid"
          v-ref:post
        >
          <a>{{post.name}}</a>
          <span class="m-postList__trash" @click.stop="remove(post)"><i class="fa fa-trash"></i></span>
        </li>
      </ul>
      <div class="m-postList__filter">
        <i class="fa fa-search"></i><input v-model="search" placeholder="search in all fields"><i class="fa fa-times-circle" @click="resetSearchText"></i>
      </div>
    </div>
  `,

  watch: {
    search() {
      _.defer(() => {
        this.listedLength = this._getListedLength();
      })
    },
    posts() {
      this.listedLength = this._getListedLength();
    }
  },
  methods: {
    select(post) {
      this.$dispatch("change:posts:current", post);
    },
    remove(post) {
      this.$dispatch("remove:posts", post);
    },
    resetSearchText() {
      this.search = "";
    },
    _getListedLength() {
      return this.$refs.post.length;
    }
  },
  ready() {
//    this.listedLength = this._getListedLength();
  }
};
