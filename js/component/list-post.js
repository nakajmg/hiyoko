module.exports = {
  props: ["posts", "state", "current"],
  data() {
    return {
      search: ''
    }
  },
  computed: {
    isPosts() {
      return this.posts.length !== 0;
    }
  },
  template: `
    <div class="m-postList" v-show="state" transition="m-postList">
      <ul>
        <li class="m-postList__item m-postList__item--current" v-if="!isPosts"><a>(\\( ⁰⊖⁰)/)  NO POST</a></li>
        <li class="m-postList__item"
          v-for="post in posts | filterBy search in 'name' 'full_name' 'body_md'"
          :class="{'m-postList__item--current': $index === current}"
          @click="select($index)"
          track-by="_id"
        >
          <a>{{post.name}}</a>
          <span class="m-postList__trash" @click="remove($index)"><i class="fa fa-trash"></i></span>
        </li>
      </ul>
      <div class="m-postList__filter">
        <i class="fa fa-search"></i><input v-model="search"><i class="fa fa-times-circle" @click="resetSearchText"></i>
      </div>
    </div>
  `,
  methods: {
    select($index) {
      this.$dispatch("change:posts:current", $index);
    },
    remove($index) {
      this.$dispatch("remove:posts", $index);
    },
    resetSearchText() {
      this.search = "";
    }
  }
};
