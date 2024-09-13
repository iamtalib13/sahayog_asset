// Copyright (c) 2024, Sid and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Item List"] = {
  filters: [
    {
      fieldname: "status",
      label: __("Status"),
      fieldtype: "Select",
      options: ["", "Low Stock", "Out of Stock", "In Stock"],
      default: "",
      reqd: 0,
    },

    {
      label: "Add New Item",
      fieldname: "add_new",
      fieldtype: "Button",
      width: 200,
    },

    {
      label: "Create PR for Low Stock",
      fieldname: "create_pr_low_stock",
      fieldtype: "Button",
      width: 200,
    },

    {
      label: "Create PR for Out of Stock",
      fieldname: "create_pr_out_of_stock",
      fieldtype: "Button",
      width: 200,
    },
    {
      label: "Stock Entry",
      fieldname: "stock_entry",
      fieldtype: "Button",
      width: 200,
    },
    {
      label: "Purchase Requisition",
      fieldname: "p_r",
      fieldtype: "Button",
      width: 200,
    },
  ],

  formatter: function (value, row, column, data, default_formatter) {
    value = default_formatter(value, row, column, data);

    if (column.fieldname == "status") {
      let color = "black";
      let backgroundColor = "transparent";

      if (value == "Out of Stock") {
        color = "red";
        backgroundColor = "rgba(255, 0, 0, 0.1)"; // Faded red
      } else if (value == "Low Stock") {
        color = "orange";
        backgroundColor = "rgba(255, 165, 0, 0.1)"; // Faded orange
      } else if (value == "In Stock") {
        color = "green";
        backgroundColor = "rgba(0, 128, 0, 0.1)"; // Faded green
      }

      value = `<b style="color:${color}; background-color:${backgroundColor};">${value}</b>`;
    }

    return value;
  },
};

$(document).on("click", "button[data-fieldname='stock_entry']", function () {
  const route = "/app/store-entry/view/list?category=IT";
  frappe.set_route(route);
});

$(document).on("click", "button[data-fieldname='add_new']", function () {
  const route = "/app/sahayog-item/new-sahayog-item";
  frappe.set_route(route);
});
$(document).on("click", "button[data-fieldname='p_r']", function () {
  const route = "/app/purchase-requisition";
  frappe.set_route(route);
});
// Open custom dialog box on button click
// Open custom dialog box on button click
$(document).on(
  "click",
  "button[data-fieldname='create_pr_low_stock']",
  function () {
    // Fetch low stock items from the server-side method
    frappe.call({
      method: "sahayog_asset.automation.get_low_stock_items",
      callback: function (response) {
        // Extract the low stock items from the response
        const lowStockItems = response.message || [];

        // Create and show the custom dialog
        let d = new frappe.ui.Dialog({
          title: "Low Stock Items",
          fields: [
            {
              label: "Low Stock Items",
              fieldname: "low_stock_items",
              fieldtype: "HTML",
              options: `
                          <table class="table table-bordered">
                              <thead>
                                  <tr>
                                      <th>Item Code</th>
                                      <th>Item Name</th>
                                      <th>New Quantity</th>
                                  </tr>
                              </thead>
                              <tbody id="low-stock-table-body">
                                  ${lowStockItems
                                    .map(
                                      (item) => `
                                              <tr>
                                                  <td>${item.name}</td>
                                                  <td>${item.item_name}</td>
                                                  <td>
                                                      <input type="number" 
                                                             class="form-control" 
                                                             data-item-code="${item.name}" 
                                                             data-item-name="${item.item_name}" 
                                                             placeholder="Enter new quantity" 
                                                             min="1">
                                                  </td>
                                              </tr>
                                          `
                                    )
                                    .join("")}
                              </tbody>
                          </table>
                      `,
            },
          ],
          size: "small",
          primary_action_label: "Create Purchase Requisition",
          primary_action(values) {
            // Collect user inputs and process them
            const inputs = Array.from(
              document.querySelectorAll("#low-stock-table-body input")
            );
            const updatedQuantities = inputs
              .map((input) => ({
                item_code: input.getAttribute("data-item-code"),
                item_name: input.getAttribute("data-item-name"),
                new_quantity: parseInt(input.value, 10) || 1, // Default to 1 if empty or zero
              }))
              .filter((item) => item.new_quantity > 0);

            if (updatedQuantities.length === 0) {
              frappe.msgprint({
                title: "No Valid Quantities",
                message:
                  "No valid quantities entered. Please enter quantities greater than zero.",
                indicator: "red",
              });
              return;
            }

            // Send updatedQuantities to the server for processing
            frappe.call({
              method: "sahayog_asset.automation.create_purchase_requisition",
              args: {
                quantities: JSON.stringify(updatedQuantities),
              },
              callback: function (response) {
                if (response.message.error) {
                  frappe.msgprint({
                    title: "Error",
                    message: response.message.error,
                    indicator: "red",
                  });
                } else {
                  frappe.show_alert(
                    {
                      message: __("Purchase Requisition created successfully"),
                      indicator: "green",
                    },
                    5
                  );
                  frappe.set_route("List", "Purchase Requisition", {
                    status: "Draft",
                  });

                  d.hide();
                }
              },
            });
          },
          secondary_action_label: "Cancel",
          secondary_action() {
            d.hide();
          },
        });

        d.show();
      },
    });
  }
);

