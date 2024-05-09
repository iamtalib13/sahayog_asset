# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AssetRequest(Document):
    pass


# @frappe.whitelist()
# def get_count(employee_user, status):
#     count = frappe.db.sql(
#         """SELECT COUNT(*)
#            FROM `tabAsset Request`
#            WHERE employee_user=%s
#            AND status=%s;""",
#         (employee_user, status),
#     )
#     return count[0][0] if count else 0


@frappe.whitelist()
def get_counts(employee_user):
    statuses = [
        "Pending",
        "Dispatched",
        "Received",
        "Pending From Purchase",
        "Pending From Store Manager",
        "Rejected",
        "Delivered",
        "Draft",
    ]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*)
               FROM `tabAsset Request`
               WHERE employee_user = %s
               AND status = %s;""",
            (employee_user, status),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts


# for Reporting Manager
@frappe.whitelist()
def get_counts_request(employee_user):
    statuses = ["Pending"]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*) AS count
               FROM (
                   SELECT ds.*, ar.status
                   FROM `tabDocShare` ds
                   JOIN `tabAsset Request` ar ON ds.share_name = ar.name
                   WHERE ds.share_doctype = 'Asset Request'
                   AND ds.user = %s
                   AND ar.status = %s
                   AND (
                       (ar.stage_1_emp_status = 'Pending' AND ar.stage_1_emp_id = %s)
                       OR
                       (ar.stage_2_emp_status = 'Pending' AND ar.stage_2_emp_id = %s)
                       OR
                       (ar.stage_3_emp_status = 'Pending' AND ar.stage_3_emp_id = %s)
                       OR
                       (ar.stage_4_emp_status = 'Pending' AND ar.stage_4_emp_id = %s)
                       OR
                       (ar.stage_5_emp_status = 'Pending' AND ar.stage_5_emp_id = %s)
                       OR
                       (ar.stage_6_emp_status = 'Pending' AND ar.stage_6_emp_id = %s)
                   )
               ) AS subquery;""",
            (
                employee_user,
                status,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
            ),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts


# for Reporting Manager
@frappe.whitelist()
def get_approved_counts(employee_user):
    statuses = ["Pending"]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*) AS count
               FROM (
                   SELECT ds.*, ar.status
                   FROM `tabDocShare` ds
                   JOIN `tabAsset Request` ar ON ds.share_name = ar.name
                   WHERE ds.share_doctype = 'Asset Request'
                   AND ds.user = %s
                   AND ar.status = %s
                   AND ar.status != 'Pending'
                   AND (
                       (ar.stage_1_emp_status IN ('Approved', 'Skip') AND ar.stage_1_emp_id = %s)
                       OR
                       (ar.stage_2_emp_status IN ('Approved', 'Skip') AND ar.stage_2_emp_id = %s)
                       OR
                       (ar.stage_3_emp_status IN ('Approved', 'Skip') AND ar.stage_3_emp_id = %s)
                       OR
                       (ar.stage_4_emp_status IN ('Approved', 'Skip') AND ar.stage_4_emp_id = %s)
                       OR
                       (ar.stage_5_emp_status IN ('Approved', 'Skip') AND ar.stage_5_emp_id = %s)
                       OR
                       (ar.stage_6_emp_status IN ('Approved', 'Skip') AND ar.stage_6_emp_id = %s)
                   )
               ) AS subquery;""",
            (
                employee_user,
                status,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
            ),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts
