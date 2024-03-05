import frappe
from frappe.utils import validate_email_address, sendmail

@frappe.whitelist()
def send_test_email():
    # Validate the email address
    if not validate_email_address():
        frappe.throw("Invalid recipient email address")

    # Send the email
    try:
        sendmail(
            recipient="talib.s@sahayogmutlistate.com",
            subject="Hello, World!",
            message="This is a test email from Sahayog Support System.",
            content_subtype="html",
        )
        return {"status": "success", "message": "Email sent successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}