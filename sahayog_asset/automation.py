import frappe
import json

@frappe.whitelist()
def create_purchase_requisition_task(quantities, employee_id, department):
    try:
        # Parse the JSON string into a Python list
        quantities = json.loads(quantities)

        # Handle quantities where new_quantity is blank or zero
        for item in quantities:
            if not item.get('new_quantity') or item['new_quantity'] <= 0:
                item['new_quantity'] = 1

        # Create a new Purchase Requisition document
        pr_doc = frappe.get_doc({
            'doctype': 'Purchase Requisition',
            'employee_id': employee_id,
            'select_department': department,
            'asset': [
                {
                    'item_id': item['item_code'],
                    'item_name': item['item_code'],
                    'quantity': item['new_quantity']
                } for item in quantities
            ]
        })
        
        # Save the document
        pr_doc.insert(ignore_permissions=True)
        return {'name': pr_doc.name}
    except Exception as e:
        # Log the exception and return an error message
        frappe.log_error(frappe.get_traceback(), "Create Purchase Requisition Error")
        return {'error': str(e)}

@frappe.whitelist()
def create_purchase_requisition(quantities):
    employee_id = frappe.session.user.split('@')[0]

    # Determine user role and set department filter
    user_roles = frappe.get_roles(frappe.session.user)
    
    # Map roles to departments
    department_map = {
        "IT Store Manager": 'IT',
        "IT Support Manager": 'IT',
        "Stationery Asset Admin": 'Stationery',
        "Admin Store Manager": 'Admin'
    }
    
    department = next((department_map[role] for role in user_roles if role in department_map), None)

    if not department:
        frappe.throw("No department found for your role")

    # Queue the task
    frappe.enqueue('sahayog_asset.automation.create_purchase_requisition_task',
                    quantities=quantities,
                    employee_id=employee_id,
                    department=department)
    
    return {'status': 'queued'}


def update_stocks(*args, **kwargs):
    # Fetch all documents from the "Sahayog Item" doctype
    items = frappe.get_all('Sahayog Item', fields=['name', 'item_id'])
    
    for item in items:
        item_id = item['item_id']
        
        # Fetch the stock-in and stock-out quantities using frappe.db.get_all
        stock_in_entries = frappe.db.get_all(
            'Store Entry',
            filters={'item_code': item_id, 'entry_type': 'STOCK-IN'},
            fields=['quantity']
        )
        
        stock_out_entries = frappe.db.get_all(
            'Store Entry',
            filters={'item_code': item_id, 'entry_type': 'STOCK-OUT'},
            fields=['quantity']
        )
        
        # Calculate the total stock-in and stock-out quantities
        stock_in_quantity = sum(entry['quantity'] for entry in stock_in_entries)
        stock_out_quantity = sum(entry['quantity'] for entry in stock_out_entries)
        
        # Calculate current stock
        current_stock = stock_in_quantity - stock_out_quantity
        
        # Update the current_stock field in "Sahayog Item"
        frappe.db.set_value('Sahayog Item', item['name'], 'current_stock', current_stock, update_modified=False)
        
        print(f"Stock updated successfully for item {item_id}: {current_stock} items in stock")

@frappe.whitelist()
def get_low_stock_items():
    # Determine user role and set category filter
    user_roles = frappe.get_roles(frappe.session.user)
    
    # Define category filters based on roles
    category_map = {
        "IT Store Manager": 'IT',
        "IT Support Manager": 'IT',
        "Stationery Asset Admin": 'Stationery',
        "Admin Store Manager": 'Admin'
    }
    
    # Get the category filter based on user roles
    category_filter = next((category_map[role] for role in user_roles if role in category_map), None)
    
    # Construct the SQL query with the category filter
    query = """
        SELECT name, item_name, current_stock, min_qty
        FROM `tabSahayog Item`
        WHERE current_stock < min_qty
        AND current_stock > 0
    """
    
    if category_filter:
        query += " AND category = %s"
        low_stock_items = frappe.db.sql(query, (category_filter,), as_dict=True)
    else:
        low_stock_items = frappe.db.sql(query, as_dict=True)
    
    return low_stock_items

@frappe.whitelist()
def get_out_of_stock_items():
    # Determine user role and set category filter
    user_roles = frappe.get_roles(frappe.session.user)
    
    # Define category filters based on roles
    category_map = {
        "IT Store Manager": 'IT',
        "IT Support Manager": 'IT',
        "Stationery Asset Admin": 'Stationery',
        "Admin Store Manager": 'Admin'
    }
    
    # Get the category filter based on user roles
    category_filter = next((category_map[role] for role in user_roles if role in category_map), None)
    
    # Construct the SQL query with the category filter
    query = """
        SELECT name, item_name, current_stock, min_qty
        FROM `tabSahayog Item`
        WHERE current_stock <= 0
    """
    
    if category_filter:
        query += " AND category = %s"
        out_of_stock_items = frappe.db.sql(query, (category_filter,), as_dict=True)
    else:
        out_of_stock_items = frappe.db.sql(query, as_dict=True)
    
    return out_of_stock_items

