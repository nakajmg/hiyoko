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
    <div class="m-list-heading">
      <a href="#"
        v-for="post in posts | esa-filter search in 'name' 'full_name' 'body_md'"
        class="m-list-heading__item" :class="{'state-wip': post.wip, 'state-current': current == post._uid}"
        @dblclick="edit(post)"
        @click="select(post)"
        @keydown.enter="select(post)"
        >
        <div class="m-list-heading__left">
          <div class="m-list-heading__icon">
            <img :src="post.created_by ? post.created_by.icon : null">
          </div>
        </div>
        <div class="m-list-heading__right">
          <div class="m-list-heading__category">
            {{post.category}}
          </div>
          <div class="m-list-heading__mid">
            <span class="m-list-heading__name" @click="select(post)">{{post.name}}</span>
            <span class="m-list-heading__tag" v-for="tag in post.tags">#{{tag}}</span>
            <span class="m-list-heading__edit" @click="edit(post)"><i class="fa fa-pencil"></i></span>
          </div>
          <div class="m-list-heading__feedback">
            <span class="m-list-heading__star" :class="{'state-active': post.stargazers_count}">
              <i class="fa fa-star"></i>
              {{post.stargazers_count}}
            </span>
            <span class="m-list-heading__watch" :class="{'state-active': post.watchers_count}">
              <i class="fa fa-eye"></i>{{post.watchers_count}}
            </span>
            <span class="m-list-heading__comments" :class="{'state-active': post.comments_count}">
              <i class="fa fa-comments"></i>{{post.comments_count}}
            </span>
            <span class="m-list-heading__date">
              <div>
                <span class="m-list-heading__date-label">Updated </span><i class="fa fa-clock-o"></i>{{date(post.updated_at)}}
              </div><br>
              <div>
                <span class="m-list-heading__date-label">Modified </span><i class="fa fa-clock-o"></i>{{date(post._modified_at)}}
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
    }
  }
};
