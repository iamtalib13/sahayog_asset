// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Asset Request", {
  before_save: function (frm) {
    let user = frappe.session.user;
    if (user === frm.doc.emp_user) {
    } else if (user === frm.doc.rm_user) {
    } else if (user === frm.doc.hod) {
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
    if (frm.doc.status === "RM Rejected") {
      let rm_reject = frm.doc.rm_reason;
      frm.set_intro("<b>Reason- </b>" + rm_reject, "red");
    }
    if (frm.doc.status === "HOD Rejected") {
      let hod_reject = frm.doc.hod_reject_reason;
      frm.set_intro("<b>Reason- </b>" + hod_reject, "red");
    }

    if (
      frm.doc.share_with_hod === "false" &&
      frm.doc.status === "Pending from HOD"
    ) {
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

          // Set field values
          frm.set_value("hod_request", "Done");
          frm.set_value("rm_approval_status", "Approved");
          frm.set_value("status", "Pending from HOD");

          // Save the form
          frm.save();
        },
      });

      frm.set_value("share_with_hod", "true");
    }

    if (frm.doc.status !== "New") {
      frm.toggle_display("list", 0);
      frm.toggle_display("quantity", 0);
      frm.toggle_display("description", 0);
      frm.toggle_display("add_item", 0);

      frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();
      frm.fields_dict["asset"].grid.wrapper
        .find(".grid-remove-all-rows")
        .hide();
      frm.fields_dict["asset"].grid.wrapper.find(".grid-remove-rows").hide();
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

          console.log("Division" + division);
          console.log("Region" + region);
          frm.set_value("division", division);
          frm.set_value("region", region);
          frm.set_value("emp_user", owner_id);
          console.log("Called !!");
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
          //frappe.msgprint("PR Owner Matched");

          // frm.add_custom_button(__("Add Item"), function () {
          //    frm.trigger("activate_add_item");
          // });

          if (!frm.is_new()) {
            //<Send for Approval , this button is only for PR Owner>

            frm.add_custom_button(__("Send for Approval"), function () {
              // Add your button's functionality here
              let rm = frm.doc.rm_user;
              //<PR is Shared with RM using API Call>

              if (frm.doc.status === "New") {
                if (frm.doc.rm_request == "Pending") {
                  frappe.confirm(
                    "<i>Do you want to send for Approval?</i>",
                    () => {
                      // action to perform if Yes is selected
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
                          if (frm.doc.status === "New") {
                            frm.set_value("status", "Pending from RM");
                          }
                          frm.save();
                        },
                      });
                    },
                    () => {
                      // action to perform if No is selected
                    }
                  );

                  //</PR is Shared with RM using API Call>
                } else {
                  frappe.msgprint("Approval Already Sent");
                }
              }
            }); //</Send for Approval , this button is only for PR Owner>
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
        //<RM Owner>
        else if (user === frm.doc.rm_user) {
          // frappe.msgprint("RM Matched");
          frm.disable_save();
          //<Send for Approval , this button is only for PR Owner>
          // Check if the page has already been reloaded

          //<Set_Intro>
          if (frm.doc.status === "Pending from RM") {
            let rm = frm.doc.rm;
            let bm = frm.doc.bm_name;
            let branch = frm.doc.branch;

            var intro_html =
              "<span id='intro-text'>Please Verify Purchase Request & give your Approval to <b><i>" +
              bm +
              " - " +
              branch;
            ("</i></b></span>");
            frm.set_intro(intro_html, "red");

            var intro_text = document.getElementById("intro-text");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_text.style.opacity = opacity;
            }, 1000);
          } else if (frm.doc.status === "Pending from HOD") {
            let rm = frm.doc.rm;
            let hod = frm.doc.hod_name;
            var intro1 =
              '<span style="color: green;">Approved from RM - <b>' +
              rm +
              "</b></span>";
            var intro2 =
              '<span style="color: red;" id="intro-text">Pending from HOD - <b>' +
              hod +
              "</b></span>";

            frm.set_intro(intro1);
            frm.set_intro(intro2);

            var intro_text = document.getElementById("intro-text");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_text.style.opacity = opacity;
            }, 1000);
          }
          //</Set_Intro>
          if (frm.doc.status === "Pending from RM") {
            frm.add_custom_button(
              __("Approved"),
              function () {
                if (frm.doc.status !== "Pending from HOD") {
                  frappe.confirm(
                    "We are assuming that you verified this Purchase Requisition. <br> " +
                      "<b>Are you sure for Approval?</b>",
                    () => {
                      // action to perform if Yes is selected
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
                            // Check if the document has been modified

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
                          },
                        });

                        //</PR is Shared with RM using API Call>
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
              },
              __("Approval")
            );

            //</Send for Approval , this button is only for PR Owner>

            frm.add_custom_button(
              __("Reject"),
              function () {
                var d = new frappe.ui.Dialog({
                  title: __("Rejection Reason"),
                  fields: [
                    {
                      label: __("Please Give Reason of Rejection of this PR"),
                      fieldname: "rm_reason",
                      fieldtype: "Small Text",
                    },
                  ],
                  primary_action_label: __("Reject"),
                  primary_action: function () {
                    frm.set_value("rm_approval_status", "Reject");
                    frm.set_value(
                      "rm_reason",
                      d.fields_dict.rm_reason.get_value()
                    );
                    d.hide();
                    frm.set_value("status", "RM Rejected");
                    cur_frm.save();
                  },
                  secondary_action_label: __("Cancel"),
                  secondary_action: function () {
                    d.hide();
                  },
                });

                d.show();
              },
              __("Approval")
            );
          }

          //<Getting Employee Region & Division using API Call>
        } //</RM Owner>
        //<HOD Owner>
        else if (user === frm.doc.hod) {
          //frappe.msgprint("HOD Matched");

          if (frm.doc.rm_approval_status === "Approved") {
            if (frm.doc.status === "Pending from HOD") {
              frm.add_custom_button(
                __("Approved"),
                function () {
                  frappe.confirm(
                    "We are assuming that you verified this Purchase Requisition. <br> " +
                      "<b>Are you sure for Approval?</b>",
                    () => {
                      // action to perform if Yes is selected
                      // Add your button's functionality here
                      let hod = frm.doc.hod;
                      //<PR is Shared with RM using API Call>
                      if (frm.doc.status === "Pending from HOD") {
                        frm.set_value("status", "Approved");
                        frm.set_value("hod_approval", "Approved");
                        cur_frm.save();
                      } else {
                        frappe.msgprint("Already Approved ");
                      }
                    },
                    () => {
                      // action to perform if No is selected
                    }
                  );
                },
                __("Approval")
              );

              //</Send for Approval , this button is only for PR Owner>
              frm.add_custom_button(
                __("Reject"),
                function () {
                  var d = new frappe.ui.Dialog({
                    title: __("Rejection Reason"),
                    fields: [
                      {
                        label: __("Please Give Reason of Rejection of this PR"),
                        fieldname: "hod_reject_reason",
                        fieldtype: "Small Text",
                      },
                    ],
                    primary_action_label: __("Reject"),
                    primary_action: function () {
                      frm.set_value("hod_approval", "Reject");
                      frm.set_value(
                        "hod_reject_reason",
                        d.fields_dict.hod_reject_reason.get_value()
                      );
                      d.hide();
                      frm.set_value("status", "HOD Rejected");
                      cur_frm.save();
                    },
                    secondary_action_label: __("Cancel"),
                    secondary_action: function () {
                      d.hide();
                    },
                  });

                  d.show();

                  // frm.set_value("rm_approval_status", "Reject");
                },
                __("Approval")
              );
            }
          }

          if (frm.doc.status === "Pending from HOD") {
            let rm = frm.doc.rm;
            let bm = frm.doc.bm_name;
            let branch = frm.doc.branch;
            var intro1 =
              '<span style="color: green;">Approved from RM - <b><i>' +
              rm +
              "</i></b></span>";

            var intro2 =
              "<span id='intro-text' style='color: #dc3545;'>Please Verify Purchase Request & give your Approval to <b><i>" +
              bm +
              " - " +
              branch +
              "</i></b></span>";

            frm.set_intro(intro1);
            frm.set_intro(intro2);

            var intro_text = document.getElementById("intro-text");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_text.style.opacity = opacity;
            }, 1000);

            // Change the background color of the form message to white
            document.querySelector(".form-message").style.backgroundColor =
              "white";

            // Add a 3D shadow to the form message
            document.querySelector(".form-message").style.boxShadow =
              "0 0 3px 0 rgba(0, 0, 0, 0.2)";
          } else if (frm.doc.status === "Pending from HOD") {
            let rm = frm.doc.rm;
            let hod = frm.doc.hod_name;
            var intro1 =
              '<span style="color: green;">Approved from RM - <b>' +
              rm +
              "</b></span>";
            var intro2 =
              '<span style="color: red;" id="intro-text">Pending from HOD - <b>' +
              hod +
              "</b></span>";

            frm.set_intro(intro1);
            frm.set_intro(intro2);

            var intro_text = document.getElementById("intro-text");
            var opacity = 1.0;
            var fadeInterval = setInterval(function () {
              opacity = opacity === 1.0 ? 0.5 : 1.0;
              intro_text.style.opacity = opacity;
            }, 1000);
          }
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
      //frappe.show_alert("IT");
      frm.set_value("it_hod", "Kamlesh Waghmare");
      frm.set_value("it_user", "1299@sahayog.com");
    } else if (frm.doc.select_department === "Admin") {
      // frappe.show_alert("Admin");
      frm.set_value("admin_hod", "Omair Khan");
      frm.set_value("admin_user", "596@sahayog.com");
    } else if (frm.doc.select_department === "Stationary") {
      // frappe.show_alert("Stationary");
      frm.set_value("stationary_hod", "Sunil Kale");
      frm.set_value("stationary_user", "51@sahayog.com");
    }

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
    } else if (frm.doc.select_department == "Stationary") {
      frm.set_query("list", function () {
        return {
          filters: {
            category: "Stationary",
          },
        };
      });
    } else {
      frm.set_query("list", function () {});
    }
  },

  rm_approval_status: function (frm) {
    frm.set_value("hod", null);
    if (frm.doc.rm_approval_status == "Approved") {
      let HOD;
      let HOD_NAME;
      if (frm.doc.it_user) {
        HOD = frm.doc.it_user;
        HOD_NAME = frm.doc.it_hod;
        frm.set_value("hod", HOD);
        frm.set_value("hod_name", HOD_NAME);
      }

      if (frm.doc.admin_user) {
        HOD = frm.doc.admin_user;
        HOD_NAME = frm.doc.admin_hod;
        frm.set_value("hod", HOD);
        frm.set_value("hod_name", HOD_NAME);
      }
      if (frm.doc.stationary_user) {
        HOD = frm.doc.stationary_user;
        HOD_NAME = frm.doc.stationary_hod;
        frm.set_value("hod", HOD);
        frm.set_value("hod_name", HOD_NAME);
      }
      console.log("HOD: " + HOD);
      console.log("HOD Name: " + HOD_NAME);
    }
  },
  add_item: function (frm) {
    let item_docname = frm.doc.list;
    let item_name;
    if (!frm.doc.list) {
      frappe.msgprint("Please Select Item ");
    } else if (!frm.doc.quantity) {
      frappe.msgprint("Please Give Quantity");
    } else {
      frappe.model.with_doc("Sahayog Item", item_docname, function () {
        let item = frappe.model.get_doc("Sahayog Item", item_docname);
        item_name = item.item_name;
        let qty = frm.doc.quantity;
        let description = frm.doc.description;
        //console.log(item_name, qty, description);
        let row = frm.add_child("asset", {
          item_name: item_name,
          quantity: qty,
          description: description,
        });
        frm.set_value("list", null);
        frm.set_value("quantity", null);

        frm.set_value("description", null);

        frm.refresh_field("asset");
      });
    }
  },

  // activate_add_item: function (frm) {
  //   let d = new frappe.ui.Dialog({
  //     title: "Add Your Item",
  //     fields: [
  //       {
  //         label: "Item",
  //         fieldname: "list",
  //         reqd: 1,
  //         fieldtype: "Link",
  //         options: "Sahayog Item",
  //       },
  //     ],
  //     primary_action_label: "Add Item",
  //     primary_action: function (values) {
  //       let item_docname = d.get_value("list");
  //       if (item_docname) {
  //         // TODO: Add code to perform the desired action after adding the item
  //         d.hide();
  //       } else {
  //         frappe.msgprint("Please select an item");
  //       }
  //     },
  //   });
  //   d.show();
  // },

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
  } else if (frm.doc.select_department == "Stationary") {
    frm.set_query("list", function () {
      return {
        filters: {
          category: "Stationary",
        },
      };
    });
  }
});