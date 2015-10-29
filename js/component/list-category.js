var _ = require("lodash");
var Vue = require("vue");
Vue.component("p-child", {
  props:["children", "search"],
  template: `
    <ul>
      <li
        v-for="child in children"
        @click="select(child)"
        :hiyoko-depth="child.depth"
        :class="{'state-current': isCurrent(child)}"
        >
        <a class="m-categoryList__name">{{$key}}</a>
        <p-child :children="child.children" :search="search"></p-child>
      </li>
    </ul>
  `,
  methods: {
    hasChild(category) {
      return (_.keys(category.children).length !== 0);
    },
    select(self) {
      event.stopPropagation();
      var path = this.getPath(self);
      this.$dispatch("set:keyword", "category:" + path);
    },
    getPath(self) {
      if (!self.path) {
        return self.origin.split("/").splice(0, self.depth + 1).join("/");
      }
      else {
        return self.path;
      }
    },
    isCurrent(child) {
      if (!this.search) return false;
      var path = this.getPath(child);
      var cat = this.search.split(":");
      if (cat[1] && cat[1] === path) {
        return true;
      }
      else {
        return false;
      }
    }
  }
});

module.exports = {
  props: ["categories", "search", "state"],
  template: `
    <div class="m-categoryList" v-show="state.category" transition="m-categoryList">
      <ul class="m-categoryList__list" v-el:list>
        <li class="m-categoryList__item"
          v-for="category in categories"
          @click="select($key)"
          :hiyoko-depth="category.depth"
          :search="search"
          :class="{'state-current': isCurrent(category)}"
          >
          <a class="m-categoryList__name">{{$key}}</a>
          <p-child :search="search" :children="category.children" v-if="hasChild(category)"></p-child>
        </li>
      </ul>
    </div>
  `,
  methods: {
    select(keyword) {
      this.$dispatch("set:keyword", "category:" + keyword);
    },
    hasChild(category) {
      return (_.keys(category.children).length !== 0);
    },
    getPath(self) {
      if (!self.path) {
        return self.origin.split("/").splice(0, self.depth + 1).join("/");
      }
      else {
        return self.path;
      }
    },
    isCurrent(category) {
      if (!this.search) return false;
      var path = this.getPath(category);
      var cat = this.search.split(":");
      if (cat[1] && cat[1] === path) {
        return true;
      }
      else {
        return false;
      }
    }
  }
};
