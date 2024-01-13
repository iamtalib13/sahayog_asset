// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
/* eslint-disable */

// frappe.query_reports["Asset Request Purchase Department Report"] = {
//   filters: [
//     {
//       fieldname: "store",
//       label: __("Store"),
//       fieldtype: "Select",
//       options: ["All", "IT", "Stationery", "Admin"],
//       default: "All",
//     },
//   ],

//   onload: function (report) {
//     report.page.add_inner_button("Excel", () => {
//       frappe.msgprint("Excel Export");
//     });
//   },
// };

frappe.ui.ready(function () {
  frappe.query_reports["Asset Request Purchase Department Report"] = {
    filters: [
      {
        fieldname: "select_department",
        label: __("Select Department"),
        fieldtype: "Select",
        options: ["All", "IT", "Stationery", "Admin"],
        default: "All",
        onchange: function () {
          frappe.route_options["select_department"] = this.value;
        },
      },
    ],
  };
});
