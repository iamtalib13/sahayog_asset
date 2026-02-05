import frappe

@frappe.whitelist()
def get_emp_details(emp_id, asset_request=None):

    try:
        emp_info = frappe.db.get_value(
            "Employee",
            {"employee_number": emp_id},
            [
                "employee_name",
                "designation",
                "department",
                "custom_region",
                "custom_district",
                "custom_division",
                "branch",
                "cell_number"
            ],
            as_dict=True
        )

        if not emp_info:
            return {}

        # Get reporting manager details
        reports_to = frappe.db.get_value("Employee", {"employee_number": emp_id}, "reports_to")
        reporting_data = {}
        if reports_to:
            rep_info = frappe.db.get_value("Employee", reports_to, ["employee_name", "company_email", "designation"], as_dict=True)
            if rep_info:
                reporting_data = {
                    "stage_1_emp_name": rep_info.employee_name,
                    "stage_1_emp_id": f"{reports_to}@sahayog.com",
                    "stage_1_emp_email": rep_info.company_email,
                    "rp_designation": rep_info.designation
                }

        data = {
            "emp_name": emp_info.employee_name or "Not specified",
            "designation": emp_info.designation or "Employee",
            "employee_department": emp_info.department or "Operations",
            "region": emp_info.custom_region or "Head Office",
            "district": emp_info.custom_district or "",
            "division": emp_info.custom_division or "",
            "branch": emp_info.branch or "GONDIA HO",
            "phone": emp_info.cell_number or ""
        }
        data.update(reporting_data)

        # 🔥 IF DOCNAME PROVIDED → UPDATE DATABASE DIRECTLY
        if asset_request:
            frappe.db.set_value("Asset Request", asset_request, data)
            frappe.db.commit()

        return data

    except Exception:
        frappe.log_error(frappe.get_traceback(), "get_emp_details error")
        return {}
