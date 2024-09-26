import frappe
from frappe.model.document import Document

class AssetRequest(Document):
    def before_save(self):
        self.set_employees_on_stages()
    
    def before_insert(self):
        self.set_employees_on_stages()

    def set_employees_on_stages(self):
        # Get employee record based on the employee_id in AssetRequest
        employee = frappe.get_doc("Employee", self.employee_id)
        
        # Retrieve the 'reports_to' field from the employee record
        reports_to = employee.reports_to
        
        if reports_to:
            # Fetch the reporting employee details based on 'reports_to'
            reporting_emp = frappe.get_doc("Employee", reports_to)
            
            # Retrieve employee_name, company_email, and designation from the reporting employee
            reporting_emp_name = reporting_emp.employee_name
            reporting_emp_email = reporting_emp.company_email
            reporting_emp_designation = reporting_emp.designation
            
            # Create the user_id in the format reports_to@sahayog.com
            reporting_user_id = f"{reports_to}@sahayog.com"

            # Set values to the fields in the AssetRequest document
            self.stage_1_emp_name = reporting_emp_name
            self.stage_1_emp_id = reporting_user_id
            self.stage_1_emp_email = reporting_emp_email
            self.rp_designation = reporting_emp_designation



    def validate(self):
        # Check if the status is not "Draft"
        if self.status != "Draft":
            # Ensure that the asset table is not empty
            if not self.asset or len(self.asset) == 0:
                frappe.throw("Asset table is empty")

    def on_change(self):
        # Check if status is "Dispatched"
        if self.status == "Dispatched":
           frappe.enqueue_doc(self.doctype, self.name, '_store_entry', queue='long', timeout=1500)

        if self.purchase_request == "Done":
           frappe.enqueue_doc(self.doctype, self.name, '_pr_entry', queue='long', timeout=1500)


    def _store_entry(self):
        # Initialize a list to keep track of successfully created store entries
        created_entries = []

        # Create a document for each asset item
        for row in self.asset:
            item_name = row.get('item_name')  # Assuming item_code field in child table
            quantity = row.get('quantity')
            item_company = row.get('company')
            serial_no = row.get('serial_no')
            windows_key = row.get('windows_key')
            office_key = row.get('office_key')
            # Convert quantity to integer
            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                quantity = 0

            # Check if quantity is not None and not 0
            if quantity > 0:
                # Create a new Store Entry document
                store_entry_doc = frappe.new_doc('Store Entry')
                store_entry_doc.branch = self.branch
                store_entry_doc.entry_type = 'STOCK-OUT'
                store_entry_doc.location_type = 'Branch'
                store_entry_doc.category = self.select_department
                store_entry_doc.item_code = item_name  # Assuming item_code field
                store_entry_doc.quantity = quantity    # Assuming quantity field
                store_entry_doc.item_company = item_company
                store_entry_doc.serial_no = serial_no
                store_entry_doc.windows_key = windows_key
                store_entry_doc.office_key = office_key
                # Save the document
                store_entry_doc.insert()

                # Add the created entry details to the list
                created_entries.append(f"Item Code: {item_name}, Quantity: {quantity}")

        # Construct a confirmation message
        details_message = f"Branch: {self.branch}\n"
        if created_entries:
            details_message += "\nStore Entries created for:\n" + "\n".join(created_entries)
        else:
            details_message += "No valid assets found."

        # Display the message
        frappe.msgprint(details_message)


@frappe.whitelist()
def store_pending(doc):
    if doc.stage_7_request == "Done":
       doc.status = "Pending From Store Manager"
       doc.save

    
    
# @frappe.whitelist()
# def get_count(employee_user, status):
#     count = frappe.db.sql(
#         """SELECT COUNT(*)
#            FROM `tabAsset Request`
#            WHERE employee_user=%s
#            AND status=%s;""",
#         (employee_user, status),
#     )
#     return count[0][0] if count else 0


@frappe.whitelist()
def get_counts(employee_user):
    statuses = [
        "Pending",
        "Dispatched",
        "Received",
        "Pending From Purchase",
        "Pending From Store Manager",
        "Rejected",
        "Delivered",
        "Draft",
    ]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*)
               FROM `tabAsset Request`
               WHERE employee_user = %s
               AND status = %s;""",
            (employee_user, status),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts


# for Reporting Manager
@frappe.whitelist()
def get_counts_request(employee_user):
    statuses = ["Pending"]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*) AS count
               FROM (
                   SELECT ds.*, ar.status
                   FROM `tabDocShare` ds
                   JOIN `tabAsset Request` ar ON ds.share_name = ar.name
                   WHERE ds.share_doctype = 'Asset Request'
                   AND ds.user = %s
                   AND ar.status = %s
                   AND (
                       (ar.stage_1_emp_status = 'Pending' AND ar.stage_1_emp_id = %s)
                       OR
                       (ar.stage_2_emp_status = 'Pending' AND ar.stage_2_emp_id = %s)
                       OR
                       (ar.stage_3_emp_status = 'Pending' AND ar.stage_3_emp_id = %s)
                       OR
                       (ar.stage_4_emp_status = 'Pending' AND ar.stage_4_emp_id = %s)
                       OR
                       (ar.stage_5_emp_status = 'Pending' AND ar.stage_5_emp_id = %s)
                       OR
                       (ar.stage_6_emp_status = 'Pending' AND ar.stage_6_emp_id = %s)
                   )
               ) AS subquery;""",
            (
                employee_user,
                status,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
            ),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts


