document.addEventListener('DOMContentLoaded', () => {
  // Grab elements
  const form = document.querySelector(
    '.shipping-details form[id^="address_form_"]'
  );
  if (!form) return;
  const addressInput = form.querySelector('input[name="address[address1]"]');
  const zipInput = form.querySelector('input[name="address[zip]"]');
  const stateSelect = form.querySelector('select[name="address[province]"]');
  const cityInput = form.querySelector('input[name="address[city]"]');
  const phoneInput = form.querySelector('input[name="address[phone]"]');
  const phoneErr = form.querySelector("#phone-error");

  const addressErr = form.querySelector("#address1-error");
  const zipErr = form.querySelector("#zip-error");
  const stateErr = form.querySelector("#province-error");
  const cityErr = form.querySelector("#city-error");

  if (!addressInput || !zipInput || !stateSelect || !cityInput || !form) return;

  let selectingFromDropdown = false;

  document.addEventListener("mousedown", (e) => {
    if (e.target.closest(".pac-container")) {
      selectingFromDropdown = true;
    }
  });

  document.addEventListener("mouseup", () => {
    selectingFromDropdown = false;
  });

  let addressOK = false;
  let zipOK = false;
  let stateOK = false;
  let cityOK = false;
  let expectedState = null;
  let expectedCity = null;

  const phonePattern = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

  // --- Address Autocomplete (as before) ---
  function initAddressAutocomplete() {
    const ac = new google.maps.places.Autocomplete(addressInput, {
      componentRestrictions: { country: "US" },
      fields: ["address_components"],
      types: ["address"],
    });

    ac.addListener("place_changed", () => {
      addressOK = true;
      addressErr.style.display = "none";

      const comps = {};
      for (const c of ac.getPlace().address_components) {
        comps[c.types[0]] = { long: c.long_name, short: c.short_name };
      }

      // Autofill CITY
      if (comps.locality && comps.administrative_area_level_1) {
        // Build “City, STATE” just like your city widget does
        const cityName = comps.locality.long;
        const stateCode = comps.administrative_area_level_1.long; // “NM”
        const fullCityValue = `${cityName}, ${stateCode}`;

        expectedCity = fullCityValue;
        cityInput.value = fullCityValue;
        cityOK = true;
        cityErr.style.display = "none";
        cityInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Autofill ZIP
      if (comps.postal_code) {
        zipInput.value = comps.postal_code.long;
        zipOK = true;
        zipErr.style.display = "none";
      }

      // Autofill STATE using the code
      if (comps.administrative_area_level_1) {
        expectedState = comps.administrative_area_level_1.long;
        if ([...stateSelect.options].some((o) => o.value === expectedState)) {
          stateSelect.value = expectedState;
          stateOK = true;
          stateErr.style.display = "none";
        } else {
          stateOK = false;
        }
      }

      // Notify your dirty-form logic:
      addressInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // --- ZIP Autocomplete & Validation ---
  function initZipAutocomplete() {
    const zipAc = new google.maps.places.Autocomplete(zipInput, {
      componentRestrictions: { country: "US" },
      fields: ["address_components"],
      types: ["postal_code"],
    });

    zipAc.addListener("place_changed", () => {
      zipOK = true;
      zipErr.style.display = "none";

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
        expectedState = comps.administrative_area_level_1.long;
        if ([...stateSelect.options].some((o) => o.value === expectedState)) {
          stateSelect.value = expectedState;
          stateOK = true;
          stateErr.style.display = "none";
        } else {
          stateOK = false;
        }
      }

      zipInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // Initialize City Autocomplete alongside address & zip
  function initCityAutocomplete() {
    const cityAc = new google.maps.places.Autocomplete(cityInput, {
      componentRestrictions: { country: "US" },
      fields: ["address_components", "formatted_address"],
      types: ["(cities)"],
    });

    cityAc.addListener("place_changed", () => {
      const place = cityAc.getPlace();
      const comps = {};
      for (const c of place.address_components) {
        comps[c.types[0]] = c.long_name;
        comps[c.types[0] + "_short"] = c.short_name;
      }

      // Build exactly what was suggested: CITY + " " + STATE_CODE
      const cityName =
        comps.locality || comps.administrative_area_level_2 || "";
      const stateCode = comps.administrative_area_level_1_long || "";
      const fullCity =
        place.formatted_address.split(",")[0] + // e.g. "Albuquerque"
        ", " +
        (comps.administrative_area_level_1_long || ""); // e.g. "NM"

      // 1) Write it back verbatim
      expectedCity = fullCity;
      cityInput.value = fullCity;
      cityOK = true;
      cityErr.style.display = "none";

      // 2) Fire an input event so your dirty-form logic picks it up
      cityInput.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // Initialize both Autocomplete widgets once Google is ready
  (function waitForGMaps() {
    if (window.google && google.maps && google.maps.places) {
      initAddressAutocomplete();
      initZipAutocomplete();
      initCityAutocomplete();
    } else {
      setTimeout(waitForGMaps, 200);
    }
  })();

  // --- Clear flags on manual edit ---
  addressInput.addEventListener("input", () => {
    addressOK = false;
    addressErr.style.display = "none";
  });
  zipInput.addEventListener("input", () => {
    zipOK = false;
    zipErr.style.display = "none";
  });
  cityInput.addEventListener("input", (e) => {
    // Only clear when the user actually types (trusted event)
    if (!e.isTrusted) return;
    cityOK = false;
    cityErr.style.display = "none";
  });
  cityInput.addEventListener("change", () => {
    cityErr.style.display = "none";
  });
  stateSelect.addEventListener("change", () => {
    const val = stateSelect.value;

    // ① Build in the new order: City, Address1, ZIP
    const fields = [
      { el: cityInput, err: cityErr, name: "city" },
      { el: addressInput, err: addressErr, name: "address1" },
      { el: zipInput, err: zipErr, name: "zip" },
    ];

    // ② Only keep the ones that are non-empty
    const filled = fields.filter((f) => f.el.value.trim() !== "");

    // hide any old state-level error
    stateErr.style.display = "none";

    // 1) If none of those three are filled, any state is OK
    if (filled.length === 0) {
      stateOK = true;
      return;
    }

    // 2) If the picked state matches what Google gave us, clear per-field errors
    if (val === expectedState) {
      stateOK = true;
      filled.forEach((f) => (f.err.style.display = "none"));
      return;
    }

    // 3) Otherwise it’s invalid — don’t clear the inputs,
    //     scroll to the first filled, and show its inline error
    stateOK = false;
    const first = filled[0];

    first.el.scrollIntoView({ behavior: "smooth", block: "center" });
    first.err.textContent = `This ${first.name} doesn’t match the selected state.`;
    first.err.style.display = "block";
  });

  // --- Blur validations ---
  addressInput.addEventListener("blur", () => {
    if (selectingFromDropdown) return;
    if (!addressOK) {
      addressErr.textContent =
        "Please select your address from the suggestions.";
      addressErr.style.display = "block";
    }
  });
  zipInput.addEventListener("blur", () => {
    if (selectingFromDropdown) return;
    if (!zipOK) {
      zipErr.textContent =
        "Please select a valid ZIP code from the suggestions.";
      zipErr.style.display = "block";
    }
  });
  cityInput.addEventListener("blur", () => {
    if (selectingFromDropdown) return;
    if (!cityOK) {
      cityErr.textContent = "Please select a city from the list.";
      cityErr.style.display = "block";
    }
  });
  phoneInput.addEventListener("blur", () => {
    if (phonePattern.test(phoneInput.value.trim())) {
      phoneErr.style.display = "none";
    } else {
      phoneErr.textContent =
        "Please enter a valid US phone (e.g. 123-456-7890).";
      phoneErr.style.display = "block";
    }
  });

  // --- Final check on submit ---
  form.addEventListener("submit", (e) => {
    // collect each field’s state
    const checks = [
      {
        ok: addressOK,
        input: addressInput,
        err: addressErr,
        msg: "Please select your address from the list.",
      },
      {
        ok: zipOK,
        input: zipInput,
        err: zipErr,
        msg: "Please select a valid ZIP code from the list.",
      },
      {
        ok: cityOK,
        input: cityInput,
        err: cityErr,
        msg: "Please select a city from the list.",
      },
      {
        ok: stateOK,
        input: stateSelect,
        err: stateErr,
        msg: "Please select the correct state for your ZIP code.",
      },
      {
        ok: phonePattern.test(phoneInput.value.trim()),
        input: phoneInput,
        err: phoneErr,
        msg: "Please enter a valid phone number (e.g. 123-456-7890).",
      },
    ];

    // reset all errors
    checks.forEach(({ err }) => {
      err.style.display = "none";
    });

    // gather the ones that failed
    const failed = checks.filter((c) => !c.ok);

    if (failed.length) {
      e.preventDefault();
      // show errors for all failed fields
      failed.forEach(({ err, msg }) => {
        err.textContent = msg;
        err.style.display = "block";
      });
      // focus the very first invalid field
      failed[0].input.focus();
    }
  });
});
