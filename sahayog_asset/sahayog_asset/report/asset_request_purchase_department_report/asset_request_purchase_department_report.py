# asset_request_purchase_department_report.py

# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt
import frappe
from frappe import _


def execute(filters=None):
    frappe.errprint(filters)
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
            "id": d.name,
            "asset_name": d.item_name,
            "quantity": int(d.quantity),
            "branch": d.branch,
            "emp_name": d.emp_name,
            "select_department": d.select_department,
            "date": d.date,
        }
        data.append(row)

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
            "width": "500",
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
            "fieldtype": "Data",
            "width": "90",
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
            "fieldtype": "Data",
            "width": "100",
        },
    ]


def get_cs_data(filters):
    select_department_filter = filters.get("select_department", "All")

    # If "All" is selected, include all rows without filtering by select_department
    if select_department_filter == "All":
        sql_query = """
        SELECT
            ar.name, ar.emp_name, ar.date,
            ar.branch, ar.select_department,
            al.item_name, al.quantity
        FROM
            `tabAsset Request` AS ar
        LEFT JOIN
            `tabAsset List` AS al
        ON
            ar.name = al.parent
        WHERE
            ar.status IN ('Pending', 'Pending From Purchase') AND 
            al.purchase = 'Pending'
        """
        data = frappe.db.sql(sql_query, as_dict=True)

    # If a specific department is selected, filter rows based on select_department
    else:
        sql_query = """
        SELECT
            ar.name, ar.emp_name, ar.date,
            ar.branch, ar.select_department,
            al.item_name, al.quantity
        FROM
            `tabAsset Request` AS ar
        LEFT JOIN
            `tabAsset List` AS al
        ON
            ar.name = al.parent
        WHERE
            ar.status IN ('Pending', 'Pending From Purchase') AND 
            ar.select_department = %s AND 
            al.purchase = 'Pending'
        """
        data = frappe.db.sql(sql_query, (select_department_filter,), as_dict=True)

    return data
