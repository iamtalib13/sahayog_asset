// Copyright (c) 2023, Talib Sheikh and contributors
// For license information, please see license.txt
frappe.ui.form.on("Incidence Report", {
  refresh: function (frm) {
    frappe.call({
      method:
        "sahayog_report.sahayog_report.doctype.incidence_report.api.check_user_designation",
      args: {
        emp_id: frm.doc.employee_id,
      },
      callback: function (r) {
        var designation = r.message[0].designation;
        console.log(designation);
        if (designation == "Branch Operation Manager") {
          frappe.show_alert("Welcome BOM");
        } else if (designation == "Branch Manager") {
          frappe.show_alert("Welcome BM");
        } else {
          frappe.show_alert("The Incidence Form only for BM and BOM");
        }
      },
    });
  },
});
