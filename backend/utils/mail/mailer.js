require("dotenv").config();
const {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
  SendSmtpEmailToInner,
} = require("@getbrevo/brevo");

const mailer = async (params) => {
  try {
    const transactionalEmailsApi = new TransactionalEmailsApi();
    transactionalEmailsApi.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO,
    );

    const sendSmtpEmail = new SendSmtpEmail();
    let to = new SendSmtpEmailToInner();
    to.email = params.email;
    to.name = "Skribbla User";

    sendSmtpEmail.to = [to];
    sendSmtpEmail.templateId = params.templateId;
    sendSmtpEmail.params = params.parameters;

    const response =
      await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    if (response.response.errored) {
      console.error(response.response.errored);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  mailer,
};
