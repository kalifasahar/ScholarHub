# Implementing the email sending functionality using smtplib for Gmail

from smtplib import SMTP, SMTPAuthenticationError, SMTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from services.send_to import sender_email_, sender_password_
from utilitis.log_manager import LogManager
from data_classes.Result import Result
import ssl

class Notification_manager:
    def __init__(self):
        self.log_manager = LogManager(Notification_manager.__name__)
        
    def send_verification_email(self, receiver_email: str, first_name: str, Athentication_link: str) ->Result:
        if sender_email_ == None or sender_password_ == None:
            return Result(False, error="the system dont have an email to send from ")
        sender_email = sender_email_  # Change to your Gmail address
        sender_password = sender_password_  # Change to your Gmail App Password

        # Create the email subject and body.
        subject = "Verify Your Account"
        body = f"""
        Hi {first_name},
        Thank you for registering. Please verify your account by clicking on the link below:
        {Athentication_link}
        Best regards,
        Your Team

        """

        # Setup the MIME
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = receiver_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        # Create secure connection with server and send email
        context = ssl.create_default_context()
        try:
            with SMTP("smtp.gmail.com", 587) as server:
                server.starttls(context=context)  # Secure the connection
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, receiver_email, message.as_string())
                self.log_manager.info("Verification email sent successfully!")
        except SMTPAuthenticationError:
            self.log_manager.error("Failed to authenticate with the SMTP server. Check your credentials.")
            return Result(False, error="Failed to authenticate with the SMTP server. Check your credentials.")
        except SMTPException as e:
            self.log_manager.error(f"An error occurred while sending email: {e}")
            return Result(False, error="An error occurred while sending email: {e}")
        return Result(True)