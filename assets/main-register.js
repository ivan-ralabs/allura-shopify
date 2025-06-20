if (!customElements.get('main-register')) {
  customElements.define(
    "main-register",
    class extends HTMLElement {
      constructor() {
        super();
        this.handleInputValidation = this.handleInputValidation.bind(this);
        this.init();
      }

      init() {
        this.currentStep = 0;
        this.totalSteps = 3;
        this.progressBarContainer = document.getElementById(
          "progress-bar-container"
        );
        this.form = document.querySelector("form#create_customer");
        this.buttons = document.querySelectorAll("button[type='button']");
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

        flatpickr("#RegisterForm-dateOfBirth", {
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

      _markField(wrapper, field, feedbackEl, ok) {
        if (!wrapper || !field) {
          console.error("markField: missing wrapper or field element");
          return;
        }
        if (ok) {
          wrapper.classList.remove("is-invalid");
          wrapper.classList.add("is-valid");
          field.classList.remove("is-invalid");
          field.classList.add("is-valid");
        } else {
          wrapper.classList.remove("is-valid");
          wrapper.classList.add("is-invalid");
          field.classList.remove("is-valid");
          field.classList.add("is-invalid");
        }
      }

      validateStep(step) {
        let valid = true;
        const seenRadioGroups = new Set();
        const fields = document.querySelectorAll(
          `#step-${step} input, #step-${step} select, #step-${step} textarea`
        );
        fields.forEach((field) => {
          if (field.type === "checkbox") return;

          if (
            (field.type === "hidden" || field.readOnly) &&
            field.id !== "RegisterForm-dateOfBirth"
          ) {
            return;
          }

          if (field.type === "radio") {
            const groupName = field.name;
            if (seenRadioGroups.has(groupName)) return;
            seenRadioGroups.add(groupName);

            // find the fieldset wrapper
            const wrapper = field.closest("fieldset.custom-radio-group");
            const feedback = wrapper?.querySelector(".invalid-feedback");

            // are any in this group checked?
            const anyChecked = Array.from(
              document.querySelectorAll(`input[name="${groupName}"]`)
            ).some((r) => r.checked);

            this._markField(wrapper, wrapper, feedback, anyChecked);
            if (!anyChecked) valid = false;
            return;
          }

          const wrapper = field.closest(".form-input-wrap");
          const feedback = wrapper?.querySelector(".invalid-feedback");
          let ok = field.checkValidity() && this.validateInput(field);
          // special‐case DOB & password/confirmation just as before...
          if (field.id === "RegisterForm-dateOfBirth") {
            ok = !!field.value.trim();
            feedback.textContent = ok
              ? ""
              : "Please select your date of birth.";
          } else if (field.id === "RegisterForm-password") {
            const pwRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
            ok = pwRe.test(field.value);
            feedback.textContent = ok
              ? ""
              : "Password must be ≥12 chars, with upper/lower/number/special.";
          } else if (field.id === "RegisterForm-password-confirmation") {
            const pw = document.getElementById("RegisterForm-password").value;
            ok = field.value === pw;
            feedback.textContent = ok ? "" : "Passwords do not match.";
          }
          this._markField(wrapper, field, feedback, ok);
          if (!ok) {
            valid = false;
          }
        });
        return valid;
      }

      validateInput(input) {
        let nameRegex;
        input.id === "preferredName"
          ? /^[\p{L}\p{Nd}.\- '\u2019]{1,50}$/u
          : /^[\p{L}.'\- ]{1,50}$/u;

        switch (input.id) {
          case "RegisterForm-FirstName":
          case "RegisterForm-LastName":
            nameRegex = /^[\p{L}.'\- ]{1,50}$/u;
            break;
          case "RegisterForm-PreferredName":
            nameRegex = /^(?:[\p{L}\p{Nd}.'\-\u2019]{1,50})?$/u;
            break;
          case "RegisterForm-password":
            nameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
            break;
          default:
            return true;
        }

        return nameRegex.test(input.value);
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

        const currentStepElement = document.getElementById(
          `step-${this.currentStep}`
        );
        currentStepElement.style.display = "none";
        this.currentStep = step;
        const nextStepElement = document.getElementById(
          `step-${this.currentStep}`
        );
        nextStepElement.style.display = "block";

        if (this.currentStep > 0) {
          document.getElementById("progress-bar-container").style.display =
            "flex";
        }

        this.updateProgressBar();
        this.setupInputValidation(this.currentStep);
      }

      previousStep(step) {
        console.log("previousStep:", step);
        const currentStepElement = document.getElementById(
          `step-${this.currentStep}`
        );
        currentStepElement.style.display = "none";
        this.currentStep = step;
        const prevStepElement = document.getElementById(
          `step-${this.currentStep}`
        );
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
          console.log(`Setting up validation for field: ${field.id}`);
          ["input", "change", "blur"].forEach((eventType) => {
            field.removeEventListener(eventType, this.handleInputValidation);
            field.addEventListener(eventType, this.handleInputValidation);
          });
        });
      }

      handleInputValidation(event) {
        const field = event.target;
        const wrapper = field.closest(".form-input-wrap");
        const fb = wrapper?.querySelector(".invalid-feedback");

        let ok;
        if (field.id === "RegisterForm-password-confirmation") {
          const pw = document.getElementById("RegisterForm-password").value;
          ok = field.value === pw;
          fb.textContent = ok ? "" : "Passwords do not match.";
        }
        else {
          ok = field.checkValidity() && this.validateInput(field);
        }

        this._markField(wrapper, field, fb, ok);
      }

      validateForm(event) {
        event.preventDefault();

        const pwField = document.getElementById("RegisterForm-password");
        const pwWrapper = pwField.closest(".form-input-wrap");
        const confirmField = document.getElementById(
          "RegisterForm-password-confirmation"
        );
        const confirmWrapper = confirmField.closest(".form-input-wrap");

        const pwFeedback = pwWrapper.querySelector(".invalid-feedback");
        const confirmFeedback =
          confirmWrapper.querySelector(".invalid-feedback");

        // same regex as in validateStep
        const pwRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

        let valid = true;

        // ——— password field ———
        if (!pwRe.test(pwField.value)) {
          pwFeedback.textContent =
            pwField.value.length === 0
              ? "Please enter your password"
              : "Password must be ≥12 chars, with upper/lower/number/special.";
          pwWrapper.classList.add("is-invalid");
          pwWrapper.classList.remove("is-valid");
          pwField.classList.add("is-invalid");
          pwField.classList.remove("is-valid");
          valid = false;
        } else {
          pwWrapper.classList.remove("is-invalid");
          pwWrapper.classList.add("is-valid");
          pwField.classList.remove("is-invalid");
          pwField.classList.add("is-valid");
        }

        // ——— confirmation ———
        if (confirmField.value !== pwField.value) {
          confirmFeedback.textContent = "Passwords do not match.";
          confirmWrapper.classList.add("is-invalid");
          confirmWrapper.classList.remove("is-valid");
          confirmField.classList.add("is-invalid");
          confirmField.classList.remove("is-valid");
          valid = false;
        } else if (pwRe.test(pwField.value)) {
          // only mark valid if the main password itself is valid
          confirmWrapper.classList.remove("is-invalid");
          confirmWrapper.classList.add("is-valid");
          confirmField.classList.remove("is-invalid");
          confirmField.classList.add("is-valid");
        }

        if (valid) {
          this.form.submit();
        }
      }
    }
  );
}