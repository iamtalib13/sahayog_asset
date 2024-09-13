import frappe
from frappe.model.document import Document

class PurchaseRequisition(Document):
    def validate(self):
        if self.status == "Dispatched":
            # Check if all rows in the child table 'asset' have the 'purchase' field set to "Dispatch"
            for row in self.asset:
                if row.purchase != "Dispatch":
                    frappe.throw(f"All rows in the 'asset' child table must have 'purchase' set to 'Dispatch'. Row with item '{row.item_name}' has '{row.purchase}'.")

    def before_save(self):
        if self.status == "Draft":
            # Set 'purchase' to "Pending" for all rows in the child table 'asset'
            for row in self.asset:
                row.purchase = "Pending"

    def on_change(self):
        # Check if status is "Dispatched"
        if self.status == "Dispatched":
            # Enqueue the _store_entry method as a background job
            frappe.enqueue_doc(self.doctype, self.name, '_store_entry', queue='long', timeout=1500)

    def _store_entry(self):
        # Initialize a list to keep track of successfully created store entries
        created_entries = []

        # Create a document for each asset item
        for row in self.asset:
            item_name = row.get('item_name')  # Assuming item_name field in child table
            quantity = row.get('quantity')
            item_company = row.get('company')
            serial_no = row.get('serial_no')
            windows_key = row.get('windows_key')
            office_key = row.get('office_key')
            
            # Convert quantity to integer
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                quantity = 0

            # Check if quantity is not None and not 0
            if quantity > 0:
                # Create a new Store Entry document
                store_entry_doc = frappe.new_doc('Store Entry')
                store_entry_doc.branch = self.branch
                store_entry_doc.entry_type = 'STOCK-IN'
                store_entry_doc.location_type = 'Store'
                store_entry_doc.category = self.select_department
                store_entry_doc.item_code = item_name  # Assuming item_code field
                store_entry_doc.quantity = quantity    # Assuming quantity field
                # store_entry_doc.item_company = item_company
                # store_entry_doc.serial_no = serial_no
                # store_entry_doc.windows_key = windows_key
                # store_entry_doc.office_key = office_key
                # Save the document
                store_entry_doc.insert()

                # Add the created entry details to the list
                created_entries.append(f"Item Code: {item_name}, Quantity: {quantity}")

        # Construct a confirmation message
        details_message = f"Branch: {self.branch}\n"
        if created_entries:
            details_message += "\nStore Entries created for:\n" + "\n".join(created_entries)
        else:
            details_message += "No valid assets found."

        # Display the message
        frappe.msgprint(details_message)
