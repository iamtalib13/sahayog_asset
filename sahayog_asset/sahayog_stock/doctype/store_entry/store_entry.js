// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Store Entry", {
  entry_type: function (frm) {
    if (frm.doc.entry_type === "STOCK-IN") {
      frm.set_value("location_type", "Department Store");
    } else if (frm.doc.entry_type === "STOCK-OUT") {
      frm.set_value("location_type", "Branch");
    }

    frm.disable_form();
    frm.disable_save();
  },
  refresh: function (frm) {
    if (!frm.is_new()) {
      frm.disable_form();
      frm.disable_save();
    }
  },

  // before_save: function (frm) {
  //   if (frm.doc.entry_type === "STOCK-IN") {
  //     frm.set_value("location", "Department Store");
  //   }
  //   if (frm.doc.entry_type === "STOCK-OUT") {
  //     frm.set_value("location", frm.doc.branch);
  //   }
  // },
});
