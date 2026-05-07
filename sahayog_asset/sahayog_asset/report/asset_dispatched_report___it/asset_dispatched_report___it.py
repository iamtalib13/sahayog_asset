# Copyright (c) 2026, Sid and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns():
	return [
		{
			"label": _("Asset Request Name"),
			"fieldname": "asset_request_name",
			"fieldtype": "Link",
			"options": "Asset Request",
			"width": 180
		},
		{
			"label": _("Employee Name"),
			"fieldname": "emp_name",
			"fieldtype": "Data",
			"width": 150
		},
		{
			"label": _("Employee Code"),
			"fieldname": "employee_id",
			"fieldtype": "Data",
			"width": 120
		},
		{
			"label": _("Request Date"),
			"fieldname": "date",
			"fieldtype": "Date",
			"width": 100
		},
		{
			"label": _("Delivered Date"),
			"fieldname": "delivered_date",
			"fieldtype": "Date",
			"width": 120
		},
		{
			"label": _("Branch"),
			"fieldname": "branch",
			"fieldtype": "Link",
			"options": "Branch",
			"width": 120
		},
		{
			"label": _("Department"),
			"fieldname": "employee_department",
			"fieldtype": "Link",
			"options": "Department",
			"width": 120
		},
		{
			"label": _("Division"),
			"fieldname": "division",
			"fieldtype": "Link",
			"options": "Division",
			"width": 120
		},		
		{
			"label": _("Status"),
			"fieldname": "status",
			"fieldtype": "Data",
			"width": 120
		},
		{
			"label": _("Employee Received Remark"),
			"fieldname": "emp_received_remark",
			"fieldtype": "Small Text",
			"width": 200
		},
		{
			"label": _("Item Name"),
			"fieldname": "item_name",
			"fieldtype": "Data",
			"width": 150
		},
		{
			"label": _("Quantity"),
			"fieldname": "quantity",
			"fieldtype": "Float",
			"width": 80
		},
		{
			"label": _("Serial No"),
			"fieldname": "serial_no",
			"fieldtype": "Data",
			"width": 120
		},
		{
			"label": _("Dispatched Mode"),
			"fieldname": "mode_of_transport",
			"fieldtype": "Data",
			"width": 120
		},
		{
			"label": _("Dispatched Status"),
			"fieldname": "dispatched_status",
			"fieldtype": "Data",
			"width": 120
		},
		{
			"label": _("Request to"),
			"fieldname": "select_department",
			"fieldtype": "Link",
			"options": "Asset Department",
			"width": 120
		}
	]

def get_data(filters):
	conditions = get_conditions(filters)

	query = f"""
		SELECT
			ar.name AS asset_request_name,
			ar.status,
			ar.emp_name,
			ar.employee_id,
			ar.date,
			ar.delivered_date,
			ar.branch,
			ar.employee_department,
			ar.division,
			ar.emp_received_remark,
			al.mode_of_transport,
			al.dispatched_status,
			al.item_name,
			al.quantity,
			al.serial_no,
			ar.select_department
		FROM
			`tabAsset Request` AS ar
		LEFT JOIN
			`tabAsset List` AS al ON ar.name = al.parent
		WHERE
			ar.select_department = 'IT'
			{conditions}
		ORDER BY
			ar.date ASC
	"""
	return frappe.db.sql(query, filters, as_dict=True)

def get_conditions(filters):
        conditions = ""
        if filters.get("status"):
                conditions += " AND ar.status = %(status)s"

        if filters.get("item"):
                conditions += " AND al.item_name = %(item)s"

        if filters.get("from_date"):
                conditions += " AND ar.date >= %(from_date)s"
        if filters.get("to_date"):
                conditions += " AND ar.date <= %(to_date)s"

        return conditions

