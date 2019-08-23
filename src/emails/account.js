const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    console.log('Sending email ...')
    sgMail.send({
        to: email,
        from: 'phantomsg@icloud.com',
        subject: 'Welcome to TaskApp',
        text: `Welcome to the app ${name}. Let me know you get along with the app.`
    })
    console.log('Email sent successfully!')
}

const sendCancellationEmail = (email, name) => {
    console.log('Sending cancel email ...')
    sgMail.send({
        to: email,
        from: 'phantomsg@icloud.com',
        subject: `Sorry to see you go ${name}!`,
        text: `Dear ${name}, We are sorry to see you leave. Is there something we could've done to stay with us?`
    })
    console.log('Email sent successfully!')
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}
