import frappe
from frappe.model.document import Document

class StoreEntry(Document):
    def after_save(self):
        pass