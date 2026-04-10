const nodemailer = require('nodemailer');
const { 
  registrationConfirmation, 
  accountApproved, 
  accountRejected, 
  accountQR, 
  trainerWelcome, 
  renewalReminder, 
  membershipExpired, 
  dietPlanAssigned,
  sessionBookedTemplate,
  sessionReminderTemplate,
  sessionCancelledTemplate,
  sessionRescheduledTemplate,
  sessionFeedbackRequestTemplate,
  paymentConfirmed,
  paymentRejected,
} = require('./emailTemplates');

// Create a reusable transporter using the Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generic send function
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const info = await transporter.sendMail({
      from: `"ITP Fitness Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Specific notification functions
const sendRegistrationConfirm = async (user) => {
  const html = registrationConfirmation(user.name);
  return await sendEmail(user.email, 'Your ITP Fitness Hub Application', html);
};

const sendApprovalEmail = async (user) => {
  const html = accountApproved(user.name);
  return await sendEmail(user.email, 'Your Account Has Been Approved!', html);
};

const sendRejectionEmail = async (user, reason) => {
  const html = accountRejected(user.name, reason);
  return await sendEmail(user.email, 'Update on Your Application', html);
};

const sendMemberQR = async (user, qrDataUrl) => {
  const html = accountQR(user.name);
  const attachments = [
    {
      filename: 'member-qr.png',
      content: qrDataUrl.split('base64,')[1],
      encoding: 'base64',
      cid: 'member-qr', // cid matches the <img src="cid:member-qr" /> in the template
    },
  ];
  return await sendEmail(user.email, 'Your ITP Fitness Hub Access QR Code', html, attachments);
};

const sendTrainerWelcome = async (user, password) => {
  const html = trainerWelcome(user.name, user.email, password);
  return await sendEmail(user.email, 'Important: Your Trainer Account Login Details', html);
};

const sendRenewalReminder = async (user, planName, expiryDate) => {
  const html = renewalReminder(user.name, planName, expiryDate);
  return await sendEmail(user.email, 'Gym Membership Renewal Reminder', html);
};

const sendMembershipExpired = async (user, planName) => {
  const html = membershipExpired(user.name, planName);
  return await sendEmail(user.email, 'Your Gym Membership Has Expired', html);
};

const sendDietPlanEmail = async (user, planName) => {
  const html = dietPlanAssigned(user.name, planName);
  return await sendEmail(user.email, 'New Diet Plan Assigned!', html);
};

const sendSessionBooking = async (user, trainer, booking) => {
  const html = sessionBookedTemplate(user.name, trainer.name, booking.date, booking.timeSlot);
  return await sendEmail(user.email, 'Session Confirmation: ITP Fitness Hub', html);
};

const sendSessionReminder = async (user, trainer, booking, type) => {
  const html = sessionReminderTemplate(user.name, trainer.name, booking.date, booking.timeSlot, type);
  return await sendEmail(user.email, `${type} Reminder: Personal Training Session`, html);
};

const sendSessionCancellation = async (user, trainer, booking) => {
  const html = sessionCancelledTemplate(user.name, trainer.name, booking.date, booking.timeSlot);
  return await sendEmail(user.email, 'Session Cancellation Alert', html);
};

const sendSessionReschedule = async (user, trainer, booking) => {
  const html = sessionRescheduledTemplate(user.name, trainer.name, booking.date, booking.timeSlot);
  return await sendEmail(user.email, 'Action Required: Session Rescheduled', html);
};

const sendSessionFeedbackRequest = async (user, trainer) => {
  const html = sessionFeedbackRequestTemplate(user.name, trainer.name);
  return await sendEmail(user.email, 'How was your session today?', html);
};

const sendPaymentConfirmedEmail = async (user, planName, amount, endDate) => {
  const html = paymentConfirmed(user.name, planName, amount, endDate);
  return await sendEmail(user.email, '✅ Payment Approved – Membership Activated!', html);
};

const sendPaymentRejectedEmail = async (user, planName, amount, reason) => {
  const html = paymentRejected(user.name, planName, amount, reason);
  return await sendEmail(user.email, '⚠️ Payment Not Approved – Action Required', html);
};

module.exports = {
  sendRegistrationConfirm,
  sendApprovalEmail,
  sendRejectionEmail,
  sendMemberQR,
  sendTrainerWelcome,
  sendRenewalReminder,
  sendMembershipExpired,
  sendDietPlanEmail,
  sendSessionBooking,
  sendSessionReminder,
  sendSessionCancellation,
  sendSessionReschedule,
  sendSessionFeedbackRequest,
  sendPaymentConfirmedEmail,
  sendPaymentRejectedEmail,
};
