// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
frappe.ui.form.on("Stock", {
  before_save: function (frm) {
    if (frm.is_new()) {
      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "Sahayog Item",
          name: frm.doc.item,
        },
        callback: function (response) {
          var doc = response.message;
          if (doc) {
            frm.set_value("item_code", doc.name);
            frm.set_value("item_name", doc.item_name);
          }
        },
      });
    }
  },
});
