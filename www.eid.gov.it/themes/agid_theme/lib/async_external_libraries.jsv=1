(function () {
  let isLoaded = false;
  let token = Symbol();
  window[token] = [];

  document.addEventListener("cactusBootstrapped", () => {
    isLoaded = true;
    fire();
  });

  function register(callback) {
    if (!isLoaded) {
      window[token].push(callback);
    } else {
      callback();
    }
  }

  function fire() {
    window[token].forEach((callback) => {
      callback();
    });
  }

  window["cactusAsyncLib"] = {
    register,
  };
})();
