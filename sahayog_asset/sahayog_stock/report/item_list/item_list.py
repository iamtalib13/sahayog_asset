import frappe

def execute(filters=None):
    if not filters:
        filters = {}

    # Determine user role and set category filter
    user_roles = frappe.get_roles(frappe.session.user)
    
    if "System Manager" in user_roles:
        category_filter = None  # No filter for System Manager
    elif "IT Store Manager" in user_roles or "IT Support Manager" in user_roles:
        category_filter = "IT"
    elif "Stationery Asset Admin" in user_roles:
        category_filter = "Stationery"
    elif "Admin Store Manager" in user_roles:
        category_filter = "Admin"
    else:
        category_filter = None  # Default category if none of the roles match

    status_filter = filters.get("status")
    columns = get_columns()
    data = get_cs_data(category_filter, status_filter)
    
    # Calculate the report summary
    in_stock_count = sum(1 for row in data if row["status"] == "In Stock")
    low_stock_count = sum(1 for row in data if row["status"] == "Low Stock")
    out_of_stock_count = sum(1 for row in data if row["status"] == "Out of Stock")
    
    report_summary = [
        {"label": "In Stock", "value": in_stock_count, "indicator": "green"},
        {"label": "Low Stock", "value": low_stock_count, "indicator": "red"},
        {"label": "Out of Stock", "value": out_of_stock_count, "indicator": "red"}
    ]

    # Return columns, data, message, chart, and report summary
    return columns, data, None, None, report_summary

def get_columns():
    return [
        {
            "fieldname": "status",
            "label": '<b style="color:black">Status</b>',
            "fieldtype": "Data",
            "width": "180",
        },
        {
            "fieldname": "name",
            "label": '<b style="color:black">ID</b>',
            "fieldtype": "Link",
            "options": "Sahayog Item",
            "width": "180",
        },
        {
            "fieldname": "item_name",
            "label": '<b style="color:black">Item Name</b>',
            "fieldtype": "Data",
            "width": "700",
        },
        {
            "fieldname": "current_stock",
            "label": '<b style="color:black">Current Stock</b>',
            "fieldtype": "Int",
            "width": "150",
        },
        {
            "fieldname": "min_qty",
            "label": '<b style="color:black">Minimum Qty</b>',
            "fieldtype": "Int",
            "width": "150",
        },
        {
            "fieldname": "category",
            "label": '<b style="color:black">Category</b>',
            "fieldtype": "Data",
            "width": "100",
        },
    ]

def get_cs_data(category_filter, status_filter):
    # Build the SQL query for detailed data
    sql_query = """
    SELECT
        si.name, si.item_name, si.current_stock, si.min_qty, si.category, si.modified,
        CASE
            WHEN si.current_stock <= 0 THEN 'Out of Stock'
            WHEN si.current_stock <= si.min_qty THEN 'Low Stock'
            ELSE 'In Stock'
        END AS status
    FROM
        `tabSahayog Item` AS si
    WHERE
        (%s IS NULL OR si.category = %s)
        AND (%s IS NULL OR
            (CASE
                WHEN si.current_stock <= 0 THEN 'Out of Stock'
                WHEN si.current_stock <= si.min_qty THEN 'Low Stock'
                ELSE 'In Stock'
            END) = %s
        )
   ORDER BY modified DESC
    """
    
    # Execute the SQL query with category and status filters
    data = frappe.db.sql(sql_query, (category_filter, category_filter, status_filter, status_filter), as_dict=True)

    return data
