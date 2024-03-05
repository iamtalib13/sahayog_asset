// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sahayog Item", {
  after_save: function (frm) {
    frm.set_value("item_id", frm.doc.name);
    frm.save();
  },

  tax: function (frm) {
    let taxString = frm.doc.tax; // e.g. "18%"
    frm.set_value("igst", taxString);

    // Remove the percentage symbol from the string
    let taxNumber = parseFloat(taxString.replace("%", "")); // e.g. 18

    // Divide the tax amount by 2 to get CGST and SGST
    let cgst = taxNumber / 2; // e.g. 9
    let sgst = taxNumber / 2; // e.g. 9

    // Convert the CGST and SGST amounts to percentages
    let cgstPercentage = cgst.toFixed(1) + "%"; // e.g. "9.00%"
    let sgstPercentage = sgst.toFixed(1) + "%"; // e.g. "9.00%"

    // Check if the CGST percentage has no decimal places
    if (cgst % 1 === 0) {
      cgstPercentage = cgst.toFixed(0) + "%"; // e.g. "9%"
      frm.set_value("cgst", cgstPercentage);
    } else {
      cgstPercentage = cgst.toFixed(1) + "%"; // e.g. "9%"
      frm.set_value("cgst", cgstPercentage);
    }

    // Check if the SGST percentage has no decimal places
    if (sgst % 1 === 0) {
      sgstPercentage = sgst.toFixed(0) + "%"; // e.g. "9%"
      frm.set_value("sgst", sgstPercentage);
    } else {
      sgstPercentage = sgst.toFixed(1) + "%"; // e.g. "9%"
      frm.set_value("sgst", sgstPercentage);
    }

    console.log(taxString); // prints the original tax amount with percentage symbol
    console.log(cgstPercentage); // prints the CGST amount as a percentage
    console.log(sgstPercentage); // prints the SGST amount as a percentage

    if (frm.doc.tax == "0%") {
      frm.set_value("sgst", "0%");
      frm.set_value("cgst", "0%");
    }

    // if (frm.doc.tax == "0%") {
    //   frm.set_value("sgst", "0%");
    //   frm.set_value("cgst", "0%");
    // } else if (frm.doc.tax == "9%") {
    //   frm.set_value("sgst", "4.5%");
    //   frm.set_value("cgst", "4.5%");
    // } else if (frm.doc.tax == "12%") {
    //   frm.set_value("sgst", "6%");
    //   frm.set_value("cgst", "6%");
    // } else if (frm.doc.tax == "18%") {
    //   frm.set_value("sgst", "9%");
    //   frm.set_value("cgst", "9%");
    // } else if (frm.doc.tax == "12%") {
    //   frm.set_value("sgst", "6%");
    //   frm.set_value("cgst", "6%");
    // } else if (frm.doc.tax == "18%") {
    //   frm.set_value("sgst", "9%");
    //   frm.set_value("cgst", "9%");
    // } else if (frm.doc.tax == "28%") {
    //   frm.set_value("sgst", "9%");
    //   frm.set_value("cgst", "9%");
    // }
  },

  refresh: function (frm) {
    if (frappe.user.has_role("Stationery Asset Admin")) {
      if (frm.is_new()) {
        console.log("Stationery Asset");
        frm.set_value("category", "Stationery");
        frm.set_df_property("category", "read_only", 1);
        frm.set_df_property("other", "hidden", 1);
        frm.set_value("enable", 1);
      } else {
        frm.set_df_property("category", "read_only", 1);
      }
    } else if (frappe.user.has_role("IT Asset Admin")) {
      if (frm.is_new()) {
        console.log("IT Asset");
        frm.set_value("category", "IT");
        frm.set_df_property("category", "read_only", 1);
        // frm.set_df_property("category", "hidden", 1);
        frm.set_value("enable", 1);
      } else {
        frm.set_df_property("category", "read_only", 1);
      }
    }
  },
});
