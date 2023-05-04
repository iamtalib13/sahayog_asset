// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Requisition", {
  onload: function (frm) {
    if (frm.doc.status == "New") {
      label = "New";
      color = "blue";
    } else if (frm.doc.status == "Pending from RM") {
      label = "Pending from RM";
      color = "orange";
    } else if (frm.doc.status == "Pending from HOD") {
      label = "Pending from HOD";
      color = "orange";
    } else if (frm.doc.status == "RM Rejected") {
      label = "RM Rejected";
      color = "red";
    } else if (frm.doc.status == "HOD Rejected") {
      label = "HOD Rejected";
      color = "red";
    } else if (frm.doc.status == "RM Approved") {
      label = "RM Approved";
      color = "green";
    } else if (frm.doc.status == "Approved") {
      label = "Approved";
      color = "green";
    } else {
      // If the status is not recognized, set a default label and color
      label = frm.doc.status;
      color = "grey";
    }
    frm.page.set_indicator(__(label), color);

    if (rm_approval_status == "Pending") {
      frm.set_value("");
      frm.page.set_indicator(__("Pending from RM"), "orange");
    }
  },

  refresh: function (frm) {
    let user = frappe.session.user;
    frappe.show_alert(user);

    let eid = user.match(/\d+/)[0];

    if (frm.is_new()) {
      frm.set_value("employee_id", eid);
    }
    let emp_id = frm.doc.employee_id;

    console.log(emp_id);
    // console.log("Division" + frm.doc.division);
    //console.log("Region" + frm.doc.region);
    //<Getting Employee Region & Division using API Call>

    frappe.call({
      method:
        "sahayog_asset.sahayog_asset.doctype.purchase_requisition.division_region_api.check_user_divison_region",
      args: {
        emp_id: emp_id,
      },
      callback: function (r) {
        // Check if the message array contains at least one object
        if (r.message.length > 0) {
          // Get the division and region fields from the first object in the array
          var division = r.message[0].division;
          var region = r.message[0].region;
          var owner_id = r.message[0].user_id;

          frm.set_value("division", division);
          frm.set_value("region", region);
          frm.set_value("emp_user", owner_id);

          //<RM for Region 1 Bases on Division>

          if (division == "MULTISTATE" && region == "Region 1") {
            frm.set_value("rm", "Mangesh Kathane");
            frm.set_value("rm_user", "26@sahayog.com");
          } else if (division == "MICROFINANCE" && region == "Region 1") {
            frm.set_value("rm", "vijay kotriwar");
            frm.set_value("rm_user", "49@sahayog.com");
          } else if (division == "TWO WHEELER" && region == "Region 1") {
            frm.set_value("rm", "Asheesh Chourasia");
            frm.set_value("rm_user", "326@sahayog.com");
          } //</RM for Region 1 Bases on Division>

          //<RM for Region 2 Bases on Division>
          if (division == "MULTISTATE" && region == "Region 2") {
            frm.set_value("rm", "Nishant Shelare");
            frm.set_value("rm_user", "145@sahayog.com");
          } else if (division == "MICROFINANCE" && region == "Region 2") {
            frm.set_value("rm", "Akash Jambhulkar");
            frm.set_value("rm_user", "102@sahayog.com");
          } else if (division == "TWO WHEELER" && region == "Region 2") {
            frm.set_value("rm", "NA");
            frm.set_value("rm_user", "NA");
          } //</RM for Region 2 Bases on Division>

          //<RM for Region 3 Bases on Division>
          if (division == "MULTISTATE" && region == "Region 3") {
            frm.set_value("rm", "Amish Tarale");
            frm.set_value("rm_user", "521@sahayog.com");
          } else if (division == "MICROFINANCE" && region == "Region 3") {
            frm.set_value("rm", "NA");
            frm.set_value("rm_user", "NA");
          } else if (division == "TWO WHEELER" && region == "Region 3") {
            frm.set_value("rm", "NA");
            frm.set_value("rm_user", "NA");
          } //</RM for Region 3 Bases on Division>

          //<RM for Region 4 Bases on Division>
          if (division == "MULTISTATE" && region == "Region 4") {
            frm.set_value("rm", "Manish Patil");
            frm.set_value("rm_user", "1348@sahayog.com");
          } else if (division == "MICROFINANCE" && region == "Region 4") {
            frm.set_value("rm", "NA");
            frm.set_value("rm_user", "NA");
          } else if (division == "TWO WHEELER" && region == "Region 4") {
            frm.set_value("rm", "NA");
            frm.set_value("rm_user", "NA");
          } //</RM for Region 4 Bases on Division>
        }
        console.log("Division: " + frm.doc.division);
        console.log("Region: " + frm.doc.region);
        console.log("owner: " + frm.doc.emp_user);

        if (user === frm.doc.emp_user) {
          frappe.msgprint("PR Owner Matched");

          //<Send for Approval , this button is only for PR Owner>
          frm.add_custom_button(__("Send for Approval"), function () {
            // Add your button's functionality here
            let rm = frm.doc.rm_user;
            //<PR is Shared with RM using API Call>
            if (frm.doc.rm_request == "Pending") {
              frappe.call({
                method: "frappe.share.add",
                args: {
                  doctype: frm.doctype,
                  name: frm.docname,
                  user: rm,
                  read: 1,
                  write: 1,
                  submit: 0,
                  share: 1,
                  notify: 1,
                },
                callback: function (response) {
                  //Display a message to the user
                  frappe.show_alert({
                    message: "Your Asset Request Sent Successfully ",
                    indicator: "green",
                  });
                  frm.set_value("rm_request", "Done");
                  frm.save();
                },
              }); //</PR is Shared with RM using API Call>
            } else {
              frappe.msgprint("Approval Already Sent");
            }
          }); //</Send for Approval , this button is only for PR Owner>
        } //</PR Owner>
        //<RM Owner>
        else if (user === frm.doc.rm_user) {
          frappe.msgprint("RM Matched");
          //<Send for Approval , this button is only for PR Owner>
          frm.add_custom_button(__("Send To HOD"), function () {
            // Add your button's functionality here
            let hod = frm.doc.hod;
            //<PR is Shared with RM using API Call>
            if (frm.doc.hod_request == "Pending") {
              frappe.call({
                method: "frappe.share.add",
                args: {
                  doctype: frm.doctype,
                  name: frm.docname,
                  user: hod,
                  read: 1,
                  write: 1,
                  submit: 0,
                  share: 1,
                  notify: 1,
                },
                callback: function (response) {
                  //Display a message to the user
                  frappe.show_alert({
                    message: "Your Asset Request Sent Successfully ",
                    indicator: "green",
                  });
                  frm.set_value("hod_request", "Done");
                  frm.save();
                },
              }); //</PR is Shared with RM using API Call>
            } else {
              frappe.msgprint("Approval Already Sent");
            }
          }); //</Send for Approval , this button is only for PR Owner>

          //<Getting Employee Region & Division using API Call>
        } //</RM Owner>
        //<HOD Owner>
        else if (user === frm.doc.hod) {
          frappe.msgprint("HOD Matched");
        } //</HOD Owner>
      },
    }); //</Getting Employee Region & Division using API Call>

    //<PR Owner>
  },

  select_department: function (frm) {
    frm.set_value("it_hod", null);
    frm.set_value("it_user", null);

    frm.set_value("admin_hod", null);
    frm.set_value("admin_user", null);

    frm.set_value("stationary_hod", null);
    frm.set_value("stationary_user", null);

    if (frm.doc.select_department === "IT") {
      frappe.show_alert("IT");
      frm.set_value("it_hod", "Kamlesh Waghmare");
      frm.set_value("it_user", "1299@sahayog.com");
    } else if (frm.doc.select_department === "Admin") {
      frappe.show_alert("Admin");
      frm.set_value("admin_hod", "Omair Khan");
      frm.set_value("admin_user", "596@sahayog.com");
    } else if (frm.doc.select_department === "Stationary") {
      frappe.show_alert("Stationary");
      frm.set_value("stationary_hod", "Sunil Kale");
      frm.set_value("stationary_user", "51@sahayog.com");
    }
  },

  rm_approval_status: function (frm) {
    frm.set_value("hod", null);
    if (frm.doc.rm_approval_status == "Approved") {
      let HOD;
      if (frm.doc.it_user) {
        HOD = frm.doc.it_user;
        frm.set_value("hod", HOD);
      }

      if (frm.doc.admin_user) {
        HOD = frm.doc.admin_user;
        frm.set_value("hod", HOD);
      }
      if (frm.doc.stationary_user) {
        HOD = frm.doc.stationary_user;
        frm.set_value("hod", HOD);
      }
      console.log("HOD: " + HOD);
      console.log(frm.doc.admin_user);
    }
  },
});
