// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Requisition", {
  dispatch_all: function (frm) {
    // Check the value of the dispatch_all field
    let check = frm.doc.dispatch_all;

    // Iterate through the child table "asset"
    frm.doc.asset.forEach((row) => {
      // If dispatch_all is checked, set the purchase field to "Dispatch"
      // If dispatch_all is unchecked, set the purchase field to "Pending"
      frappe.model.set_value(
        row.doctype,
        row.name,
        "purchase",
        check ? "Dispatch" : "Pending"
      );
    });

    // Refresh the field in the form to reflect the changes
    frm.refresh_field("asset");
  },
  admin_save: function (frm) {
    if (frappe.user.has_role("Administrator")) {
      frm.save();
      return;
    }
  },

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

  Approval_and_Fullfillment_Tracker: function (frm) {
    // Initialize the custom intro message with the heading in bold and black

    let status;
    let CTO = "Kamlesh Waghmare";
    if (
      frm.doc.status == "Pending" ||
      frm.doc.status == "Pending from Purchase"
    ) {
      status = "Pending";
    } else if (frm.doc.status == "Pending from CFO") {
      status = "Pending from CFO";
    } else if (frm.doc.status == "Pending from Vendor") {
      status = "Pending from Vendor";
    } else if (frm.doc.status == "Dispatched") {
      status = "Dispatched";
    } else if (frm.doc.status == "Pending from CTO") {
      status = "Waiting for CTO Approval";
    }

    let ctoStatusColor =
      frm.doc.cto_status === "Pending"
        ? "#FF5733" // Use a shade of red
        : frm.doc.cto_status === "Approved"
        ? "#4CAF50" // Use a shade of green
        : "black";

    // Add conditional color to cto_name
    let ctoNameColor =
      frm.doc.cto_status === "Pending"
        ? "#FF5733" // Use a shade of red
        : frm.doc.cto_status === "Approved"
        ? "#4CAF50" // Use a shade of green
        : "black";

    let customIntroMessage = ""; // Initialize an empty message

    if (frm.doc.cto_status !== "Skip") {
      customIntroMessage = `<b style="color: black;">Approval Tracker:</b> <span style="color: ${ctoStatusColor};">${frm.doc.cto_status}</span><br>`;

      // Add cto_name with the dynamically determined color
      customIntroMessage += `<span style="color: ${ctoNameColor};">${CTO}</span><br>`;

      // Add a separator line using <hr>
      customIntroMessage += "<hr>";
    }
    // Add the "Fullfillment Tracker" heading
    customIntroMessage += "<b style='color: black;'>Purchase Department: </b>";

    // Determine the color for Fulfillment Tracker based on frm.doc.status
    let fullfillment_color =
      frm.doc.status === "Dispatched" || frm.doc.status === "Received"
        ? "#4CAF50" // Green for "Dispatched" and "Received"
        : "#FF5733"; // Red for other statuses

    // Add additional content to the message, for example, frm.doc.status
    customIntroMessage += `<span style="color: ${fullfillment_color};">${status}</span><br>`;

    // You can customize the style and color here
    let customIntroStyle = "color: blue; font-size: 16px;";

    // Set the intro message
    frm.set_intro(customIntroMessage, customIntroStyle);
  },

  refresh: function (frm) {
    if (frm.is_new() && frappe.user.has_role("Purchase Department")) {
      frm.set_read_only();
    }

    if (!frm.is_new()) {
      if (frm.doc.status !== "Draft") {
        //frm.set_df_property("asset", "read_only", 1);
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
        if (
          user === "1299@sahayog.com" ||
          frappe.user.has_role("Administrator")
        ) {
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
        frm.doc.status == "Pending" ||
        frm.doc.status == "Pending from CTO" ||
        frm.doc.status == "Pending from Purchase" ||
        frm.doc.status == "Pending from Vendor" ||
        frm.doc.status == "Pending from CFO"
      ) {
        frm.trigger("Approval_and_Fullfillment_Tracker");
      } else if (frm.doc.status == "Dispatched") {
        frm.set_intro("Dispatched from Purchase Department", "green");
      } else if (frm.doc.status == "Received") {
        //frm.set_intro("Received by : <b>" + store_manager + "</b>", "green");
        frm.trigger("Approval_and_Fullfillment_Tracker");
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
          frappe.user.has_role("Purchase Department")
        ) {
          frm.set_df_property("asset", "read_only", 0);
          console.log("only for purchase Department");
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
      const total_rows = frm.doc.asset.length;
      let dispatch_count = 0;
      let pending_rows = [];

      // 1. Count Dispatch and collect Pending rows
      frm.doc.asset.forEach((row) => {
        if (row.purchase === "Dispatch") {
          dispatch_count++;
        } else if (row.purchase === "Pending") {
          pending_rows.push(row);
        }
      });

      // 2. Exit if no item marked as Dispatch
      if (dispatch_count === 0) {
        frappe.msgprint({
          title: __("No Dispatch"),
          message: __(
            "Please mark at least one item as 'Dispatch' to proceed."
          ),
          indicator: "red",
        });
        return;
      }

      // 3. Check if pending rows have dispatched_status = "Dispatch"
      let partial_dispatch_exists = pending_rows.some(
        (row) => row.dispatched_status === "Dispatch"
      );

      // 4. Decide final_status
      let final_status = "";
      if (dispatch_count === total_rows) {
        final_status = "Dispatched";
      } else if (partial_dispatch_exists || dispatch_count > 0) {
        final_status = "Partially Dispatched";
      } else {
        frappe.msgprint({
          title: __("Invalid Dispatch"),
          message: __("Cannot proceed as no valid partial dispatch found."),
          indicator: "red",
        });
        return;
      }

      // 5. Check allowed statuses
      const allowed_statuses = [
        "Pending from Purchase",
        "Pending from CFO",
        "Pending from Vendor",
        "Partially Dispatched",
      ];

      if (allowed_statuses.includes(frm.doc.status)) {
        frappe.confirm(
          "We are assuming that you verified this Purchase Request.<br><b>Are you sure for Dispatch?</b>",
          () => {
            frm.set_value("status", final_status);

            frm
              .save()
              .then(() => {
                frappe.show_alert({
                  message: `${final_status} and Saved Successfully`,
                  indicator: "green",
                });
                frm.reload_doc();
              })
              .catch((err) => {
                frappe.msgprint({
                  title: __("Error"),
                  message: __("Could not save the document. Please try again."),
                  indicator: "red",
                });
                console.error(err);
              });
          }
        );
      } else {
        frappe.msgprint({
          title: __("Already Dispatched"),
          message: __("This document is already dispatched."),
          indicator: "red",
        });
      }
    });

    // Button styling
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
          message:
            "Your Purchase Request Sent To Purchase Department Successfully ",
          indicator: "green",
        });
        //frm.set_value("cto_request", "Done");
        //frm.set_value("cto_status", "Pending");

        frm.set_value("status", "Pending from Purchase");

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

