import frappe


@frappe.whitelist()
def get_emp_dept(emp_id):
    return frappe.db.sql(
        f"""select department,division,region from `tabEmployee` where employee_id='{emp_id}';""",
        as_dict=True,
    )
