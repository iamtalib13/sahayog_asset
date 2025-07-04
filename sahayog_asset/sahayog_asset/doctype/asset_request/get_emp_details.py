import frappe


@frappe.whitelist()
def get_emp_details(emp_id):
    return frappe.db.sql(
        f"""select department,custom_division,custom_region,user_id,branch,custom_district,employee_name,cell_number,designation,custom_zone,reports_to
        from `tabEmployee` where employee_id='{emp_id}';""",
        as_dict=True,
    )
