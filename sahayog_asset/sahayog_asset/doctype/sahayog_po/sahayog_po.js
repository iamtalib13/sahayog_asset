// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sahayog PO", {
  calculate: function (frm) {
    let tot_qty = 0;
    let tot_amt = 0;
    let tot_tax_amt = 0;

    for (let item of frm.doc.material) {
      tot_qty = tot_qty + item.quantity;
      tot_amt = tot_amt + item.total_amount;
      tot_tax_amt = tot_tax_amt + item.total_cost;

      if (frm.doc.gst_state_code == 27) {
        item.ref_sgst = item.sgst;
        item.ref_cgst = item.cgst;
        item.ref_igst = "0%";
      } else {
        item.ref_sgst = "0%";
        item.ref_cgst = "0%";
        item.ref_igst = item.igst;
      }
      frm.refresh_field("material");
    }
    frm.set_value("total_quantity", tot_qty);
    frm.set_value("total_amount", tot_amt);
    frm.set_value("total_amt_with_tax", tot_tax_amt);
    frm.set_value("order_total_amount", tot_tax_amt);
    let igst = frm.doc.total_amt_with_tax - frm.doc.total_amount;

    if (frm.doc.gst_state_code == 27) {
      frm.set_value(
        "sgst_amount",
        (frm.doc.total_amt_with_tax - frm.doc.total_amount) / 2
      );
      frm.set_value(
        "cgst_amount",
        (frm.doc.total_amt_with_tax - frm.doc.total_amount) / 2
      );
      frm.set_value("igst_amount", "");
    } else if (frm.doc.gst_state_code !== 27) {
      frm.set_value("igst_amount", igst);
      frm.set_value("sgst_amount", "");
      frm.set_value("cgst_amount", "");
    }
    frm.trigger("other_charges");
  },
  vendor: function (frm) {
    frm.trigger("calculate");
  },
  other_charges: function (frm) {
    let order_tot_amt = frm.doc.other_charges + frm.doc.total_amt_with_tax;
    frm.set_value("order_total_amount", order_tot_amt);
  },

  refresh: function (frm) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date();
    const dayName = daysOfWeek[date.getDay()];
    frm.set_value("day", dayName);

    frm.set_value("des_party_name", "Sahayog Multistate Credit Co-Op Society");

    frm.set_value("inv_party_name", "Sahayog Multistate Credit Co-Op Society");
  },
});

frappe.ui.form.on("PO Material List", {
  po_material_list_add: function (frm, cdt, cdn) {
    var child = locals[cdt][cdn];
    let tot_qty = 0;
    frm.add_child_event("quantity", cdt, cdn, function () {
      refresh_field("total_amount", child.name, child.parentfield);
      refresh_field("total_cost", child.name, child.parentfield);
      tot_qty = tot_qty + child.quantity;
      frm.set_value("total_quantity", tot_qty);
    });
    frm.add_child_event("rate", cdt, cdn, function () {
      refresh_field("total_amount", child.name, child.parentfield);
      refresh_field("total_cost", child.name, child.parentfield);
    });
  },

  form_render: function (frm, cdt, cdn) {
    let item = locals[cdt][cdn];
    let sgst_String = item.sgst;
    let cgst_String = item.cgst;
    let sgst_Number = parseFloat(sgst_String.replace("%", ""));
    let cgst_Number = parseFloat(cgst_String.replace("%", ""));
    if (item.rate && item.quantity) {
      item.total_amount = item.quantity * item.rate;
      item.total_cost =
        item.total_amount +
        (item.total_amount * sgst_Number) / 100 +
        (item.total_amount * cgst_Number) / 100;
      refresh_field("total_amount", item.name, item.parentfield);
      refresh_field("total_cost", item.name, item.parentfield);
      frm.trigger("calculate");
    }
  },

  quantity: function (frm, cdt, cdn) {
    let item = locals[cdt][cdn];
    let sgst_String = item.sgst;
    let cgst_String = item.cgst;
    let sgst_Number = parseFloat(sgst_String.replace("%", ""));
    let cgst_Number = parseFloat(cgst_String.replace("%", ""));
    if (item.rate && item.quantity) {
      item.total_amount = item.quantity * item.rate;
      item.total_cost =
        item.total_amount +
        (item.total_amount * sgst_Number) / 100 +
        (item.total_amount * cgst_Number) / 100;
      refresh_field("total_amount", item.name, item.parentfield);
      refresh_field("total_cost", item.name, item.parentfield);
      frm.trigger("calculate");
    }
  },

  rate: function (frm, cdt, cdn) {
    let item = locals[cdt][cdn];
    let sgst_String = item.sgst;
    let cgst_String = item.cgst;
    let sgst_Number = parseFloat(sgst_String.replace("%", ""));
    let cgst_Number = parseFloat(cgst_String.replace("%", ""));
    if (item.rate && item.quantity) {
      item.total_amount = item.quantity * item.rate;
      item.total_cost =
        item.total_amount +
        (item.total_amount * sgst_Number) / 100 +
        (item.total_amount * cgst_Number) / 100;
      refresh_field("total_amount", item.name, item.parentfield);
      refresh_field("total_cost", item.name, item.parentfield);
      frm.trigger("calculate");
    }
  },
});
