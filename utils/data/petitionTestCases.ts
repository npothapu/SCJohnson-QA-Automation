export const testCases = [
  {
    id: 'TC_PF_BLANK_REQUIRED_FIELDS_01',
    tags: '@petitionform-desktop @negative',
    title: 'should show errors for blank required fields',
    data: { firstName: '', lastName: '', email: '', zipCode: '' },
    assertions: [
      { field: 'First Name', text: 'This field is required.' },
      { field: 'Last Name', text: 'This field is required.' },
      { field: 'Email', text: 'Please enter a valid email address' },
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  {
    id: 'TC_PF_INVALID_EMAIL_AND_ZIP_02',
    tags: '@petitionform-desktop @negative',
    title: 'should show error for invalid email and zip code format',
    data: { firstName: 'John', lastName: 'Smith', email: 'invalidemail', zipCode: '12' },
    assertions: [
      { field: 'Email', text: 'Please enter a valid email address' },
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  {
    id: 'TC_PF_EMAIL_MISSING_AT_03',
    tags: '@petitionform-desktop @negative',
    title: 'should show error for email missing "@" symbol',
    data: { firstName: 'John', lastName: 'Doe', email: 'john.doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Email', text: 'Please enter a valid email address' },
    ]
  },
  {
    id: 'TC_PF_ZIP_CONTAINS_LETTERS_04',
    tags: '@petitionform-desktop @negative',
    title: 'should show error for zip code containing letters',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '12a45' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  {
    id: 'TC_PF_ZIP_TOO_SHORT_05',
    tags: '@petitionform-desktop @negative',
    title: 'should show error for zip code too short',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '123' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  {
    id: 'TC_PF_ZIP_TOO_LONG_06',
    tags: '@petitionform-desktop @negative',
    title: 'should show error for zip code too long',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '1234567890' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },

];