if (!customElements.get('main-register')) {
  customElements.define(
    "main-register",
    class extends HTMLElement {
      constructor() {
        super();

        this.init();
      }

      init() {
        this.currentStep = 0;
        this.totalSteps = 3;
        this.progressBarContainer = document.getElementById(
          "progress-bar-container"
        );
        this.form = document.querySelector("form#create_customer");
        this.buttons = document.querySelectorAll(
          "button[type='button']"
        );
        this.buttons.forEach((button) => {
          button.addEventListener("click", (event) => {
            event.preventDefault();
            const step = parseInt(button.getAttribute("data-step"));
            const direction = button.getAttribute("data-direction");
            if (direction === "next") {
              this.nextStep(step);
            } else if (direction === "prev") {
              this.previousStep(step); 
            }
          });
        });

        if (this.form) {
          this.form.addEventListener("submit", (event) => {
            this.validateForm(event);
          });
        }
        console.log("main-register: init");
        this.progressBarContainer.style.display = "none";
        this.updateProgressBar();
        this.setupInputValidation(this.currentStep);
        this.setRegisterDate();
      }

      updateProgressBar() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        document.getElementById("progress-bar").style.width = progress + "%";

        document.getElementById(
          "progress-text"
        ).textContent = `${this.currentStep}/${this.totalSteps}`;
      }

      setRegisterDate() {
        const today = new Date();
        const minDate = today.setFullYear(today.getFullYear() - 13);
        const maxDate = today.setFullYear(today.getFullYear() - 110);

        flatpickr("#dateOfBirth", {
          dateFormat: "Y-m-d",
          defaultDate: "today",
          altInput: true,
          altFormat: "F j, Y",
          minDate: maxDate,
          maxDate: minDate,
          allowInput: false,
          onReady: function (instance) {
            if (instance.input) {
              instance.input.classList.add("flatpickr-input");
            }
          },
        });
      }

      validateStep(step) {
        let valid = true;
        const fields = document.querySelectorAll(
          `#step-${step} input, #step-${step} select, #step-${step} textarea`
        );
        fields.forEach((field) => {
          if (field.type === "checkbox" || !field.required) {
            return; // Пропускаємо необов'язкові поля
          }

          let formFloatingWrapper = undefined;

          if (field.type === "radio") {
            formFloatingWrapper = field.closest("fieldset.custom-radio-group");
          } else {
            formFloatingWrapper = field.closest(".form-floating-label");
          }

          const feedbackElement =
            formFloatingWrapper.querySelector(".invalid-feedback");

          if (!field.checkValidity()) {
            valid = false;
            formFloatingWrapper.classList.add("is-invalid");
            field.classList.add("is-invalid");
            if (feedbackElement) {
              feedbackElement.style.display = "block";
            }
          } else {
            formFloatingWrapper.classList.remove("is-invalid");
            field.classList.remove("is-invalid");
            if (feedbackElement) {
              feedbackElement.style.display = "none";
            }
          }
        });
        return valid;
      }

      nextStep(step) {
        const registrationForm = document.querySelector(
          ".customer.registration-form"
        );

        if (registrationForm) {
          if (!registrationForm.classList.contains("steps-wrap")) {
            registrationForm.classList.add("steps-wrap");
          }
        }

        if (!this.validateStep(this.currentStep)) {
          return;
        }

        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        currentStepElement.style.display = "none";
        this.currentStep = step;
        const nextStepElement = document.getElementById(`step-${this.currentStep}`);
        nextStepElement.style.display = "block";

        if (this.currentStep > 0) {
          document.getElementById("progress-bar-container").style.display =
            "flex";
        }

        this.updateProgressBar();
        this.setupInputValidation(this.currentStep);
      }

      previousStep(step) {
        console.log('previousStep:', step);
        const currentStepElement = document.getElementById(`step-${this.currentStep}`);
        currentStepElement.style.display = "none";
        this.currentStep = step;
        const prevStepElement = document.getElementById(`step-${this.currentStep}`);
        prevStepElement.style.display = "block";

        if (this.currentStep === 0) {
          document.getElementById("progress-bar-container").style.display =
            "none";
        }

        this.updateProgressBar();
      }

      setupInputValidation(step) {
        const fields = document.querySelectorAll(
          `#step-${step} input, #step-${step} select, #step-${step} textarea`
        );

        fields.forEach((field) => {
          console.log("field", field);
          field.removeEventListener("input", this.handleInputValidation);
          field.addEventListener("input", this.handleInputValidation);
        });
      }

      handleInputValidation(event) {
        const field = event.target;
        const formFloatingWrapper = field.closest(".form-input-wrap");
        const feedbackElement =
          formFloatingWrapper?.querySelector(".invalid-feedback");
        const minLengthFeedback =
          formFloatingWrapper?.querySelector(".min-length-feedback");

        const fields = formFloatingWrapper.querySelectorAll(
          "input, select, textarea"
        );

        if (field.checkValidity()) {
          formFloatingWrapper?.classList.remove("is-invalid");
          field.classList.remove("is-invalid");
          fields.forEach((input) => {
            input.classList.remove("is-invalid");
          });
          if (feedbackElement) {
            feedbackElement.style.display = "none";
          }
          if (minLengthFeedback) {
            minLengthFeedback.style.display = "none";
          }
        } else {
          formFloatingWrapper?.classList.add("is-invalid");
          field.classList.add("is-invalid");
          if (feedbackElement) {
            feedbackElement.style.display = "block";
          }

          if (field.validity.tooShort && minLengthFeedback) {
            minLengthFeedback.style.display = "block";
          }
        }
      }

      validateForm(event) {
        event.preventDefault();

        const passwordField = document.getElementById("RegisterForm-password");
        const passwordFieldWrapper = passwordField.closest(".form-input-wrap");
        const passwordConfirmationField = document.getElementById(
          "RegisterForm-password-confirmation"
        );
        const passwordConfirmationFieldWrapper =
          passwordConfirmationField.closest(".form-input-wrap");

        let valid = true;

        if (!passwordField.value || passwordField.value.length < 8) {
          passwordField.setCustomValidity("");
          const feedbackElement =
            passwordFieldWrapper.querySelector(".invalid-feedback");

          if (!passwordField.value) {
            feedbackElement.textContent = "Please enter your password";
          } else if (passwordField.value.length < 8) {
            feedbackElement.textContent =
              "Password must be at least 8 characters long.";
          }
          valid = false;
          passwordFieldWrapper.classList.add("is-invalid");
          passwordField.classList.add("is-invalid");
          feedbackElement.style.display = "block";
        } else {
          passwordFieldWrapper.classList.remove("is-invalid");
          passwordField.classList.remove("is-invalid");
          passwordFieldWrapper.querySelector(".invalid-feedback").style.display =
            "none";
        }

        if (passwordConfirmationField.value !== passwordField.value) {
          valid = false;
          passwordConfirmationFieldWrapper.classList.add("is-invalid");
          passwordConfirmationField.classList.add("is-invalid");
          passwordConfirmationFieldWrapper
            .querySelector(".invalid-feedback")
            .style.display = "block";
        } else {
          passwordConfirmationFieldWrapper.classList.remove("is-invalid");
          passwordConfirmationField.classList.remove("is-invalid");
          passwordConfirmationFieldWrapper
            .querySelector(".invalid-feedback")
            .style.display = "none";
        }

        if (valid) {
          this.form.submit();
        }
      }
    }
  );
}