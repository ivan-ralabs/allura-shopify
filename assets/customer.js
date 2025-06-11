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
          toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
          deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
          countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
        }
      : {};
  }

  _initDOMelements() {
    this.stateSelect = document.querySelector('select[name="address[province]"]');
    this.cityInput = document.querySelector('input[name="address[city]"]');
    this.address1Input = document.querySelector('input[name="address[address1]"]');
    this.address2Input = document.querySelector('input[name="address[address2]"]');
    this.zipInput = document.querySelector('input[name="address[zip]"]');
    this.phoneInput = document.querySelector('input[name="address[phone]"]');
    this.saveButton = document.querySelector(selectors.saveButton);
    this.cancelButton = document.querySelector(selectors.cancelButton);

    this._getElementValues();
    if (!this.saveButton) {
      console.error("saveButton not found");
      return;
    }

    [this.stateSelect, this.cityInput, this.address1Input, this.address2Input, this.zipInput, this.phoneInput].forEach((input) => {
      if (input) {
        input.addEventListener('input', () => {
          this.saveButton.disabled = false;
          this.cancelButton.disabled = false;
        });
      }
    });

    this.cancelButton.addEventListener(
      "click", (e) => {
        e.preventDefault();
        this._cancelChanges();
      }
    );
  }

  _cancelChanges() {
    this.stateSelect.value = this.initialValues.state || this.stateSelect.getAttribute('data-default');
    this.address1Input.value = this.initialValues.address1 || '';
    this.address2Input.value = this.initialValues.address2 || '';
    this.cityInput.value = this.initialValues.city || '';
    this.stateSelect.value = this.initialValues.state || '';
    this.zipInput.value = this.initialValues.zip || '';
    this.phoneInput.value = this.initialValues.phone || '';
    this.saveButton.disabled = true;
    this.cancelButton.disabled = true;
  }

  _getElementValues() {
    this.initialValues = {
      state: this.stateSelect ? this.stateSelect.value : '',
      city: this.cityInput ? this.cityInput.value : '',
      address1: this.address1Input ? this.address1Input.value : '',
      address2: this.address2Input ? this.address2Input.value : '',
      zip: this.zipInput ? this.zipInput.value : '',
      phone: this.phoneInput ? this.phoneInput.value : '',
    };
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    target.setAttribute(attributes.expanded, (target.getAttribute(attributes.expanded) === 'false').toString());
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
}
