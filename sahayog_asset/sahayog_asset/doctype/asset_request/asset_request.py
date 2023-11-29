# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.share import add


class AssetRequest(Document):
    pass


@frappe.whitelist()
def get_value():
    return False


def update_asset_request(self, rm_stage_request, level, stage_status):
    next_request = frappe.db.get_value("Asset Request", self, rm_stage_request)

    if level == "0":
        if next_request == "Pending":
            frappe.db.set_value("Asset Request", self, rm_stage_request, "Done")
            frappe.db.set_value("Asset Request", self, "status", "Pending")
            frappe.db.set_value("Asset Request", self, "asset_lock", "True")
    else:
        frappe.db.set_value(
            "Asset Request",
            self,
            rm_stage_request,
            "Done",
            update_modified=False,
        )

    if stage_status != "None":
        frappe.db.set_value(
            "Asset Request",
            self,
            stage_status,
            "Approved",
            update_modified=False,
        )


def check_conditions(self, rm_stage_request):
    next_request = frappe.db.get_value("Asset Request", self, rm_stage_request)
    return next_request == "Done"


def share_doc(self, rm_stage):
    add(
        doctype="Asset Request",
        name=self,
        user=rm_stage,
        read=1,
        write=1,
        share=1,
        everyone=0,
        notify=1,
    )


@frappe.whitelist()
def set_level(level, self, rm_stage_status, rm_stage, rm_stage_request, stage_status):
    try:
        update_asset_request(self, rm_stage_request, level, stage_status)
        share_doc(self, rm_stage)
        return check_conditions(self, rm_stage_request)
    except Exception as e:
        return False
