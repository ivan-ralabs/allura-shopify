document.addEventListener('DOMContentLoaded', () => {
  // Grab elements
  const form         = document.querySelector('.shipping-details form[id^="address_form_"]');
  const addressInput = form.querySelector('input[name="address[address1]"]');
  const zipInput     = form.querySelector('input[name="address[zip]"]');
  const stateSelect  = form.querySelector('select[name="address[province]"]');

  const addressErr   = form.querySelector('#address1-error');
  const zipErr       = form.querySelector('#zip-error');
  const stateErr     = form.querySelector('#province-error');

  if (!addressInput || !zipInput || !stateSelect || !form) return;

  let addressOK = false;
  let zipOK     = false;
  let stateOK   = false;
  let expectedState = null;

  // Initialize both Autocomplete widgets once Google is ready
  (function waitForGMaps() {
    if (
      window.google &&
      google.maps &&
      google.maps.places &&
      typeof google.maps.places.Autocomplete === 'function'
    ) {
      initAddressAutocomplete();
      initZipAutocomplete();
    } else {
      setTimeout(waitForGMaps, 200);
    }
  })();

  // --- Address Autocomplete (as before) ---
  function initAddressAutocomplete() {
    const ac = new google.maps.places.Autocomplete(addressInput, {
      componentRestrictions: { country: 'US' },
      fields:               ['address_components'],
      types:                ['address']
    });

    ac.addListener('place_changed', () => {
      addressOK = true;
      addressErr.style.display = 'none';

      const comps = {};
      for (const c of ac.getPlace().address_components) {
        comps[c.types[0]] = c.long_name;
      }

      // Autofill ZIP
      if (comps.postal_code) {
        zipInput.value = comps.postal_code;
        zipOK = true;
        zipErr.style.display = 'none';
      }

      // Autofill STATE
      if (comps.administrative_area_level_1) {
        expectedState = comps.administrative_area_level_1;
        if ([...stateSelect.options].some(o => o.value === expectedState)) {
          stateSelect.value = expectedState;
          stateOK = true;
          stateErr.style.display = 'none';
        } else {
          stateOK = false;
        }
      }
    });
  }

  // --- ZIP Autocomplete & Validation ---
  function initZipAutocomplete() {
    const zipAc = new google.maps.places.Autocomplete(zipInput, {
      componentRestrictions: { country: 'US' },
      fields:               ['address_components'],
      types:                ['postal_code']
    });

    zipAc.addListener('place_changed', () => {
      zipOK = true;
      zipErr.style.display = 'none';

      const comps = {};
      for (const c of zipAc.getPlace().address_components) {
        comps[c.types[0]] = c.long_name;
      }

      // Ensure the ZIP field has the canonical postal_code
      if (comps.postal_code) {
        zipInput.value = comps.postal_code;
      }

      // Auto-adjust STATE based on the postal code
      if (comps.administrative_area_level_1) {
        expectedState = comps.administrative_area_level_1;
        if ([...stateSelect.options].some(o => o.value === expectedState)) {
          stateSelect.value = expectedState;
          stateOK = true;
          stateErr.style.display = 'none';
        } else {
          stateOK = false;
        }
      }
    });
  }

  // --- Clear flags on manual edit ---
  addressInput.addEventListener('input', () => {
    addressOK = false;
    addressErr.style.display = 'none';
  });
  zipInput.addEventListener('input', () => {
    zipOK = false;
    zipErr.style.display = 'none';
  });
  stateSelect.addEventListener('change', () => {
    stateOK = stateSelect.value === expectedState;
    stateErr.style.display = 'none';
  });

  // --- Blur validations ---
  addressInput.addEventListener('blur', () => {
    if (!addressOK) {
      addressErr.textContent = 'Please select your address from the suggestions.';
      addressErr.style.display = 'block';
    }
  });
  zipInput.addEventListener('blur', () => {
    if (!zipOK) {
      zipErr.textContent = 'Please select a valid ZIP code from the suggestions.';
      zipErr.style.display = 'block';
    }
  });
  stateSelect.addEventListener('blur', () => {
    if (!stateOK) {
      stateErr.textContent = 'Please select the correct state for your ZIP code.';
      stateErr.style.display = 'block';
    }
  });

  // --- Final check on submit ---
  form.addEventListener('submit', (e) => {
    if (!addressOK) {
      e.preventDefault();
      addressErr.textContent = 'Please select your address from the suggestions.';
      addressErr.style.display = 'block';
      addressInput.focus();
      return;
    }
    if (!zipOK) {
      e.preventDefault();
      zipErr.textContent = 'Please select a valid ZIP code from the suggestions.';
      zipErr.style.display = 'block';
      zipInput.focus();
      return;
    }
    if (!stateOK) {
      e.preventDefault();
      stateErr.textContent = 'Please select the correct state for your ZIP code.';
      stateErr.style.display = 'block';
      stateSelect.focus();
      return;
    }
  });
});
