// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Requisition", {
  before_save: function (frm) {
    let user = frappe.session.user;
    if (user === frm.doc.emp_user) {
    } else if (user === frm.doc.rm_user) {
    } else if (user === frm.doc.hod) {
    }
  },

  validate: function (frm) {
    if (!frm.doc.asset) {
      frappe.throw({
        title: __("Please Add Asset Item"),
        indicator: "red",
        message: __("Please Add At Least One Asset Item"),
      });
    }
  },
  after_save: function (frm) {
    let user = frappe.session.user;
    if (user === frm.doc.emp_user) {
      location.reload();
    } else if (user === frm.doc.rm_user) {
    } else if (user === frm.doc.hod) {
    }
  },

  refresh: function (frm) {
    if (frm.is_new() && frappe.user.has_role("Purchase Department")) {
      frm.set_read_only();
    }

    if (!frm.is_new()) {
      if (frm.doc.status !== "Draft") {
        frm.set_df_property("asset", "read_only", 1);
        frm.disable_save();
      }
    }

    if (!frm.is_new()) {
      let user = frappe.session.user;
      let store_manager = frm.doc.emp_name;
      if (frm.doc.status == "Draft") {
        frm.add_custom_button(__("Submit"), function () {
          if (frm.doc.status === "Draft") {
            if (frm.doc.request == "Pending") {
              if (!frm.doc.asset) {
                frappe.throw({
                  title: __("Please Add Asset Item"),
                  indicator: "red",
                  message: __("Please Add At Least One Asset Item"),
                });
              } else {
                frappe.confirm(
                  "<i>Do you want to send to Purchase Department?</i>",
                  () => {
                    // action to perform if Yes is selected
                    if (frm.doc.select_department === "IT") {
                      frm.trigger("share_with_cto");
                      frappe.show_alert({
                        message: "Successfully Sent to CTO",
                        indicator: "green",
                      });
                    } else {
                      frm.trigger("share_with_purchase_dept");
                      frappe.show_alert({
                        message: "Successfully Sent to Purchase Department",
                        indicator: "green",
                      });
                    }
                  },
                  () => {
                    // action to perform if No is selected
                  }
                );
              }

              //</PR is Shared with RM using API Call>
            } else {
              frappe.msgprint(" Already Sent");
            }
          }
        });
        frm.change_custom_button_type("Submit", null, "success");
      } else if (frm.doc.status == "Pending from CTO") {
        if (user === "1299@sahayog.com") {
          frm.add_custom_button(__("Approve"), function () {
            if (frm.doc.status == "Pending from CTO") {
              frappe.confirm(
                "We are assuming that you verified this Purchase Request <br> " +
                  "<b>Are you sure for Approval?</b>",
                () => {
                  //<PR is Shared with RM using API Call>
                  if (frm.doc.request == "Pending") {
                    frm.trigger("share_with_purchase_dept");
                    // Set field values
                    frm.set_value("request", "Done");
                    frm.set_value("cto_status", "Approved");
                    frm.set_value("status", "Pe nding from Purchase");

                    // Save the form
                    frm.save();
                  } else {
                    frappe.msgprint("Approval Already Sent");
                  }
                },
                () => {
                  // action to perform if No is selected
                }
              );
            } else {
              frappe.msgprint("Already Approved", "Message", "red");
            }
          });
          frm.add_custom_button(__("Reject"), function () {
            var d = new frappe.ui.Dialog({
              title: __("Rejection Reason"),
              fields: [
                {
                  label: __(
                    "Please Give Reason of Rejection for this Asset Request"
                  ),
                  fieldname: "rejection_reason",
                  fieldtype: "Small Text",
                  reqd: 1, // Set the rejection reason field as mandatory
                },
              ],
              primary_action_label: __("Reject"),
              primary_action: function () {
                // Check if the rejection reason is provided
                if (!d.fields_dict.rejection_reason.get_value()) {
                  frappe.msgprint(__("Please provide a rejection reason."));
                  return;
                }

                frm.set_value("status", "Reject");
                frm.set_value(
                  "rejection_reason",
                  d.fields_dict.rejection_reason.get_value()
                );
                d.hide();
                frm.set_value("status", "Rejected");
                cur_frm.save();
              },
              secondary_action_label: __("Cancel"),
              secondary_action: function () {
                d.hide();
              },
            });

            d.show();
          });
        }
      }

      if (
        frm.doc.cto_status == "Approved" &&
        frm.doc.status == "Pending from Purchase"
      ) {
        frm.set_intro("Approved by CTO", "green");
      } else if (frm.doc.status == "Dispatched") {
        frm.set_intro("Dispatched from Purchase Department", "green");
      } else if (frm.doc.status == "Received") {
        frm.set_intro("Received by : <b>" + store_manager + "</b>", "green");
      }
    }

    if (frm.doc.status !== "Draft") {
      frm.toggle_display("list", 0);
      frm.toggle_display("uom", 0);
      frm.toggle_display("quantity", 0);
      frm.toggle_display("description", 0);
      frm.toggle_display("add_item", 0);
      frm.toggle_display("item_description", 0);
      frm.toggle_display("item_purpose", 0);

      frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();
      frm.fields_dict["asset"].grid.wrapper
        .find(".grid-remove-all-rows")
        .hide();
      frm.fields_dict["asset"].grid.wrapper.find(".grid-remove-rows").hide();
    }
    if (frm.doc.status !== "Draft") {
      let it_store_manager = "50@sahayog.com";
      let admin_store_manager = "596@sahayog.com";
      let stationery_store_manager = "51@sahayog.com";
    }

    let user = frappe.session.user;
    //frappe.show_alert(user);
    console.log("Logged-in-user = " + user);

    if (frm.is_new()) {
      let eid = user.match(/\d+/)[0];
      frm.set_value("employee_id", eid);
    }
    let empid = frm.doc.employee_id;

    console.log(empid);

    //<Getting Employee Region & Division using API Call>

    if (!frm.is_new()) {
      let it_store_manager = "50@sahayog.com";
      let admin_store_manager = "596@sahayog.com";
      let stationery_store_manager = "51@sahayog.com";
      if (user === it_store_manager) {
        //frappe.msgprint("IT Store Manager Matched");
        if (frm.doc.status == "Dispatched") {
          frm.trigger("receive_button");
        }
      } else if (user === admin_store_manager) {
        if (frm.doc.status == "Dispatched") {
          frm.trigger("receive_button");
        }
        //frappe.msgprint("Admin Store Manager Matched");
      } else if (user === stationery_store_manager) {
        if (frm.doc.status == "Dispatched") {
          frm.trigger("receive_button");
        }

        // frappe.msgprint("Stationery Store Manager Matched");
      } else {
        if (
          frm.doc.status !== "Dispatched" &&
          frm.doc.status !== "Received" &&
          user !== "1299@sahayog.com"
        ) {
          frm.trigger("dispatch");
        }

        if (
          (frm.doc.status == "Pending from Purchase" ||
            frm.doc.status == "Pending from Vendor") &&
          user !== "1299@sahayog.com"
        )
          if (frm.doc.status !== "Pending from Vendor") {
            frm.trigger("Pending_from_cfo");
          }

        if (
          (frm.doc.status == "Pending from CFO" ||
            frm.doc.status == "Pending from Purchase") &&
          user !== "1299@sahayog.com"
        ) {
          frm.trigger("Pending_from_vendor");
        }
      }
    }

    frappe.call({
      method:
        "sahayog_asset.sahayog_asset.doctype.purchase_requisition.division_region_api.check_user_divison_region",
      args: {
        emp_id: empid,
      },
      callback: function (r) {
        // Check if the message array contains at least one object
        if (r.message.length > 0) {
          // Get the division and region fields from the first object in the array
          var division = r.message[0].division;
          var region = r.message[0].region;
          var owner_id = r.message[0].user_id;
          var department = r.message[0].department;

          console.log("Division" + division);
          console.log("Region" + region);
          console.log("Department : " + department);
          frm.set_value("division", division);
          frm.set_value("region", region);
          frm.set_value("emp_user", owner_id);
          frm.set_value("employee_department", department);
          console.log("Called !!");
        }
        console.log("Division: " + frm.doc.division);
        console.log("Region: " + frm.doc.region);
        console.log("owner: " + frm.doc.emp_user);
        let it_store_manager = "50@sahayog.com";
        let admin_store_manager = "596@sahayog.com";
        let stationery_store_manager = "51@sahayog.com";

        if (user === it_store_manager) {
          //frappe.msgprint("IT Store Manager Matched");
          frm.set_value("select_department", "IT");
        } else if (user === admin_store_manager) {
          //frappe.msgprint("Admin Store Manager Matched");
          frm.set_value("select_department", "Admin");
        } else if (user === stationery_store_manager) {
          // frappe.msgprint("Stationery Store Manager Matched");
          frm.set_value("select_department", "Stationery");
        }

        if (user === it_store_manager) {
          // frm.add_custom_button(__("Add Item"), function () {
          //    frm.trigger("activate_add_item");
          // });

          if (!frm.is_new()) {
            if (frm.doc.status !== "Draft") {
              frm.set_df_property("asset", "read_only", 1);
            }
          }

          //<Set_Intro>
          if (frm.doc.status === "New" && !frm.is_new()) {
            var intro_owner =
              "<span id='intro-t' style='color:  #dc3545;'><i><b>Please Verify and Send for Approval" +
              "</i></b></span>";
            frm.set_intro(intro_owner);
            var intro_t = document.getElementById("intro-t");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_t.style.opacity = opacity;
            }, 1000);
            document.querySelector(".form-message").style.backgroundColor =
              "white";
            document.querySelector(".form-message").style.boxShadow =
              "0 0 3px 0 rgba(0, 0, 0, 0.2)";
          } else if (frm.doc.status === "Pending from RM") {
            let rm = frm.doc.rm;

            frm.set_intro(
              "Approval Pending from Regional Manager - <b>" + rm + "</b>",
              "red"
            );
          } else if (
            frm.doc.status === "Pending from HOD" ||
            frappe.user.has_role("System Manager")
          ) {
            let rm = frm.doc.rm;
            let hod = frm.doc.hod_name;
            // Define the intros
            var intro1 =
              '<span style="color: green;">Approved by RM - ' +
              "<i><b>" +
              rm +
              "<i/><b/>" +
              "</span>";

            var intro2 =
              "<span id='intro-text' style='color: #dc3545;'>Pending from HOD - <b><i>" +
              hod +
              "</i></b></span>";

            // Set the form intros
            frm.set_intro(intro1);
            frm.set_intro(intro2);

            var intro_text = document.getElementById("intro-text");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_text.style.opacity = opacity;
            }, 1000);
            // Change the background color of the form message to light gray
            document.querySelector(".form-message").style.backgroundColor =
              "white";

            // Add a box shadow to the form message
            document.querySelector(".form-message").style.boxShadow =
              "0 0 3px 0 rgba(0, 0, 0, 0.2)";
          }

          //</Set_Intro>
        } //</PR Owner>
      },
    }); //</Getting Employee Region & Division using API Call>

    //<PR Owner>

    let addButton = frm.get_field("add_item").$input;
    addButton.addClass("btn btn-outline-success"); // Add Bootstrap class
    addButton.css({
      width: "100%", // Adjust width as needed
      height: "calc(1.5em + .75rem + 2px)", // Adjust height as needed
      padding: "5px", // Adjust padding as needed
      "font-size": "14px", // Adjust font size as needed
      "margin-top": "23px", // Add top margin of 5 pixels
      "background-color": "#a0d170", // Set the background color
    });
    // Change the background color on hover
    addButton.hover(
      function () {
        $(this).css("background-color", "#86c44c");
      },
      function () {
        $(this).css("background-color", "#a0d170");
      }
    );
  },
  onload_post_render: function (frm) {
    frm.fields_dict.quantity.$input.on("input", function (evt) {
      // Get the value of the input field
      var input_value = evt.target.value;

      // Define a regular expression that matches alphabets, special characters, and spaces
      var invalid_input_regex =
        /[a-zA-Z`!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?~\s]/;

      // Check if the input value contains invalid characters
      if (invalid_input_regex.test(input_value)) {
        // Remove the invalid characters from the input field
        var cleaned_input_value = input_value.replace(invalid_input_regex, "");

        // Set the cleaned value back into the input field
        evt.target.value = cleaned_input_value;

        // Display an alert message
        frappe.msgprint({
          title: __("Alert"),
          indicator: "red",
          message: __(
            "Alphabets, Special Characters, and Spaces are not Allowed in Quantity."
          ),
        });
      }
    });
  },
  dispatch: function (frm) {
    frm.add_custom_button(__("Dispatch"), function () {
      if (
        frm.doc.status == "Pending from Purchase" ||
        frm.doc.status == "Pending from CFO" ||
        frm.doc.status == "Pending from Vendor"
      ) {
        frappe.confirm(
          "We are assuming that you verified this Purchase Request <br> " +
            "<b>Are you sure for Dispatch</b>",
          () => {
            //<PR is Shared with RM using API Call>
            if (frm.doc.status !== "Dispatched") {
              // Document share was successful
              frappe.show_alert({
                message: " Dispatched Saved Successfully",
                indicator: "green",
              });

              // Set field values

              frm.set_value("status", "Dispatched");

              // Save the form
              frm.save();

              //</PR is Shared with RM using API Call>
            } else {
              frappe.msgprint("Already Dispatched");
            }
          },
          () => {
            // action to perform if No is selected
          }
        );
      } else {
        frappe.msgprint("Already dispatched", "Message", "red");
      }
    });
    frm.change_custom_button_type("Dispatch", null, "success");
  },
  Pending_from_vendor: function (frm) {
    frm.add_custom_button(__("Pending from Vendor"), function () {
      if (frm.doc.status == "Pending from Vendor") {
        frappe.msgprint("Already Pending From Vendor");
      } else if (
        frm.doc.status == "Pending from Purchase" ||
        frm.doc.status == "Pending from Vendor" ||
        frm.doc.status == "Pending from CFO"
      ) {
        frappe.confirm(
          "This will Notify -> Pending from Vendor <br> " +
            "<b>Are you sure ?</b>",
          () => {
            frm.set_value("status", "Pending from Vendor");

            // Save the form
            frm.save();
          },
          () => {
            // action to perform if No is selected
          }
        );
      } else {
        frappe.msgprint("Pending from Vendor", "Message", "red");
      }
    });
    frm.change_custom_button_type("Receive", null, "success");
  },
  Pending_from_cfo: function (frm) {
    frm.add_custom_button(__("Pending from CFO"), function () {
      if (frm.doc.status == "Pending from CFO") {
        frappe, msgprint("Already Pending From CFO");
      } else if (
        frm.doc.status == "Pending from Purchase" ||
        frm.doc.status == "Pending from Vendor" ||
        frm.doc.status == "Pending from CFO"
      ) {
        frappe.confirm(
          "This will Notify -> Pending from CFO <br> " +
            "<b>Are you sure ?</b>",
          () => {
            frm.set_value("status", "Pending from CFO");

            // Save the form
            frm.save();
          },
          () => {
            // action to perform if No is selected
          }
        );
      } else {
        frappe.msgprint("Pending from CFO", "Message", "red");
      }
    });
    frm.change_custom_button_type("Receive", null, "success");
  },

  receive_button: function (frm) {
    frm.add_custom_button(__("Receive"), function () {
      if (frm.doc.status == "Dispatched") {
        frappe.confirm(
          "We are assuming that you Received this Asset  <br> " +
            "<b>Are you sure ?</b>",
          () => {
            if (frm.doc.status == "Dispatched") {
              frm.set_value("status", "Received");

              // Save the form
              frm.save();
            } else {
              frappe.msgprint("Already Received");
            }
          },
          () => {
            // action to perform if No is selected
          }
        );
      } else {
        frappe.msgprint("Already Recieved", "Message", "red");
      }
    });
    frm.change_custom_button_type("Receive", null, "success");
  },
  select_department: function (frm) {
    if (frm.doc.select_department == "IT") {
      frm.set_query("list", function () {
        return {
          filters: {
            category: "IT",
          },
        };
      });
    } else if (frm.doc.select_department == "Admin") {
      frm.set_query("list", function () {
        return {
          filters: {
            category: "Admin",
          },
        };
      });
    } else if (frm.doc.select_department == "Stationery") {
      frm.set_query("list", function () {
        return {
          filters: {
            category: "Stationery",
          },
        };
      });
    } else {
      frm.set_query("list", function () {});
    }
  },

  add_item: function (frm) {
    let item_docname = frm.doc.list;
    let item_name;

    if (!frm.doc.list) {
      frappe.msgprint("Please Select Item ");
    } else if (!frm.doc.quantity) {
      frappe.msgprint("Please Give Quantity");
    } else if (!frm.doc.item_description) {
      frappe.msgprint("Please Give Item Description");
    } else if (!frm.doc.item_purpose) {
      frappe.msgprint("Please Give Item Purpose");
    } else {
      frappe.model.with_doc("Sahayog Item", item_docname, function () {
        let item = frappe.model.get_doc("Sahayog Item", item_docname);
        item_name = item.item_name;
        let qty = frm.doc.quantity;
        let description = frm.doc.item_description;
        let item_purpose = frm.doc.item_purpose;
        let uom = frm.doc.uom;

        let assetTable = frm.doc.asset || [];

        // Check for duplicate entry only if the table is not empty
        if (assetTable.length > 0) {
          let duplicateFound = false;
          assetTable.forEach(function (row) {
            if (row.item_name === item_name) {
              frappe.msgprint(
                `You have already added <b>'${item_name}'</b> You can adjust the quantity.`
              );

              duplicateFound = true;
              return false; // Break the loop
            }
          });

          if (duplicateFound) {
            return; // Exit the function
          }
        }

        let row = frm.add_child("asset", {
          item_name: item_name,
          quantity: qty,
          uom: uom,
          item_description: description,
          item_purpose: item_purpose,
        });
        frm.set_value("list", null);
        frm.set_value("quantity", null);
        frm.set_value("item_description", null);
        frm.set_value("item_purpose", null);
        frm.set_value("uom", "NOS");

        frm.refresh_field("asset");
        frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();
        frm.set_df_property("select_department", "read_only", 1);
      });
    }
  },

  share_with_hod: function (frm) {
    let hod = frm.doc.hod;
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
        // Check if the document has been modified
        if (response.exc && response.exc === "TimestampMismatchError") {
          // Display a message to the user
          frappe.show_alert({
            message:
              "The document has been modified. Please refresh and try again.",
            indicator: "red",
          });
        } else {
          // Document share was successful
          frappe.show_alert({
            message: "Your Asset Request Sent Successfully",
            indicator: "green",
          });

          // Set field values
          frm.set_value("hod_request", "Done");
          frm.set_value("rm_approval_status", "Approved");
          frm.set_value("status", "Pending from HOD");

          // Save the form
          frm.save();
        }
      },
    });
  },

  share_with_cto: function (frm) {
    frappe.call({
      method: "frappe.share.add",
      args: {
        doctype: frm.doctype,
        name: frm.docname,
        user: "1299@sahayog.com",
        read: 1,
        write: 1,
        submit: 0,
        share: 1,
        notify: 1,
      },
      callback: function (response) {
        //Display a message to the user
        frappe.show_alert({
          message: "Your Purchase Request Sent To CTO Successfully ",
          indicator: "green",
        });
        frm.set_value("cto_request", "Done");
        frm.set_value("cto_status", "Pending");

        frm.set_value("status", "Pending from CTO");

        frm.save();
      },
    });
  },

  share_with_purchase_dept: function (frm) {
    frappe.call({
      method: "frappe.share.add",
      args: {
        doctype: frm.doctype,
        name: frm.docname,
        user: "689@sahayog.com",
        read: 1,
        write: 1,
        submit: 0,
        share: 1,
        notify: 1,
      },
      callback: function (response) {
        //Display a message to the user
        frappe.show_alert({
          message: "Your Purchase Request Sent Successfully ",
          indicator: "green",
        });
      },
    });
    frappe.call({
      method: "frappe.share.add",
      args: {
        doctype: frm.doctype,
        name: frm.docname,
        user: "40@sahayog.com",
        read: 1,
        write: 1,
        submit: 0,
        share: 1,
        notify: 1,
      },
      callback: function (response) {
        //Display a message to the user
        frappe.show_alert({
          message: "Your Purchase Request Sent Successfully ",
          indicator: "green",
        });
      },
    });
    frappe.call({
      method: "frappe.share.add",
      args: {
        doctype: frm.doctype,
        name: frm.docname,
        user: "2481@sahayog.com",
        read: 1,
        write: 1,
        submit: 0,
        share: 1,
        notify: 1,
      },
      callback: function (response) {
        //Display a message to the user
        frappe.show_alert({
          message: "Your Purchase Request Sent Successfully ",
          indicator: "green",
        });
        frm.set_value("request", "Done");
        frm.set_value("status", "Pending from Purchase");

        frm.save();
      },
    });
  },
});

frappe.ui.form.on("Purchase Requisition", "refresh", function (frm) {
  if (frm.doc.select_department == "IT") {
    frm.set_query("list", function () {
      return {
        filters: {
          category: "IT",
        },
      };
    });
  } else if (frm.doc.select_department == "Admin") {
    frm.set_query("list", function () {
      return {
        filters: {
          category: "Admin",
        },
      };
    });
  } else if (frm.doc.select_department == "Stationery") {
    frm.set_query("list", function () {
      return {
        filters: {
          category: "Stationery",
        },
      };
    });
  }
});
