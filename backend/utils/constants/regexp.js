const EMAIL_REGEXP = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const USRENAME_REGEXP = /^[a-zA-Z0-9_]{3,30}$/;
const PACKAGE_NAME_REGEXP = /^[a-z-]{2,20}$/;
const RELEASE_REGEXP = /^([a-zA-Z]+)?[0-9]+\\.[0-9]+(\\.[0-9]+)?{1,30}$/;

module.exports = {
  EMAIL_REGEXP,
  USRENAME_REGEXP,
  PACKAGE_NAME_REGEXP,
  RELEASE_REGEXP,
};
