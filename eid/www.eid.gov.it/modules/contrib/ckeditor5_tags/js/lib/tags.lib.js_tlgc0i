(function () {
  //Expose dynamic tags to window object for global consumption
  window.dynamicTags = (() => {

    /**
     * Processes all DOM elements with the "dynamic-tag" attribute and organizes them into a handled collection.
     * Each tag element is enhanced with methods to replace its content, toggle waiting state or remove waiting state and current state
     * @returns {Object} A collection of tag objects, keyed by their "dynamic-tag" attribute values.
     */
    function process() {
      return [].slice
        .call(document.querySelectorAll("[dynamic-tag]"))
        .reduce((items, $tag) => {
          if ($tag.children.length) {
            items[$tag.getAttribute("dynamic-tag")] = {
              $elem: $tag,
              $target: $tag.querySelector(".tag-label"),
              replace,
              wait,
              stop,
              isWaiting: false,
              isReplaced: false,
            };
          }
          return items;
        }, {});
    }

    /**
     * Replaces the content of the tag's target element and updates the tag's state to reflect the change.
     * @param {string} value - The new content to be displayed in the tag's target element.
     */
    function replace(value) {
      this.$target.innerHTML = value;
      this.isReplaced = true;
      wait.apply(this, [false]);
    }

    /**
     * Toggles the waiting state of the tag's element activating or deactivating a visual indication (e.g., spinner).
     * The spinner style can be modified through CSS.
     * @param {boolean} [activate=true] - Flag to activate or deactivate the waiting state.
     */
    function wait(activate = true) {
      this.$elem.classList.toggle("has-spinner", activate);
      this.isWaiting = activate;
    }

    function stop() {
      wait.apply(this, [false]);
    }

    /**
     * Substitute the tags object with a lazy processed object
     */
    return {
      get tags() {
        delete this.tags;
        this.tags = process();
        return this.tags;
      },
    };
  })();
})();
