# import frappe


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
