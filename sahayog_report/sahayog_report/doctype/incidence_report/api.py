import frappe

@frappe.whitelist()
def check_user_designation(emp_id):
    return frappe.db.sql(f"""select designation from `tabEmployee` where employee_id='{emp_id}';""", as_dict=True)