// https://github.com/getbrevo/brevo-node
const brevo = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new brevo.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  // Khởi tạo sendSmtpEmail với những thông tin cần thiết
  let sendSmtpEmail = new brevo.SendSmtpEmail()

  // Tài khoản gửi mail: lưu ý địa chỉ admin email phải là cái email tạo tài khoản trên brevo
  sendSmtpEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tài khoản nhận mail
  // 'to' phải là một Array để sau chúng ta có thể tùy biến gửi 1 email tới nhiều user
  sendSmtpEmail.to = [{ email: recipientEmail }]

  // tiêu đề của email
  sendSmtpEmail.subject = customSubject

  // nội dung email dạng HTML
  sendSmtpEmail.htmlContent = customHtmlContent

  // Gọi hành động gửi mail
  // sendTransacEmail sẽ trả về một Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}