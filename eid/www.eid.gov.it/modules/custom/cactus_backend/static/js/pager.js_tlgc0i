/**
 * @file
 * Cactus Backend behaviors.
 */
(function (Drupal) {
  "use strict";

  const initMarker = Symbol("pagerInitialized");
  const urlParams = new URLSearchParams(window.location.search);
  const isPaginatorRedirect = urlParams.get('page') !== null;

  const isBreakpointMob = window.innerWidth < 768;
  const isBreakpointTab = window.innerWidth >= 768 && window.innerWidth <= 991;
  const stickyHeaderDskHeight = 72;
  const stickyHeaderMobHeight = 64;
  const stickyHeaderHeight = isBreakpointMob || isBreakpointTab ? stickyHeaderMobHeight : stickyHeaderDskHeight;
  
  Drupal.behaviors.cactusBackendPager = {
    attach(context, settings) {
      const $targets = document.querySelectorAll(".pager");
      if ($targets.length) {
        if (new URLSearchParams(location.search).get("page")) {
          history.replaceState(
            {},
            "cleanPage",
            `${location.origin}${location.pathname}`,
          );
        }


        $targets.forEach(($target, index) => {
          const $inputWrapper = $target.querySelector('.navigate-page');
          if($inputWrapper) {
            const $input = $inputWrapper.querySelector('input.navigate-page-field');
            const maxPage = parseInt($inputWrapper.getAttribute('data-total-pages'));
  
            if (!$inputWrapper[initMarker]) {
              $inputWrapper[initMarker] = true;
              $input.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter") {
                  const inputValue = $input.value - 1;
                  const isInputValid = !isNaN(inputValue) && inputValue >= 0 && inputValue < maxPage;
                  if (isInputValid) {
                    $target.classList.remove('input-error');
  
                    const params = new URLSearchParams({ page: inputValue.toString() });
                    location.href = `${location.origin}${location.pathname}?${params}`;
                  } else {
                    $target.classList.add('input-error');
                  }
                }
              });
            }
  
            if(index === 0) {
              if(isPaginatorRedirect) {
                const $parentComponent = $inputWrapper.closest('.component');
                const bodyOffsetHeight = document.body.getBoundingClientRect().top;
                const $scrollTarget = $parentComponent || $inputWrapper;
                const scrollTargetHeight = $scrollTarget.getBoundingClientRect().top;

                window.scrollTo({ top: (scrollTargetHeight - bodyOffsetHeight - stickyHeaderHeight), behavior: "smooth" });
              }
            }
          }
        });
      }
    },
  };
})(Drupal);
