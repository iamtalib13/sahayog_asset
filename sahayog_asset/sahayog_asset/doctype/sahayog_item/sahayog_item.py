import frappe
from frappe.model.document import Document

class SahayogItem(Document):
    pass

    def before_save(self):
        if self.item_name:
            self.item_name = self.item_name.upper()
