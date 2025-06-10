if (!customElements.get('personal-data')) {
  customElements.define(
    "personal-data",
    class extends HTMLElement {
      constructor() {
        super();

        this.init();
      }

      init() {
        this.firstNameInput = document.getElementById("firstName");
        this.lastNameInput = document.getElementById("lastName");
        this.prefferedNameInput = document.getElementById("preferredName");
        this.dateOfBirthInput = document.getElementById("dateOfBirth");
        this.gendersSet = document.getElementById("gendersSet");

        this.saveButton = document.getElementById("saveButton");
        this.cancelButton = document.getElementById("cancelButton");

        this.initialValues = {
          firstName: this.firstNameInput.value,
          lastName: this.lastNameInput.value,
          preferredName: this.prefferedNameInput.value,
          dateOfBirth: this.dateOfBirthInput.value,
          selectedGender: this.gendersSet.querySelector(
            "input[type='radio']:checked"
          )?.value || ""
        };

        console.log('this.initialValues', this.initialValues);

        [
          this.firstNameInput,
          this.lastNameInput,
          this.prefferedNameInput,
          this.dateOfBirthInput,
          this.gendersSet
        ].forEach(input => {
          console.log(`Adding input event listener to ${input.id}`);
          if (input) input.addEventListener('input', this.enableButtons.bind(this));
        });

        if (this.saveButton) {
          this.saveButton.addEventListener(
            "click",
            this.saveChanges.bind(this)
          );
        } else {
          console.error("saveButton not found");
        }

        if (this.cancelButton) {
          this.cancelButton.addEventListener("click", this.cancelChanges.bind(this));
        }
        else {
          console.error("cancelButton not found");
        }

      }

      enableButtons() {
        console.log("Enabling buttons based on input changes");
        this.saveButton.disabled = false;
        this.cancelButton.disabled = false;
      }

      saveChanges() {
        const obj = {
          input: {},
        };

        const input = obj.input;
        if (this.firstNameInput.value !== this.initialValues.firstName) {
          input.firstName = this.firstNameInput.value;
        }
        if (this.lastNameInput.value !== this.initialValues.lastName) {
          input.lastName = this.lastNameInput.value;
        }
        if (this.prefferedNameInput.value !== this.initialValues.preferredName) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "preffered_name",
            type: "single_line_text_field",
            value: this.prefferedNameInput.value,
          });
        }
        if (this.dateOfBirthInput.value !== this.initialValues.dateOfBirth) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "date_of_birth",
            type: "date",
            value: this.dateOfBirthInput.value,
          });
        }
        const selectedGender = this.gendersSet.querySelector(
          "input[type='radio']:checked"
        )?.value;
        if (selectedGender && selectedGender !== this.initialValues.selectedGender) {
          input.metafields = input.metafields || [];
          input.metafields.push({
            namespace: "custom",
            key: "gender_text",
            type: "single_line_text_field",
            value: selectedGender,
          });
        }

        if (Object.keys(input).length === 0 || 
            (input.metafields && input.metafields.length === 0)) {
          console.log("No changes to save");
          return;
        }

        console.log('this', this);
        input.id = `gid://shopify/Customer/${this.getAttribute("data-customer-id")}`;
        console.log("Changes detected, preparing to save:", obj);

        // Here you would typically send the `input` object to your server or API
      }

      cancelChanges() {
        console.log("Setting initial values for inputs");
        this.firstNameInput.value = this.initialValues.firstName;
        this.lastNameInput.value = this.initialValues.lastName;
        this.prefferedNameInput.value = this.initialValues.preferredName;
        this.dateOfBirthInput.value = this.initialValues.dateOfBirth;
        this.gendersSet.querySelector(
          `input[type='radio'][value='${this.initialValues.selectedGender}']`
        ).checked = true;
      }
    }
  );
}