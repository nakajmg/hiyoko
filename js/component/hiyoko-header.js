module.exports = {
  props: ["search"],
  template: `
    <div class="m-headerMenu">
      <div class="m-searchBox">
        <i class="fa fa-search" id="search_icon"></i>
        <i class="fa fa-times-circle" @click="resetSearch" v-show="search"></i>
        <input type="text" v-model="search" placeholder="foo category:bar/baz tag:foo #bar">
      </div>
    </div>
  `,
  methods: {
    resetSearch() {
      this.search = "";
    }
  }
};
