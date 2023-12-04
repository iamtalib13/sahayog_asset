# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    # Clear the cache before running your code
    frappe.clear_cache()
    columns, data = get_columns(), get_data(filters)
    return columns, data


def get_data(filters):
    query = """
        SELECT
            name, emp_name, select_department,
            stage_1_emp_status, stage_2_emp_status,
            stage_3_emp_status, stage_4_emp_status,
            stage_5_emp_status, stage_6_emp_status,
            stage_7_emp_status
        FROM
            `tabAsset Request`
    """
    data = frappe.db.sql(query)
    return data


def get_columns():
    return [
        _("ID") + ":Link/Asset Request:100",
        _("Employee") + ":Data:100",
        _("Department") + ":Data:100",
        _("Reporting Person Status") + ":Data:100",
        _("HOD Status") + ":Data:100",
        _("GM Status") + ":Data:100",
        _("CFO Status") + ":Data:100",
        _("CEO Status") + ":Data:100",
        _("CTO Status") + ":Data:100",
        _("Store Status") + ":Data:100",
    ]
