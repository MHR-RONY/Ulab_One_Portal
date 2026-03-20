const LOGO_URL = "https://res.cloudinary.com/dreby3qi3/image/upload/v1774005800/ulaboneportallogo_ivxtsz.png";

const buildOtpEmailHtml = (name: string, otp: string): string => {
	const firstName = name.split(" ")[0];
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">

          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#ffffff; padding:32px 0; text-align:center;">
              <img src="${LOGO_URL}" alt="ULAB One Portal" width="180" style="display:block; margin:0 auto;" />
            </td>
          </tr>

          <!-- White Content Card -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; margin-top:-20px; position:relative;">
                <tr>
                  <td style="padding:44px 0 32px 0;">

                    <p style="margin:0 0 20px 0; font-size:16px; color:#1a1a1a; line-height:1.6;">
                      Hi ${firstName},
                    </p>

                    <p style="margin:0 0 28px 0; font-size:16px; color:#4a4a4a; line-height:1.6;">
                      Here's the confirmation code you requested:
                    </p>

                    <!-- OTP Code -->
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                      <tr>
                        <td style="font-size:32px; font-weight:700; letter-spacing:6px; color:#1a1a1a; padding:12px 0; border-bottom:3px solid #1d4ed8;">
                          ${otp}
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 32px 0; font-size:14px; color:#6b7280; line-height:1.6;">
                      This code expires in 5 minutes. If you didn't request this, you can ignore this email or let us know.
                    </p>

                    <!-- Divider -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-top:1px solid #e5e7eb; padding-top:28px;">
                          <p style="margin:0 0 4px 0; font-size:15px; color:#1a1a1a; font-weight:600;">Thanks,</p>
                          <p style="margin:0; font-size:15px; color:#4a4a4a;">The ULAB One Portal Team</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px 40px 40px; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#9ca3af;">
                University of Liberal Arts Bangladesh
              </p>
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                Dhanmondi, Dhaka, Bangladesh
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendOtpEmail = async (
	email: string,
	name: string,
	otp: string
): Promise<void> => {
	const apiKey = process.env.BREVO_API_KEY;
	const senderEmail = process.env.BREVO_SENDER_EMAIL;
	const senderName = process.env.BREVO_SENDER_NAME;

	if (!apiKey || !senderEmail || !senderName) {
		throw new Error("Brevo email configuration is missing in environment variables");
	}

	const response = await fetch("https://api.brevo.com/v3/smtp/email", {
		method: "POST",
		headers: {
			"accept": "application/json",
			"content-type": "application/json",
			"api-key": apiKey,
		},
		body: JSON.stringify({
			sender: { email: senderEmail, name: senderName },
			to: [{ email, name }],
			subject: "ULAB One Portal - Email Verification Code",
			htmlContent: buildOtpEmailHtml(name, otp),
		}),
	});

	if (!response.ok) {
		const errorData = (await response.json()) as { message?: string };
		throw new Error(`Brevo email failed: ${errorData.message || response.statusText}`);
	}
};
