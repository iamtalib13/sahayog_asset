import frappe


@frappe.whitelist()
def get_emp_details(emp_id):
    return frappe.db.sql(
        f"""select department,division,region,user_id,branch,district,employee_name,cell_number,designation,zone,reports_to
        from `tabEmployee` where employee_id='{emp_id}';""",
        as_dict=True,
    )
