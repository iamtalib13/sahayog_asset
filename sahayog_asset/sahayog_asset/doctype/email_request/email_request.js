// Copyright (c) 2024, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Email Request", {
  after_save: function (frm) {
    if (frm.doc.status == "Draft") {
      location.reload();
    }
  },
  refresh: function (frm) {
    let status = frm.doc.status;
    if (frm.is_new()) {
    } else if (!frm.is_new()) {
      if (status == "Correction-Required") {
        if (frappe.user.has_role("HR Support Manager")) {
          frm.trigger("submit_button");
          frm.trigger("correction_intro_messages");
        }
        if (frappe.user.has_role("IT Store Manager")) {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Draft" || status == "Correction-Required") {
        frm.trigger("draft_intro_messages");

        if (frappe.user.has_role("HR Support Manager")) {
          frm.trigger("submit_button");
        }
        if (frappe.user.has_role("IT Store Manager")) {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Pending") {
        frm.trigger("pending_intro_messages");
     
        
        if (frappe.user.has_role("IT Store Manager")) {
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
                        frm.save();
                        d.hide();
                      },
                    });

                    frm.set_value("status", "Delivered");
                    frm.save();
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
                    frappe.msgprint(__("Please provide a correction reason."));
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
        }else if(frappe.user.has_role("HR Support Manager"))
        {
          frm.disable_save();
          frm.disable_form();
        }
      } else if (status == "Delivered") {
        frm.trigger("delivered_intro_messages");
        frm.disable_save();
        frm.disable_form();
      }
    }
  },

  draft_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Manager")) {
      frm.set_intro(
        "Please submit the Email Request to the IT Department",
        "red"
      );
    }
  },
  pending_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Manager")) {
      frm.set_intro(
        "<div style='display:flex; align-items:center;'><div style='width: 30px; height: 30px; background-color: green; border-radius: 50%; margin-right: 10px; display: flex; justify-content: center; align-items: center;'><span style='color: white; font-size: 20px;'>&#x2713;</span></div><div style='font-size: 15px;'>Your email creation request has been sent to the IT department</div></div>",
        "green"
      );
    }
    if (frappe.user.has_role("IT Store Manager")) {
      frm.set_intro(
        "Please create an Email Account for - <b><font color='black'>" +
          frm.doc.employee_name +
          "</font></b>",
        "red"
      );
    }
  },
  delivered_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Manager")) {
      frm.set_intro(
        "<b><font color='black'>Email Account</font></b> - " +
          frm.doc.email +
          " <b><font color='black'> for </font></b> " +
          frm.doc.employee_name +
          " <b><font color='black'>Delivered Successfully to the HR Department</font></b>",
        "green"
      );
    }

    if (frappe.user.has_role("IT Store Manager")) {
      frm.set_intro(
        "<b><font color='black'>Email Account</font></b> - " +
          frm.doc.email +
          " <b><font color='black'> for </font></b> " +
          frm.doc.employee_name +
          " <b><font color='black'>Delivered Successfully to the HR Department</font></b>",
        "green"
      );
    }
  },

  correction_intro_messages: function (frm) {
    if (frappe.user.has_role("HR Support Manager")) {
      frm.set_intro(
        "<b><font color='black'>Correction Remark from IT Department:</font></b><br>" +
          "<div class='card' style='padding: 10px; background-color: #f8f9fa;'>" +
          frm.doc.return_remark +
          "</div>",
        "green"
      );
    }

    if (frappe.user.has_role("IT Store Manager")) {
      if (frappe.user.has_role("HR Support Manager")) {
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
    if (frappe.user.has_role("HR Support Manager")) {
      frm
        .add_custom_button(__("Submit Email Request"), function () {
          frappe.confirm(
            "Are you sure you want to submit to the IT Department ?",
            () => {
              // action to perform if Yes is selected
              //perform desired action such as routing to new form or fetching etc.

              frm.set_value("status", "Pending");
              frm.refresh_field("status");
              frm.save();
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
});
