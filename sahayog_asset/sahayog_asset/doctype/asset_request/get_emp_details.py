import frappe

@frappe.whitelist()
def get_emp_details(emp_id):
    return frappe.db.get_value(
        "Employee",
        {"employee_id": emp_id},
        [
            "department",
            "custom_division",
            "custom_region",
            "user_id",
            "branch",
            "custom_district",
            "employee_name",
            "cell_number",
            "designation",
            "custom_zone",
            "reports_to"
        ],
        as_dict=True
    )
