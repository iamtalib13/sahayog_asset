// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
frappe.ui.form.on("Asset List", {
  // quantity: function (frm, cdt, cdn) {
  //   var child = locals[cdt][cdn];
  //   console.log("qty : ", child.quantity);
  //   if (child.quantity == 0) {
  //     child.dispatched_status = "Cancelled";
  //   }
  // },
});
frappe.ui.form.on("Asset Request", {
  test: function (frm) {
    frm.call({
      method: "get_value",
      args: {
        msg: "hello",
      },
      callback: function (r) {
        if (r.message === "True") {
          frappe.msgprint("True");
        } else {
          frappe.msgprint("False");
        }
      },
    });
  },

  admin_save: function (frm) {
    if (frappe.user.has_role("Administrator")) {
      frm.save();
      return;
    }
  },

  popup_for_purchase: function (frm) {
    let user = frappe.session.user;
    let p1 = "689@sahayog.com";
    let p2 = "40@sahayog.com";
    let p3 = "2481@sahayog.com";
    let p4 = "2946@sahayog.com";
    if (user === p1 || user === p2 || user === p3 || user === p4) {
      if (frm.doc.status == "Pending From Purchase")
        if (!frm.doc.estimated_date) {
          frappe.msgprint(
            {
              title: __("Asset Is Pending From Purchase Department"),
              message: __("Please Set a Estimated Time for this Request"),
              indicator: "red",
            },
            5
          );
        } else {
          frappe.msgprint({
            message: __(
              '<div style="text-align: center; padding: 20px; background-color: #f2f2f2; border-radius: 5px;">' +
                '<p style="font-size: 18px; margin-bottom: 15px;">' +
                '<span style="font-weight: bold; color: red; animation: blink 1s infinite;">Your Estimate is Pending</span>' +
                "</p>" +
                '<p style="font-size: 14px; margin-bottom: 5px;">Please Provide A New Estimated Time</p>' +
                '<p style="font-size: 14px; margin-bottom: 5px;">Or</p>' +
                '<p style="font-size: 14px; margin-bottom: 15px;">Confirm The Dispatch Asset to the Store</p>' +
                "</div>" +
                "<style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; }}</style>"
            ),
          });
        }
    }
  },

  after_save: function (frm) {
    if (frm.doc.status == "Draft") {
      frm.reload_doc();
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

  before_save: function (frm) {
    if (frm.doc.status == "Draft") {
      if (frm.doc.employee_department == "Information Technology") {
        frm.set_value("stage_3_emp_status", "Skip");
        frm.set_value("stage_6_emp_status", "Skip");
      }

      if (frm.doc.stage_1_emp_id == frm.doc.stage_5_emp_id) {
        frm.set_value("stage_1_emp_status", "Skip");
        frm.set_value("stage_2_emp_status", "Skip");
        frm.set_value("stage_3_emp_status", "Skip");
        frm.set_value("stage_4_emp_status", "Skip");
        frm.set_value("stage_5_emp_status", "Pending");
      } else if (frm.doc.stage_2_emp_id == frm.doc.stage_5_emp_id) {
        frm.set_value("stage_2_emp_status", "Skip");
        frm.set_value("stage_3_emp_status", "Skip");
        frm.set_value("stage_4_emp_status", "Skip");
      } else if (frm.doc.stage_3_emp_id == frm.doc.stage_5_emp_id) {
        frm.set_value("stage_3_emp_status", "Skip");
        frm.set_value("stage_4_emp_status", "Skip");
      } else if (frm.doc.stage_4_emp_id == frm.doc.stage_5_emp_id) {
        frm.set_value("stage_4_emp_status", "Skip");
      } else if (frm.doc.stage_1_emp_id == frm.doc.stage_4_emp_id) {
        frm.set_value("stage_1_emp_status", "Skip");
        frm.set_value("stage_2_emp_status", "Skip");
        frm.set_value("stage_3_emp_status", "Skip");
      } else if (frm.doc.stage_1_emp_id == frm.doc.stage_3_emp_id) {
        frm.set_value("stage_1_emp_status", "Skip");
        frm.set_value("stage_2_emp_status", "Skip");
      } else if (frm.doc.stage_1_emp_id == frm.doc.stage_2_emp_id) {
        frm.set_value("stage_1_emp_status", "Skip");
        // Code to handle the case where stage_1_emp_id is equal to stage_2_emp_id
      } else if (frm.doc.stage_2_emp_id == frm.doc.stage_4_emp_id) {
        frm.set_value("stage_2_emp_status", "Skip");
        frm.set_value("stage_3_emp_status", "Skip");
        frm.set_value("stage_4_emp_status", "Pending");
      } else {
        // No match, do nothing
      }
    }

    frm.set_value("first_intro", "Done");

    // if (frm.doc.status === "Pending From Store Manager") {
    //   if (frm.doc.asset.every((row) => row.dispatched_status === "Cancelled")) {
    //     frm.set_value("status", "Cancelled");
    //   }
    // }

    // if (frm.doc.status === "Pending From Store Manager") {
    //   if (frm.doc.asset.some((row) => row.dispatched_status === "Cancelled")) {
    //     frappe.throw("Some Cancelled");
    //   }
    // }
  },
  rejection_intro: function (frm) {
    let stages = [
      {
        stage: "Stage 1",
        emp: frm.doc.stage_1_emp_name,
        status: frm.doc.stage_1_emp_status,
        emp_rejection: frm.doc.stage_1_emp_rejection,
      },
      {
        stage: "Stage 2",
        emp: frm.doc.stage_2_emp_name,
        status: frm.doc.stage_2_emp_status,
        emp_rejection: frm.doc.stage_2_emp_rejection,
      },
      {
        stage: "Stage 3",
        emp: frm.doc.stage_3_emp_name,
        status: frm.doc.stage_3_emp_status,
        emp_rejection: frm.doc.stage_3_emp_rejection,
      },
      {
        stage: "Stage 4",
        emp: frm.doc.stage_4_emp_name,
        status: frm.doc.stage_4_emp_status,
        emp_rejection: frm.doc.stage_4_emp_rejection,
      },
      {
        stage: "Stage 5",
        emp: frm.doc.stage_5_emp_name,
        status: frm.doc.stage_5_emp_status,
        emp_rejection: frm.doc.stage_5_emp_rejection,
      },
      {
        stage: "Stage 6",
        emp: frm.doc.stage_6_emp_name,
        status: frm.doc.stage_6_emp_status,
        emp_rejection: frm.doc.stage_6_emp_rejection,
      },
      {
        stage: "Stage 7",
        emp: frm.doc.stage_7_emp_name,
        status: frm.doc.stage_7_emp_status,
        emp_rejection: frm.doc.stage_7_emp_rejection,
      },
    ];

    let rejectionIntroMessage = "";

    for (let i = 0; i < stages.length; i++) {
      let emp = stages[i].emp;
      let status = stages[i].status;
      let rejection = stages[i].emp_rejection;

      if (status === "Reject") {
        rejectionIntroMessage += `<span style="color: red; font-size: 14px;">Rejected By: <b>${emp}</b></span><br>`;
        rejectionIntroMessage += `Rejection Reason: ${rejection}<br><br>`;
      }
    }

    // Set the intro with the custom message and red color for rejection cases
    frm.set_intro(rejectionIntroMessage, "red");
  },

  refresh: function (frm) {
    if (frappe.user.has_role("Analytics")) {
      // frm.set_df_property("asset", "read_only", 1);
    }

    if (frappe.user.has_role("Administrator")) {
      frm.enable_save();
    }

    frm.trigger("select_department");
    // START Apply dynamic CSS styles using querySelector
    // Get all elements matching the selector
    frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();

    // END Apply dynamic CSS styles using querySelector

    if (frm.doc.status === "Draft") {
      if (!frm.is_new() && frm.doc.first_intro == "Done") {
        frm.set_intro("Please Verify and Send for Approval", "blue");
      }
    } else if (
      frm.doc.status === "Pending" ||
      frm.doc.status === "Pending From Purchase" ||
      frm.doc.status === "Pending From Store Manager" ||
      frm.doc.status === "Partially Dispatched"
    ) {
      let introMessage = "";
      let introMessage2 = "";

      let stages = [
        {
          stage: "Stage 1",
          emp: frm.doc.stage_1_emp_name,
          status: frm.doc.stage_1_emp_status,
        },
        {
          stage: "Stage 2",
          emp: frm.doc.stage_2_emp_name,
          status: frm.doc.stage_2_emp_status,
        },
        {
          stage: "Stage 3",
          emp: frm.doc.stage_3_emp_name,
          status: frm.doc.stage_3_emp_status,
        },
        {
          stage: "Stage 4",
          emp: frm.doc.stage_4_emp_name,
          status: frm.doc.stage_4_emp_status,
        },
        {
          stage: "Stage 5",
          emp: frm.doc.stage_5_emp_name,
          status: frm.doc.stage_5_emp_status,
        },
        {
          stage: "Stage 6",
          emp: frm.doc.stage_6_emp_name,
          status: frm.doc.stage_6_emp_status,
        },
        {
          stage: "Stage 7",
          emp: frm.doc.stage_7_emp_name,
          status: frm.doc.stage_7_emp_status,
        },
      ];
      let rightArrowSymbol = "&rarr;";
      let imgTag = `<span style="font-size: 17px;">${rightArrowSymbol}</span>`;

      // Loop for intro 1
      let introHeading1 =
        "<b style='color: black;'><u>Approval Tracker</u></b>";

      let pendingFound = false;
      for (let i = 0; i < Math.min(stages.length, 4); i++) {
        let emp = stages[i].emp;
        let status = stages[i].status;

        // Determine the color based on the value of the status
        // Determine the color based on the value of the status
        let fontColor =
          status === "Approved"
            ? "green"
            : status === "Pending" && !pendingFound
            ? ((pendingFound = true), "red")
            : "gray";

        // Check if the status is "Skip"; if yes, skip adding details for this stage
        if (status === "Skip") {
          continue;
        }

        // Add the employee details for "Stage 1" to "Stage 4" to intro 1 message
        introMessage += `<span style="color: ${fontColor}; font-size: 14px;">${emp}</span>`;

        // Add the image link after each stage except the last one in "Stage 1" to "Stage 4"
        if (i < 3 && i < stages.length - 1) {
          introMessage += ` ${imgTag}`;
        }
        introMessage += "\n";
      }

      // Add "Stage 5" to intro 1 message based on conditions
      let stage5Emp = stages[4].emp;
      let stage5Status = stages[4].status;
      let stage5FontColor =
        stage5Status === "Pending"
          ? "red"
          : stage5Status === "Approved"
          ? "green"
          : "";

      if (stage5Status !== "Skip") {
        introMessage += `<span> ${imgTag}</span><span style="color: ${stage5FontColor}; font-size: 14px;">${stage5Emp}</span>\n`;
      }

      // Add separator line after Intro 1
      introMessage += "<hr>";
      let store_status;
      let store_status_color;

      if (frm.doc.employee_department == "Information Technology") {
        if (
          frm.doc.stage_2_emp_status == "Pending" &&
          frm.doc.stage_2_request == "Done"
        ) {
          store_status = "Pending From CTO";
          store_status_color = "gray";
        } else if (
          frm.doc.stage_2_emp_status == "Approved" &&
          frm.doc.stage_2_request == "Done"
        ) {
          store_status = "Pending";
          store_status_color = "red";
        }
      } else if (frm.doc.select_department == "IT") {
        if (
          frm.doc.stage_6_emp_status == "Pending" &&
          frm.doc.stage_6_request == "Done"
        ) {
          store_status = "Pending From CTO";
          store_status_color = "gray";
        } else if (frm.doc.stage_6_emp_status == "Approved") {
          store_status = "Pending";
          store_status_color = "red";
        } else {
          store_status = "Waiting for Approval";
          store_status_color = "gray";
        }
      } else {
        if (
          frm.doc.stage_4_emp_status == "Pending" &&
          frm.doc.stage_4_request == "Done"
        ) {
          store_status = "Pending From CFO";
          store_status_color = "gray";
        } else if (frm.doc.stage_4_emp_status == "Approved") {
          store_status = "Pending";
          store_status_color = "red";
        } else if (
          frm.doc.stage_5_emp_status == "Pending" &&
          frm.doc.stage_5_request == "Done"
        ) {
          store_status = "Pending from CEO";
          store_status_color = "gray";
        } else if (frm.doc.status === "Pending From Purchase") {
          store_status = "Pending from Purchase";
          store_status_color = "gray";
        } else {
          store_status = "Waiting for Approval";
          store_status_color = "gray";
        }
      }

      // if (frm.doc.stage_7_request == "Pending") {
      //   store_status = "Waiting for Approval";
      //   store_status_color = "gray";
      // } else if (frm.doc.stage_7_emp_status == "Pending") {
      //   store_status = "Approval Received";
      //   store_status_color = "green";
      // } else if (frm.doc.stage_7_emp_status == "Dispatched") {
      //   store_status = "Dispatched";
      //   store_status_color = "green";
      // } else if (frm.doc.stage_7_emp_status == "Pending From Purchase") {
      //   store_status = "Pending From Purchase";
      //   store_status_color = "yellow";
      // }

      // Loop for intro 2
      let introHeading2 =
        "<b style='color: black;'><u>Fullfillment Tracker</u> : </b>";

      if (
        ["Pending From Purchase", "Pending"].includes(
          frm.doc.stage_7_emp_status
        )
      ) {
        introHeading2 += `<span style='color: ${store_status_color}; font-size: 13px;'>${store_status}</span>`;
      } else if (frm.doc.stage_7_emp_status === "Dispatched") {
        introHeading2 += `<span style='color: ${store_status_color}; font-size: 13px;'>${store_status}</span>`;
      } else {
        introHeading2 += store_status;
      }

      let pendingdetect = false;
      for (let i = 5; i < stages.length; i++) {
        let emp = stages[i].emp;
        let status = stages[i].status;

        // Determine the color based on the value of the status

        let fontColor =
          status === "Approved"
            ? "green"
            : status === "Pending" && !pendingdetect
            ? ((pendingdetect = true),
              frm.doc.stage_4_emp_status === "Approved" ? "red" : "gray")
            : "gray";

        // Check if the status is "Skip"; if yes, skip adding details for this stage
        if (status === "Skip") {
          continue;
        }

        // Add the employee details for "Stage 6" and "Stage 7" to intro 2 message
        introMessage2 += `<span style="color: ${fontColor}; font-size: 14px;">${emp}</span>`;
        // Add the image link after each stage except the last one in "Stage 6" and "Stage 7"
        if (i < stages.length - 1) {
          introMessage2 += ` ${imgTag}`;
        }
        introMessage2 += "\n";
      }

      // Set the intro with the custom message and blue color for intro 1
      frm.set_intro(introHeading1 + "<br>" + "\n" + introMessage, "blue");

      // Set the intro with the custom message for intro 2 if it has content
      if (introMessage2 !== "") {
        frm.set_intro(introHeading2 + "<br>" + "\n" + introMessage2, "blue");
      }

      // let user = frappe.session.user;
      // if (
      //   user === frm.doc.stage_7_emp_id &&
      //   frm.doc.purchase_request == "Done"
      // ) {
      //   frm.set_intro(
      //     `<u><strong><span style='color: black;'>OTP :</span></strong></u> ${frm.doc.store_otp}`,
      //     "blue"
      //   );
      // }

      // Add a separator <hr> after the second intro message if purchase_request is "Done"
      // Add a separator <hr> after the second intro message if purchase_request is "Done"
      if (frm.doc.purchase_request === "Done") {
        frm.set_intro("<hr>", "blue");

        // Define color mappings for different status values
        const statusColors = {
          Pending: "red",
          "Delivered To Store": "green",
          // Add more status colors here if needed
        };

        // Get the color based on the status value
        const statusColor = statusColors[frm.doc.purchase_status] || "black";

        frm.set_intro(
          `<strong style='color:black'><u>Purchase Department:</strong></u> <span style='color: ${statusColor};'>${frm.doc.purchase_status}</span>`,
          "blue"
        );

        // Use cards for Estimate Days and Remark if they are not blank
        const cardStyles = `
            border: 1px solid #e5e5e5;
            background-color: #f5f5f5;
            border-radius: 5px;
            padding: 10px;
            margin: 5px 0; /* Adjust the top and bottom margins */
        `;

        let cardContent = ""; // Initialize an empty string to hold the card content

        if (
          frm.doc.estimated_date &&
          frm.doc.status !== "Pending From Store Manager"
        ) {
          const dateObj = new Date(frm.doc.estimated_date);
          const formattedEstimatedDate = `${dateObj.getDate()}-${
            dateObj.getMonth() + 1
          }-${dateObj.getFullYear()}`;

          cardContent += `
                <div style='${cardStyles}'>
                    <strong>Estimated Date: </strong>${formattedEstimatedDate}
                </div>
            `;
        }

        if (
          frm.doc.purchase_remark &&
          frm.doc.status !== "Pending From Store Manager"
        ) {
          cardContent += `
                <div style='${cardStyles}'>
                    <strong>Remark: </strong>${frm.doc.purchase_remark}
                </div>
            `;
        }

        if (cardContent) {
          frm.set_intro(cardContent, "blue");
        } else if (frm.doc.status == "Pending From Purchase") {
          // Show the message if both Estimate Days and Remark are blank
          frm.set_intro(
            `<b><p style="color: #D9512C;">The Purchase Department has not provided an estimated time</p></b>`,
            "blue"
          );
        }
      }
    } else if (frm.doc.status === "Approved") {
    } else if (frm.doc.status === "Rejected") {
      frm.trigger("rejection_intro");
    } else if (
      frm.doc.status === "Dispatched" ||
      frm.doc.status === "Received"
    ) {
      frm.trigger("Dispatched_Received_intro");
    } else if (frm.doc.status === "Received") {
      frm.trigger("Dispatched_Received_intro");
    } else if (frm.doc.status === "Delivered") {
      frm.trigger("Delivered_Intro");
    }
    if (!frm.is_new()) {
      if (frm.doc.status !== "Draft")
        frm.toggle_display("section_break_hitna", 0);
    }
    if (frm.is_new()) {
      if (frm.doc.select_department) {
        frm.toggle_display("section_break_hitna", 1);
      }
    }
    if (
      frm.doc.status == "Pending" ||
      frm.doc.status == "Dispatch" ||
      frm.doc.status == "Received" ||
      frm.doc.status == "Pending From Purchase" ||
      frm.doc.status == "Rejected"
    ) {
      // frm.set_df_property("asset", "read_only", 1);
    }

    if (frm.doc.status !== "Draft") {
      frm.toggle_display("asset_department_section", 0);

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

    let user = frappe.session.user;

    if (frm.is_new()) {
      // Get the numeric part of the user string
      let eid = user.match(/\d+/)[0];

      // Initialize the modified employee_id
      let modifiedEmployeeId = "";

      // Check if the user string contains "ABPS" or "MCPS"
      if (user.includes("ABPS")) {
        modifiedEmployeeId = "ABPS" + eid;
      } else if (user.includes("MCPS")) {
        modifiedEmployeeId = "MCPS" + eid;
      } else {
        // If neither "ABPS" nor "MCPS" is found, use the numeric part as is
        modifiedEmployeeId = eid;
      }

      // Set the "employee_id" field with the modified value
      frm.set_value("employee_id", modifiedEmployeeId);

      frappe.call({
        method:
          "sahayog_asset.sahayog_asset.doctype.asset_request.get_emp_details.get_emp_details",
        args: {
          emp_id: empid,
        },
        callback: function (r) {
          // Check if the message array contains at least one object
          if (r.message.length > 0) {
            // Get the employee department field from the first object in the array
            //var department = r.message[0].department;
            frm.set_value("employee_department", r.message[0].department);
            frm.set_value("division", r.message[0].division);
            frm.set_value("region", r.message[0].region);
            frm.set_value("employee_user", r.message[0].user_id);
            frm.set_value("branch", r.message[0].branch);
            //<Email Setup>
            console.log(frm.doc.region);
            if (frm.doc.division === "Microfinance") {
              if (frm.doc.region === "Region-1") {
                frm.set_value("stage_2_emp_id", "49@sahayog.com");
                frm.set_value("stage_2_emp_name", "Vijay Kotriwar");
                frm.set_value(
                  "stage_2_emp_email",
                  "vijay.k@sahayogmultistate.com"
                );
              } else if (frm.doc.region === "Region-2") {
                frm.set_value("stage_2_emp_id", "102@sahayog.com");
                frm.set_value("stage_2_emp_name", "Akash Jambhulkar");
                frm.set_value(
                  "stage_2_emp_email",
                  "akash.j@sahayogmultistate.com"
                );
              } else if (frm.doc.region === "Region-3") {
                frm.set_value("stage_2_emp_id", "49@sahayog.com");
                frm.set_value("stage_2_emp_name", "Vijay Kotriwar");
                frm.set_value(
                  "stage_2_emp_email",
                  "vijay.k@sahayogmultistate.com"
                );
              } else if (frm.doc.region === "Region-4") {
                frm.set_value("stage_2_emp_id", "102@sahayog.com");
                frm.set_value("stage_2_emp_name", "Akash Jambhulkar");
                frm.set_value(
                  "stage_2_emp_email",
                  "akash.j@sahayogmultistate.com"
                );
              }
            } else if (
              frm.doc.employee_department == "Information Technology"
            ) {
              frm.set_value("stage_2_emp_id", "1299@sahayog.com");
              frm.set_value("stage_2_emp_name", "Kamlesh Waghmare");
              frm.set_value(
                "stage_2_emp_email",
                "kamlesh.w@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Human Resource") {
              frm.set_value("stage_2_emp_id", "1394@sahayog.com");
              frm.set_value("stage_2_emp_name", "Harshvardhan Gutke");
              frm.set_value(
                "stage_2_emp_email",
                "harsh.vardhan@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Operations") {
              if (frm.doc.rp_designation == "Branch Manager") {
                if (frm.doc.division == "Multistate") {
                  if (frm.doc.region == "Region-1") {
                    frm.set_value("stage_2_emp_id", "26@sahayog.com");
                    frm.set_value("stage_2_emp_name", "Mangesh Kathane");
                    frm.set_value(
                      "stage_2_emp_email",
                      "rmgondia@sahayogmultistate.com"
                    );
                  } else if (frm.doc.region == "Region-2") {
                    frm.set_value("stage_2_emp_id", "145@sahayog.com");
                    frm.set_value("stage_2_emp_name", "Nishant Shelare");
                    frm.set_value(
                      "stage_2_emp_email",
                      "nishant.s@sahayogmultistate.com"
                    );
                  } else if (frm.doc.region == "Region-3") {
                    frm.set_value("stage_2_emp_id", "521@sahayog.com");
                    frm.set_value("stage_2_emp_name", "Amish Tarale");
                    frm.set_value(
                      "stage_2_emp_email",
                      "amish.t@sahayogmultistate.com"
                    );
                  } else if (frm.doc.region == "Region-4") {
                    frm.set_value("stage_2_emp_id", "1348@sahayog.com");
                    frm.set_value("stage_2_emp_name", "Manish Patil");
                    frm.set_value(
                      "stage_2_emp_email",
                      "manish.p@sahayogmultistate.com"
                    );
                  }
                } else if (frm.doc.division == "Two Wheeler") {
                  frm.set_value("stage_2_emp_id", "304@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Sunil Rathod");
                  frm.set_value(
                    "stage_2_emp_email",
                    "sunil.r@sahayogmultistate.com"
                  );
                } else if (frm.doc.division == "Microfinance") {
                  frm.set_value("stage_2_emp_id", "2553@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Dillipkumar Mishra");
                  frm.set_value(
                    "stage_2_emp_email",
                    "dillip.m@sahayogmultistate.com"
                  );
                }
              } else {
                frm.set_value("stage_2_emp_id", "813@sahayog.com");
                frm.set_value("stage_2_emp_name", "Ravi Jaiswal");
                frm.set_value(
                  "stage_2_emp_email",
                  "ravi.j@sahayogmultistate.com"
                );
              }
            } else if (frm.doc.employee_department == "Administration") {
              frm.set_value("stage_2_emp_id", "596@sahayog.com");
              frm.set_value("stage_2_emp_name", "Omair Rashid Khan");
              frm.set_value(
                "stage_2_emp_email",
                "adminmanager@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Sales") {
              if (frm.doc.division == "Multistate") {
                if (frm.doc.region == "Region-1") {
                  frm.set_value("stage_2_emp_id", "26@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Mangesh Kathane");
                  frm.set_value(
                    "stage_2_emp_email",
                    "rmgondia@sahayogmultistate.com"
                  );
                } else if (frm.doc.region == "Region-2") {
                  frm.set_value("stage_2_emp_id", "145@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Nishant Shelare");
                  frm.set_value(
                    "stage_2_emp_email",
                    "nishant.s@sahayogmultistate.com"
                  );
                } else if (frm.doc.region == "Region-3") {
                  frm.set_value("stage_2_emp_id", "521@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Amish Tarale");
                  frm.set_value(
                    "stage_2_emp_email",
                    "amish.t@sahayogmultistate.com"
                  );
                } else if (frm.doc.region == "Region-4") {
                  frm.set_value("stage_2_emp_id", "1348@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Manish Patil");
                  frm.set_value(
                    "stage_2_emp_email",
                    "manish.p@sahayogmultistate.com"
                  );
                }
              } else if (frm.doc.division == "Two Wheeler") {
                frm.set_value("stage_2_emp_id", "304@sahayog.com");
                frm.set_value("stage_2_emp_name", "Sunil Rathod");
                frm.set_value(
                  "stage_2_emp_email",
                  "sunil.r@sahayogmultistate.com"
                );
              } else if (frm.doc.division == "Microfinance") {
                if (frm.doc.region === "Region-1") {
                  frm.set_value("stage_2_emp_id", "49@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Vijay Kotriwar");
                  frm.set_value(
                    "stage_2_emp_email",
                    "vijay.k@sahayogmultistate.com"
                  );
                } else if (frm.doc.region === "Region-2") {
                  frm.set_value("stage_2_emp_id", "102@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Akash Jambhulkar");
                  frm.set_value(
                    "stage_2_emp_email",
                    "akash.j@sahayogmultistate.com"
                  );
                } else if (frm.doc.region === "Region-3") {
                  frm.set_value("stage_2_emp_id", "49@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Vijay Kotriwar");
                  frm.set_value(
                    "stage_2_emp_email",
                    "vijay.k@sahayogmultistate.com"
                  );
                } else if (frm.doc.region === "Region-4") {
                  frm.set_value("stage_2_emp_id", "102@sahayog.com");
                  frm.set_value("stage_2_emp_name", "Akash Jambhulkar");
                  frm.set_value(
                    "stage_2_emp_email",
                    "akash.j@sahayogmultistate.com"
                  );
                }
              }
            } else if (frm.doc.employee_department == "Audit") {
              frm.set_value("stage_2_emp_id", "914@sahayog.com");
              frm.set_value("stage_2_emp_name", "Naresh Lulani");
              frm.set_value(
                "stage_2_emp_email",
                "naresh.l@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Collection & Recovery") {
              frm.set_value("stage_2_emp_id", "914@sahayog.com");
              frm.set_value("stage_2_emp_name", "Naresh Lulani");
              frm.set_value(
                "stage_2_emp_email",
                "naresh.l@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Credit") {
              frm.set_value("stage_2_emp_id", "914@sahayog.com");
              frm.set_value("stage_2_emp_name", "Naresh Lulani");
              frm.set_value(
                "stage_2_emp_email",
                "naresh.l@sahayogmultistate.com"
              );
            } else if (
              frm.doc.employee_department ==
              "Operational Excellence And Service Quality"
            ) {
              frm.set_value("stage_2_emp_id", "914@sahayog.com");
              frm.set_value("stage_2_emp_name", "Naresh Lulani");
              frm.set_value(
                "stage_2_emp_email",
                "naresh.l@sahayogmultistate.com"
              );
            } else if (frm.doc.employee_department == "Finance & Accounts") {
              if (frm.doc.stage_1_emp_id == "1389@sahayog.com") {
                frm.set_value("stage_2_emp_id", "1389@sahayog.com");
                frm.set_value("stage_2_emp_name", "Sandeepsingh Bhatia");
                frm.set_value("stage_2_emp_email", "cfo@sahayogmultistate.com");
              } else {
                frm.set_value("stage_2_emp_id", "914@sahayog.com");
                frm.set_value("stage_2_emp_name", "Naresh Lulani");
                frm.set_value(
                  "stage_2_emp_email",
                  "naresh.l@sahayogmultistate.com"
                );
              }
            } else if (frm.doc.employee_department == "Store & Purchase") {
              frm.set_value("stage_2_emp_id", "1389@sahayog.com");
              frm.set_value("stage_2_emp_name", "Sandeepsingh Bhatia");
              frm.set_value("stage_2_emp_email", "cfo@sahayogmultistate.com");
            } else if (frm.doc.employee_department == "Legal") {
              frm.set_value("stage_2_emp_id", "1389@sahayog.com");
              frm.set_value("stage_2_emp_name", "Sandeepsingh Bhatia");
              frm.set_value("stage_2_emp_email", "cfo@sahayogmultistate.com");
            } else if (frm.doc.employee_department == "Back Office") {
              frm.set_value("stage_2_emp_id", "1@sahayog.com");
              frm.set_value("stage_2_emp_name", "Vilas Wasnik");
              frm.set_value("stage_2_emp_email", "ceo@sahayogmultistate.com");
            } else if (
              frm.doc.employee_department == "Teaching" ||
              frm.doc.employee_department == "Non-Teaching" ||
              frm.doc.employee_department == "House Keeping" ||
              frm.doc.employee_department == "Transport"
            ) {
              if (frm.doc.branch == "Goregaon") {
                frm.set_value("stage_2_emp_id", "MCPS1039@sahayog.com");
                frm.set_value("stage_2_emp_name", "J.K.Lokhande");
                frm.set_value("stage_2_emp_email", "director@abpschools.com");
              } else {
                frm.set_value("stage_2_emp_id", "ABPS1001@sahayog.com");
                frm.set_value("stage_2_emp_name", "Vilas Karlekar");
                frm.set_value(
                  "stage_2_emp_email",
                  "coo.schools@sahayogmultistate.com"
                );
              }
            }

            //<set stage 3 user>

            if (frm.doc.division == "School") {
              frm.set_value("stage_3_emp_id", "MCPS1039@sahayog.com");
              frm.set_value("stage_3_emp_name", "J.K.Lokhande");
              frm.set_value("stage_3_emp_email", "director@abpschools.com");
            } else if (frm.doc.division !== "School") {
              frm.set_value("stage_3_emp_id", "914@sahayog.com");
              frm.set_value("stage_3_emp_name", "Naresh Lulani");
              frm.set_value(
                "stage_3_emp_email",
                "naresh.l@sahayogmultistate.com"
              );
            }
            //</set stage 3 user>

            //<set stage 4 user>
            frm.set_value("stage_4_emp_id", "1389@sahayog.com");
            frm.set_value("stage_4_emp_name", "Sandeepsingh Bhatia");
            frm.set_value("stage_4_emp_email", "cfo@sahayogmultistate.com");
            //</set stage 4 user>

            //<set stage 5 user>
            frm.set_value("stage_5_emp_id", "1@sahayog.com");
            frm.set_value("stage_5_emp_name", "Vilas R Wasnik");
            frm.set_value("stage_5_emp_email", "ceo@sahayogmultistate.com");
            //</set stage 5 user>

            //<set stage 6 user>
            frm.set_value("stage_6_emp_id", "1299@sahayog.com");
            frm.set_value("stage_6_emp_name", "Kamlesh Waghmare");
            frm.set_value(
              "stage_6_emp_email",
              "kamlesh.w@sahayogmultistate.com"
            );

            //</set stage 6 user>
            //</Email Setup>
            //<set stage 7 user>
            //set from Asset Deparment
            //<set stage 7 user>

            if (frm.doc.status == "Draft") {
              console.log("Working refresh");
              if (frm.doc.employee_department == "Information Technology") {
                frm.set_value("stage_3_emp_status", "Skip");
                frm.set_value("stage_6_emp_status", "Skip");
              }

              if (frm.doc.stage_1_emp_id == frm.doc.stage_5_emp_id) {
                frm.set_value("stage_1_emp_status", "Skip");
                frm.set_value("stage_2_emp_status", "Skip");
                frm.set_value("stage_3_emp_status", "Skip");
                frm.set_value("stage_4_emp_status", "Skip");
                frm.set_value("stage_5_emp_status", "Pending");
              } else if (frm.doc.stage_2_emp_id == frm.doc.stage_5_emp_id) {
                frm.set_value("stage_2_emp_status", "Skip");
                frm.set_value("stage_3_emp_status", "Skip");
                frm.set_value("stage_4_emp_status", "Skip");
              } else if (frm.doc.stage_2_emp_id == frm.doc.stage_3_emp_id) {
                frm.set_value("stage_2_emp_status", "Skip");
                frm.set_value("stage_3_emp_status", "Pending");
              } else if (frm.doc.stage_3_emp_id == frm.doc.stage_5_emp_id) {
                frm.set_value("stage_3_emp_status", "Skip");
                frm.set_value("stage_4_emp_status", "Skip");
              } else if (frm.doc.stage_4_emp_id == frm.doc.stage_5_emp_id) {
                frm.set_value("stage_4_emp_status", "Skip");
              } else if (frm.doc.stage_1_emp_id == frm.doc.stage_4_emp_id) {
                frm.set_value("stage_1_emp_status", "Skip");
                frm.set_value("stage_2_emp_status", "Skip");
                frm.set_value("stage_3_emp_status", "Skip");
              } else if (frm.doc.stage_1_emp_id == frm.doc.stage_3_emp_id) {
                frm.set_value("stage_1_emp_status", "Skip");
                frm.set_value("stage_2_emp_status", "Skip");
              } else if (frm.doc.stage_1_emp_id == frm.doc.stage_2_emp_id) {
                frm.set_value("stage_1_emp_status", "Skip");
                // Code to handle the case where stage_1_emp_id is equal to stage_2_emp_id
              } else {
                // No match, do nothing
              }
            }
          }
        },
      });

      var item_name = frappe.meta.get_docfield(
        "Asset List",
        "item_name",
        cur_frm.doc.name
      );
      var dispatched_status = frappe.meta.get_docfield(
        "Asset List",
        "dispatched_status",
        cur_frm.doc.name
      );

      var purchase_status = frappe.meta.get_docfield(
        "Asset List",
        "purchase",
        cur_frm.doc.name
      );
      item_name.read_only = 1;
      dispatched_status.read_only = 0;
      purchase_status.read_only = 1;
    }

    //START-------------------------------------------------------------------------------------------
    //<Stage 0: Employe Who Request Asset>
    if (user === frm.doc.employee_user) {
      let empid = frm.doc.employee_id;

      if (!frm.is_new()) {
        if (frm.doc.status == "Draft") {
          console.log("Employee Matched at Stage 0 :" + frm.doc.employee_user);
          //<Send for Approval , this button is only for Asset Requester Owner>
          if (!frm.doc.asset || frm.doc.asset.length === 0) {
            frappe.throw({
              title: __("Please Add Asset Item"),
              indicator: "red",
              message: __("Please Add At Least One Asset Item"),
            });
          } else {
            frm.add_custom_button(__("Send for Approval"), function () {
              // Add your button's functionality here
              let rm_stage;
              let rm_stage_request;
              let rm_stage_status;

              if (frm.doc.status === "Draft") {
                if (frm.doc.stage_1_emp_status !== "Skip") {
                  rm_stage = frm.doc.stage_1_emp_id;
                  rm_stage_request = "stage_1_request";
                  rm_stage_status = frm.doc.stage_1_emp_status;
                } else if (frm.doc.stage_2_emp_status !== "Skip") {
                  rm_stage = frm.doc.stage_2_emp_id;
                  rm_stage_request = "stage_2_request";
                  rm_stage_status = frm.doc.stage_2_emp_status;
                } else if (frm.doc.stage_3_emp_status !== "Skip") {
                  rm_stage = frm.doc.stage_3_emp_id;
                  rm_stage_request = "stage_3_request";
                  rm_stage_status = frm.doc.stage_3_emp_status;
                } else if (frm.doc.stage_4_emp_status !== "Skip") {
                  rm_stage = frm.doc.stage_4_emp_id;
                  rm_stage_request = "stage_4_request";
                  rm_stage_status = frm.doc.stage_4_emp_status;
                } else {
                  rm_stage = frm.doc.stage_5_emp_id;
                  rm_stage_request = "stage_5_request";
                  rm_stage_status = frm.doc.stage_5_emp_status;
                }
                //console.log("Reporting Person Status: ", rm_stage_status);

                let self = frm.doc.name;
                let level = 0;

                if (rm_stage_status == "Pending") {
                  if (!frm.doc.asset || frm.doc.asset.length === 0) {
                    frappe.throw({
                      title: __("Please Add Asset Item"),
                      indicator: "red",
                      message: __("Please Add At Least One Asset Item"),
                    });
                  } else {
                    frappe.confirm(
                      "<i>Do you want to send for Approval?</i>",
                      () => {
                        // FIRST Set Value THEN Share doc with next User
                        frappe.call({
                          method:
                            "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                          args: {
                            level: level, // ex - 1
                            self: self, //ex - SAR-17112023-2145
                            rm_stage_status: rm_stage_status, // Pass the variable value here
                            rm_stage: rm_stage,
                            rm_stage_request: rm_stage_request,
                            stage_status: "None",
                          },
                          callback: function (r) {
                            // Check if the server-side function returned True
                            if (r.message === true) {
                              // Display a success message
                              frm.set_value("status", "Pending");
                              console.log("Response Value : ", r.message);
                              frappe.show_alert({
                                message:
                                  "Your Asset Request Sent Successfully ",
                                indicator: "green",
                              });

                              frm.save();
                              frm.reload_doc();
                            } else {
                              // Display an alert for other cases
                              frappe.msgprint({
                                title: __("Server Down"),
                                indicator: "red",
                                message: __("Please Try Again"),
                              });
                            }
                          },
                        });

                        // action to perform if Yes is selected
                      },
                      () => {
                        // action to perform if No is selected
                      }
                    );
                  }

                  //</PR is Shared with RM using API Call>
                } else {
                  frappe.msgprint("Approval Already Sent");
                }
              }
            });
          }

          frm.change_custom_button_type("Send for Approval", null, "primary");
          //</Send for Approval , this button is only for Asset Requester Owner>
        } else if (frm.doc.status == "Dispatched") {
          frm.add_custom_button(__("Receive"), function () {
            var d = new frappe.ui.Dialog({
              title: __("Received Remark"),
              fields: [
                {
                  label: __("Please Give Received Remark for this Asset"),
                  fieldname: "emp_received_remark",
                  fieldtype: "Small Text",
                  reqd: 1, // Set the rejection reason field as mandatory
                  description: __(
                    "Wrtie Courier Name & Builty No / Vehicle No. / Mode of Transport"
                  ), // Description for the field
                },
              ],
              primary_action_label: __("Receive"),
              primary_action: function () {
                // Check if the rejection reason is provided
                if (!d.fields_dict.emp_received_remark.get_value()) {
                  frappe.msgprint(__("Please provide a Received Remark."));
                  return;
                }
                // Generate a random 4-digit number
                var randomOTP = Math.floor(1000 + Math.random() * 9000);

                frm.set_value(
                  "emp_received_remark",
                  d.fields_dict.emp_received_remark.get_value()
                );
                d.hide();
                frm.set_value("status", "Received");
                frm.set_value("received_otp", randomOTP); // Set the random number to store_otp
                cur_frm.save();
              },
              secondary_action_label: __("Cancel"),
              secondary_action: function () {
                d.hide();
              },
            });

            d.show();
          });
        } else if (frm.doc.status == "Received") {
          frm.disable_save();
        }
      }

      if (frm.doc.status !== "Draft") {
        frm.set_df_property("asset", "read_only", 1);
      }
    } //</Stage 0>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 1>
    if (
      user === frm.doc.stage_1_emp_id &&
      frm.doc.stage_1_emp_status == "Pending"
    ) {
      frm.set_df_property("asset", "read_only", 1);
      console.log("Employee Matched at Stage 1 :" + frm.doc.stage_1_emp_id);

      if (
        frm.doc.status == "Pending" &&
        frm.doc.stage_1_emp_status == "Pending"
      ) {
        frm.add_custom_button(__("Approve"), function () {
          if (frm.doc.status == "Pending") {
            frappe.confirm(
              "We are assuming that you verified this Asset Request <br> " +
                "<b>Are you sure for Approval?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage2;
                let emp_stage2_request;
                let emp_stage2_status;

                if (frm.doc.status === "Pending") {
                  if (frm.doc.stage_2_emp_status !== "Skip") {
                    emp_stage2 = frm.doc.stage_2_emp_id;
                    emp_stage2_request = "stage_2_request";
                    emp_stage2_status = frm.doc.stage_2_emp_status;
                  } else if (frm.doc.stage_3_emp_status !== "Skip") {
                    emp_stage2 = frm.doc.stage_3_emp_id;
                    emp_stage2_request = "stage_3_request";
                    emp_stage2_status = frm.doc.stage_3_emp_status;
                  } else if (frm.doc.stage_4_emp_status !== "Skip") {
                    emp_stage2 = frm.doc.stage_4_emp_id;
                    emp_stage2_request = "stage_4_request";
                    emp_stage2_status = frm.doc.stage_4_emp_status;
                  } else if (frm.doc.stage_5_emp_status !== "Skip") {
                    emp_stage2 = frm.doc.stage_5_emp_id;
                    emp_stage2_request = "stage_5_request";
                    emp_stage2_status = frm.doc.stage_4_emp_status;
                  }
                }
                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here
                let stage2 = emp_stage2;
                let self = frm.doc.name;
                let level = "1";
                let stage_status = "stage_1_emp_status";

                //<PR is Shared with RM using API Call>
                if (frm.doc.stage_1_emp_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage2_status, // Pass the variable value here
                      rm_stage: stage2,
                      rm_stage_request: emp_stage2_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);
                        //frm.set_value("stage_1_emp_status", "Approved");
                        frm
                          .set_value("stage_1_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        // Display a success message
                        // Set field values
                        //frm.set_value(emp_stage2_request, "Done");
                        //
                        // frm.set_value("status", "Pending");

                        frappe.show_alert({
                          message: "Your Asset Request Sent Successfully ",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });
                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage2,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage2_request, "Done");
                  //     frm.set_value("stage_1_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
        frm.add_custom_button(__("Reject"), function () {
          var d = new frappe.ui.Dialog({
            title: __("Rejection Reason"),
            fields: [
              {
                label: __(
                  "Please Give Reason of Rejection for this Asset Request"
                ),
                fieldname: "stage_1_emp_rejection",
                fieldtype: "Small Text",
                reqd: 1, // Set the rejection reason field as mandatory
              },
            ],
            primary_action_label: __("Reject"),
            primary_action: function () {
              // Check if the rejection reason is provided
              if (!d.fields_dict.stage_1_emp_rejection.get_value()) {
                frappe.msgprint(__("Please provide a rejection reason."));
                return;
              }

              frm.set_value("stage_1_emp_status", "Reject");
              frm.set_value(
                "stage_1_emp_rejection",
                d.fields_dict.stage_1_emp_rejection.get_value()
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

      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 1>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 2>
    else if (
      user === frm.doc.stage_2_emp_id &&
      frm.doc.stage_2_emp_status !== "Skip" &&
      frm.doc.stage_2_emp_status == "Pending"
    ) {
      frm.set_df_property("asset", "read_only", 1);
      console.log("Employee Matched at Stage 2 :" + frm.doc.stage_2_emp_id);

      if (
        frm.doc.status == "Pending" &&
        frm.doc.stage_2_emp_status == "Pending"
      ) {
        frm.add_custom_button(__("Approve"), function () {
          if (
            frm.doc.status == "Pending" &&
            frm.doc.stage_2_emp_status == "Pending"
          ) {
            frappe.confirm(
              "We are assuming that you verified this Asset Request <br> " +
                "<b>Are you sure for Approval?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage;
                let emp_stage_request;
                let emp_stage_status;

                if (frm.doc.status === "Pending") {
                  if (frm.doc.stage_3_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_3_emp_id;
                    emp_stage_request = "stage_3_request";
                    emp_stage_status = frm.doc.stage_3_emp_status;
                  } else if (frm.doc.stage_4_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_4_emp_id;
                    emp_stage_request = "stage_4_request";
                    emp_stage_status = frm.doc.stage_4_emp_status;
                  } else if (frm.doc.stage_5_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_5_emp_id;
                    emp_stage_request = "stage_5_request";
                    emp_stage_status = frm.doc.stage_4_emp_status;
                  }
                }
                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here
                let stage = emp_stage;
                let level = "2";
                let self = frm.doc.name;
                let stage_status = "stage_2_emp_status";
                //<PR is Shared with RM using API Call>
                if (frm.doc.stage_2_emp_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage_status, // Pass the variable value here
                      rm_stage: stage,
                      rm_stage_request: emp_stage_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);

                        frm
                          .set_value("stage_2_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        // Display a success message
                        // Set field values
                        //frm.set_value(emp_stage2_request, "Done");
                        //
                        // frm.set_value("status", "Pending");

                        frappe.show_alert({
                          message: "Sent Successfully",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });

                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage_request, "Done");
                  //     frm.set_value("stage_2_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
        frm.add_custom_button(__("Reject"), function () {
          var d = new frappe.ui.Dialog({
            title: __("Rejection Reason"),
            fields: [
              {
                label: __(
                  "Please Give Reason of Rejection for this Asset Request"
                ),
                fieldname: "stage_2_emp_rejection",
                fieldtype: "Small Text",
                reqd: 1, // Set the rejection reason field as mandatory
              },
            ],
            primary_action_label: __("Reject"),
            primary_action: function () {
              // Check if the rejection reason is provided
              if (!d.fields_dict.stage_2_emp_rejection.get_value()) {
                frappe.msgprint(__("Please provide a rejection reason."));
                return;
              }

              frm.set_value("stage_2_emp_status", "Reject");
              frm.set_value(
                "stage_2_emp_rejection",
                d.fields_dict.stage_2_emp_rejection.get_value()
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
      // frappe.msgprint("RP Matched");
      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 2>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 3>
    else if (
      user === frm.doc.stage_3_emp_id &&
      frm.doc.stage_3_emp_status !== "Skip" &&
      frm.doc.stage_3_emp_status == "Pending"
    ) {
      frm.set_df_property("asset", "read_only", 1);
      console.log("Employee Matched at Stage 3 :" + frm.doc.stage_3_emp_id);

      if (
        frm.doc.status == "Pending" &&
        frm.doc.stage_3_emp_status == "Pending"
      ) {
        frm.add_custom_button(__("Approve"), function () {
          if (
            frm.doc.status == "Pending" &&
            frm.doc.stage_3_emp_status == "Pending"
          ) {
            frappe.confirm(
              "We are assuming that you verified this Asset Request <br> " +
                "<b>Are you sure for Approval?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage;
                let emp_stage_request;
                let emp_stage_status;

                if (frm.doc.status === "Pending") {
                  if (frm.doc.stage_4_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_4_emp_id;
                    emp_stage_request = "stage_4_request";
                    emp_stage_status = frm.doc.stage_4_emp_status;
                  } else if (frm.doc.stage_5_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_5_emp_id;
                    emp_stage_request = "stage_5_request";
                    emp_stage_status = frm.doc.stage_4_emp_status;
                  }
                }
                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here

                let stage = emp_stage;
                let level = "3";
                let self = frm.doc.name;
                let stage_status = "stage_3_emp_status";
                //<PR is Shared with RM using API Call>
                if (emp_stage_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage_status, // Pass the variable value here
                      rm_stage: stage,
                      rm_stage_request: emp_stage_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);
                        frm.set_value(emp_stage_request, "Done");
                        frm
                          .set_value("stage_3_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        // Display a success message
                        // Set field values
                        //frm.set_value(emp_stage2_request, "Done");
                        //
                        // frm.set_value("status", "Pending");

                        frappe.show_alert({
                          message: "Successfully Approved",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });

                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage_request, "Done");
                  //     frm.set_value("stage_3_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
        frm.add_custom_button(__("Reject"), function () {
          var d = new frappe.ui.Dialog({
            title: __("Rejection Reason"),
            fields: [
              {
                label: __(
                  "Please Give Reason of Rejection for this Asset Request"
                ),
                fieldname: "stage_3_emp_rejection",
                fieldtype: "Small Text",
                reqd: 1, // Set the rejection reason field as mandatory
              },
            ],
            primary_action_label: __("Reject"),
            primary_action: function () {
              // Check if the rejection reason is provided
              if (!d.fields_dict.stage_3_emp_rejection.get_value()) {
                frappe.msgprint(__("Please provide a rejection reason."));
                return;
              }

              frm.set_value("stage_3_emp_status", "Reject");
              frm.set_value(
                "stage_3_emp_rejection",
                d.fields_dict.stage_3_emp_rejection.get_value()
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
      // frappe.msgprint("RP Matched");
      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 3>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 4>
    else if (
      user === frm.doc.stage_4_emp_id &&
      frm.doc.stage_4_emp_status !== "Skip" &&
      frm.doc.stage_4_emp_status == "Pending"
    ) {
      frm.set_df_property("asset", "read_only", 1);
      console.log("Employee Matched at Stage 4 :" + frm.doc.stage_4_emp_id);

      if (
        frm.doc.status == "Pending" &&
        frm.doc.stage_4_emp_status == "Pending"
      ) {
        frm.add_custom_button(__("Approve"), function () {
          if (
            frm.doc.status == "Pending" &&
            frm.doc.stage_4_emp_status == "Pending"
          ) {
            frappe.confirm(
              "We are assuming that you verified this Asset Request <br> " +
                "<b>Are you sure for Approval?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage;
                let emp_stage_request;
                let emp_stage_status;

                if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department == "IT" &&
                  frm.doc.employee_department == "Information Technology"
                ) {
                  if (frm.doc.stage_7_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_7_emp_id;
                    emp_stage_request = "stage_7_request";
                    emp_stage_status = frm.doc.stage_7_emp_status;
                  }
                } else if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department == "IT"
                ) {
                  if (frm.doc.stage_6_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_6_emp_id;
                    emp_stage_request = "stage_6_request";
                    emp_stage_status = frm.doc.stage_6_emp_status;
                  }
                } else if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department !== "IT"
                ) {
                  if (frm.doc.stage_7_emp_status !== "Skip") {
                    emp_stage = frm.doc.stage_7_emp_id;
                    emp_stage_request = "stage_7_request";
                    emp_stage_status = frm.doc.stage_7_emp_status;
                  }
                }

                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here
                let stage = emp_stage;
                let level = "4";
                let self = frm.doc.name;
                let stage_status = "stage_4_emp_status";
                //<PR is Shared with RM using API Call>
                if (emp_stage_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage_status, // Pass the variable value here
                      rm_stage: stage,
                      rm_stage_request: emp_stage_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);

                        frm
                          .set_value("stage_4_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        frappe.show_alert({
                          message: "Successfully Approved",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });

                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage_request, "Done");
                  //     frm.set_value("stage_4_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
        frm.add_custom_button(__("Reject"), function () {
          var d = new frappe.ui.Dialog({
            title: __("Rejection Reason"),
            fields: [
              {
                label: __(
                  "Please Give Reason of Rejection for this Asset Request"
                ),
                fieldname: "stage_4_emp_rejection",
                fieldtype: "Small Text",
                reqd: 1, // Set the rejection reason field as mandatory
              },
            ],
            primary_action_label: __("Reject"),
            primary_action: function () {
              // Check if the rejection reason is provided
              if (!d.fields_dict.stage_4_emp_rejection.get_value()) {
                frappe.msgprint(__("Please provide a rejection reason."));
                return;
              }

              frm.set_value("stage_4_emp_status", "Reject");
              frm.set_value(
                "stage_4_emp_rejection",
                d.fields_dict.stage_4_emp_rejection.get_value()
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
        frm.add_custom_button(__("Send To CEO"), function () {
          if (
            frm.doc.status == "Pending" &&
            frm.doc.stage_4_emp_status == "Pending"
          ) {
            frappe.confirm(
              "Do you really want to send this to CEO <br> " +
                "<b>Are you sure for Approval from CEO?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage;
                let emp_stage_request;
                let emp_stage_status;

                if (frm.doc.status === "Pending") {
                  if (frm.doc.stage_5_emp_status == "Skip") {
                    frm.set_value("stage_5_emp_status", "Pending");
                    emp_stage = frm.doc.stage_5_emp_id;
                    emp_stage_request = "stage_5_request";
                    emp_stage_status = frm.doc.stage_4_emp_status;
                  }
                }
                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here
                let stage = emp_stage;
                let level = "4";
                let self = frm.doc.name;
                let stage_status = "stage_4_emp_status";
                //<PR is Shared with RM using API Call>
                if (emp_stage_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage_status, // Pass the variable value here
                      rm_stage: stage,
                      rm_stage_request: emp_stage_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);

                        frm
                          .set_value("stage_4_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        frappe.show_alert({
                          message: "Successfully Approved",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });

                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage_request, "Done");
                  //     frm.set_value("stage_4_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
      }
      // frappe.msgprint("RP Matched");
      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 4>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 5>
    else if (
      user === frm.doc.stage_5_emp_id &&
      frm.doc.stage_5_emp_status !== "Skip" &&
      frm.doc.stage_5_emp_status == "Pending"
    ) {
      frm.set_df_property("asset", "read_only", 1);
      console.log("Employee Matched at Stage 5 :" + frm.doc.stage_5_emp_id);

      if (
        frm.doc.status == "Pending" &&
        frm.doc.stage_5_emp_status == "Pending"
      ) {
        frm.add_custom_button(__("Approve"), function () {
          if (
            frm.doc.status == "Pending" &&
            frm.doc.stage_5_emp_status == "Pending"
          ) {
            frappe.confirm(
              "We are assuming that you verified this Asset Request <br> " +
                "<b>Are you sure for Approval?</b>",
              () => {
                //<check Next Not Skippable Employee>
                let emp_stage;
                let emp_stage_request;
                let emp_stage_status;

                if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department == "IT" &&
                  frm.doc.employee_department == "Information Technology"
                ) {
                  console.log("IT");
                  emp_stage = frm.doc.stage_7_emp_id;
                  emp_stage_request = "stage_7_request";
                  emp_stage_status = frm.doc.stage_7_emp_status;
                } else if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department == "IT" &&
                  frm.doc.employee_department !== "Information Technology"
                ) {
                  emp_stage = frm.doc.stage_6_emp_id;
                  emp_stage_request = "stage_6_request";
                  emp_stage_status = frm.doc.stage_6_emp_status;
                } else if (
                  frm.doc.status === "Pending" &&
                  frm.doc.select_department !== "IT"
                ) {
                  console.log("not IT");
                  emp_stage = frm.doc.stage_7_emp_id;
                  emp_stage_request = "stage_7_request";
                  emp_stage_status = frm.doc.stage_7_emp_status;
                }
                //</check Next Not Skippable Employee>

                // action to perform if Yes is selected
                // Add your button's functionality here
                let stage = emp_stage;
                let level = "5";
                let self = frm.doc.name;
                let stage_status = "stage_5_emp_status";
                //<PR is Shared with RM using API Call>
                if (emp_stage_status == "Pending") {
                  frappe.call({
                    method:
                      "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                    args: {
                      level: level, // ex - 1
                      self: self, //ex - SAR-17112023-2145
                      rm_stage_status: emp_stage_status, // Pass the variable value here
                      rm_stage: stage,
                      rm_stage_request: emp_stage_request,
                      stage_status: stage_status,
                    },
                    callback: function (r) {
                      // Check if the server-side function returned True
                      if (r.message === true) {
                        console.log("Response Value : ", r.message);

                        frm
                          .set_value("stage_5_emp_status", "Approved")
                          .then(() => {
                            // do something after value is set
                            //console.log("True");
                          });
                        frm.save();

                        frappe.show_alert({
                          message: "Successfully Approved",
                          indicator: "green",
                        });
                      } else {
                        // Display an alert for other cases
                        frappe.msgprint({
                          title: __("Server Down"),
                          indicator: "red",
                          message: __("Please Try Again"),
                        });
                      }
                    },
                  });

                  // frappe.call({
                  //   method: "frappe.share.add",
                  //   args: {
                  //     doctype: frm.doctype,
                  //     name: frm.docname,
                  //     user: stage,
                  //     read: 1,
                  //     write: 1,
                  //     submit: 0,
                  //     share: 1,
                  //     notify: 1,
                  //     send_email: 0, // Set this to 0 to prevent sending email notifications
                  //   },
                  //   callback: function (response) {
                  //     // Check if the document has been modified

                  //     // Document share was successful
                  //     frappe.show_alert({
                  //       message: "Your Asset Request Sent Successfully",
                  //       indicator: "green",
                  //     });

                  //     // Set field values
                  //     frm.set_value(emp_stage_request, "Done");
                  //     frm.set_value("stage_5_emp_status", "Approved");
                  //     frm.set_value("status", "Pending");

                  //     // Save the form
                  //     frm.save();
                  //   },
                  // });

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
        });
        frm.add_custom_button(__("Reject"), function () {
          var d = new frappe.ui.Dialog({
            title: __("Rejection Reason"),
            fields: [
              {
                label: __(
                  "Please Give Reason of Rejection for this Asset Request"
                ),
                fieldname: "stage_5_emp_rejection",
                fieldtype: "Small Text",
                reqd: 1, // Set the rejection reason field as mandatory
              },
            ],
            primary_action_label: __("Reject"),
            primary_action: function () {
              // Check if the rejection reason is provided
              if (!d.fields_dict.stage_5_emp_rejection.get_value()) {
                frappe.msgprint(__("Please provide a rejection reason."));
                return;
              }

              frm.set_value("stage_5_emp_status", "Reject");
              frm.set_value(
                "stage_5_emp_rejection",
                d.fields_dict.stage_5_emp_rejection.get_value()
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
      // frappe.msgprint("RP Matched");
      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 5>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 6>
    else if (user === frm.doc.stage_6_emp_id) {
      if (
        (frm.doc.stage_6_emp_status == "Pending" &&
          frm.doc.stage_4_emp_status == "Approved") ||
        (frm.doc.stage_6_emp_status == "Pending" &&
          frm.doc.stage_5_emp_status == "Approved")
      ) {
        if (frm.doc.stage_5_emp_status === "Skip") {
          // "Stage 4" is approved and "Stage 5" is skipped
          frm.set_df_property("asset", "read_only", 1);
          console.log("Employee Matched at Stage 6 :" + frm.doc.stage_6_emp_id);
          console.log("CEO Not Required");
          frm.add_custom_button(__("Verify"), function () {
            if (
              frm.doc.status == "Pending" &&
              frm.doc.stage_6_emp_status == "Pending"
            ) {
              frappe.confirm(
                "We are assuming that you verified this Asset Request <br> " +
                  "<b>Are you sure for Proceed?</b>",
                () => {
                  //<check Next Not Skippable Employee>
                  let emp_stage;
                  let emp_stage_request;
                  let emp_stage_status;

                  if (
                    frm.doc.status === "Pending" &&
                    frm.doc.select_department == "IT"
                  ) {
                    if (frm.doc.stage_7_emp_status !== "Skip") {
                      emp_stage = frm.doc.stage_7_emp_id;
                      emp_stage_request = "stage_7_request";
                      emp_stage_status = frm.doc.stage_7_emp_status;
                    }
                  }
                  //</check Next Not Skippable Employee>

                  // action to perform if Yes is selected
                  // Add your button's functionality here
                  let stage = emp_stage;
                  let level = "6";
                  let self = frm.doc.name;
                  let stage_status = "stage_6_emp_status";
                  //<PR is Shared with RM using API Call>
                  if (emp_stage_status == "Pending") {
                    frappe.call({
                      method:
                        "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                      args: {
                        level: level, // ex - 1
                        self: self, //ex - SAR-17112023-2145
                        rm_stage_status: emp_stage_status, // Pass the variable value here
                        rm_stage: stage,
                        rm_stage_request: emp_stage_request,
                        stage_status: stage_status,
                      },
                      callback: function (r) {
                        // Check if the server-side function returned True
                        if (r.message === true) {
                          console.log("Response Value : ", r.message);

                          frm
                            .set_value("stage_6_emp_status", "Approved")
                            .then(() => {
                              // do something after value is set
                              //console.log("True");
                            });
                          frm.save();

                          frappe.show_alert({
                            message: "Successfully Approved",
                            indicator: "green",
                          });
                        } else {
                          // Display an alert for other cases
                          frappe.msgprint({
                            title: __("Server Down"),
                            indicator: "red",
                            message: __("Please Try Again"),
                          });
                        }
                      },
                    });
                    // frappe.call({
                    //   method: "frappe.share.add",
                    //   args: {
                    //     doctype: frm.doctype,
                    //     name: frm.docname,
                    //     user: stage,
                    //     read: 1,
                    //     write: 1,
                    //     submit: 0,
                    //     share: 1,
                    //     notify: 1,
                    //     send_email: 0, // Set this to 0 to prevent sending email notifications
                    //   },
                    //   callback: function (response) {
                    //     // Check if the document has been modified

                    //     // Document share was successful
                    //     frappe.show_alert({
                    //       message: "Your Asset Request Sent Successfully",
                    //       indicator: "green",
                    //     });

                    //     // Set field values
                    //     frm.set_value(emp_stage_request, "Done");
                    //     frm.set_value("stage_6_emp_status", "Approved");
                    //     frm.set_value("status", "Pending");

                    //     // Save the form
                    //     frm.save();
                    //   },
                    // });

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
          });
        } else if (frm.doc.stage_5_emp_status === "Approved") {
          // "Stage 4" is approved, but "Stage 5" approval is pending
          console.log("Employee Matched at Stage 6 :" + frm.doc.stage_6_emp_id);
          console.log("pending from Stage 5");
          frm.add_custom_button(__("Verify"), function () {
            if (
              frm.doc.status == "Pending" &&
              frm.doc.stage_6_emp_status == "Pending"
            ) {
              frappe.confirm(
                "We are assuming that you verified this Asset Request <br> " +
                  "<b>Are you sure for Proceed?</b>",
                () => {
                  //<check Next Not Skippable Employee>
                  let emp_stage;
                  let emp_stage_request;
                  let emp_stage_status;

                  if (
                    frm.doc.status === "Pending" &&
                    frm.doc.select_department == "IT"
                  ) {
                    if (frm.doc.stage_7_emp_status !== "Skip") {
                      emp_stage = frm.doc.stage_7_emp_id;
                      emp_stage_request = "stage_7_request";
                      emp_stage_status = frm.doc.stage_7_emp_status;
                    }
                  }
                  //</check Next Not Skippable Employee>

                  // action to perform if Yes is selected
                  // Add your button's functionality here
                  let stage = emp_stage;
                  let level = "6";
                  let self = frm.doc.name;
                  let stage_status = "stage_6_emp_status";
                  //<PR is Shared with RM using API Call>
                  if (emp_stage_status == "Pending") {
                    frappe.call({
                      method:
                        "sahayog_asset.sahayog_asset.doctype.asset_request.asset_request.set_level",
                      args: {
                        level: level, // ex - 1
                        self: self, //ex - SAR-17112023-2145
                        rm_stage_status: emp_stage_status, // Pass the variable value here
                        rm_stage: stage,
                        rm_stage_request: emp_stage_request,
                        stage_status: stage_status,
                      },
                      callback: function (r) {
                        // Check if the server-side function returned True
                        if (r.message === true) {
                          console.log("Response Value : ", r.message);

                          frm
                            .set_value("stage_6_emp_status", "Approved")
                            .then(() => {
                              // do something after value is set
                              //console.log("True");
                            });
                          frm.save();

                          frappe.show_alert({
                            message: "Successfully Approved",
                            indicator: "green",
                          });
                        } else {
                          // Display an alert for other cases
                          frappe.msgprint({
                            title: __("Server Down"),
                            indicator: "red",
                            message: __("Please Try Again"),
                          });
                        }
                      },
                    });

                    // frappe.call({
                    //   method: "frappe.share.add",
                    //   args: {
                    //     doctype: frm.doctype,
                    //     name: frm.docname,
                    //     user: stage,
                    //     read: 1,
                    //     write: 1,
                    //     submit: 0,
                    //     share: 1,
                    //     notify: 1,
                    //     send_email: 0, // Set this to 0 to prevent sending email notifications
                    //   },
                    //   callback: function (response) {
                    //     // Check if the document has been modified

                    //     // Document share was successful
                    //     frappe.show_alert({
                    //       message: "Your Asset Request Sent Successfully",
                    //       indicator: "green",
                    //     });

                    //     // Set field values
                    //     frm.set_value(emp_stage_request, "Done");
                    //     frm.set_value("stage_6_emp_status", "Approved");
                    //     frm.set_value("status", "Pending");

                    //     // Save the form
                    //     frm.save();
                    //   },
                    // });

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
          });
        }
      }

      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded
    } //</Stage 6>
    //END-------------------------------------------------------------------------------------------

    //START-------------------------------------------------------------------------------------------
    //<Stage 7>
    else if (
      (user === frm.doc.stage_7_emp_id &&
        frm.doc.stage_4_emp_status == "Approved") ||
      (user === frm.doc.stage_7_emp_id &&
        frm.doc.stage_5_emp_status == "Approved") ||
      (user === frm.doc.stage_7_emp_id &&
        frm.doc.stage_6_emp_status == "Approved")
    ) {
      var purchase_status = frappe.meta.get_docfield(
        "Asset List",
        "purchase",
        cur_frm.doc.name
      );
      purchase_status.read_only = 1;

      console.log("Employee Matched at Stage 7 :" + frm.doc.stage_7_emp_id);
      if (
        frm.doc.status === "Dispatched" ||
        frm.doc.status === "Recieved" ||
        frm.doc.status === "Delivered" ||
        frm.doc.status === "Pending From Purchase "
      ) {
        frm.set_df_property("asset", "read_only", 1);
      } else {
        frm.set_df_property("asset", "read_only", 0);
      }

      if (frm.doc.status == "Received") {
        frm.trigger("Asset_Delivered");
      }
      if (
        (frm.doc.status == "Pending" &&
          frm.doc.stage_7_emp_status == "Pending" &&
          frm.doc.stage_5_emp_status !== "Pending") ||
        frm.doc.status == "Pending From Purchase" ||
        frm.doc.status == "Pending From Store Manager"
      ) {
        if (
          frm.doc.status == "Pending" ||
          frm.doc.status == "Pending From Purchase"
        ) {
          frm.trigger("dispatch_button");
        } else if (frm.doc.purchase_status == "Delivered To Store") {
          frm.trigger("dispatch_button");
        }

        if (
          frm.doc.status == "Pending" &&
          frm.doc.stage_7_emp_status !== "Pending From Purchase"
        ) {
          // frm.add_custom_button(__("Pending From Purchase"), function () {
          //   var d = new frappe.ui.Dialog({
          //     title: __("Pending From Purchase Reason"),
          //     fields: [
          //       {
          //         label: __(
          //           "Please Give Reason of unavailability for this Asset Request"
          //         ),
          //         fieldname: "stage_7_emp_unavailable_reason",
          //         fieldtype: "Small Text",
          //         reqd: 1, // Set the unavailability reason field as mandatory
          //       },
          //     ],
          //     primary_action_label: __("Submit"),
          //     primary_action: function () {
          //       // Check if the unavailability reason is provided
          //       if (!d.fields_dict.stage_7_emp_unavailable_reason.get_value()) {
          //         frappe.msgprint(
          //           __("Please provide an unavailability reason.")
          //         );
          //         return;
          //       }
          //       // Generate a random 4-digit number
          //       var randomOTP = Math.floor(1000 + Math.random() * 9000);
          //       frm.set_value("stage_7_emp_status", "Pending From Purchase");
          //       frm.set_value("store_otp", randomOTP); // Set the random number to store_otp
          //       frm.set_value(
          //         "stage_7_emp_unavailable_reason",
          //         d.fields_dict.stage_7_emp_unavailable_reason.get_value()
          //       );
          //       d.hide();
          //       frm.set_value("status", "Pending From Purchase");
          //       console.log("Pending from Button");
          //       frm.trigger("share_with_purchase");
          //       cur_frm.save();
          //     },
          //     secondary_action_label: __("Cancel"),
          //     secondary_action: function () {
          //       d.hide();
          //     },
          //   });
          //   d.show();
          // });
        }
      }
      // frappe.msgprint("RP Matched");
      frm.disable_save();
      //<Send for Approval , this button is only for PR Owner>
      // Check if the page has already been reloaded

      // Get the dispatch_check button field element
      var dispatchCheckButton = frm.get_field("dispatch_check").$wrapper;
    } //</Stage 7>

    //END-------------------------------------------------------------------------------------------
    else {
      console.log("You Already Approved");
    }

    //START-------------------------------------------------------------------------------------------
    //<Stage 8 : Purchase Department>
    let p1 = "689@sahayog.com";
    let p2 = "40@sahayog.com";
    let p3 = "2481@sahayog.com";
    let p4 = "2946@sahayog.com";
    if (user === p1 || user === p2 || user === p3 || user === p4) {
      if (frm.doc.status == "Pending From Purchase")
        frm.trigger("purchase_remark");

      frm.trigger("popup_for_purchase");
    }

    //END-------------------------------------------------------------------------------------------
    //</Stage 8 : Purchase Department>

    if (!frm.is_new()) {
      if (frm.doc.status !== "Draft") {
        frm.disable_save();
      }
    }
    frm.change_custom_button_type("Approve", null, "success");
    frm.change_custom_button_type("Send To CEO", null, "primary");
    frm.change_custom_button_type("Reject", null, "danger");
    frm.change_custom_button_type("Verify", null, "info");
    frm.change_custom_button_type("Dispatch", null, "success");
    frm.change_custom_button_type("Pending From Purchase", null, "warning");
    frm.change_custom_button_type("Receive", null, "success");
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
    let sendForApprovalButton = frm.page.wrapper.find(
      '.btn.btn-primary[data-label="Send%20for%20Approval"]'
    );

    if (sendForApprovalButton.length > 0) {
      let button = sendForApprovalButton;
      let isYellow = false;

      // // Continuously change font color and weight between yellow and white
      // setInterval(function () {
      //   if (isYellow) {
      //     button.css("color", "white");
      //     button.css("font-weight", "normal");
      //   } else {
      //     button.css("color", "yellow");
      //     button.css("font-weight", "bold");
      //   }
      //   isYellow = !isYellow;
      // }, 1000); // Change color every 1000ms (1 second)
    }

    frm.trigger("hide_childtable_Edit_Setting");
  },

  hide_childtable_Edit_Setting: function (frm) {},

  select_department: function (frm) {
    frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();
    var department = frm.doc.select_department;

    if (department) {
      frm.set_query("list", function () {
        return {
          filters: [
            ["category", "=", department],
            ["enable", "=", "1"], // Additional filter for "enable"
          ],
        };
      });

      if (frm.doc.status === "Draft") {
        if (
          department === "IT" &&
          frm.doc.employee_department == "Information Technology"
        ) {
          frm.set_value("stage_6_emp_status", "Skip");
        } else if (department === "IT") {
          frm.set_value("stage_6_emp_status", "Pending");
        } else {
          frm.set_value("stage_6_emp_status", "Skip");
        }
      }
    } else {
      // Reset the filter when no department is selected
      frm.set_query("list", function () {
        return {
          filters: [
            ["enable", "=", "1"], // Additional filter for "enable"
          ],
        };
      });
      // Reset stage_6_emp_status when no department is selected
      frm.set_value("stage_6_emp_status", "");
    }
  },

  // rm_approval_status: function (frm) {
  //   frm.set_value("hod", null);
  //   if (frm.doc.rm_approval_status == "Approved") {
  //     let HOD;
  //     let HOD_NAME;
  //     if (frm.doc.it_user) {
  //       HOD = frm.doc.it_user;
  //       HOD_NAME = frm.doc.it_hod;
  //       frm.set_value("hod", HOD);
  //       frm.set_value("hod_name", HOD_NAME);
  //     }

  //     if (frm.doc.admin_user) {
  //       HOD = frm.doc.admin_user;
  //       HOD_NAME = frm.doc.admin_hod;
  //       frm.set_value("hod", HOD);
  //       frm.set_value("hod_name", HOD_NAME);
  //     }
  //     if (frm.doc.stationary_user) {
  //       HOD = frm.doc.stationary_user;
  //       HOD_NAME = frm.doc.stationary_hod;
  //       frm.set_value("hod", HOD);
  //       frm.set_value("hod_name", HOD_NAME);
  //     }
  //
  //   }
  // },

  Dispatched_Received_intro: function (frm) {
    // Create a new intro for the dispatch details
    let dispatchIntro = "<b><u>Dispatch Details</u></b>";
    let dispatchedBy = frm.doc.stage_7_emp_name;

    // Create the dispatch intro message
    let dispatchMessage = `
      Dispatched By: <span style="font-weight: bold;">${dispatchedBy}</span><br>
    `;

    // Add a separator line without any gap space
    let separator = '<hr style="margin: 0;">';

    // Create a new intro for the received details
    let receivedIntro = "<b><u>Receive Details</u></b>";
    let receivedBy = frm.doc.emp_name;
    let receivedRemark = frm.doc.emp_received_remark;
    let received_otp = frm.doc.received_otp;

    // Check the status and choose the appropriate received message
    let receivedMessage = "";
    if (frm.doc.status === "Received") {
      // receivedMessage = `
      //   Received By: <span style="font-weight: bold;">${receivedBy}</span><br>
      //   Received Remark: <span style="font-weight: bold;">${receivedRemark}</span><br>
      // `;
    } else {
      receivedMessage = `
        <strong>Pending from Receiver</strong>
      `;
    }

    // Assuming 'user' is a variable you've declared elsewhere
    let user = frappe.session.user;
    if (frm.doc.status === "Received" && user === frm.doc.employee_user) {
      receivedMessage += `
        Received By: <span style="font-weight: bold;">${receivedBy}</span><br>
        Received Remark: <span style="font-weight: bold;">${receivedRemark}</span><br>
        OTP : <span style="font-weight: bold;">${received_otp}</span><br>
      `;
    }

    // Set the intros with the custom messages, separator, and blue color
    frm.set_intro(
      dispatchIntro +
        "<br>" +
        dispatchMessage +
        separator +
        "<br>" +
        receivedIntro +
        "<br>" +
        receivedMessage,
      "blue"
    );
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
        let item_level = frm.doc.item_level;

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
          item_level: item_level,
        });
        frm.set_value("item_level", null);
        frm.set_value("list", null);
        frm.set_value("quantity", null);
        frm.set_value("item_description", null);
        frm.set_value("item_purpose", null);
        frm.set_value("uom", "NOS");

        frm.refresh_field("asset");
        frm.fields_dict["asset"].grid.wrapper.find(".grid-add-row").hide();
        frm.set_df_property("select_department", "read_only", 1);
        if (!frm.is_new()) {
          frm.save();
        }
      });
    }

    if (!frm.doc.approval_levels) {
      frm.set_value("approval_levels", frm.doc.item_level);
    } else if (frm.doc.approval_levels) {
      if (frm.doc.item_level > frm.doc.approval_levels) {
        frm.set_value("approval_levels", frm.doc.item_level);
      } else {
        frm.set_value("approval_levels", frm.doc.approval_levels);
      }
    }
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
        send_email: 0, // Set this to 0 to prevent sending email notifications
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
          //frm.set_value("rm_approval_status", "Approved");
          frm.set_value("status", "Pending from HOD");

          // Save the form
          frm.save();
        }
      },
    });
  },

  share_with_purchase: function (frm) {
    let p1 = "689@sahayog.com";
    let p2 = "40@sahayog.com";
    let p3 = "2481@sahayog.com";
    let p4 = "2946@sahayog.com";

    if (frm.doc.purchase_request == "Pending") {
      frappe.call({
        method: "frappe.share.add",
        args: {
          doctype: frm.doctype,
          name: frm.docname,
          user: p1,
          read: 1,
          write: 1,
          submit: 0,
          share: 1,
          notify: 1,
          send_email: 0, // Set this to 0 to prevent sending email notifications
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
            // Set field values
            frm.set_value("purchase_request", "Done");
            //frm.set_value("rm_approval_status", "Approved");
            //frm.set_value("status", "Pending From Purchase");

            // Save the form
            //frm.save();
          }
        },
      });
      frappe.call({
        method: "frappe.share.add",
        args: {
          doctype: frm.doctype,
          name: frm.docname,
          user: p2,
          read: 1,
          write: 1,
          submit: 0,
          share: 1,
          notify: 1,
          send_email: 0, // Set this to 0 to prevent sending email notifications
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
            // Set field values
            frm.set_value("purchase_request", "Done");
            //frm.set_value("rm_approval_status", "Approved");
            //frm.set_value("status", "Pending From Purchase");

            // Save the form
            //frm.save();
          }
        },
      });

      frappe.call({
        method: "frappe.share.add",
        args: {
          doctype: frm.doctype,
          name: frm.docname,
          user: p3,
          read: 1,
          write: 1,
          submit: 0,
          share: 1,
          notify: 1,
          send_email: 0, // Set this to 0 to prevent sending email notifications
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
            // Set field values
            frm.set_value("purchase_request", "Done");
            //frm.set_value("rm_approval_status", "Approved");
            //frm.set_value("status", "Pending From Purchase");

            // Save the form
            //frm.save();
          }
        },
      });
      frappe.call({
        method: "frappe.share.add",
        args: {
          doctype: frm.doctype,
          name: frm.docname,
          user: p4,
          read: 1,
          write: 1,
          submit: 0,
          share: 1,
          notify: 1,
          send_email: 0, // Set this to 0 to prevent sending email notifications
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
            // Set field values
            frm.set_value("purchase_request", "Done");
            //frm.set_value("rm_approval_status", "Approved");
            //frm.set_value("status", "Pending From Purchase");

            // Save the form
            //frm.save();
          }
        },
      });

      // Document share was successful
      frappe.show_alert({
        message: "Successfully sent to Purchase Department",
        indicator: "green",
      });
    } else {
      frappe.msgprint("Already Sent to Purchase Department");
    }
  },

  purchase_remark: function (frm) {
    frm.add_custom_button(__("Set Estimate"), function () {
      frm.trigger("purchase_remark_dailog");
    });
  },
  purchase_remark_dailog: function (frm) {
    var d = new frappe.ui.Dialog({
      title: __("Set Estimate"),
      fields: [
        {
          label: __("Estimate Days"),
          fieldname: "purchase_estimate_days",
          fieldtype: "Select",
          options: [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
          ],
          reqd: 1, // Make the field mandatory
          default: frm.doc.purchase_estimate_days, // Pre-fill with existing value
        },
        {
          label: __("Purchase Remark"),
          fieldname: "purchase_remark",
          fieldtype: "Small Text",
          reqd: 1, // Make the field mandatory
          default: frm.doc.purchase_remark, // Pre-fill with existing value
        },
      ],
      primary_action_label: __("Submit"),
      primary_action: function () {
        if (!d.fields_dict.purchase_estimate_days.get_value()) {
          frappe.msgprint(__("Please select an Estimate Days."));
          return;
        }

        if (!d.fields_dict.purchase_remark.get_value()) {
          frappe.msgprint(__("Please provide a Purchase Remark."));
          return;
        }

        frappe.confirm("Are you sure you want to submit this estimate?", () => {
          frm.set_value(
            "purchase_estimate_days",
            d.fields_dict.purchase_estimate_days.get_value()
          );
          frm.set_value(
            "purchase_remark",
            d.fields_dict.purchase_remark.get_value()
          );

          frm.save();
          d.hide();
        });
      },
      secondary_action_label: __("Cancel"),
      secondary_action: function () {
        d.hide();
      },
    });

    d.show();
  },

  purchase_remark: function (frm) {
    frm.add_custom_button(__("Set Estimate"), function () {
      var d = new frappe.ui.Dialog({
        title: __("Set Estimate Date"),
        fields: [
          {
            label: __("Estimated Date"),
            fieldname: "estimated_date",
            fieldtype: "Date",
            reqd: 1, // Make the field mandatory
            default: frm.doc.estimated_date, // Pre-fill with existing value
          },
          {
            label: __("Purchase Remark"),
            fieldname: "purchase_remark",
            fieldtype: "Small Text",
            reqd: 1, // Make the field mandatory
            default: frm.doc.purchase_remark, // Pre-fill with existing value
          },
        ],
        primary_action_label: __("Submit"),
        primary_action: function () {
          if (!d.fields_dict.estimated_date.get_value()) {
            frappe.msgprint(__("Please select an Estimate Date."));
            return;
          }

          if (!d.fields_dict.purchase_remark.get_value()) {
            frappe.msgprint(__("Please provide a Purchase Remark."));
            return;
          }

          frappe.confirm(
            "Are you sure you want to submit this estimate?",
            () => {
              frm.set_value(
                "estimated_date",
                d.fields_dict.estimated_date.get_value()
              );
              frm.set_value(
                "purchase_remark",
                d.fields_dict.purchase_remark.get_value()
              );
              frm.save();
              d.hide();
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

    frm.add_custom_button(__("Dispatch To Store"), function () {
      var store_manager = frm.doc.stage_7_emp_name;

      frappe.confirm(
        "Are you sure you want to Dipatch Asset Item?",
        () => {
          // action to perform if Yes is selected
          frm.trigger("purchase_dispatch");
        },
        () => {
          // action to perform if No is selected
        }
      );
    });

    // Rest of your code for the "Dispatch To Store" button
  },

  Asset_Delivered: function (frm) {
    let employee = frm.doc.emp_name;
    frm.add_custom_button(__("Deliver To Employee"), function () {
      var d = new frappe.ui.Dialog({
        title: __("Please Enter OTP Given By: <b>" + employee + "</b>"),
        fields: [
          {
            label: __("OTP"),
            fieldname: "delivered_otp",
            fieldtype: "Data",
            reqd: 1, // Make the field mandatory
          },
        ],
        primary_action_label: __("Submit"),
        primary_action: function () {
          if (!d.fields_dict.delivered_otp.get_value()) {
            frappe.msgprint(
              __("Please enter the OTP Given by :<b>" + employee + "</b>")
            );
            return;
          }

          // Check if the entered OTP matches the store OTP
          if (
            frm.doc.received_otp === d.fields_dict.delivered_otp.get_value()
          ) {
            frm.set_value("status", "Delivered");

            frappe.call({
              method:
                "sahayog_asset.sahayog_asset.doctype.asset_request.server_date_api.get_server_datetime",
              callback: function (r) {
                frm.set_value("delivered_date", r.message);
                frm.save();
                d.hide();
              },
            });
          } else {
            frappe.msgprint(__("Invalid OTP. Please try again."));
          }
        },
        secondary_action_label: __("Cancel"),
        secondary_action: function () {
          d.hide();
        },
      });

      d.show();
    });
  },

  Delivered_Intro: function (frm) {
    let employee = frm.doc.emp_name;
    let branch = frm.doc.branch;
    let delivered_date = frm.doc.delivered_date;

    // Format the delivered_date to DD/MM/YYYY
    let formatted_delivered_date = frappe.datetime
      .str_to_user(delivered_date)
      .split(" ")[0];

    frm.set_intro("<b><u>Asset Delivered To</u></b>:", "green");
    frm.set_intro("<b>Employee:</b> " + employee, "green");
    frm.set_intro("<b>Branch:</b> " + branch, "green");
    frm.set_intro(
      "<b>Delivered Date:</b> " + formatted_delivered_date,
      "green"
    );
  },

  dispatch_button: function (frm) {
    frm.add_custom_button(__("Dispatch / Pending"), function () {
      frm.trigger("dispatch_check");
    });
    frm.change_custom_button_type("Dispatch / Pending", null, "success");
  },

  validation_check: function (frm) {
    if (!frm.doc.asset || frm.doc.asset.length === 0) {
      frappe.throw({
        title: __("Please Add Asset Item"),
        indicator: "red",
        message: __("Please Add At Least One Asset Item"),
      });
    } else {
      let isAssetTableEmpty = true;
      for (let row of frm.doc.asset) {
        if (row.item_name !== "") {
          isAssetTableEmpty = false;
          break;
        }
      }

      if (isAssetTableEmpty) {
        frappe.msgprint("Empty Asset Table");
      } else {
        frappe.msgprint("Not Empty Asset Table");
      }
    }
  },
  dispatch_check: function (frm) {
    let user = frappe.session.user;
    if (user === frm.doc.stage_7_emp_id) {
      const assetTable = frm.doc.asset;
      let conditionMet = false; // Initialize a variable to track condition status

      // Check if all row.purchase values are "Pending"
      const allPending = assetTable.every(function (row) {
        return (
          row.dispatched_status === "Pending" &&
          (row.purchase == "" || row.purchase == null)
        );
      });

      // Check if all row.purchase values are "Dispatched"
      const allDispatched = assetTable.every(function (row) {
        return (
          row.dispatched_status !== "Pending" &&
          (row.purchase !== "Pending" || row.purchase === "Dispatch")
        );
      });

      // Check if any row.purchase value is "Pending"
      const anyPending = assetTable.some(function (row) {
        return row.dispatched_status == "Pending";
      });

      // Check if any row.purchase value is "Pending"
      const Intitial_Check = assetTable.every(function (row) {
        return row.dispatched_status == "Pending" && !row.purchase;
      });

      const All_Dispatched_From_Store = assetTable.every(function (row) {
        return row.dispatched_status == "Dispatch" && !row.purchase;
      });
      const All_Dispatched_From_Store_and_purchase = assetTable.every(function (
        row
      ) {
        return row.dispatched_status == "Dispatch";
      });

      const Some_Dispatched_From_Store = assetTable.some(function (row) {
        return row.dispatched_status === "Pending";
      });

      const Check_Mode_of_Transport = assetTable.every(function (row) {
        return row.mode_of_transport;
      });
      const Check_Some_Mode_of_Transport = assetTable.some(function (row) {
        return row.dispatched_status == "Dispatch" && row.mode_of_transport;
      });
      const Check_Transport_Remark = assetTable.every(function (row) {
        return row.transport_remark;
      });
      const Check_Some_Transport_Remark = assetTable.some(function (row) {
        return row.dispatched_status == "Dispatch" && row.transport_remark;
      });

      // Check if any row.purchase value is "Pending"
      const anyPending_From_Store = assetTable.every(function (row) {
        return row.purchase === "Dispatch" || !row.purchase;
      });

      const all_dispatched_from_purchase = assetTable.every(function (row) {
        return row.purchase == "Dispatch";
      });

      const check_store = assetTable.some(function (row) {
        return row.dispatched_status !== "Dispatch";
      });

      const check_initial_purchase = assetTable.every(function (row) {
        return !row.purchase;
      });
      const some_dispatched_from_purchase = assetTable.some(function (row) {
        return row.purchase == "Dispatch";
      });

      if (Intitial_Check) {
        frappe.warn(
          "All Pending From Purchase Department ?",
          "<b>Dispatch</b> - If You Set Dispatch Then Select Mode Of Transport And set Remark <br>  <b>Pending</b> - It Will Automatically Send to Purchase Department",

          () => {
            // Action to perform if "Continue" is selected
            // Add your code for the "Send to Purchase" action here

            frm.doc.asset.forEach(function (row) {
              if (row.dispatched_status == "Pending" && 0 < row.quantity) {
                row.purchase = "Pending";
                console.log("Setting only Pending");
              }
            });

            // Refresh the field outside the loop to avoid unnecessary refreshes
            frm.refresh_field("asset");

            frm.set_value("status", "Pending From Purchase");
            frm.set_value("purchase_status", "Pending");
            frm.set_value("stage_7_emp_status", "Pending From Purchase");
            frm.trigger("share_with_purchase");
            console.log("All Pending From Purchase");

            frm.save();
          },
          "Continue",
          true // Sets dialog as minimizable
        );
        return;
      } else if (All_Dispatched_From_Store) {
        if (Check_Mode_of_Transport) {
          if (Check_Transport_Remark) {
            frappe.confirm(
              "Are you sure you want to Dispatch All Items?",
              () => {
                // action to perform if Yes is selected
                frm.set_value("status", "Dispatched");

                frm.set_value("stage_7_emp_status", "Dispatched");
                frm.save();

                console.log("All Dispatched From Store");
              },
              () => {
                // action to perform if No is selected
              }
            );
          } else {
            frappe.throw("Please Set Transport Remark for Asset Item");
          }
        } else {
          frappe.throw("Please Set Transport Mode for Asset Item");
        }

        return;
      } else if (Some_Dispatched_From_Store) {
        console.log("Some dispatch = true");
        if (check_initial_purchase) {
          frappe.confirm(
            "Are you sure you want to Dispatch Some Items?<br> And Pending From Purchase",
            () => {
              // action to perform if Yes is selected

              frm.doc.asset.forEach(function (row) {
                if (
                  // row.dispatched_status === "Pending" &&
                  // (row.purchase !== "Dispatch" || !row.purchase)
                  //below condition added for some dispatched and check qty , if 0 then cancelled

                  row.dispatched_status === "Pending" &&
                  0 < row.quantity
                ) {
                  row.purchase = "Pending";
                  frm.refresh_field("asset");
                }
              });

              frm.set_value("status", "Pending From Purchase");

              frm.set_value("stage_7_emp_status", "Partially Dispatched");
              frm.trigger("share_with_purchase");
              frm.save();

              console.log("Partially Dispatched From Store");
            },
            () => {
              // action to perform if No is selected
            }
          );
        } else if (all_dispatched_from_purchase) {
          console.log("all dispatch from purchase = true ");
          if (some_dispatched_from_purchase) {
            msgprint("Some Dispatched from Purchase");
            frm.save();
            return;
          } else if (check_store) {
            frappe.throw("Please Dispatch !!");
            console.log("check Store true");
            return;
          } else {
            frappe.confirm(
              "Are you sure you want to Dispatch Some Items?<br> And Pending From Purchase",
              () => {
                // action to perform if Yes is selected

                frm.doc.asset.forEach(function (row) {
                  if (
                    row.dispatched_status === "Pending" &&
                    (row.purchase !== "Dispatch" || !row.purchase)
                  ) {
                    row.purchase = "Pending";
                    frm.refresh_field("asset");
                  }
                });

                frm.set_value("status", "Pending From Purchase");

                frm.set_value("stage_7_emp_status", "Partially Dispatched");
                frm.trigger("share_with_purchase");
                frm.save();

                console.log("Partially Dispatched From Store");
              },
              () => {
                // action to perform if No is selected
              }
            );
          }
          if (All_Dispatched_From_Store_and_purchase) {
            if (Check_Mode_of_Transport) {
              if (Check_Transport_Remark) {
                frappe.confirm(
                  "Are you sure you want to Dispatch All Items?",
                  () => {
                    // action to perform if Yes is selected
                    frm.set_value("status", "Dispatched");

                    frm.set_value("stage_7_emp_status", "Dispatched");
                    frm.save();

                    console.log("All Dispatched From Store");
                  },
                  () => {
                    // action to perform if No is selected
                  }
                );
              } else {
                frappe.throw("Please Set Transport Remark for Asset Item");
              }
            } else {
              frappe.throw("Please Set Transport Mode for Asset Item");
            }

            return;
          } else {
            frappe.confirm(
              "Are you sure you want to Dispatch Some Items?<br> And Pending From Purchase",
              () => {
                // action to perform if Yes is selected

                frm.doc.asset.forEach(function (row) {
                  if (
                    row.dispatched_status === "Pending" &&
                    (row.purchase !== "Dispatch" || !row.purchase)
                  ) {
                    row.purchase = "Pending";
                    frm.refresh_field("asset");
                  }
                });

                frm.set_value("status", "Pending From Purchase");

                frm.set_value("stage_7_emp_status", "Partially Dispatched");
                frm.trigger("share_with_purchase");
                frm.save();

                console.log("Partially Dispatched From Store");
              },
              () => {
                // action to perform if No is selected
              }
            );
          }

          return;
        } else {
          frappe.throw("Please Dispatch Assets");
        }

        return;
      }

      if (allPending) {
        frm.doc.asset.forEach(function (row) {
          if (
            row.dispatched_status === "Pending" &&
            row.purchase !== "Dispatch" &&
            !row.purchase
          ) {
            row.purchase = "Pending";
            frm.refresh_field("asset");
            console.log("set");
          }
        });

        frm.set_value("status", "Pending From Purchase");
        frm.set_value("purchase_status", "Pending");
        frm.set_value("stage_7_emp_status", "Pending From Purchase");
        frm.trigger("share_with_purchase");
        console.log("All Pending From Purchase");

        conditionMet = true; // Set the condition as met
      } else if (allDispatched) {
        frm.doc.asset.forEach(function (row) {
          if (
            row.dispatched_status === "Dispatch" &&
            row.purchase !== "Pending"
          ) {
            row.dispatched = "Dispatch";

            frm.refresh_field("asset");
            console.log(row.purchase);
            frm.set_value("status", "Dispatched");
            frm.set_value("purchase_status", "Delivered To Store");
            frm.set_value("stage_7_emp_status", "Dispatched");

            console.log("All Dispatched From Store");
          }
          conditionMet = true; // Set the condition as met
        });
      } else {
        console.log("pending items");
        frappe.msgprint("Some Assets items are pending");
        conditionMet = true; // Set the condition as met
      }

      if (anyPending_From_Store) {
        if (anyPending) {
          frappe.throw("Please Dispatch !!");
          conditionMet = true; // Set the condition as met
        }
      } //else if (anyPending) {
      //   frm.doc.asset.forEach(function (row) {
      //     if (row.dispatched_status === "Pending") {

      //     }
      //   });

      //   frm.set_value("status", "Partially Dispatched");
      //   frm.set_value("purchase_status", "Pending");
      //   frm.set_value("stage_7_emp_status", "Pending From Purchase");
      //   frm.trigger("share_with_purchase");

      //   console.log("Partially Dispatched and pending From Purchase");

      //   conditionMet = true; // Set the condition as met
      // } else {
      //   frappe.msgprint(__("No action required."));
      // }

      // Check if any condition has been met and save the form if changes were made
      if (conditionMet) {
        frm.dirty(); // Mark the form as dirty (changed)
        frm.save(); // Save the form
        return;
      }

      // Continue with other operations if no condition was met
      // ...

      console.log("Dispatch check");
    } else {
      frappe.msgprint("You are Not Store Manager");
    }
  },

  purchase_dispatch: function (frm) {
    const assetTable = frm.doc.asset;
    let conditionMet = false; // Initialize a variable to track condition status

    // Check if all row.purchase values are "Pending"
    const allPending = assetTable.every(function (row) {
      return row.purchase === "Pending" || !row.purchase;
    });
    const allDispatched = assetTable.every(function (row) {
      return row.purchase === "Dispatch" || !row.purchase;
    });
    const SomeDispatched = assetTable.some(function (row) {
      return row.purchase === "Pending" || !row.purchase;
    });

    if (allPending) {
      msgprint("Please Dispatch Pending Items");
    } else if (allDispatched) {
      frm.set_value("status", "Pending From Store Manager");
      frm.set_value("purchase_status", "Delivered To Store");
      frm.set_value("stage_7_emp_status", "Pending");
      frm.save();

      //show_alert with indicator
      frappe.show_alert(
        {
          message: __("All Dispatched Successfully"),
          indicator: "green",
        },
        5
      );
      return;
    } else if (SomeDispatched) {
      frm.set_value("status", "Pending From Purchase");
      frm.set_value("purchase_status", "Pending");
      frm.set_value("stage_7_emp_status", "Pending From Purchase");
      frm.save();

      //show_alert with indicator
      frappe.show_alert(
        {
          message: __("Some Dispatched Successfully"),
          indicator: "green",
        },
        5
      );
      return;
    }

    // Check if any condition has been met and break operation
    if (conditionMet) {
      return;
    }

    // Continue with other operations if no condition was met
    // ...
  },
});
