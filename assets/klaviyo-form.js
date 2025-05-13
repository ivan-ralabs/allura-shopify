if (!customElements.get('klaviyo-form')) {
  class KlaviyoForm extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('submit', (event) => {
        event.preventDefault();
        this.form = this.querySelector('form');
        this.email = this.form.querySelector('input[name="email"]').value;
        this.successMessage = this.form.querySelector('#success-message');
        this.listID = this.form.getAttribute('data-list-id');

        if (!this.email || !this.listID) {
          console.error('Email or list ID is missing.');
          return;
        }
        klaviyoSubscribe(this.listID, this.email, null, null); // Assuming phoneObj and customProperties are not needed for this example
      });

      window.addEventListener('klaviyo:subscribed', (event) => {
        if (event.detail.listID && event.detail.listID === this.listID) {
          this.showSuccessMessage();
          this.form.reset(); // Reset the form after successful subscription
        }
      });
    }

    showSuccessMessage() {
      if (!this.querySelector('.alert.show')) {
        this.successMessage.classList.add('show');
      }
    }
  }

  customElements.define('klaviyo-form', KlaviyoForm);
}

