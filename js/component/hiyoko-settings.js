module.exports = {
  template: `
    <dialog class="m-env" v-el:env>
      <div class="m-env__inputs">
        <h2>Environment Settings</h2>
        <label class="m-env__item">
          <span class="m-env__label">Screen Name</span><input class="m-env__input">
        </label>
        <label class="m-env__item">
          <span class="m-env__label">Team Name</span><input class="m-env__input">
        </label>
        <label class="m-env__item">
          <span class="m-env__label">Team Url</span><input class="m-env__input">
        </label>
        <label class="m-env__item">
          <span class="m-env__label">Access Token</span><input class="m-env__input">
        </label>
        <span class="m-env__info">アクセストークンは、ユーザの管理画面(https://[team].esa.io/user/tokens)から発行できます。</span>
        <div class="m-env__btns">
          <button class="m-button"><i class="fa fa-check"></i>Activation</button>
          <!--<button class="m-button &#45;&#45;yellow &#45;&#45;status">OK!!</button>-->
        </div>
      </div>
    </dialog>
  `,

  ready() {
    this.$els.env.show();
  }
};
