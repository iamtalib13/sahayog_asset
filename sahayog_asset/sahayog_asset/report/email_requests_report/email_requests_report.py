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
            "first_name": capitalize_if_present(d.first_name),
            "last_name": capitalize_if_present(d.last_name),
            "designation": capitalize_if_present(d.designation),
            "department": capitalize_if_present(d.department),
            "phone": d.phone,
            "login_id": create_login_id(d),
            "branch": capitalize_if_present(d.branch),
            "email_category": d.email_category,
            "email_usage": d.email_usage,
            "email_display_name": d.email_display_name  # Added field
        }
        data.append(row)

    return columns, data


def clean_string(s):
    """Remove spaces and convert string to lowercase."""
    return s.replace(" ", "").lower() if s else ''


def capitalize_if_present(s):
    """Capitalize the first letter of the string if present."""
    return s.capitalize() if s else ''


def create_login_id(d):
    """Create a login ID based on email category: Branch, Department, or Employee."""
    if d.email_category == 'Branch' and d.branch:
        return f"{clean_string(d.branch)}@sahayogmultistate.com"
    elif d.email_category == 'Employee' and d.first_name and d.last_name:
        return f"{clean_string(d.first_name)}.{clean_string(d.last_name)}@sahayogmultistate.com"
    elif d.email_category == 'Department' and d.department:
        return f"{clean_string(d.department)}@sahayogmultistate.com"
    return None  # Return None if no criteria are met


def get_columns():
    """Define the columns for the report."""
    return [
        {"fieldname": "name", "label": "Request ID", "fieldtype": "Link", "options": "Email Request", "width": "150"},
        {"fieldname": "mode", "label": "Mode", "fieldtype": "Data", "width": "100"},
        {"fieldname": "employee_id", "label": "Employee ID", "fieldtype": "Data", "width": "100"},
        {"fieldname": "first_name", "label": "First Name", "fieldtype": "Data", "width": "100"},
        {"fieldname": "last_name", "label": "Last Name", "fieldtype": "Data", "width": "100"},
        {"fieldname": "designation", "label": "Designation", "fieldtype": "Data", "width": "100"},
        {"fieldname": "department", "label": "Department", "fieldtype": "Data", "width": "100"},
        {"fieldname": "phone", "label": "Phone", "fieldtype": "Data", "width": "100"},
        {"fieldname": "login_id", "label": "Login ID", "fieldtype": "Data", "width": "200"},
        {"fieldname": "branch", "label": "Branch", "fieldtype": "Data", "width": "100"},
        {"fieldname": "email_category", "label": "Email Category", "fieldtype": "Data", "width": "150"},
        {"fieldname": "email_usage", "label": "Email Usage", "fieldtype": "Data", "width": "150"},
        {"fieldname": "email_display_name", "label": "Email Display Name", "fieldtype": "Data", "width": "200"}  # Added column
    ]


def get_email_request_data():
    """Fetch the data using raw SQL query with status condition."""
    query = """
        SELECT
            name,
            mode,
            employee_id,
            first_name,
            last_name,
            designation,
            department,
            phone,
            branch,
            email_category,
            email_usage,
            email_display_name  -- Added in SQL
        FROM
            `tabEmail Request`
        WHERE
            status = 'Pending From IT'
        ORDER BY
            creation DESC
    """

    try:
        return frappe.db.sql(query, as_dict=True)
    except Exception as e:
        frappe.log_error(f"Error fetching email request data: {str(e)}")
        return []
