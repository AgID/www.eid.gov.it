/**
 * @file
 * Cactus theme behaviors.
 */
(function (Drupal) {
  "use strict";

  Drupal.behaviors.cactusThemeViewsFiltersEnhancement = {
    attach(context, settings) {
      const $listEntities = document.querySelectorAll(".list-entities");

      $listEntities.forEach(($list, indexList) => {
        const $drupalFilters = $list.querySelector(".view-filters");
        const $attachments = $list.querySelectorAll(".attachment");
        let values = {};
        let initialValues = {};
        let filtersAsTab = $list.querySelector('.filters-as-tab') && $list.querySelector('.filters-as-tab').innerText && $list.querySelector('.filters-as-tab').innerText.trim() ? $list.querySelector('.filters-as-tab').innerText.trim().split(',') : [];

        if ($drupalFilters) {

          const notSelectors = filtersAsTab.map(item => `:not(.js-form-item-${item})`).join('');
          const selectors = filtersAsTab.map(item => `.js-form-item-${item}`).join(',');

          const selectorsAsTab = selectors ?  $drupalFilters.querySelectorAll(
            `${selectors}`,
          ) : null;

          const inputs = $drupalFilters.querySelectorAll(
            `.js-form-type-textfield:not(.form-item-datepicker-min):not(.form-item-datepicker-max)`,
          );
          const singleSelects = $drupalFilters.querySelectorAll(
            `.js-form-type-select:not(.form-item-multi-select)${notSelectors}`
          );

          const multiSelects = $drupalFilters.querySelectorAll(
            `.form-item-multi-select${notSelectors}`,
          );
          const datePickers = $drupalFilters.querySelectorAll(
            "[data-drupal-selector=edit-datepicker-wrapper]",
          );
          const $filtersTemplate = $list.querySelector(".filters.template");
          const $buttons = $filtersTemplate.querySelector(
            ".buttons.filters-all",
          );
          const $cloneButtons = $buttons.cloneNode(true);
          const $applyBtn = $cloneButtons.querySelector(".apply-filters");
          const $resetBtn = $cloneButtons.querySelector(".reset-filters");
          const $resultsNumber = $list.querySelector(".number-result");

          if (!$applyBtn || !$resetBtn || !$resultsNumber) {
            return;
          }

          $resetBtn.setAttribute("disabled", "");
          $applyBtn.setAttribute("disabled", "");
          const $resultValue = $resultsNumber.querySelector(".value");
          const $noResultsNumber = $list.querySelector(".no-result");
          const $drupalHeader = $list.querySelector(".view-header");

          if ($buttons) {
            $buttons.remove();
          }

          function bindAll(reset = false) {
            inputs.forEach((input, index) => {
              values[`input-${index}`] = input.querySelector("input").value;
              initialValues[`input-${index}`] = input.querySelector("input").value;

              bindInput(
                index,
                input.querySelector("input"),
                input.querySelector("label"),
                reset,
              );
            });

            multiSelects.forEach((select, index) => {
              const selectEl = select.querySelector("select");
              const label = select.querySelector("label");
              const placeholder = select.querySelector(".description");
              const $itemsToShow = $list.querySelector(".tags-to-show");

              let selectedOpts = [];

              selectEl.querySelectorAll('option').forEach(op => {
                if(op.selected){
                  selectedOpts.push(op.value);
                }
              });

              selectedOpts = selectedOpts.join(',');

              values[`multi-${index}`] = selectedOpts;
              initialValues[`multi-${index}`] = selectedOpts;

              if ($itemsToShow) {
                bindMultiSelect(index, selectEl, label, placeholder, reset);
              }
            });

            singleSelects.forEach((select, index) => {
              const selectEl = select.querySelector("select");
              values[`single-${index}`] = selectEl.value && selectEl.value !== 'placeholder' && selectEl.value !== 'All' ? selectEl.value : '';
              initialValues[`single-${index}`] = selectEl.value && selectEl.value !== 'placeholder' && selectEl.value !== 'All' ? selectEl.value : '';

              const title = select.querySelector("label");
              const placeholder = select.querySelector(".description");
              const recipientType = select.classList.contains(
                "js-form-item-field-recipients-target-id",
              );
              const $recipientsToShow = $list.querySelector(
                ".recipients-to-show",
              );
              const $subtypeToShow = $list.querySelector(".subtype-to-show");
              if (recipientType && $recipientsToShow) {
                bindSingleSelect(
                  index,
                  selectEl,
                  title,
                  placeholder,
                  reset,
                  recipientType,
                );
              } else {
                if ($subtypeToShow && !recipientType) {
                  bindSingleSelect(
                    index,
                    selectEl,
                    title,
                    placeholder,
                    reset,
                    recipientType,
                  );
                }
              }
            });

            datePickers.forEach((datePicker, index) => {
              bindDatePicker(index, datePicker, reset);
            });

            $filtersTemplate.appendChild($cloneButtons);

            if(selectorsAsTab){
              selectorsAsTab.forEach(selector => {
                bindTabs(selector);
              })
            }
          }

          $applyBtn.addEventListener("click", () => {
            bindApply($applyBtn);
          });

          $resetBtn.addEventListener("click", () => {
            bindReset($resetBtn);
          });

          function bindMultiSelect(
            index,
            select,
            label,
            placeholder,
            valueInit = false,
          ) {
            if (valueInit) {
              select.value = "";
            }
            const $itemsToShow = $list.querySelector(".tags-to-show");
            if ($itemsToShow) {
              const options = select.querySelectorAll("option");
              const values = $itemsToShow.innerHTML.trim().split(",");
              options.forEach((option) => {
                if (!values.includes(option.value)) {
                  option.remove();
                }
              });
            }
            const $cloneMulti = select.cloneNode(true);
            const $cloneLabel = label.cloneNode(true);
            $cloneMulti.setAttribute("data-select-search", "");
            $cloneLabel.classList.add("d-none");
            const $selectTemplate = $filtersTemplate.querySelector(
              ".multi-select",
            );
            const applyText = $selectTemplate.getAttribute('data-apply');
            const removeText = $selectTemplate.getAttribute('data-remove');
            const noMatchesText = $selectTemplate.getAttribute('data-no-matches');
            const $cloneSelectTemplate = $selectTemplate.cloneNode(true);
            $cloneSelectTemplate.setAttribute("data-id", `m-select-${index}`);

            if ($filtersTemplate.querySelector(`[data-id=m-select-${index}]`)) {
              const $selectPast = $filtersTemplate.querySelector(
                `[data-id=m-select-${index}]`,
              );
              $selectPast.remove();
              $cloneSelectTemplate.innerHTML = "";
            }

            $cloneSelectTemplate.classList.remove("d-none");
            $cloneSelectTemplate.appendChild($cloneMulti);
            $filtersTemplate.appendChild($cloneSelectTemplate);

            cactusRetrieve("_multiCustomSelect")($cloneMulti, index, {
              title: $cloneLabel.innerText,
              placeholder: placeholder.innerHTML,
              removeText: removeText ? removeText : '',
              applyText: applyText ? applyText : '',
              noMatches: noMatchesText ? noMatchesText : '',
              isMulti: true,
            });

            $cloneMulti.addEventListener("change", () => {
              const $currentOptions = $cloneMulti.querySelectorAll("option");
              const drupalOptions = select.querySelectorAll("option");

              let selectedOpts = [];

              $currentOptions.forEach(op => {
                if(op.selected){
                  selectedOpts.push(op.value);
                }
              });

              selectedOpts = selectedOpts.join(',');

              values[`multi-${index}`] = selectedOpts;

              if((Object.values(values).find(v => !!v) && objectCompare(values, initialValues))  || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }

              drupalOptions.forEach((option, index) => {
                option.selected = $currentOptions[index].selected;
              });
            });
          }

          function bindSingleSelect(
            index,
            select,
            title,
            placeholder,
            valueInit = false,
            recipientType,
          ) {
            const $selectTemplate =
              $filtersTemplate.querySelector(".single-select");
            const $selectClone = $selectTemplate.cloneNode(true);

            if (recipientType) {
              const $recipientsToShow = $list.querySelector(
                ".recipients-to-show",
              );
              if ($recipientsToShow) {
                const options = select.querySelectorAll("option");
                const values = $recipientsToShow.innerHTML.trim().split(",");
                options.forEach((option) => {
                  if (
                    !values.includes(option.value) &&
                    option.value !== "All" &&
                    option.value !== "placeholder"
                  ) {
                    option.remove();
                  }
                });
              }
            } else {
              const $subtypeToShow = $list.querySelector(".subtype-to-show");
              if ($subtypeToShow) {
                const options = select.querySelectorAll("option");
                const values = $subtypeToShow.innerHTML.trim().split(",");
                options.forEach((option) => {
                  if (
                    !values.includes(option.value) &&
                    option.value !== "All" &&
                    option.value !== "placeholder"
                  ) {
                    option.remove();
                  }
                });
              }
            }

            if ($filtersTemplate.querySelector(`[data-id=s-select-${index}]`)) {
              const $selectPast = $filtersTemplate.querySelector(
                `[data-id=s-select-${index}]`,
              );
              $selectPast.remove();
            }

            $selectClone.setAttribute("data-id", `s-select-${index}`);
            $selectClone.classList.remove("d-none");

            const $select = $selectClone.querySelector("select");
            const $label = $selectClone.querySelector("label");
            $select.setAttribute("id", `index-${index}`);
            $label.setAttribute("for", `index-${index}`);
            const drupalOptions = select.querySelectorAll("option");
            let firstValue = false;

            const noSelection = document.createElement("option");
            noSelection.value = "All";
            noSelection.innerText = Drupal.t("Nessuna selezione");

            drupalOptions.forEach((drupalOption) => {
              const cloneOption = drupalOption.cloneNode(true);
              if (cloneOption.value === "All") {
                cloneOption.value = "placeholder";
                cloneOption.innerHTML = placeholder.innerHTML;

                $select.prepend(noSelection);
              } else {
                if (!firstValue) {
                  cloneOption.setAttribute("data-first", "");
                }
                firstValue = true;
              }
              $select.appendChild(cloneOption);
            });

            if (valueInit) {
              select.value = "All";
            }

            $select.value =
              select.value === "All" ? "placeholder" : select.value;

            cactusRetrieve("_multiCustomSelect")($select, index, {
              title: title.innerText,
              isMulti: false,
            });

            $select.addEventListener("change", () => {
              select.value = $select.value;

              values[`single-${index}`] = $select.value && $select.value !== 'placeholder' ? $select.value : '';

              if((Object.values(values).find(v => !!v) && objectCompare(values, initialValues)) || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }

            });

            $filtersTemplate.appendChild($selectClone);
          }

          function bindInput(index, input, label, valueInit = false) {
            const $inputTemplate = $filtersTemplate.querySelector(".keyword");
            const $inputClone = $inputTemplate.cloneNode(true);
            const $closeIcn = $inputClone.querySelector(".close-icn");
            if ($filtersTemplate.querySelector(`[data-id=input-${index}]`)) {
              const $inputPast = $filtersTemplate.querySelector(
                `[data-id=input-${index}]`,
              );
              $inputPast.remove();
            }
            const value = valueInit ? "" : input.value;
            $inputClone.classList.remove("d-none");

            if (valueInit) {
              input.value = "";
            }

            const $input = $inputClone.querySelector("input");
            $input.setAttribute('id', `keyword-input-${indexList}`);
            $input.value = value;
            $inputClone.setAttribute("data-id", `input-${index}`);
            const $title = $inputClone.querySelector(".title-input-select");
            $title.innerText = label.innerText;

            if (input.getAttribute("placeholder")) {
              $input.setAttribute(
                "placeholder",
                input.getAttribute("placeholder"),
              );
            }

            $input.addEventListener("input", () => {
              const inputText = $input.value;
              input.value = inputText;

              if (inputText.length) {
                $closeIcn.classList.remove("d-none");
                $closeIcn.setAttribute("tabindex", "0");

                values[`input-${index}`] = inputText;
              } else {
                values[`input-${index}`] = inputText;
                if (!$closeIcn.classList.contains("d-none")) {
                  $closeIcn.classList.add("d-none");
                  $closeIcn.setAttribute("tabindex", "-1");
                }
              }

              if((Object.values(values).find(v => !!v) && objectCompare(values, initialValues)) || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }
            });

            $input.addEventListener('keyup', e => {
              if (e.key === 'Tab' && $input.classList.contains('focus-mouse')) {
                $input.classList.remove('focus-mouse');
              }
            });

            $input.addEventListener('focusout', () => {
              $input.classList.add('focus-mouse');
            });

            $closeIcn.addEventListener("click", () => {
              $input.value = "";
              input.value = "";
              $closeIcn.classList.add("d-none");
              $closeIcn.setAttribute("tabindex", "-1");
              $input.focus();
              activeApplyBtn();
              $input.classList.add('focus-mouse');
              values[`input-${index}`] = '';

              if(Object.values(values).find(v => !!v) || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }
            });

            $closeIcn.addEventListener("keyup", (e) => {
              if (e.key === "Enter") {
                $input.value = "";
                input.value = "";
                $closeIcn.classList.add("d-none");
                $closeIcn.setAttribute("tabindex", "-1");
                $input.focus();
                activeApplyBtn();
                $input.classList.remove('focus-mouse');
                values[`input-${index}`] = '';

                if(Object.values(values).find(v => !!v) || objectCompare(values, initialValues)){
                  activeApplyBtn();
                  activeResetBtn();
                }else{
                  disableApplyBtn();
                  disableResetBtn();
                }
              }
            });

            if (input.value) {
              $closeIcn.classList.remove('d-none');
              $closeIcn.setAttribute('tabindex', '0');
            }

            $filtersTemplate.appendChild($inputClone);
          }

          function bindDatePicker(index, datePicker, valueInit = false) {
            const $templateDatePicker =
              $filtersTemplate.querySelector(".date-picker");
            const $cloneDatePicker = $templateDatePicker.cloneNode(true);
            if (valueInit && datePicker) {
              datePicker.querySelector('input[name="datepicker[min]"]').value =
                "";
              datePicker.querySelector('input[name="datepicker[max]"]').value =
                "";
            }
            const cloneDatePicker = datePicker.cloneNode(true);

            if ($filtersTemplate.querySelector(`[data-id=dp-${index}]`)) {
              const $wrapper = $cloneDatePicker.querySelector(
                ".datepicker-wrapper",
              );
              $wrapper
                .querySelector(".input-start")
                .querySelector('input[name="datepicker[min]"]')
                ?.remove();
              $wrapper
                .querySelector(".input-end")
                .querySelector('input[name="datepicker[max]"]')
                ?.remove();
              $filtersTemplate.querySelector(`[data-id=dp-${index}]`).remove();
            }

            const title = cloneDatePicker.querySelector(".fieldset-legend");
            const $titleTemplate =
              $cloneDatePicker.querySelector(".label-input");
            $titleTemplate.innerText = title.innerText;
            $cloneDatePicker.setAttribute("data-id", `dp-${index}`);
            $cloneDatePicker.classList.remove("d-none");
            const $wrapper = $cloneDatePicker.querySelector(
              ".datepicker-wrapper",
            );
            $cloneDatePicker.setAttribute("id", "datepicker");
            const labelFirst = cloneDatePicker.querySelector(
              ".form-item-datepicker-min label",
            );
            labelFirst.classList.add("d-none");
            const inputFirst = cloneDatePicker.querySelector(
              'input[name="datepicker[min]"]',
            );
            inputFirst.classList.add("focus-mouse");
            const labelLast = cloneDatePicker.querySelector(
              ".form-item-datepicker-max label",
            );
            labelLast.classList.add("d-none");
            const inputLast = cloneDatePicker.querySelector(
              'input[name="datepicker[max]"]',
            );
            inputLast.classList.add("focus-mouse");

            $wrapper.querySelector(".input-end").appendChild(labelLast);
            $wrapper.querySelector(".input-end").appendChild(inputLast);
            $wrapper.querySelector(".input-start").prepend(inputFirst);
            $wrapper.querySelector(".input-start").prepend(labelFirst);

            values[`date-min-${index}`] = inputFirst.value ? inputFirst.value : '';
            initialValues[`date-min-${index}`] = inputFirst.value ? inputFirst.value : '';
            values[`date-max-${index}`] = inputLast.value ? inputLast.value : '';
            initialValues[`date-max-${index}`] = inputLast.value ? inputLast.value : '';

            inputFirst.addEventListener("changeDate", () => {
              const firstDrupal = datePicker.querySelector(
                'input[name="datepicker[min]"]',
              );
              if (inputFirst.value) {
                values[`date-${index}`] = true;
                firstDrupal.value = inputFirst.value + "-01-01";
              } else {
                firstDrupal.value = "";
              }

              values[`date-min-${index}`] = firstDrupal.value;

              if((Object.values(values).find(v => !!v) && objectCompare(values, initialValues)) || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }
            });

            inputLast.addEventListener("changeDate", () => {
              const lastDrupal = datePicker.querySelector(
                'input[name="datepicker[max]"]',
              );
              if (inputLast.value) {
                lastDrupal.value = inputLast.value + "-12-31";
              } else {
                lastDrupal.value = "";
              }

              values[`date-max-${index}`] = lastDrupal.value;

              if((Object.values(values).find(v => !!v) && objectCompare(values, initialValues)) || objectCompare(values, initialValues)){
                activeApplyBtn();
                activeResetBtn();
              }else{
                disableApplyBtn();
                disableResetBtn();
              }
            });

            inputFirst.addEventListener("keyup", (e) => {
              if (
                e.key === "Tab" &&
                inputFirst.classList.contains("focus-mouse")
              ) {
                inputFirst.classList.remove("focus-mouse");
              }
            });

            inputFirst.addEventListener("focusout", () => {
              inputFirst.classList.add("focus-mouse");
            });

            inputLast.addEventListener("keyup", (e) => {
              if (
                e.key === "Tab" &&
                inputLast.classList.contains("focus-mouse")
              ) {
                inputLast.classList.remove("focus-mouse");
              }
            });

            inputLast.addEventListener("focusout", () => {
              inputLast.classList.add("focus-mouse");
            });

            cactusRetrieve("_datePicker")($cloneDatePicker);
            $filtersTemplate.appendChild($cloneDatePicker);
          }

          function bindTabs(selector){
            const $tabs = $list.querySelector('.tabs-filters');
            const $selectFilter = $list.querySelector('.filters-select select');
            $tabs.classList.remove('d-none');
            $tabs.innerHTML = '';
            const nativeSelect = selector.querySelector('select');
            const options = nativeSelect.querySelectorAll('option');
            const $itemsToShow = $list.querySelector(".subtype-to-show") && $list.querySelector(".subtype-to-show").innerText && $list.querySelector(".subtype-to-show").innerText.trim() ? $list.querySelector(".subtype-to-show").innerText.trim().split(',') : [];
            let found = false;
            let preSelected = false;

            options.forEach((option, index) => {
              if($itemsToShow.includes(option.value)){
                found = true;
                const button = document.createElement('button');
                button.innerText = option.innerText;
                button.setAttribute('data-id', option.value);
                button.setAttribute('id', `tab-${index}`);
                button.setAttribute('aria-controls', `area-${index}`);
                button.setAttribute('aria-selected', 'false');
                button.setAttribute('type', 'button');
                button.setAttribute('role', 'tab');
                button.setAttribute('title', option.innerText);
                if(option.selected || option.checked){
                  preSelected = true;
                  button.classList.add('selected');
                  button.setAttribute('aria-selected', 'true');
                }
                const cloneOption = option.cloneNode(true);
                $selectFilter.appendChild(cloneOption);
                $tabs.appendChild(button);

                button.addEventListener('click', () => {
                  nativeSelect.value = button.getAttribute('data-id');
                  $drupalFilters.querySelector('[id^="edit-submit"]').click();
                });

              }
            })

            if(found){
              const button = document.createElement('button');
              button.innerText = Drupal.t('Tutti');
              button.setAttribute('type', 'button');
              button.setAttribute('data-id', 'All');
              button.setAttribute('role', 'tab');
              button.setAttribute('id', `tab-1`);
              button.setAttribute('aria-controls', `area-1`);

              const AllOption = document.createElement('option');
              button.setAttribute('title', Drupal.t('Tutti'));
              button.setAttribute('aria-selected', 'false');
              AllOption.innerText = Drupal.t('Tutti');
              AllOption.value = 'All';

              if(!preSelected){
                button.setAttribute('aria-selected', 'true');
                button.classList.add('selected');
                AllOption.selected = true;
              }

              $selectFilter.prepend(AllOption);
              $tabs.prepend(button);

              cactusRetrieve("_multiCustomSelect")($selectFilter, 'filters-select', {
                title: '',
                isMulti: false,
              });

              button.addEventListener('click', () => {
                nativeSelect.value = 'All';
                $drupalFilters.querySelector('[id^="edit-submit"]').click();
              });
            }

            $selectFilter.onchange = () => {
              nativeSelect.value = $selectFilter.value;
              $drupalFilters.querySelector('[id^="edit-submit"]')?.click();
            }
          }

          function tags() {
            $attachments.forEach(($attachment) => {
              const $tags = $attachment.querySelectorAll(".tag");
              const $number = $attachment.querySelector(".number-hidden");

              if (!$number) {
                return;
              }

              const $value = $number.querySelector(".number");

              if ($tags.length && $tags.length > 3) {
                const ariaLabel = $number.getAttribute('aria-label');
                if (ariaLabel) {
                  $number.setAttribute('aria-label', ariaLabel.replace('[n]', ($tags.length - 3).toString()));
                }
                $number.classList.remove("d-none");
                if ($value) {
                  $value.innerHTML = $tags.length - 3;
                }
                $tags.forEach(($tag, index) => {
                  if (index > 2) {
                    $tag.classList.add("d-none");
                  }
                  $number.setAttribute("tabindex", "0");
                });
              } else {
                $number.removeAttribute('aria-label');
                $number.classList.add("d-none");
                $number.setAttribute("tabindex", "-1");
              }

              $tags.forEach(($tag, index) => {
                if (index > 2) {
                  $tag.classList.add("d-none");
                }
              });

              $number.addEventListener("click", () => {
                $tags.forEach(($tag, index) => {
                  $tag.classList.remove("d-none");
                  $number.setAttribute("tabindex", "-1");
                  $number.classList.add("d-none");
                });
              });

              $number.addEventListener("keyup", (e) => {
                if (e.key === "Enter") {
                  $tags.forEach(($tag, index) => {
                    $tag.classList.remove("d-none");
                    $number.setAttribute("tabindex", "-1");
                    $number.classList.add("d-none");
                  });
                }
              });
            });
          }

          function bindApply() {
            const applyBtnDrupal = $drupalFilters.querySelector(
              '[id^="edit-submit"]',
            );
            applyBtnDrupal?.click();
            const currentInput = $drupalFilters.querySelector('.js-form-type-textfield:not(.form-item-datepicker-min):not(.form-item-datepicker-max) input');
            const inputs = $list.querySelectorAll('.js-form-type-textfield:not(.form-item-datepicker-min):not(.form-item-datepicker-max) input');

            const currentSingleS = $drupalFilters.querySelector(".js-form-type-select:not(.form-item-multi-select) select");
            const selects = $list.querySelectorAll(".js-form-type-select:not(.form-item-multi-select) select");

            const currentMultiS = $drupalFilters.querySelector(".form-item-multi-select select");
            const multiSelects = $list.querySelectorAll(".form-item-multi-select select");

            const currentPicker = $drupalFilters.querySelector("[data-drupal-selector=edit-datepicker-wrapper]");
            const pickers = $list.querySelectorAll("[data-drupal-selector=edit-datepicker-wrapper]");

            inputs.forEach(input => {
              input.value = currentInput.value;
            });

            selects.forEach(select => {
              select.value = currentSingleS.value;
            });

            multiSelects.forEach(multiSelect => {
              const options = multiSelect.querySelectorAll('option');
              const currentOptions = currentMultiS.querySelectorAll('option');
              currentOptions.forEach((cOpt, index) => {
                options[index].selected = cOpt.selected;
              });
            });

            pickers.forEach(picker => {
              const currentInitInput = currentPicker.querySelector(".form-item-datepicker-min input");
              const currentEndInput = currentPicker.querySelector(".form-item-datepicker-max input");

              const pickerInitInput = picker.querySelector(".form-item-datepicker-min input");
              const pickerEndInput = picker.querySelector(".form-item-datepicker-max input");

              pickerInitInput.value = currentInitInput.value;
              pickerEndInput.value = currentEndInput.value;
            })

            const allBtns  = document.querySelectorAll('[id^="edit-submit"]');

            allBtns.forEach(btn => {
              if(btn !== applyBtnDrupal){
                btn.click();
              }
            })

          }

          function bindReset() {
            const resetBtnDrupal =
              $drupalFilters.querySelector('[id^="edit-reset"]');
            if (resetBtnDrupal) {
              location.reload();
              bindCloseMobile();
            } else {
              bindAll(true);
              activeResetBtn();
              disableApplyBtn();
              $resetBtn.setAttribute("disabled", "");
            }
          }

          function showResultsNumber() {
            if(Object.values(values).find(v => !!v)){
              if ($drupalHeader) {
                if (
                  Number($drupalHeader.innerHTML) &&
                  Number($drupalHeader.innerHTML.trim()) > 0
                ) {
                  $noResultsNumber.classList.add("d-none");
                  $resultsNumber.classList.remove("d-none");
                  $resultValue.innerHTML = $drupalHeader.innerHTML;
                  if(Number($drupalHeader.innerHTML.trim()) === 1){
                    $resultsNumber.querySelector('.results-label.single').classList.remove('d-none');
                    $resultsNumber.querySelector('.results-label.multi').classList.add('d-none');
                  }else{
                    $resultsNumber.querySelector('.results-label.single').classList.add('d-none');
                    $resultsNumber.querySelector('.results-label.multi').classList.remove('d-none');
                  }

                } else {
                  $noResultsNumber.classList.remove("d-none");
                  $resultsNumber.classList.add("d-none");
                }
              }
            } else {
              $resultsNumber.classList.add("d-none");
              $noResultsNumber.classList.add("d-none");
            }
          }

          function activeResetBtn() {
            if(Object.values(values).find(v => !!v) || objectCompare(values, initialValues)){
              $resetBtn.removeAttribute("disabled");
            }
          }

          function disableResetBtn() {
            if(!Object.values(values).find(v => !!v)){
              $resetBtn.setAttribute("disabled", "");
            }
          }

          function activeApplyBtn(){
            $applyBtn.removeAttribute("disabled");
          }

          function disableApplyBtn(){
            $applyBtn.setAttribute("disabled", "");
          }

          function bindCloseMobile() {
            if (window.innerWidth < 992) {
              const $filterMobile = document.querySelector(".filters.template");
              $filterMobile.classList.remove("open");
              $filterMobile.classList.add("closed");
              document.body.classList.remove("has-mask");
            }
          }

          function bindNumberOfFiltersApplied(){
            const $filtersApplied = $list.querySelector('.filters-applied-value');
            let count = 0;

            inputs.forEach(input => {
              if(input.querySelector("input").value){
                count++;
              }
            });

            singleSelects.forEach(singleSelect => {
              if(singleSelect.querySelector("select").value && singleSelect.querySelector("select").value !== 'All'){
                count++;
              }
            });

            multiSelects.forEach(multiSelect=> {
              if(multiSelect.querySelector("select").value){
                count++;
              }
            });

            datePickers.forEach(datePicker => {
              const input = datePicker.querySelector('input[name="datepicker[min]"]');
              if(input.value){
                count++;
              }
            });

            if(count){
              $filtersApplied.classList.remove('d-none');
              $filtersApplied.innerHTML = `(${count})`;
            }else{
              $filtersApplied.classList.add('d-none');
            }
          }

          function objectCompare(first, second) {
            let diffKeys = [];
            for (const key in first) {
              if (!(key in second) ||
                first[key] !== second[key]) {
                diffKeys.push(key);
              }
            }
            for (const key in second) {
              if (!(key in first) ||
                first[key] !== second[key]) {
                if (!diffKeys.includes(key)) {
                  diffKeys.push(key);
                }
              }
            }

            return diffKeys.length;
          }

          function init() {
            tags();
            bindAll(false);
            showResultsNumber();
            activeResetBtn();
            bindCloseMobile();
            bindNumberOfFiltersApplied();
          }

          init();
        }
      });
    },
  };
})(Drupal);
