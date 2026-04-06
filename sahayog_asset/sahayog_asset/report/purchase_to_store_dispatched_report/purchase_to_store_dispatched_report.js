// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Purchase to Store Dispatched Report"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
			"reqd": 1
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_today(),
			"reqd": 1
		},
		{
			"fieldname": "select_department",
			"label": __("Asset Department"),
			"fieldtype": "Link",
			"options": "Asset Department"
		},
		{
			"fieldname": "branch",
			"label": __("Branch"),
			"fieldtype": "Link",
			"options": "Branch"
		},
		{
			"fieldname": "division",
			"label": __("Division"),
			"fieldtype": "Link",
			"options": "Division"
		}
	]
};
