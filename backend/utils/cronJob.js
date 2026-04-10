const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { sendRenewalReminder, sendMembershipExpired, sendSessionReminder } = require('./emailService');

const initCronJobs = () => {
  // 1. Membership Expiry Check (Daily at 00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily membership expiry check...');
    
    try {
      const today = new Date();
      
      // Find subscriptions expiring in exactly 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const expiringSoon = await Subscription.find({
        status: 'active',
        endDate: {
          $gte: new Date(sevenDaysFromNow.setHours(0, 0, 0, 0)),
          $lte: new Date(sevenDaysFromNow.setHours(23, 59, 59, 999))
        }
      }).populate('user').populate('plan');

      for (const sub of expiringSoon) {
        if (sub.user && sub.user.email) {
          await sendRenewalReminder(sub.user, sub.plan.name, sub.endDate);
          console.log(`Sent renewal reminder to ${sub.user.email}`);
        }
      }

      // Find subscriptions that expired today
      const expiredToday = await Subscription.find({
        status: 'active',
        endDate: { $lt: today }
      }).populate('user').populate('plan');

      for (const sub of expiredToday) {
        sub.status = 'expired';
        await sub.save();
        
        if (sub.user && sub.user.email) {
          await sendMembershipExpired(sub.user, sub.plan.name);
          console.log(`Sent expiry notice to ${sub.user.email}`);
        }
      }

    } catch (error) {
      console.error('Error in membership cron job:', error);
    }
  });

  // 2. Session Reminders (Hourly)
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly session reminder check...');
    
    try {
      const now = new Date();
      
      // Check for 24h Reminders
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const bookings24h = await Booking.find({
        status: 'confirmed',
        'remindersSent.dayBefore': false,
        date: {
          $gte: new Date(twentyFourHoursFromNow.getTime() - 30 * 60 * 1000), // 30 min window
          $lte: new Date(twentyFourHoursFromNow.getTime() + 30 * 60 * 1000)
        }
      }).populate('user').populate('trainer');

      for (const booking of bookings24h) {
        if (booking.user && booking.user.email) {
          await sendSessionReminder(booking.user, booking.trainer, booking, '24-Hour');
          booking.remindersSent.dayBefore = true;
          await booking.save();
          console.log(`Sent 24h reminder for booking ${booking._id}`);
        }
      }

      // Check for 1h Reminders
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const bookings1h = await Booking.find({
        status: 'confirmed',
        'remindersSent.hourBefore': false,
        date: {
          $gte: new Date(oneHourFromNow.getTime() - 15 * 60 * 1000), // 15 min window
          $lte: new Date(oneHourFromNow.getTime() + 15 * 60 * 1000)
        }
      }).populate('user').populate('trainer');

      for (const booking of bookings1h) {
        if (booking.user && booking.user.email) {
          await sendSessionReminder(booking.user, booking.trainer, booking, '1-Hour');
          booking.remindersSent.hourBefore = true;
          await booking.save();
          console.log(`Sent 1h reminder for booking ${booking._id}`);
        }
      }

    } catch (error) {
      console.error('Error in session reminder cron job:', error);
    }
  });

  console.log('Cron Jobs Initialized Successfully.');
};

module.exports = initCronJobs;
