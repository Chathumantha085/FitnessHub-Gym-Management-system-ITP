const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

// @desc    Toggle attendance check-in/out for today
// @route   PATCH /api/attendance/mark/:userId
// @access  Public (for camera scan)
exports.markAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Membership is not active' });
    }

    // Check for active subscription
    const activeSubscription = await Subscription.findOne({ 
      user: userId, 
      status: 'active',
      endDate: { $gte: new Date() }
    });

    if (!activeSubscription) {
      return res.status(403).json({ 
        success: false, 
        message: 'No active membership plan found or plan has expired. Please renew your membership.' 
      });
    }

    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if user already has an entry for today
    let attendance = await Attendance.findOne({ user: userId, date: todayDate });

    if (!attendance) {
      // Create new Check-In record
      attendance = await Attendance.create({
        user: userId,
        date: todayDate,
        checkIn: new Date(),
        status: 'present',
      });

      return res.status(201).json({
        success: true,
        type: 'check-in',
        message: `Welcome ${user.name}! Check-in successful.`,
        data: attendance,
        user: user, // Added user details
      });
    } else if (attendance.checkOut) {
      // User already checked out today
      return res.status(400).json({
        success: false,
        message: 'Member has already checked out for today.',
        user: user, // Added user details
      });
    } else {
      // Perform Check-Out
      attendance.checkOut = new Date();
      
      // Calculate duration in minutes
      const diffMs = attendance.checkOut - attendance.checkIn;
      attendance.duration = Math.round(diffMs / (1000 * 60));
      
      await attendance.save();

      return res.status(200).json({
        success: true,
        type: 'check-out',
        message: `Goodbye ${user.name}! Check-out successful. Session: ${attendance.duration} mins.`,
        data: attendance,
        user: user, // Added user details
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance history for a user
// @route   GET /api/attendance/user/:userId
// @access  Private
exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    const history = await Attendance.find({ user: userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance for today (for Admin/Staff)
// @route   GET /api/attendance/today
// @access  Private/Admin
exports.getTodayAttendance = async (req, res) => {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const history = await Attendance.find({ date: todayDate }).populate('user', 'name role');

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Scan attendance via browser (GET) - Returns standalone HTML for mobile compatibility
// @route   GET /api/attendance/scan/:userId
// @access  Public
exports.scanAttendance = async (req, res) => {
  const userId = req.params.userId;
  const action = req.query.action;
  const backendUrl = process.env.BACKEND_URL || 'https://tan-salamander-545528.hostingersite.com';
  
  try {
    // 1. Validate User ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send(renderResponse('error', 'Invalid Scan', 'The QR code contains an invalid member ID format.', null, null));
    }

    // 2. Find User
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).send(renderResponse('error', 'Member Not Found', 'The scanned ID does not match any gym member.', null, null));
    }

    // 3. Check Approval Status
    if (user.status !== 'approved') {
      return res.status(403).send(renderResponse('error', 'Access Denied', 'Membership status is not active. Please contact admin.', user, null));
    }

    // 4. Check for active subscription
    const activeSubscription = await Subscription.findOne({ 
      user: userId, 
      status: 'active',
      endDate: { $gte: new Date() }
    });

    if (!activeSubscription) {
      return res.status(403).send(renderResponse('error', 'PLAN EXPIRED', 'You do not have an active membership plan. Please renew via dashboard.', user, null));
    }

    // 5. Mark Attendance
    const todayDate = new Date().toISOString().split('T')[0];
    let attendance = await Attendance.findOne({ user: userId, date: todayDate });
    
    // CASE A: NEW CHECK-IN
    if (!attendance) {
      attendance = await Attendance.create({
        user: userId,
        date: todayDate,
        checkIn: new Date(),
        status: 'present',
      });
      return res.status(201).send(renderResponse('success', 'CHECKED IN', `Welcome ${user.name}! Check-in successful.`, user, attendance, true));
    }

    // CASE B: ACTIVE SESSION - HANDLE CHECKOUT OR SHOW STATUS
    if (!attendance.checkOut) {
      if (action === 'checkout') {
         // Perform manual Checkout
         attendance.checkOut = new Date();
         const diffMs = attendance.checkOut - attendance.checkIn;
         attendance.duration = Math.round(diffMs / (1000 * 60));
         await attendance.save();
         return res.status(200).send(renderResponse('success', 'CHECKED OUT', `Goodbye ${user.name}! Check-out successful.`, user, attendance));
      } else {
         // Showing Status with Checkout Button
         return res.status(200).send(renderResponse('success', 'ACTIVE SESSION', `Welcome back ${user.name}! You are currently checked in.`, user, attendance, true));
      }
    }

    // CASE C: ALREADY CHECKED OUT
    return res.status(400).send(renderResponse('error', 'SESSION ENDED', 'You have already checked out for today.', user, attendance));

  } catch (error) {
    console.error('Attendance Scan Error:', error);
    const errorHtml = renderResponse('error', 'System Error', 'An unexpected error occurred: ' + (error.message || 'Unknown'), null, null);
    res.status(500).send(errorHtml);
  }
};

// Helper function to render a premium HTML response
function renderResponse(status, title, message, user, attendance, showCheckoutBtn = false) {
  try {
    const isSuccess = status === 'success';
    const isCheckOut = attendance?.checkOut;
    const accentColor = isSuccess ? (isCheckOut ? '#f59e0b' : '#10b981') : '#ef4444';
  
    // Sri Lanka Timezone Helper (GMT+5:30)
    const getSLTime = (date) => {
        if (!date) return '--:--';
        // Adjust for SL Timezone (+5.5 hours)
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const slDate = new Date(utc + (3600000 * 5.5));
        
        const h = slDate.getHours();
        const m = slDate.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        const mStr = m < 10 ? '0' + m : m;
        return `${h12}:${mStr} ${ampm}`;
    };

    const timeString = getSLTime(attendance?.checkOut || attendance?.checkIn);
    const backendUrl = process.env.BACKEND_URL || 'https://tan-salamander-545528.hostingersite.com';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Attendance - ITP GYM</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;400;600;800&display=swap" rel="stylesheet">
        <style>
          :root {
            --bg: #030712;
            --card-bg: rgba(17, 24, 39, 0.95);
            --accent: ${accentColor};
            --text: #f3f4f6;
            --text-dim: #9ca3af;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; overflow: hidden; }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .card {
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            width: 100%;
            max-width: 400px;
            border-radius: 32px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          
          .header {
            padding: 48px 24px; text-align: center;
            background: linear-gradient(to bottom, rgba(${isSuccess ? (isCheckOut ? '245, 158, 11' : '16, 185, 129') : '239, 68, 68'}, 0.2), transparent);
          }
          .status-icon {
            width: 80px; height: 80px; margin: 0 auto 28px;
            background: rgba(${isSuccess ? (isCheckOut ? '245, 158, 11' : '16, 185, 129') : '239, 68, 68'}, 0.2);
            border-radius: 28px; display: flex; align-items: center; justify-content: center;
            color: var(--accent); border: 2px solid var(--accent);
          }
          .status-title {
            font-size: 32px; font-weight: 800; letter-spacing: -0.01em; color: var(--accent);
            text-transform: uppercase; margin-bottom: 8px;
          }
          .status-msg { font-size: 16px; color: var(--text-dim); line-height: 1.5; padding: 0 10px; }
          
          .content { padding: 0 28px 48px; }
          .profile {
            display: flex; align-items: center; gap: 16px;
            padding: 24px; background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
            margin-bottom: 30px;
          }
          .avatar {
            width: 54px; height: 54px; background: #3b82f6;
            border-radius: 16px; font-weight: 800; font-size: 24px;
            display: flex; align-items: center; justify-content: center; color: white;
            box-shadow: 0 8px 15px rgba(59, 130, 246, 0.3);
          }
          .p-info h3 { font-size: 19px; font-weight: 700; margin-bottom: 4px; }
          .p-info p { font-size: 12px; font-weight: 800; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.1em; }
          
          .meta { display: grid; gap: 12px; margin-bottom: 32px; }
          .m-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 18px 22px; background: rgba(255,255,255,0.04);
            border-radius: 16px; font-size: 15px; color: var(--text-dim);
          }
          .m-item b { color: var(--text); font-weight: 800; font-family: monospace; font-size: 17px; }

          .btn-checkout {
            display: block; width: 100%; padding: 22px;
            background: #ef4444; color: #fff; text-align: center;
            text-decoration: none; border-radius: 18px; font-weight: 900;
            font-size: 16px; letter-spacing: 0.05em;
            box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
            transition: all 0.2s; border: none;
          }
          .btn-checkout:active { transform: scale(0.96); box-shadow: 0 5px 10px rgba(239, 68, 68, 0.3); }
          
          .f-tag {
            text-align: center; margin-top: 32px; font-size: 10px; font-weight: 800;
            letter-spacing: 0.4em; color: rgba(255,255,255,0.15); text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="status-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${isSuccess ? 
                  (isCheckOut ? '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>' : '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>') : 
                  '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
              </svg>
            </div>
            <h1 class="status-title">${title}</h1>
            <p class="status-msg">${message}</p>
          </div>
          
          <div class="content">
            ${user ? `
            <div class="profile">
              <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
              <div class="p-info">
                <h3>${user.name}</h3>
                <p>Sri Lanka Member</p>
              </div>
            </div>
            ` : ''}
            
            <div class="meta">
              <div class="m-item">SL Time <b>${timeString}</b></div>
              ${attendance?.duration > 0 ? `<div class="m-item">Session <b>${attendance.duration} Min</b></div>` : ''}
            </div>
            
            ${showCheckoutBtn ? `
               <a href="${backendUrl}/api/attendance/scan/${user._id}?action=checkout" class="btn-checkout">END ATTENDANCE</a>
            ` : ''}
          </div>
        </div>
        <div class="f-tag">GYM CORE SCANNER v3</div>
      </body>
      </html>
    `;
  } catch (err) {
    return `<div style="background:#000;color:#fff;padding:20px;font-family:sans-serif;"><h1>Attendance Error</h1><p>${message}</p></div>`;
  }
}
