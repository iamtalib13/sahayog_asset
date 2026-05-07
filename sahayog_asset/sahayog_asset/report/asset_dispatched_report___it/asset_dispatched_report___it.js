// Copyright (c) 2026, Sid and contributors
// For license information, please see license.txt

frappe.query_reports["Asset Dispatched Report - IT"] = {
  filters: [
    {
      fieldname: "from_date",
      label: __("From Date"),
      fieldtype: "Date",
    },
    {
      fieldname: "to_date",
      label: __("To Date"),
      fieldtype: "Date",
    },
    {
      fieldname: "status",
      label: __("Status"),
      fieldtype: "Select",
      options:
        "\nDraft\nPending\nRejected\nDispatched\nPartially Dispatched\nReceived\nPending From Purchase\nPending From Store Manager\nDelivered",
      default: "",
    },
  ],
};
//
