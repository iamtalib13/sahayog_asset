# Copyright (c) 2024, Sid and contributors
# For license information, please see license.txt
from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class EmailRequest(Document):
	pass

def before_insert(self):
	self.status = "Draft"