// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Test"] = {
  filters: [
    {
      fieldname: "name",
      label: __("ID"),
      fieldtype: "Link",
      options: "Asset Request",
      Width: 100,
      reqd: 0,
    },
    {
      fieldname: "Department",
      label: __("Department"),
      fieldtype: "Select",
      options: ["Admin", "IT", "Stationery"],
      Width: 100,
      reqd: 0,
    },
  ],
};
