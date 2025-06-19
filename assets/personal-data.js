if (!customElements.get('personal-data')) {
  customElements.define(
    "personal-data",
    class extends HTMLElement {
      constructor() {
        super();
        this.init();
      }

      validateNameInput(input) {
        const isPreferred = input.id === "preferredName";
        const nameRegex = isPreferred
          ? /^[\p{L}\p{Nd}.\- '\u2019]{1,50}$/u
          : /^[\p{L}.'\- ]{1,50}$/u;
        const ok = nameRegex.test(input.value);
        const wrapper = input.closest(".form-floating-label");
        if (!ok) {
          input.setCustomValidity("Invalid");
          wrapper.classList.add("is-invalid");
        } else {
          input.setCustomValidity("");
          wrapper.classList.remove("is-invalid");
        }
        return ok;
      }

      init() {
        this.firstNameInput = this.querySelector("#firstName");
        this.lastNameInput = this.querySelector("#lastName");
        this.preferredNameInput = this.querySelector("#preferredName");
        this.dateOfBirthInput = this.querySelector("#dateOfBirth");
        this.gendersSet = this.querySelector("#gendersSet");
        this.saveButton = this.querySelector("#saveButton");
        this.cancelButton = this.querySelector("#cancelButton");

        this.initialValues = {
          firstName: this.firstNameInput?.value ?? "",
          lastName: this.lastNameInput?.value ?? "",
          preferredName: this.preferredNameInput?.value ?? "",
          dateOfBirth: this.dateOfBirthInput?.value ?? "",
          gender:
            this.gendersSet?.querySelector("input[type=radio]:checked")?.value ?? "",
        };

        if (!this.firstNameInput || !this.lastNameInput) {
          console.error("personal-data: missing required name inputs");
          return;
        }

        console.log("this.initialValues", this.initialValues);

        [
          this.firstNameInput,
          this.lastNameInput,
          this.preferredNameInput,
          this.dateOfBirthInput,
          this.gendersSet,
        ].forEach((input) => {
          input.addEventListener("input", () => this.enableButtons());
          input.addEventListener("change", () => this.enableButtons());
        });

        [
          this.firstNameInput,
          this.lastNameInput,
          this.preferredNameInput,
        ].forEach((input) =>
          input.addEventListener("blur", (e) => this.validateNameInput(e.target))
        );

        this.saveButton.addEventListener('click', e => this.onSave(e));
        this.cancelButton.addEventListener('click', e => this.cancelChanges(e));
      }

      enableButtons() {
        this.saveButton.disabled = false;
        this.cancelButton.disabled = false;
      }

      onSave(e) {
        const input = {};

        if (this.firstNameInput.value !== this.initialValues.firstName) {
          input.firstName = this.firstNameInput.value;
        }
        if (this.lastNameInput.value !== this.initialValues.lastName) {
          input.lastName = this.lastNameInput.value;
        }
        // preferredName
        if (
          this.preferredNameInput.value !== this.initialValues.preferredName
        ) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "preffered_name",
            type: "single_line_text_field",
            value: this.preferredNameInput.value,
          });
        }
        // dateOfBirth
        if (this.dateOfBirthInput.value !== this.initialValues.dateOfBirth) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "date_of_birth",
            type: "date",
            value: this.dateOfBirthInput.value,
          });
        }
        // gender
        const newGender = this.gendersSet.querySelector("input[type=radio]:checked")?.value;
        if (
          newGender  &&
          newGender !== this.initialValues.gender
        ) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "gender_text",
            type: "single_line_text_field",
            value: newGender,
          });
        }

        if (!Object.keys(input).length) return;

        input.id = this.getAttribute("data-customer-id");
        console.log("Saving payload:", input);

        // TODO: API call to save the data
      }

      cancelChanges(e) {
        e.preventDefault();
        console.log("Setting initial values for inputs");
        this.firstNameInput.value = this.initialValues.firstName;
        this.lastNameInput.value = this.initialValues.lastName;
        this.preferredNameInput.value = this.initialValues.preferredName;
        this.dateOfBirthInput.value = this.initialValues.dateOfBirth;
        this.gendersSet.querySelector(
          `input[type='radio'][value='${this.initialValues.gender}']`
        ).checked = true;

        [ this.firstNameInput, this.lastNameInput, this.preferredNameInput ].forEach((input) => {
          input.setCustomValidity("");
          const wrapper = input.closest(".form-floating-label");
          wrapper.classList.remove("is-invalid");
        });

        this.saveButton.disabled = true;
        this.cancelButton.disabled = true;
      }
    }
  );
}