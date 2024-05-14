# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AssetRequest(Document):
    pass

def validate(self):
    if self.status == "Pending":
        # Iterate through each row in the "asset" child table
        for asset in self.get("asset"):
            # Check if the "quantity" field is blank
            if not asset.quantity:
                frappe.throw("Quantity cannot be blank for all assets.")  # Show message if quantity is blank

@frappe.whitelist()
def store_pending(doc):
    if doc.stage_7_request == "Done":
       doc.status = "Pending From Store Manager"
       doc.save

    
    
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



@frappe.whitelist()
def Level1(employee_user):
    message = f"Testing Done {employee_user}"
    return message  

@frappe.whitelist()
def get_level_1_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_1_emp_id = %s
           AND stage_1_emp_status = 'Pending';""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_2_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_2_emp_id = %s
           AND stage_2_emp_status = 'Pending'
            AND stage_1_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_3_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_3_emp_id = %s
           AND stage_3_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
           AND stage_2_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_4_count(employee_user):
    count = frappe.db.sql(
        """SELECT count(*)
FROM `tabAsset Request`
WHERE status = 'Pending'
AND employee_user != %s
AND stage_4_emp_id = %s
AND stage_4_emp_status = 'Pending'
AND stage_1_emp_status IN ('Approved', 'Skip')
AND stage_2_emp_status IN ('Approved', 'Skip')
AND stage_3_emp_status IN ('Approved', 'Skip')
;
""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_5_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_5_emp_id = %s
           AND stage_5_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
AND stage_2_emp_status IN ('Approved', 'Skip')
AND stage_3_emp_status IN ('Approved', 'Skip')
AND stage_4_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_6_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_6_emp_id = %s
           AND stage_6_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
           AND stage_2_emp_status IN ('Approved', 'Skip')
           AND stage_3_emp_status IN ('Approved', 'Skip')
           AND stage_4_emp_status IN ('Approved', 'Skip')
           AND stage_5_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0


@frappe.whitelist()
def get_all_count(employee_user):
    # Call each function to get counts
    level_1_count = get_level_1_count(employee_user)
    level_2_count = get_level_2_count(employee_user)
    level_3_count = get_level_3_count(employee_user)
    level_4_count = get_level_4_count(employee_user)
    level_5_count = get_level_5_count(employee_user)
    level_6_count = get_level_6_count(employee_user)

    # Check if all counts are zero
    if all(count == 0 for count in [level_1_count, level_2_count, level_3_count, level_4_count, level_5_count, level_6_count]):
        return True
    else:
        return False
