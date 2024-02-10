export class View {
  constructor() {
    this.contactForm = document.querySelector('#add-contact-form');
    this.editForm = document.querySelector('#edit-contact-form');
    this.searchBar = document.querySelector('.search-bar');
    this.addButtons = document.querySelectorAll('.add-button');
    this.contactList = document.querySelector('.contact-list');
  }

  bindSearchBar(handler) {
    this.searchBar.addEventListener('input', event => {
      const input = event.target;
      handler(input.value)
    });
  }

  bindAddButtons(handler) {
    this.addButtons.forEach(button => {
      button.addEventListener('click', handler);
    });
  }

  bindCancelButton(form, handler) {
    const cancelBtn = form.querySelector('.cancel-button');
    cancelBtn.addEventListener('click', handler)
  }

  bindCancelEditButton(form, handler) {
    const cancelBtn = form.querySelector('.cancel-button');
    cancelBtn.addEventListener('click', handler);
  }

  bindSubmitButton(form, handler) {
    form.addEventListener('submit',  async event => {
      event.preventDefault();
      await handler();
    });
  }

  bindContactListActions(deleteHandler, editHandler) {
    this.contactList.addEventListener('click', event => {
      const target = event.target;

      const contactItem = target.closest('.contact-item');
      const id = contactItem.getAttribute('data-id');

      if (!contactItem) return;

      if (target.classList.contains('delete')) {
        if (window.confirm('Are You Sure?')) {
          deleteHandler(id);
        } 
      } else if (target.classList.contains('edit')) {
        editHandler(id);
      }  
    });
  }

  bindTagSearch(handler) {
    const tags = this.contactList
    tags.addEventListener('click', event => {
      event.preventDefault();
      const target = event.target;

      if (target.tagName === 'A') {
        handler(target.textContent.trim());
      }
    });
  }

  bindAddTagButton(handler, formId) {
    const newTagButton = document.querySelector(`#${formId} #add_tag_button`);
    const newTagInput = document.querySelector(`#${formId} #new_tag`);
  
    newTagButton.addEventListener('click', event => {
      event.preventDefault();
      const newTag = newTagInput.value.trim();

      handler(newTag, formId);
    });
  }

  bindBackButton(handler) {
    const button = document.querySelector('#back-button');

    button.addEventListener('click', event => {
      event.preventDefault();
      handler()
    });
  }

  getCurrentTags(formId) {
    const tagsContainer = document.querySelector(`#${formId} #tags_container`);
    const tags = tagsContainer.querySelectorAll('input');
    return [...tags].map(input => input.value);
  }

  addTag(tagName, formId) {
    const tagsContainer = document.querySelector(`#${formId} #tags_container`);
    const label = document.createElement('label');
    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.name = 'tags';
    checkBox.value = tagName.toLowerCase();
    label.appendChild(checkBox);
    label.append(`${tagName}`);

    tagsContainer.appendChild(label);
  }

  repopulateTags(tags) {
    tags.forEach(tag => {
      this.addTag(tag, 'add-contact-form');
      this.addTag(tag, 'edit-contact-form');
    });
  }

  displayNewTagError(formId) {
    const message = document.querySelector(`#${formId} #tag_error_message`);
    const newTagInput = document.querySelector(`#${formId} #new_tag`); 
    message.textContent = "This tag already exists."
    message.classList.remove('hidden');

    newTagInput.classList.add('error');
  }

  hideNewTagError(formId) {
    const message = document.querySelector(`#${formId} #tag_error_message`);
    const newTagInput = document.querySelector(`#${formId} #new_tag`); 

    message.classList.add('hidden');

    newTagInput.classList.remove('error')
  }

  toggleContactForm() {
    const header = document.querySelector('.header-actions');
    const noContact = document.querySelector('.no-contacts');
    const contactList = document.querySelector('.contact-list');

    header.classList.toggle('hidden');
    
    if (contactList) {
      contactList.classList.toggle('hidden');
    }

    this.contactForm.classList.toggle('hidden');

    if (!this.contactForm.classList.contains('hidden') || !this.contactList.classList.contains('hidden')) {
      noContact.classList.add('hidden');
    } else {
      noContact.classList.remove('hidden');
    }
  }

  toggleEditForm() {
    const header = document.querySelector('.header-actions');
    const noContact = document.querySelector('.no-contacts');
    header.classList.toggle('hidden');
    this.contactList.classList.toggle('hidden');
    this.editForm.classList.toggle('hidden');

    if (!this.editForm.classList.contains('hidden') || !this.contactList.classList.contains('hidden')) {
      noContact.classList.add('hidden');
    } else {
      noContact.classList.remove('hidden');
    }
  }

  populateEditForm(contactData) {
    this.editForm.querySelector('#full_name').value = contactData.full_name;
    this.editForm.querySelector('#email').value = contactData.email;
    this.editForm.querySelector('#phone_number').value = contactData.phone_number;

    document.querySelectorAll('#edit-contact-form [name="tags"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    if (contactData.tags && contactData.tags.length > 0) {
      contactData.tags.forEach(tag => {
        const checkbox = document.querySelector(`#edit-contact-form [name="tags"][value="${tag}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
  }

  getFormInfo(form) {
    const currentForm = form.querySelector('form');
    const formData = new FormData(currentForm);
    const info = {}
    const tags = [];
    
    for (const [key,value] of formData) {
      if (key === 'tags') {
        tags.push(value);
        info[key] = tags;
      } else {
        info[key] = value;
      }
    }
    return info;
  }

  renderContacts(contacts) {
    Handlebars.registerPartial('tags', document.querySelector('#tags-template').innerHTML);
    const contactList = document.querySelector('.contact-list');
    const contactTemplate = document.querySelector('#contact-list-template').innerHTML;
    const template = Handlebars.compile(contactTemplate)
    const html = template({contacts});
    contactList.innerHTML = html;
  }

  displayContacts(contacts) {
    const noContacts = document.querySelector('.no-contacts');
    const contactList = document.querySelector('.contact-list');
    if (contacts.length > 0) {
      noContacts.classList.add('hidden');
      this.renderContacts(contacts);
    } else {
      noContacts.classList.remove('hidden');
      contactList.classList.add('hidden');
    }
  }

  contactNotFound(input) {
    const p = document.querySelector('.not-found p');
    const div = document.querySelector('.not-found');
    
    if (input.length > 0) {
      if (div.classList.contains('hidden')) {
        div.classList.remove('hidden');
      }
      p.textContent = `There is no contacts starting with ${input}`;
      this.contactList.classList.add('hidden');
    } else if (input.length === 0){
      div.classList.add('hidden');
      this.contactList.classList.remove('hidden');
    }
  }

  displayErrorMessage(element, message) {
    const errorMessage = element.nextElementSibling
    element.classList.add('error');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  }

  hideErrorMessage(element) {
    const errorMessage = element.nextElementSibling
    errorMessage.classList.add('hidden');
    element.classList.remove('error');
  }

  displayValidationErrors(validation, form) {
    const nameInput = form.querySelector('#full_name');
    const phoneNumberInput = form.querySelector('#phone_number');
    const emailInput = form.querySelector('#email');

    [nameInput, phoneNumberInput, emailInput].forEach(this.hideErrorMessage);

    if (!validation.fullName) {
      this.displayErrorMessage(nameInput, 'Please Enter A Valid Name');
    } else {
      this.hideErrorMessage(nameInput);
    }
    if (!validation.phoneNumber) {
      this.displayErrorMessage(phoneNumberInput, 'Please Enter A Valid Phone Number')
    } else {
      this.hideErrorMessage(phoneNumberInput);
    }
    if (!validation.email) {
      this.displayErrorMessage(emailInput, 'Please Enter A Valid Email')
    } else {
      this.hideErrorMessage(emailInput);
    }
  }

  resetContactForm() {
    const form = this.contactForm.querySelector('form');
    form.reset();
  }

  resetEditForm() {
    const form = this.editForm.querySelector('form');
    form.reset();
  }

  displayBackButton() {
    document.querySelector('#back-button').classList.remove('hidden');
  }

  hideBackButton(){
    document.querySelector('#back-button').classList.add('hidden');
  }
}