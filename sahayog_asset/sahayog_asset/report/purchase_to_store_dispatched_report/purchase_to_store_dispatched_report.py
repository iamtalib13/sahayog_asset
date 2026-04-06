import frappe


def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)

    if not data:
        frappe.msgprint("No Records Found")
        return columns, data

    return columns, data


def get_columns():
    return [
        {
            "fieldname": "date",
            "label": "Date",
            "fieldtype": "Date",
            "width": "100",
        },
        {
            "fieldname": "id",
            "label": "ID",
            "fieldtype": "Link",
            "options": "Asset Request",
            "width": "155",
        },
        {
            "fieldname": "asset_name",
            "label": "Asset Name",
            "fieldtype": "Link",
            "options": "Sahayog Item",
            "width": "200",
        },
        {
            "fieldname": "quantity",
            "label": "Quantity",
            "fieldtype": "Int",
            "width": "80",
        },
        {
            "fieldname": "select_department",
            "label": "Asset Department",
            "fieldtype": "Link",
            "options": "Asset Department",
            "width": "120",
        },
        {
            "fieldname": "emp_name",
            "label": "Employee Name",
            "fieldtype": "Data",
            "width": "135",
        },
        {
            "fieldname": "branch",
            "label": "Branch",
            "fieldtype": "Link",
            "options": "Branch",
            "width": "100",
        },
        {
            "fieldname": "division",
            "label": "Division",
            "fieldtype": "Link",
            "options": "Division",
            "width": "100",
        },
    ]


def get_data(filters):
    conditions = get_conditions(filters)
    
    sql_query = f"""
     SELECT
        ar.name as id, ar.emp_name, ar.date,
        ar.branch, ar.select_department, ar.division,
        al.item_name as asset_name, al.quantity 
    FROM
        `tabAsset Request` AS ar
    LEFT JOIN
        `tabAsset List` AS al
    ON
        ar.name = al.parent
    WHERE
        al.purchase = 'Dispatch'
        {conditions}
    ORDER BY ar.date DESC;
    """

    data = frappe.db.sql(sql_query, filters, as_dict=True)
    
    for d in data:
        if d.quantity is not None:
            d.quantity = int(d.quantity)
        else:
            d.quantity = 0

    return data

def get_conditions(filters):
    conditions = ""
    
    if filters.get("from_date"):
        conditions += " AND ar.date >= %(from_date)s"
    if filters.get("to_date"):
        conditions += " AND ar.date <= %(to_date)s"
    if filters.get("branch"):
        conditions += " AND ar.branch = %(branch)s"
    if filters.get("division"):
        conditions += " AND ar.division = %(division)s"
    if filters.get("select_department"):
        conditions += " AND ar.select_department = %(select_department)s"
        
    return conditions
