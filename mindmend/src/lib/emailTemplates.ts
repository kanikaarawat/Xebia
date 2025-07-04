export const cancellationEmailTemplate = (data: {
  appointmentId: string;
  sessionDate: string;
  sessionTime: string;
  originalAmount: string;
  refundAmount: string;
  refundPercentage: number;
  refundReason: string;
  cancellationReason: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Session Cancellation Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6f42c1;
          margin-bottom: 10px;
        }
        .title {
          color: #dc3545;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #6c757d;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
          padding: 20px;
          border-radius: 8px;
        }
        .session-details {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
        }
        .refund-details {
          background-color: #d4edda;
          border-left: 4px solid #28a745;
        }
        .policy-details {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #495057;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .detail-label {
          font-weight: 500;
          color: #6c757d;
        }
        .detail-value {
          font-weight: 600;
          color: #495057;
        }
        .refund-amount {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }
        .policy-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .policy-list li {
          padding: 5px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .policy-list li:last-child {
          border-bottom: none;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 12px;
        }
        .contact-info {
          background-color: #e9ecef;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MindMend</div>
          <div class="title">Session Cancellation Confirmation</div>
          <div class="subtitle">Your session has been successfully cancelled</div>
        </div>

        <div class="section session-details">
          <div class="section-title">📅 Session Details</div>
          <div class="detail-row">
            <span class="detail-label">Appointment ID:</span>
            <span class="detail-value">#${data.appointmentId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Session Date:</span>
            <span class="detail-value">${new Date(data.sessionDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Session Time:</span>
            <span class="detail-value">${new Date(`2000-01-01T${data.sessionTime}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Original Amount:</span>
            <span class="detail-value">₹${data.originalAmount}</span>
          </div>
        </div>

        <div class="section refund-details">
          <div class="section-title">💰 Refund Details</div>
          <div class="detail-row">
            <span class="detail-label">Refund Amount:</span>
            <span class="detail-value refund-amount">₹${data.refundAmount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Refund Percentage:</span>
            <span class="detail-value">${data.refundPercentage}%</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Refund Reason:</span>
            <span class="detail-value">${data.refundReason}</span>
          </div>
          ${data.cancellationReason ? `
          <div class="detail-row">
            <span class="detail-label">Your Reason:</span>
            <span class="detail-value">${data.cancellationReason}</span>
          </div>
          ` : ''}
        </div>

        <div class="section policy-details">
          <div class="section-title">📋 Our Refund Policy</div>
          <ul class="policy-list">
            <li><strong>48+ hours before session:</strong> 80% refund</li>
            <li><strong>24-48 hours before session:</strong> 50% refund</li>
            <li><strong>Less than 24 hours:</strong> No refund</li>
          </ul>
        </div>

        <div class="contact-info">
          <div class="section-title">📞 Need Help?</div>
          <p>If you have any questions about your cancellation or refund, please contact our support team:</p>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">support@mindmend.com</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">+91 98765 43210</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing MindMend. We hope to see you again soon!</p>
          <p>© 2024 MindMend. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const refundProcessedEmailTemplate = (data: {
  appointmentId: string;
  refundAmount: string;
  refundMethod: string;
  processingTime: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Processed</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #6f42c1;
          margin-bottom: 10px;
        }
        .title {
          color: #28a745;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #6c757d;
          font-size: 14px;
        }
        .section {
          margin-bottom: 25px;
          padding: 20px;
          border-radius: 8px;
          background-color: #d4edda;
          border-left: 4px solid #28a745;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #155724;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .detail-label {
          font-weight: 500;
          color: #6c757d;
        }
        .detail-value {
          font-weight: 600;
          color: #495057;
        }
        .refund-amount {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MindMend</div>
          <div class="title">✅ Refund Processed Successfully</div>
          <div class="subtitle">Your refund has been processed and will be credited to your account</div>
        </div>

        <div class="section">
          <div class="section-title">💰 Refund Details</div>
          <div class="detail-row">
            <span class="detail-label">Appointment ID:</span>
            <span class="detail-value">#${data.appointmentId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Refund Amount:</span>
            <span class="detail-value refund-amount">₹${data.refundAmount}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Refund Method:</span>
            <span class="detail-value">${data.refundMethod}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Processing Time:</span>
            <span class="detail-value">${data.processingTime}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing MindMend. We hope to see you again soon!</p>
          <p>© 2024 MindMend. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 