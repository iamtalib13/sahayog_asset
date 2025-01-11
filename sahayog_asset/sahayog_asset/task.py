import frappe


def name():
     # Fetch all Email Request records where email_category is "Employee"
    requests = frappe.get_all(
        "Email Request",
        filters={"email_category": ["in", ["Employee"]]},
        fields=["name", "employee_name"]
    )

    # Update each record with extracted first and last names
    for request in requests:
        employee_name = request.get('employee_name')
        doc_name = request.get('name')  # Get the name (ID) of the document

        if employee_name:
            # Split the employee name into first and last names
            name_parts = employee_name.split()
            first_name = name_parts[0]  # First name
            last_name = name_parts[-1] if len(name_parts) > 1 else ""  # Last name (if available)

            # Update the document with the new first_name and last_name
            frappe.db.set_value("Email Request", doc_name, "first_name", first_name, update_modified=False)
            frappe.db.set_value("Email Request", doc_name, "last_name", last_name, update_modified=False)
            print(f"Updated {doc_name}: First Name: {first_name}, Last Name: {last_name}")


# def delete_all_asset_requests():
#     try:
#         # Fetch all Asset Request documents
#         asset_requests = frappe.get_all("Asset Request")

#         # Loop through the list of documents and delete each one
#         for asset_request in asset_requests:
#             print(f"Deleting Asset Request: {asset_request.name}")
#             frappe.delete_doc("Asset Request", asset_request.name)

#         # Commit the changes to the database
#         frappe.db.commit()
#         return "All Asset Request documents have been deleted successfully."

#     except Exception as e:
#         frappe.db.rollback()  # Rollback changes in case of an error
#         return f"Error deleting Asset Requests: {str(e)}"


# # Call the function to delete all Asset Request documents
# result = delete_all_asset_requests()
# print(result)


def update_asset_list_item_name():
    # Fetch all Asset List records where parenttype is "Purchase Requisition"
    asset_list = frappe.get_all(
        "Asset List",
        filters={"parenttype": "Purchase Requisition"},
        fields=["name", "item_name", "asset_name"]
    )

    for asset in asset_list:
        # Match asset_name in Asset List with name in Sahayog Item
        sahayog_item = frappe.get_value(
            "Sahayog Item",
            {"name": asset['asset_name']},
            "item_name"
        )

        # If a match is found, update the asset_name in Asset List with the matched item_name from Sahayog Item
        if sahayog_item:
            frappe.db.set_value("Asset List", asset['name'], "asset_name", sahayog_item)
            print(f"Updated asset_name for Asset List {asset['name']} to {sahayog_item}")

