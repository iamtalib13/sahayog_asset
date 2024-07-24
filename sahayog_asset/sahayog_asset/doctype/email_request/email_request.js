// Copyright (c) 2024, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Email Request", {
  after_save: function (frm) {
    if (frm.doc.status == "Draft") {
      location.reload();
    }
    if (frappe.user.has_role("HR Support Executive")) {
      frappe.set_route("app/email-management");
    } else if (frappe.user.has_role("HR Support Head")) {
      frappe.set_route("app/hr-email-request");
    } else if (frappe.user.has_role("IT Store Manager")) {
      frappe.set_route("app/email-requests");
    }
  },
  refresh: function (frm) {
    frm.trigger("section_colors");
    frm.trigger("mandatory_controls");

    let status = frm.doc.status;
    if (frm.is_new()) {
      frm.trigger("get_creator_name");
      frm.trigger("read_only_from_hr");
      frm.trigger("get_approval_details");
    } else if (!frm.is_new()) {
      if (status !== "Draft") {
        frm.trigger("approval_pending_intro_messages");
      } else {
      }
      frm.trigger("read_only_from_hr");

      if (status == "Correction-Required") {
        if (frappe.user.has_role("HR Support Executive")) {
          frm.trigger("submit_button");
          frm.trigger("correction_intro_messages");
        }
        if (frappe.user.has_role("IT Store Manager")) {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Draft" || status == "Correction-Required") {
        frm.trigger("draft_intro_messages");

        if (frappe.user.has_role("HR Support Executive")) {
          frm.trigger("submit_button");
        }
        if (frappe.user.has_role("IT Store Manager")) {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Pending From IT") {
        frm.trigger("pending_intro_messages");

        if (frappe.user.has_role("IT Store Manager")) {
          frm.trigger("read_only_from_it_store_manager");

          if (frm.doc.request_type == "New") {
            frm
              .add_custom_button(__("Deliver To HR"), function () {
                if (!frm.doc.email && !frm.doc.otp) {
                  frm.set_df_property(
                    "email",
                    "description",
                    "<b style='color:red;'>Please fill Email</b>"
                  );
                  frm.set_df_property(
                    "otp",
                    "description",
                    "<b style='color:red;'>Please fill OTP</b>"
                  );
                } else if (!frm.doc.email) {
                  frm.set_df_property(
                    "email",
                    "description",
                    "<b style='color:red;'>Please fill Email</b>"
                  );
                } else if (!frm.doc.otp) {
                  frm.set_df_property(
                    "otp",
                    "description",
                    "<b style='color:red;'>Please fill OTP</b>"
                  );
                } else {
                  frappe.confirm(
                    "Are you sure you want to deliver?",
                    () => {
                      // Action to perform if "Yes" is selected
                      frm.call({
                        method: "get_server_datetime",
                        freeze: true, // Set to true to freeze the UI
                        freeze_message: "Internet Not Stable, Please Wait...",
                        callback: function (r) {
                          frm.set_value("delivered_date", r.message);
                          frm.set_value("status", "Delivered");
                          frm.save();
                        },
                      });
                    },
                    () => {
                      // Action to perform if "No" is selected
                    }
                  );
                }
              })
              .css({
                "background-color": "#28a745", // Set green color
                color: "#ffffff", // Set font color to white
              });

            //return draft
            frm
              .add_custom_button(__("Return To HR"), function () {
                var dialog = new frappe.ui.Dialog({
                  title: __("Correction Reason"),
                  fields: [
                    {
                      label: __("Please Give Reason for Correction"),
                      fieldname: "return_remark",
                      fieldtype: "Small Text",
                      reqd: 1, // Set the correction reason field as mandatory
                    },
                  ],
                  primary_action_label: __("Submit"),
                  primary_action: function () {
                    // Check if the correction reason is provided
                    var correctionReason = dialog.get_value("return_remark");
                    if (!correctionReason) {
                      frappe.msgprint(
                        __("Please provide a correction reason.")
                      );
                      return;
                    }

                    // Set correction reason and update status
                    frm.set_value("return_remark", correctionReason);
                    frm.set_value("email", null);
                    frm.set_value("otp", null);
                    frm.set_value("status", "Correction-Required");
                    frm.save();
                    dialog.hide();
                  },
                  secondary_action_label: __("Cancel"),
                  secondary_action: function () {
                    dialog.hide();
                  },
                });

                dialog.show();
              })
              .css({
                "background-color": "#fd0e35", // Set soft red color
                color: "#ffffff", // Set font color to white
              });
          } else if (frm.doc.request_type == "Delete") {
            frm
              .add_custom_button(__("Delete"), function () {
                frappe.confirm(
                  "Are you sure you want to delete?",
                  () => {
                    // Action to perform if "Yes" is selected
                    frm.call({
                      method: "get_server_datetime",
                      freeze: true, // Set to true to freeze the UI
                      freeze_message: "Internet Not Stable, Please Wait...",
                      callback: function (r) {
                        frm.set_value("delivered_date", r.message);
                        frm.set_value("status", "Deleted");
                        frm.save();
                      },
                    });
                  },
                  () => {
                    // Action to perform if "No" is selected
                  }
                );
              })
              .css({
                "background-color": "#ff6347", // Set green color
                color: "#ffffff", // Set font color to white
              });
          }
        } else if (frappe.user.has_role("HR Support Executive")) {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Delivered") {
        frm.trigger("delivered_intro_messages");
        frm.disable_save();
        frm.disable_form();
      } else if (status == "Deleted") {
        frm.trigger("delivered_intro_messages");
        frm.disable_save();
        frm.disable_form();
      } else if (status == "Approval Pending") {
        if (frappe.user.has_role("HR Support Executive")) {
          // frm.trigger("Approval_email");
        }

        frm.trigger("correction_intro_messages");
        frm.trigger("approval_pending_intro_messages");
        frm.trigger("approval_controls");

        frm.disable_save();
        frm.disable_form();
      }
    } else {
    }
  },

  get_creator_name: function (frm) {
    const full_name = frappe.session.user_fullname;
    frm.set_value("creator_name", full_name);
    frm.refresh_field("creator_name");
  },

  mandatory_controls: function (frm) {},
  Approval_email: function (frm) {
    frm.add_custom_button(__("Send Email for Approval"), function () {
      frappe.msgprint(frm.doc.email);
    });
  },

  approval_controls: function (frm) {
    let user = frappe.session.user;
    let approval_user = frm.doc.level_1_user_id;
    console.log(user);
    console.log(approval_user);
    if (user == approval_user) {
      console.log("apprroval matched");
      frm.add_custom_button(__("Approve"), function () {
        // Create a dialog to collect approval remark
        var d = new frappe.ui.Dialog({
          title: __("Approval Remark"),
          fields: [
            {
              label: __("Remark"),
              fieldname: "approval_remark",
              fieldtype: "Small Text",
              reqd: 1, // Set the remark field as mandatory
            },
          ],
          primary_action_label: __("Approve"),
          primary_action: async function () {
            // Get the remark from the dialog
            let remark = d.fields_dict.approval_remark.get_value();
            if (!remark) {
              frappe.msgprint(__("Please provide a remark before approving."));
              return;
            }

            // Confirm the approval action
            frappe.confirm(
              "We are assuming that you verified this Email Request <br> " +
                "<b>Are you sure for Approval?</b>",
              async () => {
                frm.set_value("status", "Pending From IT");
                frm.set_value("level_1_status", "Approved");
                frm.set_value("level_1_remark", remark);
                d.hide();
                await frm.save();
                frappe.show_alert({
                  message: "Email Request has been approved and sent to IT.",
                  indicator: "green",
                });
              },
              () => {
                // action to perform if No is selected
              }
            );
          },
          secondary_action_label: __("Cancel"),
          secondary_action: function () {
            d.hide();
          },
        });

        d.show();
      });

      frm.add_custom_button(__("Reject"), function () {
        var d = new frappe.ui.Dialog({
          title: __("Rejection Reason"),
          fields: [
            {
              label: __("Remark"),
              fieldname: "level_1_remark",
              fieldtype: "Small Text",
              reqd: 1, // Set the remark field as mandatory
            },
          ],
          primary_action_label: __("Reject"),
          primary_action: function () {
            // Check if the rejection reason and remark are provided
            let remark = d.fields_dict.level_1_remark.get_value();
            if (!remark) {
              frappe.msgprint(__("Please provide a remark before rejecting."));
              return;
            }

            frm.set_value("status", "Rejected");
            frm.set_value("level_1_status", "Rejected");
            frm.set_value("level_1_remark", remark);
            d.hide();
            frm.save();
          },
          secondary_action_label: __("Cancel"),
          secondary_action: function () {
            d.hide();
          },
        });

        d.show();
      });

      // Lighter green for the Approve button
      frm.custom_buttons["Approve"].css("background-color", "#a5d6a7"); // Lighter green

      // Lighter red for the Reject button
      frm.custom_buttons["Reject"].css("background-color", "#ef9a9a"); // Lighter red
    } else {
      console.log("approval not matched");
    }
  },

  section_colors: function (frm) {
    // Extremely light blue gradient for approval_html_section
    frm.fields_dict["approval_html_section"].wrapper.css(
      "background",
      "linear-gradient(to right, #f9fcff, #f2faff)" // Extremely light blue gradient
    );

    // Slightly darker blue gradient for the third section
    frm.fields_dict["section_break_mm0dh"].wrapper.css(
      "background",
      "linear-gradient(to right, #f0faff, #e6f7ff)" // Most lightest blue gradient
    );

    // Very light blue gradient for email details section
    frm.fields_dict["email_details_section"].wrapper.css(
      "background",
      "linear-gradient(to right, #e0f7fa, #b2ebf2)" // Very light blue gradient
    );

    // Slightly lighter blue gradient for employee details section
    frm.fields_dict["employee_details_section"].wrapper.css(
      "background",
      "linear-gradient(to right, #cce7ff, #a3d9ff)" // Slightly lighter blue gradient
    );
  },

  async approval_pending_intro_messages(frm) {
    // Get Approval Tracker details from the form
    const full_name = frm.doc.level_1_name || "Not specified";
    const status = frm.doc.level_1_status || "Not specified";

    // Extract the first and last name
    const name_parts = full_name.split(" ");
    const first_last_name =
      name_parts.length > 1
        ? `${name_parts[0]} ${name_parts[name_parts.length - 1]}`
        : full_name;

    // Determine the status color
    let status_color;
    if (status === "Pending") {
      status_color = "red";
    } else if (status === "Approved") {
      status_color = "green";
    } else {
      status_color = "gray"; // Default color for unspecified statuses
    }

    // Generate HTML for card view
    let html = `
        <div style="
            background-color: transparent; 
            width: 100%; /* Full width */
            text-align: left;
            box-sizing: border-box; /* Ensure padding and border are included in width */
        ">
            <h4 style="margin: 0 0 8px 0; font-size: var(--text-base);font-weight:Bold  ">Approval Tracker</h4>
            <div style="
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 8px; 
                display: flex; 
                align-items: center;
            ">
                <img src='/files/user.png' style="width: 50px; height: 50px; border-radius: 50%; margin-right: 16px;"></img>
                <div>
                    <p style="margin: 0; font-weight: bold;">${first_last_name}</p>
                    <p style="margin: 0; color: ${status_color};">${status}</p>
                </div>
            </div>
            <hr>
        </div>
    `;

    // Set the HTML as Summary HTML
    frm.set_df_property("approval_html", "options", html);
  },
  get_approval_details: async function (frm) {
    try {
      let level_1_user = await frappe.db.get_single_value(
        "Email Approval",
        "employee_id"
      );
      let level_1_email = await frappe.db.get_single_value(
        "Email Approval",
        "email_id"
      );
      let level_1_name = await frappe.db.get_single_value(
        "Email Approval",
        "employee_name"
      );

      frm.set_value("level_1_user_id", level_1_user);
      frm.set_value("level_1_email", level_1_email);
      frm.set_value("level_1_name", level_1_name);
    } catch (error) {
      console.error("Error fetching values:", error);
    }
  },

  draft_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      frm.set_intro(
        "Please submit the Email Request for approval to <b>Harshavardhan Ghutke Sir</b>",
        "red"
      );
    }
  },
  pending_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      let request_type = frm.doc.request_type;
      let message = "";

      if (request_type == "New") {
        message = "Your email creation request has been sent to IT Department.";
      } else if (request_type == "Delete") {
        message = "Your email deletion request has been sent to IT Department.";
      }

      frm.set_intro(
        `<div style='display:flex; align-items:center;'><div style='width: 30px; height: 30px; background-color: green; border-radius: 50%; margin-right: 10px; display: flex; justify-content: center; align-items: center;'><span style='color: white; font-size: 20px;'>&#x2713;</span></div><div style='font-size: 15px;'>${message}</div></div>`,
        "green"
      );
    }
    if (frappe.user.has_role("IT Store Manager")) {
      let request_type = frm.doc.request_type;
      let action = "";

      if (request_type == "New") {
        action = "create";
      } else if (request_type == "Delete") {
        action = "delete";
      }

      frm.set_intro(
        `Please ${action} an Email Account for - <b><font color='black'>${frm.doc.employee_name}</font></b>`,
        "red"
      );
    }
  },
  delivered_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      let request_type = frm.doc.request_type;
      let action = "";
      let color = "";

      if (request_type == "New") {
        action = "Delivered";
        color = "green";
      } else if (request_type == "Delete") {
        action = "Deleted";
        color = "red";
      }

      // Use the 'action' variable in frm.set_intro
      frm.set_intro(
        "<b>Email Account</b> - " +
          frm.doc.email +
          " <b>for</b> " +
          frm.doc.employee_name +
          " <b>" +
          action +
          " Successfully</b>",
        color
      );
    }

    if (frappe.user.has_role("IT Store Manager")) {
      let request_type = frm.doc.request_type;
      let action = "";
      let color = "";

      if (request_type == "New") {
        action = "created";
        color = "green";
      } else if (request_type == "Delete") {
        action = "deleted";
        color = "red";
      }

      frm.set_intro(
        `Email Account - <b>${frm.doc.email}</b> for <b>${frm.doc.employee_name}</b> ${action} successfully.`,
        color
      );
    }
  },

  correction_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Executive") && frm.doc.return_remark) {
      frm.set_intro(
        "<b><font color='black'>Correction Remark from IT Department:</font></b><br>" +
          "<div class='card' style='padding: 10px; background-color: #f8f9fa;'>" +
          frm.doc.return_remark +
          "</div>",
        "green"
      );
    }

    if (frappe.user.has_role("IT Store Manager")) {
      if (frappe.user.has_role("HR Support Executive")) {
        frm.set_intro(
          "<b><font color='black'>Correction Remark from IT Department:</font></b><br>" +
            "<div class='card' style='padding: 10px; background-color: #f8f9fa;'>" +
            frm.doc.return_remark +
            "</div>",
          "green"
        );
      }
    }
  },

  submit_button: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      frm
        .add_custom_button(__("Submit Email Request"), function () {
          frappe.confirm(
            "Are you sure you want to submit?",
            () => {
              // action to perform if Yes is selected
              // perform desired action such as routing to new form or fetching etc.

              frm.set_value("status", "Approval Pending");
              frm.set_value("level_1_status", "Pending");
              frm.refresh_field("status");
              frm.refresh_field("level_1_status");

              frm
                .save()
                .then(() => {
                  // Handle successful save
                  frappe.msgprint(
                    __("Email Request has been submitted successfully.")
                  );
                })
                .catch((error) => {
                  // Handle save failure
                  frappe.throw(
                    __("Failed to submit Email Request. Please try again.")
                  );
                });
            },
            () => {
              // action to perform if No is selected
            }
          );
        })
        .css({
          "background-color": "#28a745", // Set green color
          color: "#ffffff", // Set font color to white
        });
    }
  },

  onload_post_render: function (frm) {
    frm.fields_dict["employee_id"].$input.on("keydown", function (event) {
      var key = event.key;

      // Allow only alphabets and numbers (0-9)
      if (!key.match(/[a-zA-Z0-9]/)) {
        // Prevent input for special characters
        event.preventDefault();
        // Set a description to inform the user to avoid special characters
        frm.set_df_property(
          "employee_id",
          "description",
          "<b style='color:red;'>Special characters are not allowed</b>"
        );
      } else {
        // If input is valid, remove the description
        frm.set_df_property("employee_id", "description", "");
      }
    });

    frm.fields_dict["employee_name"].$input.on("keydown", function (event) {
      var key = event.key;

      // Check if the key pressed is a special character or a numeric value
      if (key.match(/[^a-zA-Z\s]/) || !isNaN(parseInt(key))) {
        // Prevent input for special characters and numeric values
        event.preventDefault();
        // Set a description to inform the user
        frm.set_df_property(
          "employee_name",
          "description",
          "<b style='color:red;'>Special characters and numeric values are not allowed</b>"
        );
      } else {
        // If input is valid, remove the description
        frm.set_df_property("employee_name", "description", "");
      }
    });

    frm.fields_dict["phone"].$input.on("keydown", function (event) {
      var key = event.key;
      var mobileField = frm.fields_dict["phone"];

      // Check if the current length is already 10
      if (mobileField.get_value().length >= 10 && key >= "0" && key <= "9") {
        event.preventDefault();
        return;
      }

      // Validate that only numbers, right arrow, left arrow, delete, and backspace are allowed
      var regex = /^[0-9]+$/;

      // Allow only numeric keys (0-9), Right Arrow, Left Arrow, Delete, and Backspace
      if (
        !(
          (key >= "0" && key <= "9") ||
          key === "ArrowRight" ||
          key === "ArrowLeft" ||
          key === "Delete" ||
          key === "Backspace"
        )
      ) {
        event.preventDefault();
        return;
      }
    });

    frm.fields_dict["branch"].$input.on("keydown", function (event) {
      var key = event.key;

      // Check if the key pressed is a special character or a numeric value
      if (key.match(/[^a-zA-Z\s]/) || !isNaN(parseInt(key))) {
        // Prevent input for special characters and numeric values
        event.preventDefault();
        // Set a description to inform the user
        frm.set_df_property(
          "branch",
          "description",
          "<b style='color:red;'>Special characters and numeric values are not allowed</b>"
        );
      } else {
        // If input is valid, remove the description
        frm.set_df_property("branch", "description", "");
      }
    });
    frm.fields_dict["district"].$input.on("keydown", function (event) {
      var key = event.key;

      // Check if the key pressed is a special character or a numeric value
      if (key.match(/[^a-zA-Z\s]/) || !isNaN(parseInt(key))) {
        // Prevent input for special characters and numeric values
        event.preventDefault();
        // Set a description to inform the user
        frm.set_df_property(
          "district",
          "description",
          "<b style='color:red;'>Special characters and numeric values are not allowed</b>"
        );
      } else {
        // If input is valid, remove the description
        frm.set_df_property("district", "description", "");
      }
    });
    frm.fields_dict["designation"].$input.on("keydown", function (event) {
      var key = event.key;

      // Check if the key pressed is a special character or a numeric value
      if (key.match(/[^a-zA-Z\s]/) || !isNaN(parseInt(key))) {
        // Prevent input for special characters and numeric values
        event.preventDefault();
        // Set a description to inform the user
        frm.set_df_property(
          "designation",
          "description",
          "<b style='color:red;'>Special characters and numeric values are not allowed</b>"
        );
      } else {
        // If input is valid, remove the description
        frm.set_df_property("designation", "description", "");
      }
    });
  },

  phone: function (frm) {
    let mobile_no = frm.doc.phone;
    let length = mobile_no ? mobile_no.length : 0;

    if (mobile_no) {
      if (length === 10) {
        frm.set_df_property(
          "phone",
          "description",
          `<b style='color:green;'>Valid Phone Number (Length: ${length})</b>`
        );
      } else {
        frm.set_df_property(
          "phone",
          "description",
          `<b style='color:red;'>Invalid Phone Number. Please enter 10 digits. (Length: ${length})</b>`
        );
      }
    } else {
      frm.set_df_property(
        "phone",
        "description",
        `<b style='color:red;'>Please Enter 10 Digit Phone No. (Length: ${length})</b>`
      );
    }
  },
  read_only_from_it_store_manager: function (frm) {
    if (frm.doc.request_type == "New") {
      frm.set_df_property("delete_reason", "read_only", 1);
      frm.set_df_property("email", "read_only", 0);
      frm.set_df_property("employee_id", "read_only", 1);
      frm.set_df_property("employee_name", "read_only", 1);
      frm.set_df_property("gender", "read_only", 1);
      frm.set_df_property("phone", "read_only", 1);
      frm.set_df_property("zone", "read_only", 1);
      frm.set_df_property("region", "read_only", 1);
      frm.set_df_property("district", "read_only", 1);
      frm.set_df_property("branch", "read_only", 1);
      frm.set_df_property("designation", "read_only", 1);
      frm.set_df_property("division", "read_only", 1);
      frm.set_df_property("department", "read_only", 1);
    } else if (frm.doc.request_type == "Delete") {
      frm.set_df_property("delete_reason", "read_only", 1);
      frm.set_df_property("email", "read_only", 1);
      frm.set_df_property("employee_id", "read_only", 1);
      frm.set_df_property("employee_name", "read_only", 1);
    }
  },
  read_only_from_hr: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      if (frm.doc.request_type == "New") {
        frm.set_df_property("email", "read_only", 1);

        console.log("hr read");
      } else if (frm.doc.request_type == "Delete") {
        frm.set_df_property("email", "read_only", 0);
      }
      frm.set_df_property("email", "read_only", 1);
    }
  },

  request_type: function (frm) {
    if (frappe.user.has_role("HR Support Executive")) {
      if (frm.doc.request_type == "New") {
        frm.set_df_property("email", "read_only", 1);
        console.log("hr read");
      } else if (frm.doc.request_type == "Delete") {
        frm.set_df_property("email", "read_only", 0);
      }
    }
  },
});
