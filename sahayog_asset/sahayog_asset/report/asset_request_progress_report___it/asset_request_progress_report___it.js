// Copyright (c) 2023, Sid and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Asset Request Progress Report - IT"] = {
  filters: [],
  formatter: function (value, row, column, data, default_formatter) {
    // Apply the default formatter first
    value = default_formatter(value, row, column, data);

    // Define the list of columns to apply the formatting to
    const statusColumns = [
      "stage_1_emp_status",
      "stage_2_emp_status",
      "stage_3_emp_status",
      "stage_4_emp_status",
      "stage_5_emp_status",
      "stage_6_emp_status",
      "stage_7_emp_status",
    ];

    if (statusColumns.includes(column.id)) {
      const currentStageIndex = statusColumns.indexOf(column.id);

      // Check the status of the current stage
      switch (data[column.id]) {
        case "Pending":
          value = `<span style='color:#ef233c; font-weight: bold; font-size: 12px;'>${value}</span>`;
          break;
        case "Approved":
          value = `<span style='color:#008000; font-weight: bold; font-size: 12px;'>${value}</span>`;
          break;
        case "Skip":
          value = `<span style='color:white; font-style: italic; font-weight: bold; font-size: 12px;'>${value}</span>`;
          break;
        case "Pending From Purchase":
          value = `<span style='color:#ffcc00; font-weight: bold; font-size: 12px;'>${value}</span>`;
          break;
        default:
          // Handle other cases if needed
          break;
      }

      // Color subsequent stages gray if the current stage is "Pending"
      if (data[column.id] === "Pending") {
        for (let i = currentStageIndex + 1; i < statusColumns.length; i++) {
          const nextStageColumn = statusColumns[i];
          data[nextStageColumn] = "Skip"; // Set subsequent stages to "Skip"
        }
      }
    }

    return value;
  },
};
