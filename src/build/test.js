function addOrganizations(organizations, currentData){
  const { organization: { government, country, acronym = '' } } = currentData;

  const hasCountryCode = government || country;
  const name           = hasCountryCode ? this.getCountryNameByCode(hasCountryCode) : '';
  const orgExists      = _.find(organizations, { name });
  const newOrg         = { name, acronym, contacts: [] };

  if(!orgExists) organizations.push(newOrg);

  const { contacts } = orgExists? orgExists : newOrg

  this.addContacts(contacts, currentData);
}