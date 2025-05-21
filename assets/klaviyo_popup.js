document.addEventListener('DOMContentLoaded', function () {
  const scriptTag = document.getElementById('klaviyo_popup_id');
  let popupData = null;
  let popupId = null;
  let popupDelay = null;

  if (!scriptTag) {
    console.error('Klaviyo popup script tag not found.');
    return;
  } else {
    try {
      popupData = JSON.parse(scriptTag.textContent);
      console.log('popupData', popupData);
      popupId = popupData.klaviyo_popup_id;
      popupDelay = popupData.klaviyo_popup_delay;
    }
    catch (error) {
      console.error('Failed to parse Klaviyo popup JSON:', error);
      return;
    }
  }

  const showForm = (FORM_ID) => {
    window._klOnsite = window._klOnsite || []; 
    window._klOnsite.push(['openForm', FORM_ID]);
  }

  const triggerKlaviyoPopup = (FORM_ID, delay = 0) => {
    if (delay) {
      console.log('delay', delay);
      setTimeout(() => {
        showForm(FORM_ID);
      }, delay);
    } else {
      showForm(FORM_ID);
    }
  }

  const getFormId = (form) => {
    const formId = form.getAttribute('data-testid');
    if (formId) {
        return formId.replace(/klaviyo-form-/, "");
    } else {
      console.error('Form ID not found in the form element.');
      return false;
    }
  }

  document.addEventListener("click", function (e) {
    e.stopPropagation();
    const target = e.target;
    let formId = null;
    if (
      target.closest(".klaviyo-close-form") ||
      target.closest('[aria-label="POPUP Form"]')
    ) {
      if (target.closest(".klaviyo-close-form")) {
        const button = target.closest(".klaviyo-close-form");
        const form = button.parentNode.querySelector("form");
        formId = getFormId(form);
      } else if (target.closest('[aria-label="POPUP Form"]')) {
        const overlay = target.closest('[aria-label="POPUP Form"]');
        const form = overlay.querySelector("form");
        formId = getFormId(form);
      }
      if (formId) {
        sessionStorageWrite(formId);
        console.log("click");
      }
    } else if (target.closest('[data-popup-trigger="' + popupId + '"]')) {
      triggerKlaviyoPopup(popupId);
    }
  });

  const isKlaviyoLocalStorage = (FORM_ID) => {
    if (window.localStorage.getItem('klaviyoOnsite')) {
      const obj = JSON.parse(window.localStorage.getItem('klaviyoOnsite'));
      if (obj.viewedForms && obj.viewedForms.modal && obj.viewedForms.modal.disabledForms) {
        const disabledForms = obj.viewedForms.modal.disabledForms;
        if (disabledForms[FORM_ID]) {
          const successActionTypes = disabledForms[FORM_ID].successActionTypes;
          if (successActionTypes && successActionTypes.length > 0) {
            for (let i = 0; i < successActionTypes.length; i++) {
              if (successActionTypes[i] === 'SUBMIT_TO_LIST_AND_TRANSITION_VIEW') {
                return 'submitted';
              }
            }
          } else {
            return 'closed';
          }
        }
      }
    }
  }

  const sessionStorageWrite = (FORM_ID) => {
    // window.sessionStorage.setItem('klaviyoViewed', FORM_ID);
    const viewed = window.sessionStorage.getItem('klaviyoViewed') || '';
    if (viewed) {
      const viewedArray = viewed.split(',');
      if (!viewedArray.includes(FORM_ID)) {
        viewedArray.push(FORM_ID);
        window.sessionStorage.setItem('klaviyoViewed', viewedArray.join(','));
      }
    } else {
      window.sessionStorage.setItem('klaviyoViewed', FORM_ID);
    }
  }

  const sessionStorageRead = (FORM_ID) => {
    const viewed = window.sessionStorage.getItem('klaviyoViewed');
    if (viewed) {
      const viewedArray = viewed.split(',');
      if (viewedArray.includes(FORM_ID)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  if (popupId) {
    console.log('Triggering Klaviyo Popup:', isKlaviyoLocalStorage(popupId));
    if (isKlaviyoLocalStorage(popupId) === 'closed') {
      if (!sessionStorageRead(popupId)) {
        triggerKlaviyoPopup(popupId, popupDelay);
      }
    }
  }
});