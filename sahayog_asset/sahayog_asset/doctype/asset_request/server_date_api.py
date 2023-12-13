# myapp.my_module.my_script.py
import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def get_server_datetime():
    return frappe.utils.now_datetime()
