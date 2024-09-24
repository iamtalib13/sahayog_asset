import frappe

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    email_request_data = get_email_request_data()

    # Check if any data is found
    if not email_request_data:
        frappe.msgprint("No Records Found")
        return columns, []

    # Prepare data in the required format
    data = []
    for d in email_request_data:
        row = {
            "name": d.name,
            "mode": d.mode,
            "employee_id": d.employee_id,
            "first_name": d.first_name,
            "last_name": d.last_name,
            "designation": d.designation,
            "department": d.department,
            "phone": d.phone,
            # Create Login ID
            "login_id": f"{d.first_name}.{d.last_name}@sahayogmultistate.com"
        }
        data.append(row)

    return columns, data


def get_columns():
    """Define the columns for the report."""
    return [
        {
            "fieldname": "name",
            "label": "Request ID",
            "fieldtype": "Link",
            "options": "Email Request",
            "width": "150",
        },
        {
            "fieldname": "mode",
            "label": "Mode",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "employee_id",
            "label": "Employee ID",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "first_name",
            "label": "First Name",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "last_name",
            "label": "Last Name",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "designation",
            "label": "Designation",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "department",
            "label": "Department",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "phone",
            "label": "Phone",
            "fieldtype": "Data",
            "width": "100",
        },
        {
            "fieldname": "login_id",
            "label": "Login ID",
            "fieldtype": "Data",
            "width": "200",
        }
    ]


def get_email_request_data():
    """Fetch the data using raw SQL query with status condition."""
    # SQL query to fetch the specified fields from tabEmail Request table
    query = """
        SELECT
            name,
            mode,
            employee_id,
            first_name,
            last_name,
            designation,
            department,
            phone
        FROM
            `tabEmail Request`
        WHERE
            status = 'Pending From IT'
        ORDER BY
            creation DESC
    """

    # Execute the SQL query and return the result
    return frappe.db.sql(query, as_dict=True)
