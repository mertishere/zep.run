const EMAIL_REGEXP = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const USRENAME_REGEXP = /^[A-Za-z_]{1,30}$/;
const PACKAGE_NAME_REGEXP = /^[A-Za-z-]{1,20}$/;
const RELEASE_REGEXP = /^[A-Za-z_]{1,40}$/;

module.exports = {
  EMAIL_REGEXP,
  USRENAME_REGEXP,
  PACKAGE_NAME_REGEXP,
  RELEASE_REGEXP,
};
