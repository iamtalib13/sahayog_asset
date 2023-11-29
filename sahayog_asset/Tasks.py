import frappe
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime


def send_stage_1_notification():
    ob = smtplib.SMTP("smtp.office365.com", 587)
    ob.starttls()
    ob.login("talib.s@sahayogmultistate.com", "Ts9422817246")
    subject = "Sending from Python"
    body = "hello"
    message = "Subject:{}\n\n{}".format(subject, body)
    listOfAddress = ["talibsh16@gmail.com"]
    ob.sendmail("talib.s@sahayogmultistate.com", listOfAddress, message)
    print("Email sent successfully.")
    ob.quit()
