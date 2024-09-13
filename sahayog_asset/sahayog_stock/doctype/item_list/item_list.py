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
import frappe
import pandas as pd
from io import BytesIO
import base64

@frappe.whitelist()
def export_to_excel():
    try:
        # Fetch data from the 'Sahayog Item' doctype
        items = frappe.get_all(
            'Sahayog Item',
            fields=['name', 'item_name', 'current_stock', 'min_qty', 'category']
        )

        if not items:
            return {'error': 'No data available to export.'}

        # Convert the list of dictionaries into a structured format
        data = {
            'Item Code': [item['name'] for item in items],
            'Item Name': [item['item_name'] for item in items],
            'Current Stock': [item['current_stock'] for item in items],
            'Min Qty': [item['min_qty'] for item in items],
            'Category': [item['category'] for item in items]
        }

        # Convert data to a DataFrame
        df = pd.DataFrame(data)
        
        # Create a BytesIO buffer
        output = BytesIO()
        
        # Write DataFrame to Excel
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Sheet1')
        
        # Get the value of the BytesIO buffer
        output.seek(0)
        
        # Convert binary data to base64 for response
        file_content = base64.b64encode(output.read()).decode('utf-8')

        return {
            'file_content': file_content,
            'filename': 'items_export.xlsx'
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), 'Item List Fetch Error')
        return {'error': str(e)}
