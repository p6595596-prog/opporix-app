const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Ethereal Email is a free fake SMTP service for testing.
// In production, you would replace this with real Gmail/SendGrid credentials.
let transporter;

async function setupTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, 
        pass: testAccount.pass, 
      },
    });
    console.log('✅ Email Transporter Ready (Ethereal test mode)');
  } catch (error) {
    console.warn('⚠️ Could not connect to Ethereal Email (network issue). Falling back to Console Logger mode for emails.');
    // Fallback: A dummy transporter that just logs to console
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n--- 📧 MOCK EMAIL SENT ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body:\n${mailOptions.html.replace(/<[^>]*>?/gm, '')}`);
        console.log('--------------------------\n');
        return { messageId: 'mock-id' };
      }
    };
  }
}

setupTransporter();

/**
 * Checks for users who have saved/applied opportunities with approaching deadlines
 * @param {Array} liveOpportunities - The live data feed of all opportunities
 */
async function checkDeadlinesAndNotify(liveOpportunities) {
  console.log('🔍 Running daily deadline check...');
  
  if (!transporter) {
    console.error('Transporter not ready yet.');
    return;
  }

  try {
    // 1. Fetch all user applications and their profiles
    const { data: applications, error: appError } = await supabase
      .from('user_applications')
      .select('*, profiles(email, full_name)')
      .in('status', ['Saved', 'Applied']);

    if (appError) throw appError;
    if (!applications || applications.length === 0) return;

    // 2. Group by user to avoid sending multiple emails if they have multiple deadlines
    const userAlerts = {};

    applications.forEach(app => {
      // Find the corresponding opportunity in the live feed
      const opp = liveOpportunities.find(o => o.id.toString() === app.opportunity_id);
      if (!opp || !opp.applicationDeadline) return;

      const deadlineDate = new Date(opp.applicationDeadline);
      const today = new Date();
      
      // Calculate difference in days
      const diffTime = deadlineDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Alert if deadline is exactly 3 days or 1 day away
      if (diffDays === 3 || diffDays === 1) {
        const userId = app.user_id;
        if (!userAlerts[userId]) {
          userAlerts[userId] = {
            email: app.profiles.email,
            name: app.profiles.full_name,
            deadlines: []
          };
        }
        userAlerts[userId].deadlines.push({
          title: opp.title,
          daysLeft: diffDays,
          deadline: opp.applicationDeadline
        });
      }
    });

    // 3. Send emails
    for (const userId in userAlerts) {
      const alert = userAlerts[userId];
      if (!alert.email) continue;

      let emailHtml = `<h2>Hello ${alert.name || 'User'},</h2>`;
      emailHtml += `<p>This is a reminder from Opporix that you have upcoming deadlines for your saved opportunities!</p>`;
      emailHtml += `<ul>`;
      alert.deadlines.forEach(d => {
        const color = d.daysLeft === 1 ? 'red' : 'orange';
        emailHtml += `<li><strong>${d.title}</strong> - Deadline is in <span style="color:${color}; font-weight:bold;">${d.daysLeft} day(s)</span> (${new Date(d.deadline).toLocaleDateString()})</li>`;
      });
      emailHtml += `</ul>`;
      emailHtml += `<p>Log in to your Dashboard to finish your applications!</p>`;

      const info = await transporter.sendMail({
        from: '"Opporix Alerts" <alerts@opporix.com>',
        to: alert.email,
        subject: "🚨 Action Required: Upcoming Deadline for Saved Opportunity",
        html: emailHtml,
      });

      console.log(`📧 Email sent to ${alert.email}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

  } catch (error) {
    console.error('Error in deadline notification job:', error);
  }
}

module.exports = {
  checkDeadlinesAndNotify
};
