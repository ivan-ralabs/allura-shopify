const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  saveButton: 'button#saveButton',
  cancelButton: 'button#cancelButton',
  deleteAddressButton: 'button[data-confirm-message]',
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message',
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
    this._initDOMelements();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          toggleButtons: document.querySelectorAll(
            selectors.toggleAddressButton
          ),
          deleteButtons: container.querySelectorAll(
            selectors.deleteAddressButton
          ),
          countrySelects: container.querySelectorAll(
            selectors.addressCountrySelect
          ),
        }
      : {};
  }

  _observeInputChanges() {
    // 1) Grab form & buttons
    const form = document.querySelector(
      '.shipping-details form[id^="address_form_"]'
    );
    if (!form) return;

    const saveBtn = form.querySelector('button[type="submit"]');
    const cancelBtn = form.querySelector('button[type="button"].cancel');

    // 2) Grab your inputs/selects
    const address1Input = form.querySelector('input[name="address[address1]"]');
    const address2Input = form.querySelector('input[name="address[address2]"]'); // if you have it
    const cityInput = form.querySelector('input[name="address[city]"]');
    const stateSelect = form.querySelector('select[name="address[province]"]');
    const zipInput = form.querySelector('input[name="address[zip]"]');
    const phoneInput = form.querySelector('input[name="address[phone]"]');

    this.addressErr = form.querySelector("#address1-error");
    this.zipErr = form.querySelector("#zip-error");
    this.cityErr = form.querySelector("#city-error");
    this.stateErr = form.querySelector("#province-error");
    this.phoneErr = form.querySelector("#phone-error");

    if (!form || !saveBtn || !cancelBtn) return;

    // 4) Helper to restore initial values
    function _setElementValues(vals) {
      if (address1Input) address1Input.value = vals.address1;
      if (address2Input) address2Input.value = vals.address2;
      if (cityInput) cityInput.value = vals.city;
      if (stateSelect) stateSelect.value = vals.state;
      if (zipInput) zipInput.value = vals.zip;
      if (phoneInput) phoneInput.value = vals.phone;
    }

    // 5) Snapshot on load
    const initialValues = this._getElementValues();

    // 6) Check “dirty” state
    function checkDirty() {
      const curr = _getElementValues();
      const dirty = Object.keys(initialValues).some(
        (key) => initialValues[key] !== curr[key]
      );
      saveBtn.disabled = !dirty;
      cancelBtn.disabled = !dirty;
    }

    // 7) Wire up listeners on every field
    const allFields = [
      address1Input,
      address2Input,
      cityInput,
      stateSelect,
      zipInput,
      phoneInput,
    ].filter(Boolean);

    allFields.forEach(field => {
      field.addEventListener('input',  checkDirty, { passive: true });
      field.addEventListener('change', checkDirty, { passive: true });
    });

    // 8) Initialize buttons
    checkDirty();

    // 9) Cancel button restores the snapshot
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      _setElementValues(initialValues);
      checkDirty();
    });
  }

  _initDOMelements() {
    this.stateSelect = document.querySelector(
      'select[name="address[province]"]'
    );
    this.cityInput = document.querySelector('input[name="address[city]"]');
    this.address1Input = document.querySelector(
      'input[name="address[address1]"]'
    );
    this.address2Input = document.querySelector(
      'input[name="address[address2]"]'
    );
    this.zipInput = document.querySelector('input[name="address[zip]"]');
    this.phoneInput = document.querySelector('input[name="address[phone]"]');
    this.saveButton = document.querySelector(selectors.saveButton);
    this.cancelButton = document.querySelector(selectors.cancelButton);

    this.initialValues = this._getElementValues();

    // this._getElementValues();
    if (!this.saveButton) {
      console.error("saveButton not found");
      return;
    }

    this._observeInputChanges();

    [
      this.stateSelect,
      this.cityInput,
      this.address1Input,
      this.address2Input,
      this.zipInput,
      this.phoneInput,
    ].forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          this.saveButton.disabled = false;
          this.cancelButton.disabled = false;
        });
      }
    });

    this.cancelButton.addEventListener("click", (e) => {
      e.preventDefault();
      this._cancelChanges();
    });
  }

  _cancelChanges() {
    this.stateSelect.value =
      this.initialValues.state || this.stateSelect.getAttribute("data-default");
    this.address1Input.value = this.initialValues.address1 || "";
    this.address2Input.value = this.initialValues.address2 || "";
    this.cityInput.value = this.initialValues.city || "";
    this.stateSelect.value = this.initialValues.state || "";
    this.zipInput.value = this.initialValues.zip || "";
    this.phoneInput.value = this.initialValues.phone || "";

    [this.addressErr, this.zipErr, this.cityErr, this.stateErr, this.phoneErr].forEach((err) => {
      if (err) err.style.display = "none";
    });

    this.saveButton.disabled = true;
    this.cancelButton.disabled = true;
  }

  _getElementValues() {
    return {
      address1: this.address1Input?.value || "",
      address2: this.address2Input?.value || "",
      city: this.cityInput?.value || "",
      state: this.stateSelect?.value || "",
      zip: this.zipInput?.value || "",
      phone: this.phoneInput?.value || "",
    };
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector(
        "AddressCountryNew",
        "AddressProvinceNew",
        {
          hideElement: "AddressProvinceContainerNew",
        }
      );
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(
          `AddressCountry_${formId}`,
          `AddressProvince_${formId}`,
          {
            hideElement: `AddressProvinceContainer_${formId}`,
          }
        );
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener("click", this._handleAddEditButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener("click", this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    target.setAttribute(
      attributes.expanded,
      (target.getAttribute(attributes.expanded) === "false").toString()
    );
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: "delete" },
      });
    }
  };
}
