// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vendor", {
  after_save: function (frm) {
    frm.set_value("vendor_code", frm.doc.name);
    frm.save();
  },

  gst_no: function (frm) {
    if (frm.doc.gst_no) {
      var state_code = frm.doc.gst_no.substring(0, 2);
      frm.set_value("gst_state_code", state_code);
    }
  },
});
