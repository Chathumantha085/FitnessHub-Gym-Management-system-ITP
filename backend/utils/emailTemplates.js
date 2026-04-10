const registrationConfirmation = (name) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Registration Received</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Welcome to <strong>ITP Fitness Hub</strong>! We've successfully received your registration application and payment slip.</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #1e293b; border-radius: 16px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; font-size: 14px; color: #3b82f6; font-weight: bold; text-transform: uppercase;">Next Steps</p>
          <p style="margin: 5px 0 0 0; font-size: 15px;">Our administrative team is currently reviewing your application and payment proof. You will receive another email once your account has been reviewed.</p>
        </div>
        <p style="font-size: 14px; color: #64748b;">This process typically takes 12-24 hours. Thank you for your patience!</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const accountApproved = (name) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Welcome Aboard!</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Great news, <strong>${name}</strong>!</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your <strong>ITP Fitness Hub</strong> account has been officially <strong>APPROVED</strong>. You are now a part of our elite fitness community.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">LOGIN TO YOUR DASHBOARD</a>
        </div>
        <p style="font-size: 14px; color: #64748b; text-align: center;">Get ready to crush your fitness goals!</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const accountRejected = (name, reason) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Update on Your Application</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Thank you for your interest in joining ITP Fitness Hub. After reviewing your application, we are unable to approve it at this time.</p>
        <div style="margin: 30px 0; padding: 20px; background-color: #7f1d1d; border-radius: 16px; border-left: 4px solid #ef4444; color: #fecaca;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Rejection Reason</p>
          <p style="margin: 5px 0 0 0; font-size: 15px;">${reason}</p>
        </div>
        <p style="font-size: 14px; color: #64748b;">If you believe this is a mistake or if you'd like to provide more information, please contact our support team.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const accountQR = (name) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Your Member QR Code</h1>
      </div>
      <div style="padding: 40px; text-align: center;">
        <p style="font-size: 18px; line-height: 1.6; text-align: left;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: left;">Here is your unique member QR code for checking in and out of <strong>ITP Fitness Hub</strong>. Please keep this code safe or save it on your mobile device.</p>
        
        <div style="margin: 40px 0; display: inline-block; padding: 20px; background-color: white; border-radius: 24px; border: 8px solid #1e293b;">
          <img src="cid:member-qr" alt="Member QR Code" style="width: 250px; height: 250px; display: block;" />
        </div>

        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">Simply scan this code at the reception desk upon your arrival.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const trainerWelcome = (name, email, password) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Team!</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">You have been officially added as a <strong>Trainer</strong> at ITP Fitness Hub. We are excited to have you on board!</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border: 1px solid #312e81;">
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #818cf8; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Your Login Credentials</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <p style="margin: 0; font-size: 15px; color: #f8fafc;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0; font-size: 15px; color: #f8fafc;"><strong>Temporary Password:</strong> <span style="background-color: #312e81; padding: 4px 8px; border-radius: 6px; font-family: monospace; color: #c7d2fe;">${password}</span></p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">LOGIN TO YOUR ACCOUNT</a>
        </div>

        <p style="font-size: 13px; color: #475569; font-style: italic;">* Please change your password after your first login for security reasons.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const renewalReminder = (name, planName, expiryDate) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Plan Renewal Reminder</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your <strong>${planName}</strong> plan is set to expire on <strong>${new Date(expiryDate).toLocaleDateString()}</strong>. Don't let your progress stop!</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 15px; color: #f8fafc;">Renew now to ensure uninterrupted access to the gym and your personalized training stats.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: #f59e0b; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">RENEW MEMBERSHIP NOW</a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const membershipExpired = (name, planName) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Membership Expired</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your <strong>${planName}</strong> plan has expired today. We've missed seeing you at the hub!</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; font-size: 15px; color: #f8fafc;">Your access QR code has been temporarily deactivated. Please renew your membership to continue your fitness journey with us.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: #ef4444; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">RENEW NOW TO RE-ACTIVATE</a>
        </div>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const dietPlanAssigned = (name, planName) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">New Diet Plan Assigned</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your trainer has assigned a new strategic nutritional protocol to your profile: <strong>${planName}</strong>.</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #6366f1;">
            <p style="margin: 0; font-size: 15px; color: #f8fafc;">Log in to your dashboard to view the full details of your meals, macros, and timing deployment.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">VIEW MY DIET PLAN</a>
        </div>

        <p style="font-size: 14px; color: #64748b; text-align: center;">Precision in nutrition is the foundation of peak performance.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const sessionBookedTemplate = (userName, trainerName, date, timeSlot) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Session Confirmed</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your personal training session with <strong>Coach ${trainerName}</strong> has been successfully booked!</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #6366f1;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #818cf8; font-weight: bold; text-transform: uppercase;">Logistics Overview</p>
          <p style="margin: 0; font-size: 16px;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Time:</strong> ${timeSlot}</p>
        </div>

        <p style="font-size: 14px; color: #64748b;">Please arrive 5 minutes early to prepare for your session. If you need to reschedule, please do so at least 12 hours in advance.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