frappe.ui.form.on("Purchase Requisition", {
  refresh: function (frm) {
    // Add custom button labeled "Add Item"

    if (frm.doc.status == "Draft" || frm.is_new()) {
      frm.add_custom_button("Add Item", function () {
        console.log("Add Item button clicked"); // Debugging line
        // Open the dialog when the button is clicked
        open_dialog(frm);
      });
    }

    function open_dialog(frm) {
      // Create a new dialog for entering item details
      let d = new frappe.ui.Dialog({
        title: "Enter Item Details",
        fields: [
          {
            label: "Item",
            fieldname: "item",
            fieldtype: "Link",
            options: "Sahayog Item",
            reqd: 1,
            get_query: function () {
              return {
                filters: {
                  category: frm.doc.select_department, // Apply filter for category
                },
              };
            },
          },
          { fieldtype: "Section Break" },
          {
            label: "Approval Required",
            fieldname: "approval_level",
            fieldtype: "Data",
            read_only: 1, // Make this field read-only
          },
          { fieldtype: "Column Break" },
          {
            label: "Current Stock",
            fieldname: "current_stock",
            fieldtype: "Data",
            read_only: 1, // Make this field read-only
          },
          { fieldtype: "Column Break" },
          {
            label: "Quantity",
            fieldname: "quantity",
            fieldtype: "Int",
            reqd: 1,
          },
          { fieldtype: "Section Break", hidden: 1 },
          {
            label: "Approval Rank",
            fieldname: "approval_rank",
            fieldtype: "Int",
            read_only: 1, // Make this field read-only
            hidden: 1,
          },
          { fieldtype: "Section Break" },
          {
            label: "Item Description",
            fieldname: "item_description",
            fieldtype: "Small Text",
            reqd: 1,
          },
          { fieldtype: "Column Break" },
          {
            label: "Item Purpose",
            fieldname: "item_purpose",
            fieldtype: "Small Text",
            reqd: 1,
          },
        ],
        primary_action_label: "Add Item",
        primary_action: function (values) {
          console.log("Primary action triggered"); // Debugging line
          // Calculate approval rank based on approval level
          let approval_rank = get_approval_rank(values.approval_level);
          values.approval_rank = approval_rank;

          // Call a function to add the entered data to the child table
          add_item_to_child_table(frm, values);
          d.hide();
        },
      });

      // Function to fetch current stock and approval level based on the selected item
      function fetch_item_details(item_code) {
        if (item_code) {
          frappe.call({
            method: "frappe.client.get",
            args: {
              doctype: "Sahayog Item",
              name: item_code,
            },
            callback: function (response) {
              if (response.message) {
                d.set_value("current_stock", response.message.current_stock);
                d.set_value("approval_level", response.message.approval_level);

                // Set approval rank based on the approval level
                let approval_rank = get_approval_rank(
                  response.message.approval_level
                );
                d.set_value("approval_rank", approval_rank);
              }
            },
          });
        } else {
          d.set_value("current_stock", "");
          d.set_value("approval_level", "");
          d.set_value("approval_rank", "");
        }
      }

      // Function to calculate approval rank based on approval level
      function get_approval_rank(approval_level) {
        let rank = 0;
        if (approval_level === "Reporting-Person") {
          rank = 1;
        } else if (approval_level === "HOD/RM") {
          rank = 2;
        } else if (approval_level === "GM") {
          rank = 3;
        } else if (approval_level === "CFO") {
          rank = 4;
        }
        return rank;
      }

      // Set up event listener for item field change
      d.get_field("item").df.onchange = function () {
        let item_code = d.get_value("item");
        fetch_item_details(item_code);
      };

      d.show();
    }

    function add_item_to_child_table(frm, values) {
      console.log("Adding item to child table"); // Debugging line
      // Add the entered item details to the "asset" child table
      let child = frm.add_child("asset");

      frappe.model.set_value(
        child.doctype,
        child.name,
        "item_name",
        values.item
      );
      frappe.model.set_value(child.doctype, child.name, "item_id", values.item);
      frappe.model.set_value(
        child.doctype,
        child.name,
        "quantity",
        values.quantity
      );
      frappe.model.set_value(
        child.doctype,
        child.name,
        "approval_level",
        values.approval_level
      );
      frappe.model.set_value(
        child.doctype,
        child.name,
        "approval_rank",
        values.approval_rank
      );
      frappe.model.set_value(
        child.doctype,
        child.name,
        "item_description",
        values.item_description
      );
      frappe.model.set_value(
        child.doctype,
        child.name,
        "item_purpose",
        values.item_purpose
      );

      frm.refresh_field("asset");
      frm.save();
    }
  },
});

