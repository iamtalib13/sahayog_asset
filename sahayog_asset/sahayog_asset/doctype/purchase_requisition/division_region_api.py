
import frappe


@frappe.whitelist()
def check_user_divison_region(emp_id):
    return frappe.db.sql(
        f"""select custom_division,custom_region,department from `tabEmployee` where employee_number='{emp_id}';""",
        as_dict=True,
    )
