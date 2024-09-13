import frappe
from frappe.model.document import Document

class SahayogItem(Document):
    def before_save(self):
        if self.item_name:
            self.item_name = self.item_name.upper()
        
        # Update stock entry counts
        self.update_stock_entry()
    
    def update_stock_entry(self):
        # Fetch the stock-in and stock-out counts using frappe.db.get_all
        stock_in_entries = frappe.db.get_all(
            'Store Entry',
            filters={'item_code': self.item_id, 'entry_type': 'STOCK-IN'},
            fields=['quantity']
        )
        
        stock_out_entries = frappe.db.get_all(
            'Store Entry',
            filters={'item_code': self.item_id, 'entry_type': 'STOCK-OUT'},
            fields=['quantity']
        )
        
        # Calculate the total stock-in and stock-out quantities
        stock_in_quantity = sum(entry['quantity'] for entry in stock_in_entries)
        stock_out_quantity = sum(entry['quantity'] for entry in stock_out_entries)
        
        # Calculate current stock
        self.current_stock = stock_in_quantity - stock_out_quantity

        # Optional: Show a message to the user
        #frappe.msgprint("Stock updated successfully: {} items in stock".format(self.current_stock))
