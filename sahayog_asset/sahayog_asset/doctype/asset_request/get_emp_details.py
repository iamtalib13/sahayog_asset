import frappe

@frappe.whitelist()
def get_emp_details(emp_id):
    employee = frappe.get_all(
        "Employee",
        filters={"employee_id": emp_id},
        fields=[
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
            "reports_to",
        ],
        limit=1
    )
    return employee
