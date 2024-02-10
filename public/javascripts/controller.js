export class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.handleDisplayContacts();
    this.bindEvents();
  }

  handleSearchBar(input) {
    let searchMatches;
    if (/\S/.test(input) && input.length > 0) {
      searchMatches = this.model.search(input);
    } else if (input.length === 0) {
      this.view.displayContacts(this.model.contacts);
    }

    if (searchMatches && searchMatches.length > 0) {
      this.view.displayContacts(searchMatches);
    } else if (searchMatches && searchMatches.length === 0 || input.length === 0) {
      this.view.contactNotFound(input);
    }
  }

  handleAddTag(newTag, formId) {
    if (newTag.length === 0) {return}
    const existingTags = this.model.getCurrentTags();
    if (!existingTags.includes(newTag.toLowerCase())) {
      this.view.hideNewTagError(formId);
      this.view.addTag(newTag, formId);
    } else {
      this.view.displayNewTagError(formId);
      return
    }
  }

  validation(formInfo, form) {
    const validationResults = this.model.validateInputs(formInfo);
    const validSubmission = Object.values(validationResults).every(isFieldValid => isFieldValid);

    if (!validSubmission) {
      this.view.displayValidationErrors(validationResults, form);
      return false;
    } else {
      return true;
    }
  }

  async handleSubmitButton() {
    const formInfo = this.view.getFormInfo(this.view.contactForm);
    if (!this.validation(formInfo, this.view.contactForm)) {
      return
    }
    
    formInfo.id = this.model.generateNextId();
    if (formInfo.tags && formInfo.length === 0) {
      formInfo.tags = '';
    } else if (formInfo.tags && formInfo.length > 0){
      formInfo.tags = formInfo.tags.join(',');
    }

    try {
      const headers = {'Content-Type': 'application/json'}
      await this.model.makeRequest('contacts', 'POST', headers, formInfo);
      this.view.toggleContactForm();
      this.view.resetContactForm();
    } catch(error) {
      console.error('Error adding contact:', error);
    }
  }

  async handleSubmitEditButton() {
    const formInfo = this.view.getFormInfo(this.view.editForm);
    if (!this.validation(formInfo, this.view.editForm)) {
      return
    }

    const id = this.view.editForm.getAttribute('data-contact-id');
    formInfo.id = id;
    if (formInfo.tags && formInfo.tags.length > 0) {
      formInfo.tags.join(',');
    } else {
      formInfo.tags = '';
    }

    try {
      const path = `contacts/${id}`;
      const headers = {'Content-Type': 'application/json'}
      await this.model.makeRequest(path, 'PUT', headers, formInfo);
      this.view.toggleEditForm();
      this.view.resetEditForm();
    } catch(error) {
      console.error(`Error adding contact:, ${error}`);
    }
  }

  async handleEditContactButton(id) {
    this.view.editForm.setAttribute('data-contact-id', id);
    try {
      const path = `contacts/${id}`;
      const response = await this.model.makeRequest(path);
      this.view.populateEditForm(response);
      this.view.toggleEditForm();
    } catch(error) {
      console.error('Error:',error);
    }
  }

  async handleDisplayContacts() {
    try {
      const response = await this.model.makeRequest('contacts')
      const allTags = response.flatMap(({tags}) => tags);
      this.model.contacts = response;
      this.model.currentTags = this.model.getUniqueTags(allTags);
      this.view.repopulateTags(this.model.getCurrentTags());
      this.view.displayContacts(response);
    } catch(error) {
      console.error('Error getting contacts:', error);
    }
  }

  async handleDeleteContactButton(id) {
    try {
      await this.model.deleteContact(id);
    } catch(error) {
      console.error('Error Deleting:', error);
    }
  }

  handleAddButtonsClick() {
    this.view.toggleContactForm();
  }

  handleCancelButtonClick() {
    this.view.toggleContactForm();
    this.view.resetContactForm();
  }

  handleCancelEditButtonClick() {
    this.view.toggleEditForm();
    this.view.resetEditForm();
  }

  handleTagSearch(target) {
    const matches = this.model.search(target);
    this.view.displayContacts(matches);
    this.view.displayBackButton()
  }

  handleBackButton() {
    this.view.displayBackButton();
    this.view.displayContacts(this.model.contacts);
    this.view.hideBackButton();
  }

  bindEvents() {
    this.view.bindSearchBar(this.handleSearchBar.bind(this));

    this.view.bindAddButtons(this.handleAddButtonsClick.bind(this));

    this.view.bindCancelButton(this.view.contactForm, this.handleCancelButtonClick.bind(this));

    this.view.bindCancelButton(this.view.editForm, this.handleCancelEditButtonClick.bind(this));

    this.view.bindSubmitButton(this.view.contactForm, this.handleSubmitButton.bind(this));

    this.view.bindSubmitButton(this.view.editForm, this.handleSubmitEditButton.bind(this));

    this.view.bindContactListActions(this.handleDeleteContactButton.bind(this), this.handleEditContactButton.bind(this));

    this.view.bindTagSearch(this.handleTagSearch.bind(this));

    this.view.bindBackButton(this.handleBackButton.bind(this));

    this.view.bindAddTagButton(this.handleAddTag.bind(this), 'add-contact-form');
    
    this.view.bindAddTagButton(this.handleAddTag.bind(this), 'edit-contact-form');
  }
}
