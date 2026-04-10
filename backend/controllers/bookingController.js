const Booking = require('../models/Booking');
const User = require('../models/User');
const { 
  sendSessionBooking, 
  sendSessionCancellation, 
  sendSessionReschedule, 
  sendSessionFeedbackRequest 
} = require('../utils/emailService');

// @desc    Get all available trainers for booking
// @route   GET /api/bookings/trainers
// @access  Private
exports.getAvailableTrainers = async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', status: 'approved' }).select('name email contactNumber specialization bio hourlyRate yearsExperience');
    res.status(200).json({ success: true, count: trainers.length, data: trainers });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Check trainer availability for a date
// @route   GET /api/bookings/availability
// @access  Private
exports.checkAvailability = async (req, res) => {
  try {
    const { trainerId, date } = req.query;
    if (!trainerId || !date) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId and date' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await Booking.find({
      trainer: trainerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    res.status(200).json({ 
      success: true, 
      bookedSlots: bookedSlots.map(b => b.timeSlot) 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all busy dates for a trainer in a range
// @route   GET /api/bookings/busy-dates
// @access  Private
exports.getBusyDates = async (req, res) => {
  try {
    const { trainerId, days = 60 } = req.query;
    if (!trainerId) {
      return res.status(400).json({ success: false, message: 'Please provide trainerId' });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(end.getDate() + parseInt(days));
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      trainer: trainerId,
      date: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).select('date timeSlot');

    // Group by date string to make it easier for frontend
    const busyData = bookings.reduce((acc, curr) => {
      const dStr = curr.date.toISOString().split('T')[0];
      if (!acc[dStr]) acc[dStr] = [];
      acc[dStr].push(curr.timeSlot);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: busyData });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create a PT booking (supports recurrence)
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { trainerId, date, timeSlot, notes, recurrence = 'none', duration = 1 } = req.body;
    
    // Check if the trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(400).json({ success: false, message: 'Invalid trainer' });
    }

    const datesToBook = [];
    const startDate = new Date(date);
    startDate.setHours(12, 0, 0, 0); // Normalize to noon

    if (recurrence === 'none') {
      datesToBook.push(new Date(startDate));
    } else if (recurrence === 'daily') {
      for (let i = 0; i < duration; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + i);
        datesToBook.push(nextDate);
      }
    } else if (recurrence === 'weekly') {
      for (let i = 0; i < duration; i++) {
        const nextDate = new Date(startDate);
        nextDate.setDate(startDate.getDate() + (i * 7));
        datesToBook.push(nextDate);
      }
    } else if (recurrence === 'weekdays') {
      // Mon-Fri for N weeks
      for (let i = 0; i < duration; i++) {
        for (let day = 1; day <= 5; day++) { // 1 = Mon, 5 = Fri
          const nextDate = new Date(startDate);
          // Find the day of the week for the start week, then add weeks
          const currentDay = startDate.getDay();
          const diff = day - currentDay;
          nextDate.setDate(startDate.getDate() + diff + (i * 7));
          if (nextDate >= startDate) datesToBook.push(nextDate);
        }
      }
    } else if (recurrence === 'weekend') {
      // Sat-Sun for N weeks
      for (let i = 0; i < duration; i++) {
        [6, 0].forEach(day => { // 6 = Sat, 0 = Sun
          const nextDate = new Date(startDate);
          const currentDay = startDate.getDay();
          let diff = day - currentDay;
          if (day === 0 && currentDay > 0) diff += 7; // Handle Sunday correctly
          nextDate.setDate(startDate.getDate() + diff + (i * 7));
          if (nextDate >= startDate) datesToBook.push(nextDate);
        });
      }
    }

    // Check for conflicts across all dates
    const conflicts = await Booking.find({
      trainer: trainerId,
      timeSlot,
      status: { $ne: 'cancelled' },
      date: { $in: datesToBook }
    });

    if (conflicts.length > 0) {
      const conflictDates = conflicts.map(c => c.date.toISOString().split('T')[0]).join(', ');
      return res.status(400).json({ 
        success: false, 
        message: `Conflict detected on the following dates: ${conflictDates}. Please adjust your schedule.` 
      });
    }

    const recurrenceGroupId = recurrence !== 'none' ? `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : null;

    const bookings = await Promise.all(datesToBook.map(async (d) => {
      return await Booking.create({
        user: req.user._id,
        trainer: trainerId,
        date: d,
        timeSlot,
        notes,
        priceAtBooking: trainer.hourlyRate || 0,
        recurrenceType: recurrence,
        recurrenceGroupId
      });
    }));

    // Send confirmation email for the first session (or a summary if needed)
    // For now, we'll just send the standard one for the first record
    if (bookings.length > 0) {
      await sendSessionBooking(req.user, trainer, bookings[0]);
    }

    res.status(201).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user's appointments
// @route   GET /api/bookings/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('trainer', 'name specialization hourlyRate');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's schedule
// @route   GET /api/bookings/trainer-schedule
// @access  Private (Trainer)
exports.getTrainerSchedule = async (req, res) => {
  try {
    const bookings = await Booking.find({ trainer: req.user._id }).populate('user', 'name contactNumber email');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Trainer/Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user').populate('trainer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Trigger emails based on status
    if (status === 'cancelled') {
      await sendSessionCancellation(booking.user, booking.trainer, booking);
    } else if (status === 'completed') {
      await sendSessionFeedbackRequest(booking.user, booking.trainer);
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule a booking
// @route   PATCH /api/bookings/:id/reschedule
// @access  Private
exports.rescheduleBooking = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user').populate('trainer');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.date = date;
    booking.timeSlot = timeSlot;
    booking.status = 'rescheduled';
    // Reset reminders so they trigger for the new time
    booking.remindersSent = { dayBefore: false, hourBefore: false };
    
    await booking.save();

    await sendSessionReschedule(booking.user, booking.trainer, booking);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Submit session feedback
// @route   POST /api/bookings/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    booking.feedback = { rating, comment };
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
