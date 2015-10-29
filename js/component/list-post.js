var moment = require("moment-timezone");
var _ = require("lodash");
module.exports = {
  watch: {
    "state.heading"() {
      if (this.state.heading) {
        this.state.posts = false;
      }
    },
    "state.posts"() {
      if (this.state.posts) {
        this.state.heading = false;
      }
    }
  },
  props: ["posts", "state", "current", "search"],
  template: `
    <div class="m-list-post">
      <a href="#"
        v-for="post in posts | esa-filter search in 'name' 'full_name' 'body_md'"
        class="m-list-post__item" :class="{'state-wip': post.wip, 'state-current': current == post._uid}"
        @dblclick="edit(post)"
        @click="select(post)"
        @keydown.enter="select(post)"
        >
        <!--<div class="m-list-post__left">-->
          <!--<div class="m-list-post__icon">-->
            <!--<img :src="post.created_by ? post.created_by.icon : null">-->
          <!--</div>-->
        <!--</div>-->
        <div class="m-list-post__right">
          <div class="m-list-post__category">
            <span @click="searchByCategory(post.category)">{{post.category}}</span>
          </div>
          <div class="m-list-post__mid">
            <span class="m-list-post__name" @click="select(post)">{{post.name}}</span>
            <span class="m-list-post__tag" v-for="tag in post.tags" @click="searchByTag(tag)">#{{tag}}</span>
            <span class="m-list-post__edit" @click="edit(post)"><i class="fa fa-pencil"></i></span>
          </div>
          <div class="m-list-post__feedback">
            <span class="m-list-post__star" :class="{'state-active': post.stargazers_count}">
              <i class="fa fa-star"></i>
              {{post.stargazers_count}}
            </span>
            <span class="m-list-post__watch" :class="{'state-active': post.watchers_count}">
              <i class="fa fa-eye"></i>{{post.watchers_count}}
            </span>
            <span class="m-list-post__comments" :class="{'state-active': post.comments_count}">
              <i class="fa fa-comments"></i>{{post.comments_count}}
            </span>
            <span class="m-list-post__date">
              <div>
                <span class="m-list-post__date-label">Updated </span><i class="fa fa-clock-o"></i>{{date(post.updated_at)}}
              </div><br>
              <div>
                <span class="m-list-post__date-label">Modified </span><i class="fa fa-clock-o"></i>{{date(post._modified_at)}}
              </div>
            </span>
          </div>
        </div>
      </a>
    </div>
  `,

  methods: {
    edit(post) {
      this.$dispatch("open:editor", post);
    },
    date(time) {
      if (time) {
        return moment(time).tz("Asia/Tokyo").format("YYYY/MM/DD HH:mm:ss");
      }
      else {
        return "none";
      }
    },
    select(post) {
      this.$dispatch("change:posts:current", post);
    },
    searchByTag(tag) {
      event.stopPropagation();
      this.$dispatch("set:keyword", "tag:" + tag);
    },
    searchByCategory(category) {
      event.stopPropagation();
      this.$dispatch("set:keyword", "category:" + category);
    }
  }
};
