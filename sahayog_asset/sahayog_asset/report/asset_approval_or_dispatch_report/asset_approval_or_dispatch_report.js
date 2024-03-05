/* Copyright (c) 2023, Sid and contributors
   For license information, please see license.txt */
/* eslint-disable */

frappe.query_reports["Asset Approval or Dispatch Report"] = {
  filters: [
    {
      fieldname: "name",
      label: __("ID"),
      fieldtype: "Link",
      options: "Asset Request",
    },
  ],
};
