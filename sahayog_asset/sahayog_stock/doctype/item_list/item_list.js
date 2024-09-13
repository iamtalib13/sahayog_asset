frappe.ui.form.on("Item List", {
  async refresh(frm) {
    await frm.trigger("populate_summary_html");
  },

  async populate_summary_html(frm) {
    // Determine the default category based on user role
    let defaultCategory = "all"; // Default to show all items
    if (frappe.user.has_role("System Manager")) {
      defaultCategory = "all"; // No filter for System Manager
    } else if (
      frappe.user.has_role("IT Store Manager") ||
      frappe.user.has_role("IT Support Manager")
    ) {
      defaultCategory = "IT";
    } else if (frappe.user.has_role("Stationery Asset Admin")) {
      defaultCategory = "Stationery";
    } else if (frappe.user.has_role("Admin Store Manager")) {
      defaultCategory = "Admin";
    }

    try {
      // Fetch the data from the backend
      const { message } = await frm.call({
        method: "item_list",
        args: { category: defaultCategory },
      });

      // Initialize counters for each filter
      let totalItemsCount = 0;
      let outOfStockCount = 0;
      let lowStockCount = 0;
      let inStockCount = 0;

      // Generate filter tags with counts, category dropdown, and search bar
      let filterHtml = `
        <div style="margin-bottom: 20px;">
          <select id="category-filter" class="filter-btn">
            <option value="all">All</option>
            <option value="IT">IT</option>
            <option value="Stationery">Stationery</option>
            <option value="Admin">Admin</option>
          </select>
          <input type="text" id="search-bar" placeholder="Search Item Name" style="margin-left: 20px; padding: 8px; border: 1px solid #dfe2e5; font-size: 14px;">
          <button id="filter-all" class="filter-btn active">All (<span id="total-count">0</span>)</button>

      
  <div class="button-with-menu">
    <button id="filter-out-of-stock" class="filter-btn">Out of Stock (<span id="out-of-stock-count">0</span>)</button>
    <div class="dropdown">
      <button class="dropbtn">⋮</button>
      <div class="dropdown-content">
        <a href="#" id="create-purchase-requisition-out-of-stock">Create Purchase Requisition</a>
        <a href="#" id="export-to-excel-out-of-stock">Export to Excel</a>
      </div>
    </div>
  </div>

            <div class="button-with-menu">
              <button id="filter-low-stock" class="filter-btn">Low Stock (<span id="low-stock-count">0</span>)</button>
              <div class="dropdown">
                <button class="dropbtn">⋮</button>
                <div class="dropdown-content">
                  <a href="#" id="create-purchase-requisition-low-stock">Create Purchase Requisition</a>
                  <a href="#" id="export-to-excel-low-stock">Export to Excel</a>
                </div>
              </div>
            </div>

           <div class="button-with-menu">
              <button id="filter-in-stock" class="filter-btn">In Stock (<span id="in-stock-count">0</span>)</button>
              <div class="dropdown">
                <button class="dropbtn">⋮</button>
                <div class="dropdown-content">
                  <a href="#" id="create-purchase-requisition-in-stock">Create Purchase Requisition</a>
                  <a href="#" id="export-to-excel-in-stock">Export to Excel</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Generate HTML for the item list in a table format
      let html = `
        ${filterHtml}
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">
            <thead style="background-color: #f6f8fa;">
              <tr>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dfe2e5;">Status</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dfe2e5;">Item Name</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dfe2e5;">Current Stock</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dfe2e5;">Minimum Stock</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dfe2e5;">Category</th>
              </tr>
            </thead>
            <tbody id="item-list">`;

      // Track items based on category and stock status
      let itemsByCategory = {
        all: { outOfStock: 0, lowStock: 0, inStock: 0, total: 0 },
        IT: { outOfStock: 0, lowStock: 0, inStock: 0, total: 0 },
        Stationery: { outOfStock: 0, lowStock: 0, inStock: 0, total: 0 },
        Admin: { outOfStock: 0, lowStock: 0, inStock: 0, total: 0 },
      };

      message.items.forEach((item) => {
        totalItemsCount++;

        // Determine the stock status
        const isOutOfStock = item.current_stock <= 0;
        const isLowStock =
          item.current_stock > 0 && item.current_stock < item.min_qty;
        const isInStock = item.current_stock >= item.min_qty;

        const status = isOutOfStock
          ? "Out of Stock"
          : isLowStock
          ? "Low Stock"
          : "In Stock";

        const statusColor = isOutOfStock
          ? "red"
          : isLowStock
          ? "orange"
          : "green";

        let statusClass = "";
        if (isOutOfStock) {
          statusClass = "out-of-stock";
          itemsByCategory[item.category].outOfStock++;
          itemsByCategory.all.outOfStock++;
        } else if (isLowStock) {
          statusClass = "low-stock";
          itemsByCategory[item.category].lowStock++;
          itemsByCategory.all.lowStock++;
        } else if (isInStock) {
          statusClass = "in-stock";
          itemsByCategory[item.category].inStock++;
          itemsByCategory.all.inStock++;
        }

        // Update total count for each category
        itemsByCategory[item.category].total++;
        itemsByCategory.all.total++;

        // Add the item name as a link
        const itemLink = `/app/sahayog-item/${item.name}`;

        html += `
          <tr class="${statusClass}" data-category="${item.category}" style="border-bottom: 1px solid #dfe2e5;">
            <td style="padding: 12px;">
              <span class="status-btn" style="background-color: ${statusColor};">${status}</span>
            </td>
            <td style="padding: 12px;"><a href="${itemLink}" target="_blank">${item.item_name}</a></td>
            <td style="padding: 12px;">${item.current_stock}</td>
            <td style="padding: 12px;">${item.min_qty}</td>
            <td style="padding: 12px;">${item.category}</td>
          </tr>`;
      });

      html += `
          </tbody>
        </table>
      </div>
      <style>
      .button-with-menu {
    display: inline-block;
    position: relative;
    margin-right: 10px;
  }

  .filter-btn {
    background-color: #f0f0f0;
    border: 1px solid #dfe2e5;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    position: relative;
  }

  .filter-btn.active {
    background-color: #007bff;
    color: white;
  }

  .dropbtn {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 8px;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }

  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {background-color: #f1f1f1}

  .dropdown:hover .dropdown-content {
    display: block;
  }

  .status-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-size: 10px;
    font-weight: bold;
    text-align: center;
    width: auto;
    min-width: 80px;
    height: 20px;
    line-height: 20px;
      </style>
      `;

      frm.set_df_property("list_html", "options", html);

      // Update counts based on the default category
      function updateCounts(category) {
        document.getElementById("out-of-stock-count").innerText =
          itemsByCategory[category].outOfStock;
        document.getElementById("low-stock-count").innerText =
          itemsByCategory[category].lowStock;
        document.getElementById("in-stock-count").innerText =
          itemsByCategory[category].inStock;
        document.getElementById("total-count").innerText =
          itemsByCategory[category].total;
      }

      document.getElementById("category-filter").value = defaultCategory;
      $("#category-filter").trigger("change");

      $(document).ready(function () {
        $(".filter-btn").click(function () {
          $(".filter-btn").removeClass("active");
          $(this).addClass("active");

          const filter = $(this).attr("id");

          if (filter === "filter-all") {
            $("#item-list tr").show();
          } else if (filter === "filter-out-of-stock") {
            $("#item-list tr").hide();
            $("#item-list tr.out-of-stock").show();
          } else if (filter === "filter-low-stock") {
            $("#item-list tr").hide();
            $("#item-list tr.low-stock").show();
          } else if (filter === "filter-in-stock") {
            $("#item-list tr").hide();
            $("#item-list tr.in-stock").show();
          }
        });

        $("#category-filter").change(function () {
          const selectedCategory = $(this).val();

          if (selectedCategory === "all") {
            $("#item-list tr").show();
          } else {
            $("#item-list tr").each(function () {
              const rowCategory = $(this).data("category");
              if (rowCategory === selectedCategory) {
                $(this).show();
              } else {
                $(this).hide();
              }
            });
          }

          updateCounts(selectedCategory);
        });

        $("#search-bar").on("input", function () {
          const searchValue = $(this).val().toLowerCase();
          $("#item-list tr").filter(function () {
            const itemName = $(this)
              .find("td:nth-child(2)")
              .text()
              .toLowerCase();
            $(this).toggle(itemName.includes(searchValue));
          });
        });
      });

      updateCounts(defaultCategory); // Initial update of counts
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    $("#create-purchase-requisition-out-of-stock").on("click", function () {
      frappe.msgprint({
        title: __("Create PR for - Out of Stock"),
        indicator: "blue",
        message: __("Create PR for - Out of Stock"),
      });
    });
    $("#export-to-excel-out-of-stock").on("click", function () {
      frm.call({
        method: "export_to_excel", // Adjust the path to your server-side method
        args: {},
        callback: function (response) {
          if (response.message.error) {
            frappe.msgprint({
              title: __("Export Error"),
              indicator: "red",
              message: __("Error: " + response.message.error),
            });
          } else if (response.message.file_url) {
            // Create a link and trigger a download
            const link = document.createElement("a");
            link.href = response.message.file_url;
            link.download = response.message.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            frappe.msgprint({
              title: __("Export Successful"),
              indicator: "green",
              message: __("The data has been exported to Excel successfully."),
            });
          } else {
            frappe.msgprint({
              title: __("Export Error"),
              indicator: "red",
              message: __(
                "No data to export based on the current filter criteria."
              ),
            });
          }
        },
        error: function (error) {
          frappe.msgprint({
            title: __("Export Error"),
            indicator: "red",
            message: __("An unexpected error occurred while exporting."),
          });
        },
      });
    });

    $("#create-purchase-requisition-low-stock").on("click", function () {
      frappe.msgprint({
        title: __("Create PR for - Low Stock"),
        indicator: "blue",
        message: __("Create PR for - Low Stock"),
      });
    });
    $("#export-to-excel-low-stock").on("click", function () {
      frappe.msgprint({
        title: __("Export to Excel"),
        indicator: "blue",
        message: __("Export to Excel - Low Stock."),
      });
    });
  },
});
