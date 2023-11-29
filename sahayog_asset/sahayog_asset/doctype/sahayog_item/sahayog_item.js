// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sahayog Item", {
  level_1_approval: function (frm) {
    if (frm.doc.level_1_approval) {
      frm.set_value("approval_levels", "1");
      frm.doc.level_2_approval = false;
      frm.doc.level_3_approval = false;
      frm.doc.level_4_approval = false;
    } else {
      frm.set_value("approval_levels", "0");
      frm.doc.level_2_approval = false;
      frm.doc.level_3_approval = false;
      frm.doc.level_4_approval = false;
    }
    frm.refresh_fields([
      "level_1_approval",
      "level_2_approval",
      "level_3_approval",
      "level_4_approval",
      "approval_levels",
    ]);

    frm.save();
  },

  level_2_approval: function (frm) {
    if (frm.doc.level_2_approval) {
      frm.set_value("approval_levels", "2");
      frm.doc.level_1_approval = true;
      frm.doc.level_3_approval = false;
      frm.doc.level_4_approval = false;
    } else {
      frm.set_value("approval_levels", "1");
      frm.doc.level_3_approval = false;
      frm.doc.level_4_approval = false;
    }
    frm.refresh_fields([
      "level_1_approval",
      "level_2_approval",
      "level_3_approval",
      "level_4_approval",
      "approval_levels",
    ]);
    frm.save();
  },

  level_3_approval: function (frm) {
    if (frm.doc.level_3_approval) {
      frm.set_value("approval_levels", "3");
      frm.doc.level_1_approval = true;
      frm.doc.level_2_approval = true;

      frm.doc.level_4_approval = false;
    } else {
      frm.set_value("approval_levels", "2");
      frm.doc.level_4_approval = false;
    }
    frm.refresh_fields([
      "level_1_approval",
      "level_2_approval",
      "level_3_approval",
      "level_4_approval",
      "approval_levels",
    ]);
    frm.save();
  },

  level_4_approval: function (frm) {
    if (frm.doc.level_4_approval) {
      frm.set_value("approval_levels", "4");
      frm.doc.level_1_approval = true;
      frm.doc.level_2_approval = true;
      frm.doc.level_3_approval = true;
    } else {
      frm.set_value("approval_levels", "3");
    }
    frm.refresh_fields([
      "level_1_approval",
      "level_2_approval",
      "level_3_approval",
      "level_4_approval",
      "approval_levels",
    ]);
    frm.save();
  },

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
});
