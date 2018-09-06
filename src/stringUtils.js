const moment = require('moment');

const properCase = (word) => {
  return ((typeof word === 'string') && (word.length >= 1)) ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word;
};

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name) => {
  return isBlank(name) ? '' : name.split('-').map(properCase).join('-');
};

function isBlank (str) {
  return (!str || /^\s*$/.test(str));
}

const toFullName = ({ firstName, lastName, name }) =>
  !isBlank(name) ? name.split(' ').map(properCaseName).join(', ') :
    (!isBlank(lastName) ? `${properCaseName(lastName)}, ` : '') + (!isBlank(firstName) ? properCaseName(firstName) : '');

const getHoursMinutes = (timestamp) => {
  const indexOfT = timestamp.indexOf('T');
  if (indexOfT < 0) {
    return '';
  }
  return timestamp.substr(indexOfT + 1, 5);
};

const isToday = (date) => {
  if (date === 'Today') {
    return true;
  }
  const searchDate = moment(date, 'DD/MM/YYYY');
  return searchDate.isSame(moment(), "day");
};

const getPrisonDescription = user => {
  const caseLoadOption = user.caseLoadOptions ? user.caseLoadOptions.find((option) => option.caseLoadId === user.activeCaseLoadId) : undefined;
  return caseLoadOption ? caseLoadOption.description : user.activeCaseLoadId;
};

module.exports = {
  properCase, properCaseName, toFullName, getHoursMinutes, isToday, getPrisonDescription
};
