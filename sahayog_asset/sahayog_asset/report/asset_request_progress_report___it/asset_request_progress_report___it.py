import frappe
from frappe.utils import get_fullname


def execute(filters=None):
    if not filters:
        filters = {}

    data, columns = [], []

    columns = get_columns()
    cs_data = get_cs_data(filters)

    if not cs_data:
        frappe.msgprint("No Records Found")
        return columns, data

    for d in cs_data:
        row = {
            "name": d.name,
            "emp_name": d.emp_name,
            "date": d.date,
            "Elapsed_Days": d.Elapsed_Days,  # Include the "Elapsed Days" field
            "branch": d.branch,  # Add branch field
            "select_department": d.select_department,
            "item_names": d.item_names,
            "stage_1_emp_name": d.stage_1_emp_name,
            "stage_1_emp_status": d.stage_1_emp_status,
            "stage_2_emp_name": d.stage_2_emp_name,
            "stage_2_emp_status": d.stage_2_emp_status,
            "stage_3_emp_status": d.stage_3_emp_status,
            "stage_4_emp_status": d.stage_4_emp_status,
            "stage_5_emp_status": d.stage_5_emp_status,
            "stage_6_emp_status": d.stage_6_emp_status,
            "stage_7_emp_status": d.stage_7_emp_status,
        }
        data.append(row)

    return columns, data


def get_columns():
    return [
        {
            "fieldname": "name",
            "label": "ID",
            "fieldtype": "Link",
            "options": "Asset Request",
            "width": "155",
        },
        {
            "fieldname": "emp_name",
            "label": "Employee",
            "fieldtype": "Data",
            "width": "135",
        },
        {
            "fieldname": "date",
            "label": "Request Date",
            "fieldtype": "Date",  # Assuming 'date' is a date field in the database
            "width": "100",  # Adjust width as needed
        },
        {
            "fieldname": "Elapsed_Days",
            "label": "Elapsed Days",
            "fieldtype": "Data",
            "width": "100",  # Adjust width as needed
        },
        {
            "fieldname": "branch",
            "label": "Branch",
            "fieldtype": "Data",
            "width": "100",  # Adjust width as needed
        },
        {
            "fieldname": "select_department",
            "label": "Request To",
            "fieldtype": "Data",
            "width": "90",
        },
        {
            "fieldname": "item_names",
            "label": "Asset Items",
            "fieldtype": "HTML",
            "width": "200",
        },
        {
            "fieldname": "stage_1_emp_name",
            "label": "RP Name",
            "fieldtype": "Data",
            "width": "130",
        },
        {
            "fieldname": "stage_1_emp_status",
            "label": "RP",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_2_emp_name",
            "label": "HOD Name",
            "fieldtype": "Data",
            "width": "130",
        },
        {
            "fieldname": "stage_2_emp_status",
            "label": "HOD",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_3_emp_status",
            "label": "GM",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_4_emp_status",
            "label": "CFO",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_5_emp_status",
            "label": "CEO",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_6_emp_status",
            "label": "CTO",
            "fieldtype": "Data",
            "width": "75",
        },
        {
            "fieldname": "stage_7_emp_status",
            "label": "Store Manager",
            "fieldtype": "Data",
            "width": "125",
        },
    ]


def get_cs_data(filters):
    # Build the SQL query
    sql_query = """
 SELECT
        ar.name, ar.emp_name, ar.date,
        DATEDIFF(CURDATE(), ar.date) AS Elapsed_Days,
        ar.branch, ar.select_department,
        GROUP_CONCAT(DISTINCT CONCAT('(', al.item_name, ')') ORDER BY al.item_name ASC SEPARATOR '<br>') AS item_names,
        ar.stage_1_emp_name, ar.stage_1_emp_status, ar.stage_2_emp_name, ar.stage_2_emp_status,
        ar.stage_3_emp_status, ar.stage_4_emp_status,
        ar.stage_5_emp_status, ar.stage_6_emp_status, ar.stage_7_emp_status
    FROM
        `tabAsset Request` AS ar
    LEFT JOIN
        `tabAsset List` AS al
    ON
        ar.name = al.parent
    WHERE
        ar.status IN ('Pending', 'Pending From Purchase') AND ar.employee_department NOT IN ('Teaching', 'Non-Teaching')
         AND ar.select_department = 'IT'
    GROUP BY
        ar.name
    ORDER BY
        Elapsed_Days DESC;
    """

    # Execute the SQL query
    data = frappe.db.sql(sql_query, as_dict=True)

    return data
