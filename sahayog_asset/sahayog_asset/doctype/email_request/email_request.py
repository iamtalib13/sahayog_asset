# Copyright (c) 2024, Sid and contributors
# For license information, please see license.txt
from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class EmailRequest(Document):
    def before_insert(self):
        self.status = "Draft"
    
    def before_save(self):
        # Convert first_name and last_name to lowercase
        self.first_name = self.first_name.lower()
        self.last_name = self.last_name.lower()
        
        # Concatenate first_name and last_name with a space
        full_name = self.first_name + " " + self.last_name
        self.employee_name = full_name
        
        # Set mode based on request_type
        request_type_value = self.request_type
        if request_type_value == "New":
            self.mode = "A"
        elif request_type_value == "Delete":
            self.mode = "D"
        elif request_type_value == "Modify":
            self.mode = "M"



@frappe.whitelist(allow_guest=True)
def get_server_datetime():
    return frappe.utils.now_datetime()
