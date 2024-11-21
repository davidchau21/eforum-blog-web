export default (name, otp) => {
  return `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>

      <style type="text/css">
        @media only screen and (min-width: 620px) {
          .u-row {
            width: 600px !important;
          }
          .u-row .u-col {
            vertical-align: top;
          }
          .u-row .u-col-100 {
            width: 600px !important;
          }
        }
        @media (max-width: 620px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
          .u-row {
            width: 100% !important;
          }
          .u-col {
            width: 100% !important;
          }
          .u-col>div {
            margin: 0 auto;
          }
        }
        
        body {
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          font-family: 'Cabin', sans-serif;
        }

        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }

        p {
          margin: 0;
        }

        a {
          color: #3498db;
          text-decoration: none;
        }

        h1 {
          font-size: 24px;
          color: #333333;
          margin: 20px 0;
          text-align: center;
        }

        .otp-box {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          max-width: 500px;
        }

        .otp-code {
          font-size: 30px;
          font-weight: bold;
          color: #27ae60;
          text-align: center;
          margin: 20px 0;
        }

        .footer {
          text-align: center;
          color: #999999;
          margin-top: 20px;
          font-size: 12px;
        }
      </style>
    </head>

    <body>
      <div class="otp-box">
        <h1>Hello, ${name}!</h1>
        <p>Your OTP for verification is:</p>
        <div class="otp-code">${otp}</div>
        <p>Please note: This OTP is valid for the next 10 minutes.</p>
        <p>Thank you for using our service!</p>
        <p>Regards,<br/>Team Task</p>
      </div>
      <div class="footer">
        <p>If you have any issues, feel free to contact us at <a href="mailto:support@edublog.com">support@edublog.com</a></p>
      </div>
    </body>

    </html>
  `;
};
