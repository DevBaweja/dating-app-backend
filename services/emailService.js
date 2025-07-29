const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key');

// Send password reset email
const sendPasswordResetEmail = async (email, token, frontendUrl) => {
  try {
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject: 'Password Reset Request - Dating App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b6b;">Password Reset Request</h2>
          <p>Hello!</p>
          <p>You requested a password reset for your dating app account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ff6b6b; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 15 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email from your dating app.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject: 'Password Reset Successful - Dating App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51cf66;">Password Reset Successful</h2>
          <p>Hello!</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated email from your dating app.
          </p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('Password reset success email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset success email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail
}; 