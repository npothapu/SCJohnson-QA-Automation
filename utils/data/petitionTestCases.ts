export const testCases = [
  // All fields blank, should show required errors.
  {
    id: 'TC_PF_001',
    tags: '@petitionform @negative',
    title: 'should show errors for blank required fields',
    data: { firstName: '', lastName: '', email: '', zipCode: '' },
    assertions: [
      { field: 'First Name', text: 'This field is required.' },
      { field: 'Last Name', text: 'This field is required.' },
      { field: 'Email', text: 'Please enter a valid email address' },
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  // Invalid email and zip code formats.
  {
    id: 'TC_PF_002',
    tags: '@petitionform @negative',
    title: 'should show error for invalid email and zip code format',
    data: { firstName: 'John', lastName: 'Smith', email: 'invalidemail', zipCode: '12' },
    assertions: [
      { field: 'Email', text: 'Please enter a valid email address' },
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  // Email missing "@" symbol.
  {
    id: 'TC_PF_003',
    tags: '@petitionform @negative',
    title: 'should show error for email missing "@" symbol',
    data: { firstName: 'John', lastName: 'Doe', email: 'john.doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Email', text: 'Please enter a valid email address' },
    ]
  },
  // Zip code contains letters.
  {
    id: 'TC_PF_004',
    tags: '@petitionform @negative',
    title: 'should show error for zip code containing letters',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '12a45' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  // First name contains numbers.
  {
    id: 'TC_PF_005',
    tags: '@petitionform @negative',
    title: 'should show error for first name containing numbers',
    data: { firstName: 'John1', lastName: 'Doe', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'First Name', text: 'Please enter a valid first name' },
    ]
  },
  // Last name contains special characters.
  {
    id: 'TC_PF_006',
    tags: '@petitionform @negative',
    title: 'should show error for last name containing special characters',
    data: { firstName: 'John', lastName: 'Doe@', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Last Name', text: 'Please enter a valid last name' },
    ]
  },
  // First name too short (1 character).
  {
    id: 'TC_PF_007',
    tags: '@petitionform @negative',
    title: 'should show error for first name too short',
    data: { firstName: 'J', lastName: 'Doe', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'First Name', text: 'First Name must be at least 2 characters' },
    ]
  },
  // First name too long (over 50 characters).
  {
    id: 'TC_PF_008',
    tags: '@petitionform @negative',
    title: 'should show error for first name too long',
    data: { firstName: 'J'.repeat(51), lastName: 'Doe', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'First Name', text: 'First Name must be less than 50 characters' },
    ]
  },
  // Zip code too short.
  {
    id: 'TC_PF_009',
    tags: '@petitionform @negative',
    title: 'should show error for zip code too short',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '123' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  // Zip code too long.
  {
    id: 'TC_PF_010',
    tags: '@petitionform @negative',
    title: 'should show error for zip code too long',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '1234567890' },
    assertions: [
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  },
  // All valid data, should submit successfully.
  {
    id: 'TC_PF_011',
    tags: '@petitionform @positive',
    title: 'should allow submit with all valid data',
    data: { firstName: 'John', lastName: 'Doe', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Form', text: 'Thank you for signing the petition' },
    ]
  },
  // Boundary valid names and zip code.
  {
    id: 'TC_PF_012',
    tags: '@petitionform @positive',
    title: 'should allow submit with boundary valid values',
    data: { firstName: 'Jo', lastName: 'Do', email: 'john@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Form', text: 'Thank you for signing the petition' },
    ]
  },
  // Email contains spaces.
  {
    id: 'TC_PF_013',
    tags: '@petitionform @negative',
    title: 'should show error for email with spaces',
    data: { firstName: 'John', lastName: 'Doe', email: 'john doe@doe.com', zipCode: '12345' },
    assertions: [
      { field: 'Email', text: 'Please enter a valid email address' },
    ]
  },
  // All fields filled with spaces only.
  {
    id: 'TC_PF_014',
    tags: '@petitionform @negative',
    title: 'should show errors for fields filled with spaces',
    data: { firstName: '   ', lastName: '   ', email: '   ', zipCode: '   ' },
    assertions: [
      { field: 'First Name', text: 'This field is required.' },
      { field: 'Last Name', text: 'This field is required.' },
      { field: 'Email', text: 'Please enter a valid email address' },
      { field: 'Zip Code', text: 'Please enter a valid zip code' },
    ]
  }
];