frappe.ui.form.on("Purchase Requisition", "refresh", function (frm) {
  //for Dispatched Status
  $(document).ready(function () {
    $('div[data-fieldname="dispatched_status"] .static-area').each(function () {
      var text = $(this).text().trim();
      var $parent = $(this).parent();

      if (text === "Pending") {
        $parent.css({
          color: "#E50914",
          "font-weight": "bold",
          "background-color": "rgba(229, 9, 20, 0.1)", // light red background
        });
      } else if (text === "Dispatch") {
        $parent.css({
          color: "#1DB954",
          "font-weight": "bold",
          "background-color": "rgba(29, 185, 84, 0.1)", // light green background
        });

        // Disable the select element
        $parent
          .find('select[data-fieldname="dispatched_status"]')
          .attr("disabled", true);
      } else if (text === "Self-Purchase") {
        $parent.css({
          color: "#1877F2",
          "font-weight": "bold",
          "background-color": "rgba(24, 119, 242, 0.1)", // light blue background
        });

        // Disable the select element
        $parent
          .find('select[data-fieldname="dispatched_status"]')
          .attr("disabled", true);
      }
    });
  });

  //for Purchase Status
  $('div[data-fieldname="purchase"] .static-area').each(function () {
    var text = $(this).text().trim();
    if (text === "Pending") {
      $(this).parent().css({
        color: "#E50914",
        "font-weight": "bold",
        "background-color": "rgba(229, 9, 20, 0.1)", // light red background
      });
    } else if (text === "Dispatch") {
      $(this).parent().css({
        color: "#1DB954",
        "font-weight": "bold",
        "background-color": "rgba(29, 185, 84, 0.1)", // light green background
      });
    }
  });
});