`;

const sessionReminderTemplate = (userName, trainerName, date, timeSlot, type) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Session Reminder</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Get ready, <strong>${userName}</strong>!</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">This is a <strong>${type}</strong> reminder for your upcoming session with <strong>Coach ${trainerName}</strong>.</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 16px;"><strong>Timestamp:</strong> ${timeSlot}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Location:</strong> Main Gym Floor</p>
        </div>

        <p style="font-size: 14px; color: #64748b;">Consistency is the key to transformation. See you at the hub!</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
`;

const sessionCancelledTemplate = (userName, trainerName, date, timeSlot) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Session Cancelled</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your scheduled session with <strong>Coach ${trainerName}</strong> for <strong>${new Date(date).toLocaleDateString()}</strong> at <strong>${timeSlot}</strong> has been cancelled.</p>
        <p style="font-size: 14px; color: #64748b;">If you wish to reschedule, please visit your dashboard to view available slots.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
`;

const sessionRescheduledTemplate = (userName, trainerName, newDate, newTimeSlot) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Session Rescheduled</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your session with <strong>Coach ${trainerName}</strong> has been moved to a new time slot.</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #a855f7;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #a855f7; font-weight: bold; text-transform: uppercase;">Updated Logistics</p>
          <p style="margin: 0; font-size: 16px;"><strong>New Date:</strong> ${new Date(newDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>New Time:</strong> ${newTimeSlot}</p>
        </div>

        <p style="font-size: 14px; color: #64748b;">Your progress remains our top priority. See you at the new time!</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
`;

const sessionFeedbackRequestTemplate = (userName, trainerName) => `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Session Complete!</h1>
      </div>
      <div style="padding: 40px; text-align: center;">
        <p style="font-size: 18px; line-height: 1.6; text-align: left;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8; text-align: left;">Congratulations on completing your session with <strong>Coach ${trainerName}</strong>! How was your experience?</p>
        
        <div style="margin: 40px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">SUBMIT PERFORMANCE FEEDBACK</a>
        </div>

        <p style="font-size: 14px; color: #64748b;">Your feedback helps us maintain at absolute peak performance levels.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
`;

const paymentConfirmed = (name, planName, amount, endDate) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Payment Approved!</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Great news, <strong>${name}</strong>!</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">Your payment has been verified and your <strong>ITP Fitness Hub</strong> membership is now <strong>ACTIVE</strong>. Get ready to crush your goals!</p>
        
        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #10b981;">
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #34d399; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Membership Details</p>
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #f8fafc;"><strong>Plan:</strong> ${planName}</p>
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #f8fafc;"><strong>Amount Paid:</strong> Rs.${Number(amount).toLocaleString()}</p>
          <p style="margin: 0; font-size: 15px; color: #f8fafc;"><strong>Valid Until:</strong> ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);">GO TO MY DASHBOARD</a>
        </div>
        <p style="font-size: 14px; color: #64748b; text-align: center;">Welcome to the ITP Fitness Hub family. Your journey starts now!</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

const paymentRejected = (name, planName, amount, reason) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="padding: 40px; text-align: center; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
        <h1 style="margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Payment Not Approved</h1>
      </div>
      <div style="padding: 40px;">
        <p style="font-size: 18px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.6; color: #94a3b8;">We were unable to verify your payment of <strong>Rs.${Number(amount).toLocaleString()}</strong> for the <strong>${planName}</strong> plan. Please review the details below and resubmit.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #7f1d1d; border-radius: 16px; border-left: 4px solid #ef4444; color: #fecaca;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Reason for Rejection</p>
          <p style="margin: 5px 0 0 0; font-size: 15px;">${reason || 'The payment slip could not be verified. Please ensure you upload a clear, valid payment receipt.'}</p>
        </div>

        <div style="margin: 30px 0; padding: 25px; background-color: #1e293b; border-radius: 20px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #fbbf24; font-weight: bold; text-transform: uppercase;">Next Steps</p>
          <p style="margin: 0; font-size: 15px; color: #f8fafc;">Please log in to your dashboard, upload a valid payment proof, and resubmit for review. Our team will process it within 12–24 hours.</p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">RESUBMIT PAYMENT</a>
        </div>
        <p style="font-size: 14px; color: #64748b; text-align: center;">If you believe this is an error, please contact our support team.</p>
      </div>
      <div style="padding: 20px; text-align: center; background-color: #1e293b; color: #475569; font-size: 12px;">
        &copy; 2025 ITP Fitness Hub HQ. All rights reserved.
      </div>
    </div>
  `;
};

module.exports = {
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
};
