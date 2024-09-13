function extend_listview_event(doctype, event, callback) {
  if (!frappe.listview_settings[doctype]) {
    frappe.listview_settings[doctype] = {};
  }

  const old_event = frappe.listview_settings[doctype][event];
  frappe.listview_settings[doctype][event] = function (listview) {
    if (old_event) {
      old_event(listview);
    }
    callback(listview);
  };
}

extend_listview_event("Sahayog Item", "refresh", function (listview) {
  $(document).ready(function () {
    // Iterate through each item in the list
    listview.data.forEach(function (row) {
      const currentStock = parseInt(row.current_stock, 10);
      const minQty = parseInt(row.min_qty, 10);
      const rowElement = $(`[data-name="${row.name}"]`);

      // Debugging: Console log to verify values
      console.log(`Name: ${row.name}`);
      console.log(`Current Stock: ${currentStock}`);
      console.log(`Min Qty: ${minQty}`);
      console.log(
        `Comparison: ${currentStock} < ${minQty} = ${currentStock < minQty}`
      );

      // Select the current_stock element
      const currentStockElement = rowElement.find(
        'a.filterable[data-filter*="current_stock"] div'
      );

      if (currentStockElement.length > 0) {
        // Apply color based on the comparison
        if (currentStock < minQty) {
          currentStockElement.css("color", "red");
          console.log("Applying red color");
        } else {
          currentStockElement.css("color", "black"); // Reset color if condition is not met
          console.log("Applying black color");
        }
      } else {
        console.log("No element found for current stock.");
      }
    });
  });
});
