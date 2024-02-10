export class Model {
  #DOMAIN = 'http://localhost:3000/api/';
  constructor() {
    this.lastId = 0;
    this.contacts = [];
    this.defaultTags = ['marketing', 'sales', 'engineering', 'admin', 'customer service'];
    this.currentTags = [];
  }

  generateNextId() {
    this.lastId += 1;
    return this.lastId;
  }

  getUniqueTags(tags) {
    const result = [];
    tags.forEach(tag => {
      if (!result.includes(tag) && !this.defaultTags.includes(tag)) {
        result.push(tag);
      }
    });
    return result;
  }

  getCurrentTags() {
    return this.currentTags;
  }

  async makeRequest(path, method, headers, body = null) {
    const url = this.#makeUrl(path);
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`status: ${response.status} - ${errorText} `);
      }

      return await response.json();
    } catch(error) {
      throw error;
    }
  }

  async deleteContact(id) {
    const path = `contacts/${id}`;
    const method = 'DELETE';
    await this.makeRequest(path, method, {'Content-Type': 'application/json'});
  }

  search(input) {
    return this.contacts.filter(contact => {
      return contact.full_name.includes(input) || contact.tags.includes(input);
    });
  }

  isValidEmail(email) {
    return /.+@.+\../.test(email);
  }

  isValidPhoneNumber(phoneNumber) {
    return phoneNumber.length > 0 && /\S/.test(phoneNumber)
  }

  isValidName(name) {
    return name.length > 0 && /\S/.test(name);
  }

  validateInputs(formInfo) {
    let validaTionResults = {
      fullName: this.isValidName(formInfo.full_name),
      email: this.isValidEmail(formInfo.email),
      phoneNumber: this.isValidPhoneNumber(formInfo.phone_number)
    }

    return validaTionResults;
  }

  #makeUrl(path) {
    return this.#DOMAIN + path + '/';
  }
}