$(document).on(
  "click",
  "button[data-fieldname='create_pr_out_of_stock']",
  function () {
    // Fetch out of stock items from the server-side method
    frappe.call({
      method: "sahayog_asset.automation.get_out_of_stock_items",
      callback: function (response) {
        // Extract the out of stock items from the response
        const lowStockItems = response.message || [];

        // Create and show the custom dialog
        let d = new frappe.ui.Dialog({
          title: "Out of Stock Items",
          fields: [
            {
              label: "Out of Stock Items",
              fieldname: "out_of_stock_items",
              fieldtype: "HTML",
              options: `
                          <table class="table table-bordered">
                              <thead>
                                  <tr>
                                      <th>Item Code</th>
                                      <th>Item Name</th>
                                      <th>New Quantity</th>
                                  </tr>
                              </thead>
                              <tbody id="out-of-stock-table-body">
                                  ${lowStockItems
                                    .map(
                                      (item) => `
                                              <tr>
                                                  <td>${item.name}</td>
                                                  <td>${item.item_name}</td>
                                                  <td>
                                                      <input type="number" 
                                                             class="form-control" 
                                                             data-item-code="${item.name}" 
                                                             data-item-name="${item.item_name}" 
                                                             placeholder="Enter new quantity" 
                                                             min="1">
                                                  </td>
                                              </tr>
                                          `
                                    )
                                    .join("")}
                              </tbody>
                          </table>
                      `,
            },
          ],
          size: "small",
          primary_action_label: "Create Purchase Requisition",
          primary_action(values) {
            // Collect user inputs and process them
            const inputs = Array.from(
              document.querySelectorAll("#out-of-stock-table-body input")
            );
            const updatedQuantities = inputs
              .map((input) => ({
                item_code: input.getAttribute("data-item-code"),
                item_name: input.getAttribute("data-item-name"),
                new_quantity: parseInt(input.value, 10) || 1, // Default to 1 if empty or zero
              }))
              .filter((item) => item.new_quantity > 0);

            if (updatedQuantities.length === 0) {
              frappe.msgprint({
                title: "No Valid Quantities",
                message:
                  "No valid quantities entered. Please enter quantities greater than zero.",
                indicator: "red",
              });
              return;
            }

            // Send updatedQuantities to the server for processing
            frappe.call({
              method: "sahayog_asset.automation.create_purchase_requisition",
              args: {
                quantities: JSON.stringify(updatedQuantities),
              },
              callback: function (response) {
                if (response.message.error) {
                  frappe.msgprint({
                    title: "Error",
                    message: response.message.error,
                    indicator: "red",
                  });
                } else {
                  frappe.msgprint({
                    title: "Purchase Requisition Created",
                    message: `Purchase Requisition creation has been queued.`,
                    indicator: "green",
                  });

                  frappe.set_route("List", "Purchase Requisition", {
                    status: "Draft",
                  });

                  d.hide();
                }
              },
            });
          },
          secondary_action_label: "Cancel",
          secondary_action() {
            d.hide();
          },
        });

        d.show();
      },
    });
  }
);

// $(document).ready(function () {
//   // Apply background color, text styling, and responsive width using jQuery
//   $("button[data-fieldname='add_new']").css({
//     "background-color": "black", // Background color
//     color: "white", // Text color
//     "border-radius": "7px", // Rounded corners
//     "font-weight": "bold", // Bold text
//   });
// });

// $(document).ready(function () {
//   // Apply background color, text styling, and responsive width using jQuery
//   $("button[data-fieldname='create_pr_low_stock']").css({
//     "background-color": "black", // Background color
//     color: "white", // Text color
//     "border-radius": "7px", // Rounded corners
//     "font-weight": "bold", // Bold text
//   });
// });

// $(document).ready(function () {
//   // Apply background color, text styling, and responsive width using jQuery
//   $("button[data-fieldname='create_pr_out_of_stock']").css({
//     "background-color": "black", // Background color
//     color: "white", // Text color
//     "border-radius": "7px", // Rounded corners
//     "font-weight": "bold", // Bold text
//   });
// });
// $(document).ready(function () {
//   // Apply background color, text styling, and responsive width using jQuery
//   $("button[data-fieldname='stock_entry']").css({
//     "background-color": "black", // Background color
//     color: "white", // Text color
//     "border-radius": "7px", // Rounded corners
//     "font-weight": "bold", // Bold text
//   });
// });
