const EMAIL_REGEXP = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
const USRENAME_REGEXP = /^[A-Za-z_]{1,30}$/;
const PACKAGE_NAME_REGEXP = /^[a-z-]{1,20}$/;
const RELEASE_REGEXP =
  /^(?:[a-zA-Z]+)?\d+(?:\.\d+)*(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

module.exports = {
  EMAIL_REGEXP,
  USRENAME_REGEXP,
  PACKAGE_NAME_REGEXP,
  RELEASE_REGEXP,
};