# for Reporting Manager
@frappe.whitelist()
def get_approved_counts(employee_user):
    statuses = ["Pending"]
    counts = {}

    for status in statuses:
        count = frappe.db.sql(
            """SELECT COUNT(*) AS count
               FROM (
                   SELECT ds.*, ar.status
                   FROM `tabDocShare` ds
                   JOIN `tabAsset Request` ar ON ds.share_name = ar.name
                   WHERE ds.share_doctype = 'Asset Request'
                   AND ds.user = %s
                   AND ar.status = %s
                   AND ar.status != 'Pending'
                   AND (
                       (ar.stage_1_emp_status IN ('Approved', 'Skip') AND ar.stage_1_emp_id = %s)
                       OR
                       (ar.stage_2_emp_status IN ('Approved', 'Skip') AND ar.stage_2_emp_id = %s)
                       OR
                       (ar.stage_3_emp_status IN ('Approved', 'Skip') AND ar.stage_3_emp_id = %s)
                       OR
                       (ar.stage_4_emp_status IN ('Approved', 'Skip') AND ar.stage_4_emp_id = %s)
                       OR
                       (ar.stage_5_emp_status IN ('Approved', 'Skip') AND ar.stage_5_emp_id = %s)
                       OR
                       (ar.stage_6_emp_status IN ('Approved', 'Skip') AND ar.stage_6_emp_id = %s)
                   )
               ) AS subquery;""",
            (
                employee_user,
                status,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
                employee_user,
            ),
        )
        counts[status.lower()] = count[0][0] if count else 0

    return counts



@frappe.whitelist()
def Level1(employee_user):
    message = f"Testing Done {employee_user}"
    return message  

@frappe.whitelist()
def get_level_1_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_1_emp_id = %s
           AND stage_1_emp_status = 'Pending';""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_2_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_2_emp_id = %s
           AND stage_2_emp_status = 'Pending'
            AND stage_1_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_3_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_3_emp_id = %s
           AND stage_3_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
           AND stage_2_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_4_count(employee_user):
    count = frappe.db.sql(
        """SELECT count(*)
FROM `tabAsset Request`
WHERE status = 'Pending'
AND employee_user != %s
AND stage_4_emp_id = %s
AND stage_4_emp_status = 'Pending'
AND stage_1_emp_status IN ('Approved', 'Skip')
AND stage_2_emp_status IN ('Approved', 'Skip')
AND stage_3_emp_status IN ('Approved', 'Skip')
;
""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_5_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_5_emp_id = %s
           AND stage_5_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
AND stage_2_emp_status IN ('Approved', 'Skip')
AND stage_3_emp_status IN ('Approved', 'Skip')
AND stage_4_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0

@frappe.whitelist()
def get_level_6_count(employee_user):
    count = frappe.db.sql(
        """SELECT COUNT(*)
           FROM `tabAsset Request`
           WHERE status = 'Pending'
           AND employee_user != %s
           AND stage_6_emp_id = %s
           AND stage_6_emp_status = 'Pending'
           AND stage_1_emp_status IN ('Approved', 'Skip')
           AND stage_2_emp_status IN ('Approved', 'Skip')
           AND stage_3_emp_status IN ('Approved', 'Skip')
           AND stage_4_emp_status IN ('Approved', 'Skip')
           AND stage_5_emp_status IN ('Approved', 'Skip');""",
        (employee_user, employee_user)
    )

    # Extract count value from the result
    return count[0][0] if count else 0


@frappe.whitelist()
def get_all_count(employee_user):
    # Call each function to get counts
    level_1_count = get_level_1_count(employee_user)
    level_2_count = get_level_2_count(employee_user)
    level_3_count = get_level_3_count(employee_user)
    level_4_count = get_level_4_count(employee_user)
    level_5_count = get_level_5_count(employee_user)
    level_6_count = get_level_6_count(employee_user)

    # Check if all counts are zero
    if all(count == 0 for count in [level_1_count, level_2_count, level_3_count, level_4_count, level_5_count, level_6_count]):
        return True
    else:
        return False
