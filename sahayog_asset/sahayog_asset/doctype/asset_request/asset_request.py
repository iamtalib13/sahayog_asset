import frappe
from frappe.model.document import Document

class AssetRequest(Document):
    def before_save(self):
        self.set_employees_on_stages()
        # Run the logic only if the document status is "Draft"
        #self.set_approval_and_skip_levels()
    
    def on_update(self):
        if (
            self.has_value_changed("stage_2_emp_status")
            and self.stage_2_emp_status == "Approved"
        ):
         {
            self.db_set("status", "Pending From Store Manager", notify=False)
         }
        
    def set_approval_and_skip_levels(self):
        pending_status = "Pending"
        skip_status = "Skip"
        approved_status = "Approved"
        rejected_status = "Rejected"

        # Helper to safely set stage status while respecting manual override
        def set_stage_status(stage, status):
            manual_skip = getattr(self, f"stage_{stage}_manual_skip", False)
            if manual_skip and status == skip_status:
                print(f"Stage {stage} manually set to Skip. Skipping automatic update.")
                return
            setattr(self, f"stage_{stage}_emp_status", status)
            print(f"Stage {stage} set to {status}.")

        # Check if CEO is same as stage 1
        def check_CEO():
            stage_1_emp_id = self.stage_1_emp_id
            stage_5_emp_id = self.stage_5_emp_id
            return stage_1_emp_id == stage_5_emp_id

        # Handle duplicate employees across stages
        def check_duplicate_stages():
            emp_ids = [
                self.stage_1_emp_id,
                self.stage_2_emp_id,
                self.stage_3_emp_id,
                self.stage_4_emp_id,
                self.stage_5_emp_id,
            ]

            approval_ranks = {stage: None for stage in range(1, 6)}
            for row in self.asset:
                approval_rank = row.approval_rank
                if approval_rank in approval_ranks:
                    approval_ranks[approval_rank] = approval_rank

            for i in range(len(emp_ids)):
                for j in range(i + 1, len(emp_ids)):
                    if emp_ids[i] and emp_ids[i] == emp_ids[j]:
                        rank_i = approval_ranks[i + 1] or float('inf')
                        rank_j = approval_ranks[j + 1] or float('inf')

                        if rank_i < rank_j:
                            set_stage_status(j + 1, skip_status)
                            print(f"Stage {j + 1} skipped because stage {i + 1} has higher rank.")
                        elif rank_j < rank_i:
                            set_stage_status(i + 1, skip_status)
                            print(f"Stage {i + 1} skipped because stage {j + 1} has higher rank.")
                        else:
                            set_stage_status(j + 1, skip_status)
                            print(f"Stage {j + 1} skipped due to same rank as stage {i + 1}.")

        # Handle approval logic based on highest rank
        def check_higher_rank():
            highest_rank = 0
            if self.asset:
                for row in self.asset:
                    if row.approval_rank and isinstance(row.approval_rank, int):
                        current_rank = row.approval_rank
                        if current_rank > highest_rank:
                            highest_rank = current_rank

            print("Highest Approval Rank is:", highest_rank)

            if check_CEO():
                for i in range(1, 6):
                    set_stage_status(i, skip_status)
                print("All stages skipped due to CEO condition.")
            else:
                if highest_rank == 0:
                    for i in range(1, 5):
                        emp_status = getattr(self, f"stage_{i}_emp_status")
                        if emp_status not in [approved_status, rejected_status]:
                            set_stage_status(i, pending_status)
                elif highest_rank == 1:
                    set_stage_status(1, pending_status)
                    for i in range(2, 6):
                        set_stage_status(i, skip_status)
                else:
                    for i in range(1, 6):
                        emp_status = getattr(self, f"stage_{i}_emp_status")
                        if emp_status not in [approved_status, rejected_status]:
                            if i <= highest_rank:
                                set_stage_status(i, pending_status)
                            else:
                                set_stage_status(i, skip_status)

        # Main flow
        if check_CEO():
            for i in range(1, 5):
                set_stage_status(i, skip_status)
            set_stage_status(5, pending_status)
            print("CEO condition applied: Stages 1-4 skipped, Stage 5 pending.")
        else:
            check_duplicate_stages()
            check_higher_rank()

        # Final check for duplicates again after rank assignment
        check_duplicate_stages()

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

              # Set only if empty
            if not self.stage_1_emp_status:
                self.stage_1_emp_status = "Pending"

        # --- Set Stage 2 Approver as fixed ---
        self.stage_2_emp_id = "2800@sahayog.com"
        stage2 = frappe.db.get_value("Employee", {"user_id": "2800@sahayog.com"}, ["employee_name","company_email"], as_dict=True)
        if stage2:
            self.stage_2_emp_name = stage2.employee_name
            self.stage_2_emp_email = stage2.company_email
        else:
            self.stage_2_emp_name = "JITENDRA INDRARAJ RANGARI"
            self.stage_2_emp_email = "jitendra.r@sahayogmultistate.com"

        if not self.stage_2_emp_status:
            self.stage_2_emp_status = "Pending"

        # --- Skip Stages 3 to 6 ---
        for i in range(3, 7):
            setattr(self, f"stage_{i}_emp_status", "Skip")
            setattr(self, f"stage_{i}_emp_id", "")
            setattr(self, f"stage_{i}_emp_name", "")
            setattr(self, f"stage_{i}_emp_email", "")

        # Don't touch stage_7 (leave it for later logic or manual input)




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


