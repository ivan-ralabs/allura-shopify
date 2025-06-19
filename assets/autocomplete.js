// at the top of your autocomplete.js (before any DOM‐ready handler):
const STATE_CODES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

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
  let cityOK = false;
  let expectedState = null;

  const phonePattern = /^(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/;

  addressOK = addressInput.value.trim() !== "";
  zipOK = zipInput.value.trim() !== "";
  cityOK = cityInput.value.trim() !== "";

  const fromCity = cityInput.dataset.stateFull;  
  stateOK = fromCity
    ? stateSelect.value === fromCity
    : stateSelect.value.trim() !== '';

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
        // after you pull out the Google components:
        const fullStateName = comps.administrative_area_level_1.long;  // "New Mexico"
        const stateCodeShort = comps.administrative_area_level_1.short; // "NM"
        const cityName = comps.locality.long;

        const fullCity = `${cityName}, ${stateCodeShort}`;
        cityInput.value = fullCity;

        // 2) stash the full state in a data-attribute for later validation
        cityInput.dataset.stateFull = fullStateName;
        
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
      fields: ["address_components"],
      types: ["(cities)"],
    });

    cityAc.addListener("place_changed", () => {
      const comps = {};
      for (const c of cityAc.getPlace().address_components) {
        comps[c.types[0]] = c.long_name;
        comps[c.types[0] + "_short"] = c.short_name;
      }

      // Grab just the city and the short state code
      const cityName = comps.locality || comps.administrative_area_level_2 || "";
      const stateCodeShort = comps.administrative_area_level_1_short || "";
      const fullStateName = comps.administrative_area_level_1 || "";

      // 1) Write back exactly "Albuquerque, NM"
      const fullCity = `${cityName}, ${stateCodeShort}`;
      cityInput.value = fullCity;

      // 2) Stash the full state name for your later validation
      cityInput.dataset.stateFull = fullStateName;

      // 3) Mark valid & clear any error
      cityOK = true;
      cityErr.style.display = "none";

      // 4) Fire a change so your Save/Cancel logic picks it up
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
  phoneInput.addEventListener("input", () => {
    phoneOK = false;
    phoneErr.style.display = "none";
  });

  cityInput.addEventListener("change", () => {
    cityErr.style.display = "none";
  });
  stateSelect.addEventListener("change", () => {
    const picked = stateSelect.value; // e.g. “New Mexico”
    const fullFromCity = cityInput.dataset.stateFull; // the “New Mexico” you stored

    // if there’s no city yet, don’t block
    if (!cityInput.value.trim()) {
      stateOK = true;
      return;
    }

    if (picked === fullFromCity) {
      stateOK = true;
      stateErr.style.display = "";
      cityErr.style.display = "";
    } else {
      stateOK = false;
      cityErr.textContent = "This city doesn’t match the selected state.";
      cityErr.style.display = "block";
    }
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
    const val = phoneInput.value.trim();
    if (phonePattern.test(val)) {
      phoneOK = true;
      phoneErr.style.display = "none";
    } else {
      phoneOK = false;
      phoneErr.textContent =
        "Please enter a valid US phone (e.g. 123-456-7890).";
      phoneErr.style.display = "block";
    }
  });

  form.addEventListener("submit", (e) => {
    const match = cityInput.value.trim().match(/,\s*([A-Z]{2})$/);
    if (match) {
      const abbr = match[1]; // e.g. "NM"
      const full = STATE_CODES[abbr]; // → "New Mexico"
      // 2) If we have a valid full name and it doesn't match the <select> value, stop right here:
      if (full && stateSelect.value !== full) {
        e.preventDefault();
        cityErr.textContent = "This city doesn’t match the selected state.";
        stateErr.textContent = "Please select the correct state for your city.";
        cityErr.style.display = stateErr.style.display = "block";
        return; // bail out—nothing else runs
      }
    }
    // --- recompute fullFromCity every time ---
    let fullFromCity;
   if (cityInput.value.includes(",")) {
      const [, short] = cityInput.value.split(/\s*,\s*/);
      fullFromCity = STATE_CODES[short] || null;
    }

    // --- the rest of your field checks ---
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
        ok: phoneOK,
        input: phoneInput,
        err: phoneErr,
        msg: "Please enter a valid phone number (e.g. 123-456-7890).",
      },
    ];

    // hide any old messages
    checks.forEach((c) => (c.err.style.display = "none"));

    const failed = checks.filter((c) => !c.ok);

    if (failed.length) {
      e.preventDefault();
      failed.forEach(({ err, msg }) => {
        err.textContent = msg;
        err.style.display = "block";
      });
      console.log('failed[0]', failed[0]);
      failed[0].input.scrollIntoView({ behavior: "smooth", block: "top" });
    }
  });
});
