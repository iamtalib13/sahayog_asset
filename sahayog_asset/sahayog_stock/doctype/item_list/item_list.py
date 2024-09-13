import frappe
from frappe.model.document import Document

class ItemList(Document):
    pass

@frappe.whitelist()
def item_list(category=None):
    try:
        # Build query with optional category filter
        filters = {}
        if category and category != 'all':
            filters['category'] = category
        
        # Fetch data from the 'Sahayog Item' doctype
        items = frappe.get_all(
            'Sahayog Item',
            fields=['name', 'item_name', 'current_stock', 'min_qty', 'category'],
            filters=filters if filters else None  # Apply filters only if they exist
        )
        return {'items': items}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Item List Fetch Error')
        return {'items': [], 'error': str(e)}
