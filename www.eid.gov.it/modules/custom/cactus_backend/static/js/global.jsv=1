/*
* WARNING:
* Be aware that this file will be run everywhere as long as the user is logged in and the view is in EDITOR mode.
* */
(function () {

  function init() {
    applyRouteLogic();
  }

  function applyRouteLogic() {
    const pathname = location.pathname;

    if (pathname.match(/^\/core\/install.php$/gi)) {
      installHook();
    }

    commonHook();
  }

  function installHook() {
    injectAction();

    function injectAction() {
      const $submit = document.querySelector('#edit-submit');
      const $injected_button = $submit.cloneNode(true);
      $injected_button.classList.remove('button--primary');
      $injected_button.classList.add('button--secondary');
      $injected_button.setAttribute('id', '#edit-submit-default');
      $injected_button.value = "Use default settings";

      $injected_button.addEventListener('click', (e) => {
        e.preventDefault();
        fillForm();
      });

      $submit.parentElement.append($injected_button);
    }

    function fillForm() {
      const $site_name = document.querySelector('#edit-site-name');
      const $site_email_address = document.querySelector('#edit-site-mail');
      const $username = document.querySelector('#edit-account-name');
      const $pwd = document.querySelector('#edit-account-pass-pass1');
      const $pwd_confirm = document.querySelector('#edit-account-pass-pass2');
      const $email_address = document.querySelector('#edit-account-mail');
      const $updates = document.querySelector('#edit-enable-update-status-module');

      let install_id = location.href.match(/https?\:\/\/([^\h.]+)/);
      install_id = install_id && install_id[1] || 'cactus';

      $site_name.value = install_id.charAt(0).toUpperCase() + install_id.slice(1);
      $site_email_address.value = `${install_id}@local.com`;
      $username.value = 'admin';
      $pwd.value = 'admin';
      $pwd_confirm.value = 'admin';
      $email_address.value = $site_email_address.value;
      $updates.click();
    }
  }

  function commonHook() {
    const $meta = document.querySelector("meta[name='cactus']");
    if($meta) {
      const raw = $meta.getAttribute("content").split(";");
      const meta = raw.reduce((entries, entry) => {
        const [key, value] = entry.split("=");
        if(key && value) {
          entries[key] = value;
        }
        return entries;
      }, {});

      version(meta.project, meta.version);
    }
  }

  function version(project, version) {
    const color = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black';
    console.log(
      `%c${project} ☄️ %cv${version} 🌵`,
      `
        color: #199000;
        font-family: sans-serif;
        font-size: 1rem;
        padding-bottom: .5rem;
        border-bottom: 1px solid #199000;
    `,
      `
        color: ${color};
        font-family: sans-serif;
        font-size: 1rem;
        padding-bottom: .5rem;
        border-bottom: 1px solid #ccc;
        font-weight: bold;
    `
    );
  }

  window.addEventListener('DOMContentLoaded', () => {
    init();
  });

})();