#permission query conditions and has_permission functions
# These functions control access to the Asset Request doctype based on user roles and document properties.
# They determine which records a user can see and whether they can perform actions on those records.
def get_permission_query_conditions(user):
    if not user:
        return ""

    roles = frappe.get_roles(user)
    full_access_roles = ["Administrator", "Purchase Department"]

    # Full access
    if any(role in full_access_roles for role in roles):
        return ""

    # Department-based access + own records
    conditions = [f"`tabAsset Request`.`employee_user` = '{user}'"]

    # Admin department
    if any(role in roles for role in [
        "Admin Support Executive",
        "Admin Support Manager",
        "Admin Store Executive",
        "Admin Store Manager"
    ]):
        conditions.append("`tabAsset Request`.`select_department` = 'Admin'")

    # IT department
    if any(role in roles for role in [
        "IT Support Executive",
        "IT Store Executive",
        "IT Store Manager"
    ]):
        conditions.append("`tabAsset Request`.`select_department` = 'IT'")

    # Stationery department
    if "Stationery Store & Support Manager" in roles:
        conditions.append("`tabAsset Request`.`select_department` = 'Stationery'")

    # Access based on stage_x_emp_id
    for stage in range(1, 8):
        conditions.append(f"`tabAsset Request`.`stage_{stage}_emp_id` = '{user}'")

    return "(" + " OR ".join(conditions) + ")"


def has_permission(doc, user):
    roles = frappe.get_roles(user)
    full_access_roles = ["Administrator", "Purchase Department"]

    # Full access
    if any(role in full_access_roles for role in roles):
        return True

    # Own records always
    if doc.employee_user == user:
        return True
    for stage in range(1, 8):
        if getattr(doc, f"stage_{stage}_emp_id", None) == user:
            return True

    # Department-based access
    if any(role in roles for role in [
        "Admin Support Executive",
        "Admin Support Manager",
        "Admin Store Executive",
        "Admin Store Manager"
    ]) and doc.select_department.lower() == "admin":
        return True

    if any(role in roles for role in [
        "IT Support Executive",
        "IT Store Executive",
        "IT Store Manager"
    ]) and doc.select_department.lower() == "it":
        return True

    if "Stationery Store & Support Manager" in roles and doc.select_department.lower() == "stationery":
        return True

    return False


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

